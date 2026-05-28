# Uniquera consultation form API (static / Hostinger)

Submit URL: `https://your-domain.com/api/uniquera-form-submit.php`

## Fix: form works but no email

1. Edit **`api/.env`** on the server (not only `.env.example`).
2. Use a **real Hostinger mailbox** for `SMTP_USER` / `SMTP_PASS`.
3. Set **`SMTP_TO`** to the inbox you check (lowercase domain is fine).
4. Use **`SMTP_PORT=465`** + **`SMTP_SECURE=ssl`** (Hostinger default).
5. **`MAIL_FROM`** must be the same address as **`SMTP_USER`**.
6. Check **spam/junk** for `[Uniquera] New consultation form submission`.
7. Submissions are also saved under **`api/storage/submissions/`** (JSON backup).

## Test SMTP without the form

In `api/.env` add:

```env
MAIL_TEST_KEY=my-secret-test-key-12345
FORM_DEBUG=true
```

Then from your PC:

```bash
curl -X POST https://landing.uniqueraclinic.com/api/mail-test.php \
  -H "Content-Type: application/json" \
  -d "{\"key\":\"my-secret-test-key-12345\"}"
```

Success: `{"success":true,"sent_to":["uniquera@uniqueraclinic.com"]}`  
Failure: `mail_failed` and `debug` with the SMTP error (when `FORM_DEBUG=true`).

Remove `MAIL_TEST_KEY` when done.

## Deploy checklist

- Upload full `dist/api/` including `vendor/`, `uniquera-smtp-config.php`, `storage/`
- Create `api/.env` from `.env.example`
- Folder `api/storage/submissions/` must be writable by PHP

## Email + backup

| Channel | What |
|--------|------|
| SMTP email | Full form table to `SMTP_TO` |
| Server JSON | `api/storage/submissions/YYYY-MM-DD/*.json` |
| Google Sheet webhook | Name, email, and all form fields (browser, after success) |
