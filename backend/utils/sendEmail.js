import nodemailer from "nodemailer";

// Sends transactional email. If SMTP is configured (SMTP_HOST/USER/PASS), a real
// email is sent via nodemailer; otherwise the message is logged to the server
// console as a dev fallback so flows like password reset work with zero setup.
// Configure the SMTP_* env vars (see .env.example) to send real mail.
const isSmtpConfigured = () =>
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

// Created lazily and reused across calls.
let transporter = null;
const getTransporter = () => {
  if (transporter) return transporter;
  const port = Number(process.env.SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // true for 465 (implicit TLS), false for 587/others
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
};

// Send an email. Returns { delivered } — false when it was only logged (no SMTP).
export const sendEmail = async ({ to, subject, text, html }) => {
  if (!isSmtpConfigured()) {
    // Dev fallback: no SMTP configured, so print the message instead of sending.
    console.log(
      "\n[DEV EMAIL] SMTP not configured — logging instead of sending.\n" +
        `To: ${to}\nSubject: ${subject}\n${text || html}\n`
    );
    return { delivered: false };
  }

  const from =
    process.env.EMAIL_FROM ||
    "Personal Finance Manager <no-reply@example.com>";
  await getTransporter().sendMail({ from, to, subject, text, html });
  return { delivered: true };
};
