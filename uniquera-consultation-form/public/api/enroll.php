<?php
/**
 * Vitality 90 – Form & assessments. JSON POST. mail() only.
 * emailType: 'eligibility' | 'mirror' = send only that assessment; otherwise full consultation (requires name/email).
 */
@header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo '{"error":"Method not allowed"}'; exit; }

$raw = @file_get_contents('php://input');
$body = $raw !== false ? @json_decode($raw, true) : null;
if (!is_array($body)) { http_response_code(400); echo '{"error":"Invalid JSON"}'; exit; }

$emailType = isset($body['emailType']) ? trim((string)$body['emailType']) : '';

$to = 'info@threetreebiotech.com';
$from = 'noreply@threetreebiotech.com';
foreach (array(__DIR__.'/.env', __DIR__.'/../.env', __DIR__.'/../../.env') as $f) {
    if (is_file($f) && is_readable($f)) {
        $lines = @file($f, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#') continue;
            if (preg_match('/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/', $line, $m)) {
                $k = trim($m[1]); $v = trim($m[2]);
                if (preg_match('/^["\'](.*)["\']$/', $v, $q)) $v = $q[1];
                if ($k === 'SMTP_TO') $to = $v;
                if ($k === 'MAIL_FROM') $from = $v;
            }
        }
        break;
    }
}

$headers = "From: Vitality 90 <$from>\r\nContent-Type: text/plain; charset=utf-8\r\n";

// --- Eligibility-only email ---
if ($emailType === 'eligibility') {
    $eligibilityTest = isset($body['eligibilityTest']) ? $body['eligibilityTest'] : (isset($body['eligibility_test']) ? $body['eligibility_test'] : []);
    if (!is_array($eligibilityTest) || empty($eligibilityTest)) { http_response_code(400); echo '{"error":"eligibilityTest required"}'; exit; }
    $text = "Vitality 90 – Eligibility assessment completed\n";
    $text .= "Submitted: " . date('Y-m-d H:i:s') . " UTC\n\nEligibility Test (Q&A)\n--------------------\n";
    foreach ($eligibilityTest as $i => $qa) {
        $qa = is_array($qa) ? $qa : (is_object($qa) ? (array)$qa : []);
        $q = isset($qa['question']) ? trim((string)$qa['question']) : '';
        $a = isset($qa['answer']) ? trim((string)$qa['answer']) : '';
        if ($q !== '' || $a !== '') $text .= ($i + 1).". Q: $q\n   A: $a\n\n";
    }
    $ok = @mail($to, 'Vitality90 – Eligibility assessment completed', $text, $headers);
    if ($ok) {
        error_log('[Vitality90] Mail sent: eligibility assessment at ' . date('Y-m-d H:i:s') . ' to ' . $to);
        echo '{"success":true,"message":"Eligibility email sent."}';
    } else {
        error_log('[Vitality90] Mail failed: eligibility assessment at ' . date('Y-m-d H:i:s') . ' to ' . $to);
        http_response_code(500); echo '{"error":"Failed to send email."}';
    }
    exit;
}

// --- Mirror-only email ---
if ($emailType === 'mirror') {
    $vitalityReflection = isset($body['vitalityReflection']) ? $body['vitalityReflection'] : (isset($body['vitality_reflection']) ? $body['vitality_reflection'] : null);
    if (!is_array($vitalityReflection) || empty($vitalityReflection)) { http_response_code(400); echo '{"error":"vitalityReflection required"}'; exit; }
    $text = "Vitality 90 – Private Vitality Mirror completed\n";
    $text .= "Submitted: " . date('Y-m-d H:i:s') . " UTC\n\n";
    $text .= "Total score: " . (isset($vitalityReflection['totalScore']) ? $vitalityReflection['totalScore'] : '') . "\n";
    if (!empty($vitalityReflection['domainScores'])) {
        foreach ($vitalityReflection['domainScores'] as $ds) {
            $ds = is_array($ds) ? $ds : (is_object($ds) ? (array)$ds : []);
            $text .= "  - ".(isset($ds['name']) ? $ds['name'] : '').": ".(isset($ds['score']) ? $ds['score'] : '')."\n";
        }
    }
    if (isset($vitalityReflection['classification'])) $text .= "Classification: ".$vitalityReflection['classification']."\n";
    if (isset($vitalityReflection['mapping'])) $text .= "Mapping: ".$vitalityReflection['mapping']."\n";
    if (!empty($vitalityReflection['questionAndAnswers'])) {
        $text .= "\nMirror Q&A:\n";
        foreach ($vitalityReflection['questionAndAnswers'] as $i => $qa) {
            $qa = is_array($qa) ? $qa : (is_object($qa) ? (array)$qa : []);
            $dom = isset($qa['domain']) ? $qa['domain'] : '';
            $q = isset($qa['question']) ? $qa['question'] : '';
            $sel = isset($qa['selectedText']) ? $qa['selectedText'] : (isset($qa['selectedIndex']) ? 'Option '.$qa['selectedIndex'] : '');
            $text .= ($i + 1).". [$dom] $q\n   Answer: $sel\n\n";
        }
    }
    $ok = @mail($to, 'Vitality90 – Private Vitality Mirror completed', $text, $headers);
    if ($ok) {
        error_log('[Vitality90] Mail sent: private mirror at ' . date('Y-m-d H:i:s') . ' to ' . $to);
        echo '{"success":true,"message":"Mirror email sent."}';
    } else {
        error_log('[Vitality90] Mail failed: private mirror at ' . date('Y-m-d H:i:s') . ' to ' . $to);
        http_response_code(500); echo '{"error":"Failed to send email."}';
    }
    exit;
}

