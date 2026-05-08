<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# UniquEra landing

React/Vite landing page with embedded Uniquera consultation form (no iframe), local/dev mail API, and production asset copy for form images/scripts.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in project root with SMTP settings used by `server.js`:

```bash
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=tls
SMTP_USER=example@example.com
SMTP_PASS=your-password
SMTP_TO=uniquera@uniqueraclinic.com
MAIL_FROM=noreply@uniqueraclinic.com
PORT=3000
```

3. Start Vite dev server:

```bash
npm run dev
```

## Build and production run

```bash
npm run build
npm run start
```

Build pipeline notes:

- `prebuild` runs `scope-uniquera-css` to generate scoped form CSS at `src/generated/uniquera-form-scoped.css`
- `postbuild` copies `uniquera-consultation-form/assets` into `dist/uniquera-consultation-form/assets` so production has all form images/js/css

## Consultation form behavior

- Form submit endpoint: `POST /api/uniquera-form-submit`
- Nonce endpoint: `POST /api/uniquera-form-nonce`
- On successful submit:
  - shows inline thank-you screen
  - waits 8 seconds
  - redirects back to `/`
