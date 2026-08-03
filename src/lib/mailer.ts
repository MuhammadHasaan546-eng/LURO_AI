import "server-only";

import nodemailer from "nodemailer";
import { env } from "@/lib/env";

const smtpConfigured = Boolean(
  env.SMTP_HOST &&
  env.SMTP_PORT &&
  env.SMTP_SECURE !== undefined &&
  env.SMTP_USER &&
  env.SMTP_PASS,
);

const smtpConfig = smtpConfigured
  ? {
      host: env.SMTP_HOST!,
      port: env.SMTP_PORT!,
      secure: env.SMTP_SECURE!,
      user: env.SMTP_USER!,
      pass: env.SMTP_PASS!,
    }
  : null;

/** A disabled mailer keeps authentication available when email is not configured locally. */
export const mailTransporter = smtpConfig
  ? nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: { user: smtpConfig.user, pass: smtpConfig.pass },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 30_000,
      tls: { minVersion: "TLSv1.2" },
    })
  : null;

export const isMailConfigured = smtpConfigured;

/** Call during deployment health checks or application startup. */
export const verifyMailConnection = async (): Promise<void> => {
  if (!mailTransporter) throw new Error("Email delivery is not configured.");
  await mailTransporter.verify();
};

export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

/** Sends a message without exposing credentials or message contents to logs. */
export const sendMail = async (message: MailMessage) => {
  if (!mailTransporter || !smtpConfig) {
    throw new Error("Email delivery is not configured.");
  }

  return mailTransporter.sendMail({
    from: env.EMAIL_FROM ?? smtpConfig.user,
    ...message,
  });
};
