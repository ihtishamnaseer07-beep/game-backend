import nodemailer from 'nodemailer';

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  const { SMTP_USER, SMTP_FROM } = process.env;
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('Email service not configured. Skipping email delivery.');
    return { ok: true, skipped: true };
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || SMTP_USER || 'no-reply@ai-cartoon-battle.local',
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};
