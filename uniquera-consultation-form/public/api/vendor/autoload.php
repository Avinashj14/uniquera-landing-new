<?php
/**
 * Minimal autoload for PHPMailer (no Composer). Used by enroll.php.
 */
$base = __DIR__ . '/phpmailer/phpmailer/src';
require_once $base . '/Exception.php';
require_once $base . '/OAuthTokenProvider.php';
require_once $base . '/OAuth.php';
require_once $base . '/POP3.php';
require_once $base . '/DSNConfigurator.php';
require_once $base . '/SMTP.php';
require_once $base . '/PHPMailer.php';
