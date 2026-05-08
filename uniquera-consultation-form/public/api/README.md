# Vitality 90 – Form API (PHP for Apache)

The consultation form submits to `api/enroll.php`. This script uses **PHPMailer** to send email via SMTP.

## Build

- **PHPMailer is included** in `public/api/vendor` (no Composer required). **`npm run build`** runs Vite only; the `dist` output includes `api/vendor` with PHPMailer.
- Optional: if you use Composer, **`npm run setup:api`** refreshes `public/api/vendor` via `composer install`.

## Setup on Apache hosting

1. Deploy the built app (from `dist/`), including the `api` folder with `enroll.php`, `vendor`, and `api/.env`.

2. **Configure SMTP** in `api/.env` (copy from `.env.example`):
   - `SMTP_HOST` – e.g. `smtp.gmail.com`, `smtp.office365.com`
   - `SMTP_PORT` – usually `587` (TLS) or `465` (SSL)
   - `SMTP_SECURE` – `tls`, `ssl`, or leave empty
   - `SMTP_USER` – your SMTP login email
   - `SMTP_PASS` – password or app password
   - `SMTP_TO` – optional; default `info@threetreebiotech.com`

3. Ensure the app is deployed so that `api/enroll.php` is reachable at  
   `https://yourdomain.com/vitality-90-program/api/enroll.php`  
   (same path as in the built app).

## Local dev

With `npm run dev`, the Node server handles `POST /vitality-90-program/api/enroll.php` so the form works without PHP. Configure SMTP in the project root `.env` for Node.
