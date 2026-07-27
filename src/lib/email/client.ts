import "server-only";

import nodemailer from "nodemailer";

type MailConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName: string;
};

function readMailConfig(): MailConfig | null {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!user || !pass) return null;

  return {
    host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    user,
    pass,
    fromName: process.env.MAIL_FROM_NAME?.trim() || "PSR Member Portal",
  };
}

export function isEmailConfigured() {
  return readMailConfig() !== null;
}

export async function sendMail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const config = readMailConfig();
  if (!config) {
    throw new Error("SMTP is not configured.");
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: `"${config.fromName}" <${config.user}>`,
    to,
    subject,
    text,
    html,
  });
}
