import Busboy from 'busboy';
import nodemailer from 'nodemailer';
import type {IncomingMessage, ServerResponse} from 'node:http';
import {buildConsultationEmailHtml} from '../emailTemplates/consultationEmail.js';

const FIELD_LABELS: Record<string, string> = {
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

function json(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    return null;
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: (process.env.SMTP_SECURE || 'tls').toLowerCase() === 'ssl',
    auth: {user, pass},
  });
}

async function readRawBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    json(res, 405, {success: false, data: {message: 'method_not_allowed'}});
    return;
  }

  const contentType = String(req.headers['content-type'] || '');
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const raw = await readRawBody(req);
    const params = new URLSearchParams(raw);
    if (params.get('action') === 'uniquera_form_nonce') {
      json(res, 200, {success: true, data: {nonce: 'react-app'}});
      return;
    }
    json(res, 400, {success: false, data: {message: 'bad_request'}});
    return;
  }

  const transporter = createTransport();
  if (!transporter) {
    json(res, 500, {success: false, data: {message: 'smtp_not_configured'}});
    return;
  }

  const fields: Record<string, string[]> = {};
  const attachments: Array<{filename: string; content: Buffer; contentType?: string}> = [];

  try {
    await new Promise<void>((resolve, reject) => {
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
      bb.on('close', () => resolve());
      bb.on('error', reject);
      req.pipe(bb);
    });

    if (fields.action?.[0] === 'uniquera_form_nonce') {
      json(res, 200, {success: true, data: {nonce: 'react-app'}});
      return;
    }

    const rows = Object.entries(fields)
      .filter(([key]) => key !== 'action' && key !== 'nonce')
      .map(([key, values]) => ({
        label: FIELD_LABELS[key] || key,
        value: values.join(', '),
      }))
      .filter((row) => row.value.trim() !== '');

    const email = fields.email?.[0];
    const fullName = fields.fullName?.[0] || 'Unknown';
    const pageUrl = fields.page_url?.[0];

    await transporter.sendMail({
      to: process.env.SMTP_TO || 'uniquera@Uniqueraclinic.com',
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      replyTo: email,
      subject: `[Uniquera] New consultation form submission - ${fullName}`,
      html: buildConsultationEmailHtml({subjectName: fullName, rows, pageUrl}),
      attachments,
    });

    json(res, 200, {success: true, data: {id: Date.now()}});
  } catch (error) {
    console.error('Vercel form submit failed', error);
    json(res, 500, {success: false, data: {message: 'mail_failed'}});
  }
}

