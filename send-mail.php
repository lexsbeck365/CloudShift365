<?php
/**
 * CloudShift365 — Contact Form Mailer
 * Uses PHPMailer with Hostinger SMTP relay.
 *
 * SETUP:
 *   1. Run: composer install
 *   2. Set SMTP_PASS below (or via environment variable for security).
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/vendor/autoload.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://cloudshift365.com');
header('Access-Control-Allow-Methods: POST');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// ---- Hostinger SMTP config ----
define('SMTP_HOST',     'smtp.hostinger.com');
define('SMTP_PORT',     587);
define('SMTP_USER',     'noreply@cloudshift365.com');
define('SMTP_PASS',     getenv('SMTP_PASS'));
define('MAIL_FROM',     'noreply@cloudshift365.com');
define('MAIL_FROM_NAME','CloudShift365');
define('MAIL_TO',       'info@cloudshift365.com');

// ---- Sanitise & validate inputs ----
function clean(string $val): string {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

$firstName = clean($_POST['firstName'] ?? '');
$lastName  = clean($_POST['lastName']  ?? '');
$email     = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$phone     = clean($_POST['phone']   ?? '');
$service   = clean($_POST['service'] ?? '');
$message   = clean($_POST['message'] ?? '');

if (!$firstName || !$lastName || !$email) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'First name, last name, and a valid email are required.']);
    exit;
}

// ---- Build and send email ----
$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;

    // Addresses
    $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
    $mail->addAddress(MAIL_TO);
    $mail->addReplyTo($email, "$firstName $lastName");

    // Content
    $mail->isHTML(true);
    $mail->Subject = "New Contact Form Submission – $firstName $lastName";
    $mail->Body    = "
        <html><body style='font-family:Arial,sans-serif;color:#333;'>
          <h2 style='color:#1a56db;'>New Contact Form Submission</h2>
          <table cellpadding='8' style='border-collapse:collapse;width:100%;max-width:600px;'>
            <tr><td><strong>Name</strong></td><td>$firstName $lastName</td></tr>
            <tr><td><strong>Email</strong></td><td><a href='mailto:$email'>$email</a></td></tr>
            <tr><td><strong>Phone</strong></td><td>" . ($phone ?: '—') . "</td></tr>
            <tr><td><strong>Service</strong></td><td>" . ($service ?: '—') . "</td></tr>
            <tr><td><strong>Message</strong></td><td>" . nl2br($message) . "</td></tr>
          </table>
        </body></html>
    ";
    $mail->AltBody = "Name: $firstName $lastName\nEmail: $email\nPhone: $phone\nService: $service\nMessage:\n$message";

    $mail->send();

    echo json_encode(['ok' => true]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Mailer error: ' . $mail->ErrorInfo]);
}
