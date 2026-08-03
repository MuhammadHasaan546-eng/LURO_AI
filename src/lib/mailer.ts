import "server-only";

import nodemailer from "nodemailer";
import { env } from "@/lib/env";

const smtpConfig = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  user: env.SMTP_USER,
  pass: env.SMTP_PASS,
};

const assertSmtpConfigured = () => {
  if (
    !smtpConfig.host ||
    !smtpConfig.port ||
    smtpConfig.secure === undefined ||
    !smtpConfig.user ||
    !smtpConfig.pass
  ) {
    throw new Error("Gmail SMTP is not fully configured.");
  }

  return {
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    user: smtpConfig.user,
    pass: smtpConfig.pass,
  };
};

const config = assertSmtpConfigured();

export const mailTransporter = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  secure: config.secure,
  auth: {
    user: config.user,
    pass: config.pass,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 30_000,
  tls: {
    minVersion: "TLSv1.2",
  },
});

/** Call during deployment health checks or application startup. */
export const verifyMailConnection = async (): Promise<void> => {
  await mailTransporter.verify();
};

/**
 * Complete sendMail example. Replace `to` and message content for real mail.
 * The App Password is used only by the transporter and is never returned or logged.
 */
export const sendExampleEmail = async (to = "muhammadhasaanm546@gmail.com") => {
  return mailTransporter.sendMail({
    from: `"Luro AI" <${config.user}>`,
    to,
    subject: "Luro AI Gmail SMTP test",
    text: "Your Luro AI Gmail SMTP configuration is working.",
    html: "<p>Your <strong>Luro AI</strong> Gmail SMTP configuration is working.</p>",
  });
};
