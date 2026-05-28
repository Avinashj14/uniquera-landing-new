import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import {buildConsultationEmailHtml} from './emailTemplates/consultationEmail.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');
const upload = multer({storage: multer.memoryStorage()});

const FIELD_LABELS = {
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

const handleSubmit = async (req, res) => {
  try {
    const transporter = createTransport();
    if (!transporter) {
      res.status(500).json({success: false, data: {message: 'smtp_not_configured'}});
      return;
    }

    const body = req.body || {};
    const files = Array.isArray(req.files) ? req.files : [];

    const rows = Object.entries(body)
      .filter(([, value]) => value !== '' && value != null)
      .map(([key, value]) => ({
        label: FIELD_LABELS[key] || key,
        value: Array.isArray(value) ? value.join(', ') : String(value),
      }));

    const attachments = files.map((file) => ({
      filename: file.originalname,
      content: file.buffer,
      contentType: file.mimetype,
    }));

    const replyTo = typeof body.email === 'string' && body.email ? body.email : undefined;
    const to = process.env.SMTP_TO || 'uniquera@Uniqueraclinic.com';
    const from = process.env.MAIL_FROM || process.env.SMTP_USER;
    const subjectName = typeof body.fullName === 'string' && body.fullName ? body.fullName : 'Unknown';
    const pageUrl = typeof body.page_url === 'string' && body.page_url ? body.page_url : undefined;

    await transporter.sendMail({
      to,
      from,
      replyTo,
      subject: `[Uniquera] New consultation form submission - ${subjectName}`,
      html: buildConsultationEmailHtml({subjectName, rows, pageUrl}),
      attachments,
    });

    res.json({success: true, data: {id: Date.now()}});
  } catch (error) {
    console.error('Form submit failed', error);
    res.status(500).json({success: false, data: {message: 'mail_failed'}});
  }
};

app.post('/api/uniquera-form-submit', upload.any(), handleSubmit);
app.post('/api/uniquera-form-submit.php', upload.any(), handleSubmit);

app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
