<?php
/**
 * SMTP test — POST JSON: {"key":"YOUR_MAIL_TEST_KEY"}
 * Set MAIL_TEST_KEY in api/.env (remove when not testing).
 */
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array('success' => false, 'message' => 'method_not_allowed'));
    exit;
}

$autoload = __DIR__ . '/vendor/autoload.php';
if (!is_file($autoload)) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'message' => 'phpmailer_missing'));
    exit;
}
require_once $autoload;
require_once __DIR__ . '/uniquera-smtp-config.php';

use PHPMailer\PHPMailer\Exception as PHPMailerException;
use PHPMailer\PHPMailer\PHPMailer;

$expected = uniquera_env_value('MAIL_TEST_KEY', '');
if ($expected === '') {
    http_response_code(403);
    echo json_encode(array('success' => false, 'message' => 'mail_test_disabled'));
    exit;
}

$raw = file_get_contents('php://input');
$body = is_string($raw) ? json_decode($raw, true) : null;
$key = is_array($body) && isset($body['key']) ? (string)$body['key'] : '';
if (!hash_equals($expected, $key)) {
    http_response_code(403);
    echo json_encode(array('success' => false, 'message' => 'forbidden'));
    exit;
}

$smtpHost = uniquera_env_value('SMTP_HOST', '');
$smtpUser = uniquera_env_value('SMTP_USER', '');
$smtpPass = uniquera_env_value('SMTP_PASS', '');
if ($smtpHost === '' || $smtpUser === '' || $smtpPass === '') {
    http_response_code(500);
    echo json_encode(array('success' => false, 'message' => 'smtp_not_configured'));
    exit;
}

$toList = uniquera_parse_email_list(uniquera_env_value('SMTP_TO', 'uniquera@uniqueraclinic.com'));
if (empty($toList)) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'message' => 'invalid_recipient'));
    exit;
}

try {
    $mail = new PHPMailer(true);
    uniquera_configure_smtp_mailer($mail);
    $from = strtolower(trim($smtpUser));
    $mail->setFrom($from, uniquera_env_value('MAIL_FROM_NAME', 'Uniquera Clinic'));
    foreach ($toList as $addr) {
        $mail->addAddress($addr);
    }
    $mail->Subject = '[Uniquera] SMTP test from landing page';
    $mail->Body = '<p>If you received this, SMTP on Hostinger is working.</p><p>Time (UTC): ' . gmdate('c') . '</p>';
    $mail->isHTML(true);
    $mail->send();
    echo json_encode(array('success' => true, 'sent_to' => $toList));
} catch (PHPMailerException $e) {
    http_response_code(500);
    $out = array('success' => false, 'message' => 'mail_failed');
    if (uniquera_debug_enabled()) {
        $out['debug'] = $e->getMessage();
    }
    echo json_encode($out);
}
