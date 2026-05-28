# Uniquera consultation form API (static / Hostinger)

The React build submits to:

`https://your-domain.com/api/uniquera-form-submit.php`

## Required on production (Hostinger)

1. Upload the full `dist/api/` folder (including `vendor/` and `uniquera-form-submit.php`).
2. Copy `api/.env.example` to `api/.env` on the server.
3. Fill in SMTP credentials (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, etc.).
4. Ensure PHP is enabled on the hosting plan.

Without `api/.env`, submissions return `smtp_not_configured` and the form shows an error alert.

## Email behavior

On successful submit, PHPMailer sends an HTML email to `SMTP_TO` (default: `uniquera@uniqueraclinic.com`) with all form fields. Reply-To is set to the visitor email when valid.

A separate Google Apps Script webhook may also receive name/email (see `uniqueraPostConsultationWebhookSilent` in form JS).

## Local development

`npm run dev` handles `/api/uniquera-form-submit.php` via Node (see `vite.config.ts`). Configure SMTP in the project root `.env` for real mail in dev, or use the dev mock success fallback when SMTP is unset.
