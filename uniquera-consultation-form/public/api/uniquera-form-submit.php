<?php
/**
 * Uniquera consultation submit endpoint for static/Vite hosting.
 * Accepts multipart/form-data and sends via SMTP using PHPMailer.
 */

use PHPMailer\PHPMailer\Exception as PHPMailerException;
use PHPMailer\PHPMailer\PHPMailer;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array('success' => false, 'data' => array('message' => 'method_not_allowed')));
    exit;
}

$autoload = __DIR__ . '/vendor/autoload.php';
if (!is_file($autoload)) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'data' => array('message' => 'phpmailer_missing')));
    exit;
}
require_once $autoload;

function uniquera_env_value($key, $default = '') {
    static $env = null;
    if ($env === null) {
        $env = array();
        foreach (array(__DIR__ . '/.env', __DIR__ . '/../.env', __DIR__ . '/../../.env') as $path) {
            if (!is_readable($path)) {
                continue;
            }
            $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if (!is_array($lines)) {
                continue;
            }
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || strpos($line, '#') === 0 || strpos($line, '=') === false) {
                    continue;
                }
                list($k, $v) = explode('=', $line, 2);
                $k = trim($k);
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

if (isset($_POST['action']) && $_POST['action'] === 'uniquera_form_nonce') {
    echo json_encode(array('success' => true, 'data' => array('nonce' => 'react-app')));
    exit;
}

$smtpHost = uniquera_env_value('SMTP_HOST', '');
$smtpUser = uniquera_env_value('SMTP_USER', '');
$smtpPass = uniquera_env_value('SMTP_PASS', '');
if ($smtpHost === '' || $smtpUser === '' || $smtpPass === '') {
    http_response_code(500);
    echo json_encode(array('success' => false, 'data' => array('message' => 'smtp_not_configured')));
    exit;
}

$labels = array(
    'gender' => 'Gender',
    'front' => 'Hair loss (frontal)',
    'back' => 'Hair loss (crown)',
    'preview' => 'Hair loss (female pattern)',
    'period' => 'Hair loss duration',
    'experienced' => 'Prior hair transplant',
    'beforeExperienceDate' => 'Prior transplant date',
    'tried_treatments' => 'Treatments tried so far',
    'tried_treatments_other' => 'Treatments tried (other)',
    'date' => 'Planned transplant timing',
    'medicines' => 'Medication, allergies, or medical conditions',
    'referral_source' => 'How did you get to know about us?',
    'fullName' => 'Full name',
    'email' => 'Email',
    'phone' => 'Phone',
    'country' => 'Phone country code',
    'city_country' => 'City and country',
    'speaks_english' => 'Speaks English',
    'speaks_english_other' => 'Language (other)',
    'travel_istanbul' => 'Willing to travel to Istanbul',
    'additional_message' => 'Anything else you want us to know?',
    'consent_info_processing' => 'Consent: information processing',
    'consent_information_accuracy' => 'Consent: information accuracy',
    'consent_contact_channels' => 'Consent: contact via WhatsApp/Phone/Email',
    'visitorIP' => 'Visitor IP',
    'visitorCity' => 'Visitor city',
    'visitorCountry' => 'Visitor country',
    'contact_time_country' => 'Contact time country',
    'source' => 'Source',
    'type' => 'Type',
    'utm_source' => 'UTM source',
    'utm_medium' => 'UTM medium',
    'utm_campaign' => 'UTM campaign',
    'utm_audience' => 'UTM audience',
    'page_url' => 'Page URL',
);

$rows = array();
foreach ($_POST as $key => $value) {
    if ($key === 'action' || $key === 'nonce') {
        continue;
    }
    $value = is_array($value) ? implode(', ', array_map('strval', $value)) : (string)$value;
    $value = trim($value);
    if ($value === '') {
        continue;
    }
    $label = isset($labels[$key]) ? $labels[$key] : $key;
    $rows[] = array('label' => $label, 'value' => $value);
}

$htmlRows = '';
foreach ($rows as $row) {
    $htmlRows .= '<tr><th style="text-align:left;padding:8px;border:1px solid #ddd;vertical-align:top;">'
        . htmlspecialchars($row['label'], ENT_QUOTES, 'UTF-8')
        . '</th><td style="padding:8px;border:1px solid #ddd;">'
        . nl2br(htmlspecialchars($row['value'], ENT_QUOTES, 'UTF-8'))
        . '</td></tr>';
}

$to = uniquera_env_value('SMTP_TO', 'uniquera@Uniqueraclinic.com');
$from = uniquera_env_value('MAIL_FROM', $smtpUser);
$fromName = uniquera_env_value('MAIL_FROM_NAME', 'Uniquera Clinic');
$replyTo = isset($_POST['email']) ? trim((string)$_POST['email']) : '';
$fullName = isset($_POST['fullName']) && trim((string)$_POST['fullName']) !== '' ? trim((string)$_POST['fullName']) : 'Unknown';

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $smtpHost;
    $mail->SMTPAuth = true;
    $mail->Username = $smtpUser;
    $mail->Password = $smtpPass;
    $mail->Port = (int)uniquera_env_value('SMTP_PORT', '587');

    $secure = strtolower(trim((string)uniquera_env_value('SMTP_SECURE', 'tls')));
    if ($secure === 'ssl' || $secure === 'smtps') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } elseif ($secure === 'tls' || $secure === 'starttls') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    }

    $mail->CharSet = 'UTF-8';
    $mail->setFrom($from, $fromName);
    $mail->addAddress($to);
    if (filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $mail->addReplyTo($replyTo, $fullName);
    }

    foreach ($_FILES as $file) {
        if (!isset($file['name'])) {
            continue;
        }
        if (is_array($file['name'])) {
            $count = count($file['name']);
            for ($i = 0; $i < $count; $i++) {
                if (isset($file['error'][$i]) && (int)$file['error'][$i] === UPLOAD_ERR_OK && isset($file['tmp_name'][$i]) && is_uploaded_file($file['tmp_name'][$i])) {
                    $mail->addAttachment($file['tmp_name'][$i], (string)$file['name'][$i]);
                }
            }
        } else {
            if (isset($file['error']) && (int)$file['error'] === UPLOAD_ERR_OK && isset($file['tmp_name']) && is_uploaded_file($file['tmp_name'])) {
                $mail->addAttachment($file['tmp_name'], (string)$file['name']);
            }
        }
    }

    $mail->isHTML(true);
    $mail->Subject = '[Uniquera] New consultation form submission - ' . $fullName;
    $mail->Body = '<!doctype html><html><body><h3>Uniquera Consultation Form Submission</h3><table style="border-collapse:collapse;width:100%;max-width:900px;">' . $htmlRows . '</table></body></html>';
    $mail->AltBody = "Uniquera Consultation Form Submission\n\n" . implode("\n", array_map(function ($row) {
        return $row['label'] . ': ' . $row['value'];
    }, $rows));
    $mail->send();

    echo json_encode(array('success' => true, 'data' => array('id' => time())));
} catch (PHPMailerException $e) {
    error_log('[Uniquera] PHPMailer error: ' . $e->getMessage());
    uniquera_mail_error_response('mail_failed', $e->getMessage());
} catch (Exception $e) {
    error_log('[Uniquera] Submit error: ' . $e->getMessage());
    uniquera_mail_error_response('mail_failed', $e->getMessage());
}