// --- Full consultation (requires name/email) ---
$name = isset($body['name']) ? trim((string)$body['name']) : '';
$email = isset($body['email']) ? trim((string)$body['email']) : '';
if ($name === '' || $email === '') { http_response_code(400); echo '{"error":"Name and email are required."}'; exit; }

$phone = isset($body['phone']) ? trim((string)$body['phone']) : '';
$whatsapp = isset($body['whatsapp']) ? trim((string)$body['whatsapp']) : '';
$ageRange = isset($body['ageRange']) ? trim((string)$body['ageRange']) : '';
$primaryConcern = isset($body['primaryConcern']) ? trim((string)$body['primaryConcern']) : '';
$consent = !empty($body['consent']);
$vitalityReflection = isset($body['vitalityReflection']) ? $body['vitalityReflection'] : (isset($body['vitality_reflection']) ? $body['vitality_reflection'] : null);
$eligibilityTest = isset($body['eligibilityTest']) ? $body['eligibilityTest'] : (isset($body['eligibility_test']) ? $body['eligibility_test'] : []);
if (!is_array($eligibilityTest)) $eligibilityTest = [];

$eligibilityBlock = "\n\nEligibility Test (Q&A)\n--------------------\n";
if (!empty($eligibilityTest)) {
    foreach ($eligibilityTest as $i => $qa) {
        $qa = is_array($qa) ? $qa : (is_object($qa) ? (array)$qa : []);
        $q = isset($qa['question']) ? trim((string)$qa['question']) : '';
        $a = isset($qa['answer']) ? trim((string)$qa['answer']) : '';
        if ($q !== '' || $a !== '') $eligibilityBlock .= ($i + 1).". Q: $q\n   A: $a\n\n";
    }
} else {
    $eligibilityBlock .= "(none submitted)\n";
}

$vitalityBlock = "\n\nVitality Reflection (Private Vitality Mirror)\n-----------------------------------------\n";
if (is_array($vitalityReflection) && !empty($vitalityReflection)) {
    if (isset($vitalityReflection['totalScore'])) $vitalityBlock .= "Total score: ".$vitalityReflection['totalScore']."\n";
    if (!empty($vitalityReflection['domainScores'])) {
        foreach ($vitalityReflection['domainScores'] as $ds) {
            $ds = is_array($ds) ? $ds : (is_object($ds) ? (array)$ds : []);
            $vitalityBlock .= "  - ".(isset($ds['name']) ? $ds['name'] : '').": ".(isset($ds['score']) ? $ds['score'] : '')."\n";
        }
    }
    if (isset($vitalityReflection['classification'])) $vitalityBlock .= "Classification: ".$vitalityReflection['classification']."\n";
    if (isset($vitalityReflection['mapping'])) $vitalityBlock .= "Mapping: ".$vitalityReflection['mapping']."\n";
    if (!empty($vitalityReflection['questionAndAnswers'])) {
        $vitalityBlock .= "\nMirror Q&A:\n";
        foreach ($vitalityReflection['questionAndAnswers'] as $i => $qa) {
            $qa = is_array($qa) ? $qa : (is_object($qa) ? (array)$qa : []);
            $dom = isset($qa['domain']) ? $qa['domain'] : '';
            $q = isset($qa['question']) ? $qa['question'] : '';
            $sel = isset($qa['selectedText']) ? $qa['selectedText'] : (isset($qa['selectedIndex']) ? 'Option '.$qa['selectedIndex'] : '');
            $vitalityBlock .= ($i + 1).". [$dom] $q\n   Answer: $sel\n\n";
        }
    }
} else {
    $vitalityBlock .= "(none submitted)\n";
}

$text = "Consultation request\n--------------------\nName: $name\nEmail: $email\nPhone: $phone\nWhatsApp: ".($whatsapp ?: '-')."\nAge range: ".($ageRange ?: '-')."\nPrimary concern: ".($primaryConcern ?: '-')."\nConsent: ".($consent ? 'Yes' : 'No').$eligibilityBlock.$vitalityBlock;
$headers = "From: Vitality 90 <$from>\r\nReply-To: $email\r\nContent-Type: text/plain; charset=utf-8\r\n";
$ok = @mail($to, 'Vitality90 - Consultation Request: '.$name, $text, $headers);
if ($ok) {
    error_log('[Vitality90] Mail sent: consultation request at ' . date('Y-m-d H:i:s') . ' to ' . $to . ' (from ' . $email . ')');
    echo '{"success":true,"message":"Consultation request sent."}';
} else {
    error_log('[Vitality90] Mail failed: consultation request at ' . date('Y-m-d H:i:s') . ' to ' . $to);
    http_response_code(500); echo '{"error":"Failed to send email. Please try again later."}';
}
