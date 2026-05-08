import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import Busboy from 'busboy';
import nodemailer from 'nodemailer';

const fieldLabels: Record<string, string> = {
  gender: 'Gender',
  front: 'Hair loss (frontal)',
  back: 'Hair loss (crown)',
  preview: 'Hair loss (female pattern)',
  period: 'Hair loss duration',
  experienced: 'Prior hair transplant',
  beforeExperienceDate: 'Prior transplant date',
  tried_treatments: 'Treatments tried so far',
  tried_treatments_other: 'Treatments tried (other)',
  date: 'Planned transplant timing',
  medicines: 'Medication, allergies, or medical conditions',
  referral_source: 'How did you get to know about us?',
  fullName: 'Full name',
  email: 'Email',
  phone: 'Phone',
  country: 'Phone country code',
  city_country: 'City and country',
  speaks_english: 'Speaks English',
  speaks_english_other: 'Language (other)',
  travel_istanbul: 'Willing to travel to Istanbul',
  additional_message: 'Anything else you want us to know?',
  consent_info_processing: 'Consent: information processing',
  consent_information_accuracy: 'Consent: information accuracy',
  consent_contact_channels: 'Consent: contact via WhatsApp/Phone/Email',
  visitorIP: 'Visitor IP',
  visitorCity: 'Visitor city',
  visitorCountry: 'Visitor country',
  contact_time_country: 'Contact time country',
  source: 'Source',
  type: 'Type',
  utm_source: 'UTM source',
  utm_medium: 'UTM medium',
  utm_campaign: 'UTM campaign',
  utm_audience: 'UTM audience',
  page_url: 'Page URL',
};

function createTransport(env: Record<string, string>) {
  const host = env.SMTP_HOST;
  const port = Number(env.SMTP_PORT || 587);
  const user = env.SMTP_USER;
  const pass = env.SMTP_PASS;
  if (!host || !user || !pass) {
    return null;
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: (env.SMTP_SECURE || 'tls').toLowerCase() === 'ssl',
    auth: {user, pass},
  });
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'uniquera-dev-mail-api',
        configureServer(server) {
          server.middlewares.use('/api/uniquera-form-nonce', (_req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({success: true, data: {nonce: 'react-app'}}));
          });

          server.middlewares.use('/api/uniquera-form-submit', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end();
              return;
            }

            const transporter = createTransport(env);
            if (!transporter) {
              // Local/dev fallback: allow form UX testing without SMTP.
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  data: {id: Date.now(), mock: true, message: 'smtp_not_configured_dev_fallback'},
                }),
              );
              return;
            }

            const fields: Record<string, string[]> = {};
            const attachments: Array<{filename: string; content: Buffer; contentType?: string}> = [];
            const bb = Busboy({headers: req.headers});

            bb.on('field', (name, value) => {
              fields[name] = fields[name] || [];
              fields[name].push(value);
            });

            bb.on('file', (_name, file, info) => {
              const chunks: Buffer[] = [];
              file.on('data', (chunk: Buffer) => chunks.push(chunk));
              file.on('end', () => {
                if (chunks.length > 0) {
                  attachments.push({
                    filename: info.filename || 'upload.bin',
                    content: Buffer.concat(chunks),
                    contentType: info.mimeType,
                  });
                }
              });
            });

            bb.on('close', async () => {
              try {
                const rows = Object.entries(fields)
                  .map(([key, values]) => ({
                    label: fieldLabels[key] || key,
                    value: values.join(', '),
                  }))
                  .filter((row) => row.value.trim() !== '');

                const htmlRows = rows
                  .map(
                    (row) =>
                      `<tr><th style="text-align:left;padding:8px;border:1px solid #ddd;vertical-align:top;">${row.label}</th><td style="padding:8px;border:1px solid #ddd;">${row.value}</td></tr>`,
                  )
                  .join('');

                const email = fields.email?.[0];
                const fullName = fields.fullName?.[0] || 'Unknown';

                await transporter.sendMail({
                  to: env.SMTP_TO || 'uniquera@Uniqueraclinic.com',
                  from: env.MAIL_FROM || env.SMTP_USER,
                  replyTo: email,
                  subject: `[Uniquera] New consultation form submission - ${fullName}`,
                  html: `<!doctype html><html><body><h3>Uniquera Consultation Form Submission</h3><table style="border-collapse:collapse;width:100%;max-width:900px;">${htmlRows}</table></body></html>`,
                  attachments,
                });

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({success: true, data: {id: Date.now()}}));
              } catch (error) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({success: false, data: {message: 'mail_failed'}}));
              }
            });

            req.pipe(bb);
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
