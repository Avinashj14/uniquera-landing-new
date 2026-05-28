<?php
/**
 * Shared SMTP / env helpers for uniquera-form-submit.php and mail-test.php.
 */

use PHPMailer\PHPMailer\PHPMailer;

function uniquera_env_value($key, $default = '') {
    static $env = null;
    if ($env === null) {
        $env = array();
        foreach (array(__DIR__ . '/.env', __DIR__ . '/../.env', __DIR__ . '/../../.env') as $path) {
            if (!is_readable($path)) {
                continue;
            }
            $raw = file_get_contents($path);
            if ($raw === false) {
                continue;
            }
            if (substr($raw, 0, 3) === "\xEF\xBB\xBF") {
                $raw = substr($raw, 3);
            }
            $lines = preg_split('/\r\n|\r|\n/', $raw);
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || strpos($line, '#') === 0 || strpos($line, '=') === false) {
                    continue;
                }
                list($k, $v) = explode('=', $line, 2);
                $k = trim($k);
                if (substr($k, 0, 3) === "\xEF\xBB\xBF") {
                    $k = substr($k, 3);
                }
                $v = trim($v);
                if (preg_match('/^([\'"])(.*)\1$/', $v, $m)) {
                    $v = $m[2];
                }
                $env[$k] = $v;
            }
            break;
        }
    }
    return isset($env[$key]) && $env[$key] !== '' ? $env[$key] : $default;
}

function uniquera_parse_email_list($raw) {
    $parts = preg_split('/[;,]+/', (string)$raw);
    $out = array();
    foreach ($parts as $part) {
        $email = strtolower(trim($part));
        if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $out[] = $email;
        }
    }
    return array_values(array_unique($out));
}

function uniquera_save_submission_backup($rows, $fullName) {
    $dir = __DIR__ . '/storage/submissions/' . gmdate('Y-m-d');
    if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
        return false;
    }
    $safeName = preg_replace('/[^a-zA-Z0-9._-]+/', '_', (string)$fullName);
    $file = $dir . '/' . gmdate('His') . '_' . substr(md5(uniqid('', true)), 0, 8) . '_' . $safeName . '.json';
    $payload = array(
        'saved_at_utc' => gmdate('c'),
        'fullName' => $fullName,
        'rows' => $rows,
    );
    return @file_put_contents($file, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) !== false;
}

function uniquera_configure_smtp_mailer(PHPMailer $mail) {
    $smtpHost = uniquera_env_value('SMTP_HOST', '');
    $smtpUser = uniquera_env_value('SMTP_USER', '');
    $smtpPass = uniquera_env_value('SMTP_PASS', '');
    $port = (int)uniquera_env_value('SMTP_PORT', '587');
    $secure = strtolower(trim((string)uniquera_env_value('SMTP_SECURE', '')));

    if ($secure === '') {
        $secure = ($port === 465) ? 'ssl' : 'tls';
    }
    if ($port === 465 && ($secure === 'tls' || $secure === 'starttls')) {
        $secure = 'ssl';
    }
    if ($port === 587 && ($secure === 'ssl' || $secure === 'smtps')) {
        $secure = 'tls';
    }

    $mail->isSMTP();
    $mail->Host = $smtpHost;
    $mail->SMTPAuth = true;
    $mail->Username = $smtpUser;
    $mail->Password = $smtpPass;
    $mail->Port = $port;
    $mail->Timeout = 30;
    $mail->SMTPKeepAlive = false;

    if ($secure === 'ssl' || $secure === 'smtps') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } elseif ($secure === 'tls' || $secure === 'starttls') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    }

    $verifySsl = strtolower(trim((string)uniquera_env_value('SMTP_VERIFY_SSL', 'true')));
    if (in_array($verifySsl, array('0', 'false', 'no', 'off'), true)) {
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true,
            ),
        );
    }
}

function uniquera_debug_enabled() {
    $flag = strtolower(trim((string)uniquera_env_value('FORM_DEBUG', 'false')));
    return in_array($flag, array('1', 'true', 'yes', 'on'), true);
}

function uniquera_mail_error_response($publicMessage, $exceptionMessage = '') {
    $payload = array('success' => false, 'data' => array('message' => $publicMessage));
    if (uniquera_debug_enabled() && $exceptionMessage !== '') {
        $payload['data']['debug'] = $exceptionMessage;
    }
    http_response_code(500);
    echo json_encode($payload);
    exit;
}
