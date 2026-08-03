import "server-only";

import Joi from "joi";
import { env } from "@/lib/env";
import { isMailConfigured, sendMail } from "@/lib/mailer";

export type NotificationResult =
  | { status: "sent" }
  | { status: "skipped"; reason: "disabled" | "throttled" }
  | { status: "failed" };

type Recipient = {
  email: string;
  firstName: string;
};

type LoginNotification = Recipient & {
  loginAt: Date;
};

type DeliveryOptions = {
  send?: typeof sendMail;
};

const recipientSchema = Joi.string().trim().lowercase().max(254).email().required();
const appName = env.EMAIL_APP_NAME ?? "Luro AI";
const websiteUrl = env.APP_URL;
const socialLinks = [
  ["X / Twitter", env.SOCIAL_X_URL],
  ["LinkedIn", env.SOCIAL_LINKEDIN_URL],
  ["Instagram", env.SOCIAL_INSTAGRAM_URL],
].filter((entry): entry is [string, string] => Boolean(entry[1]));

const escapeHtml = (value: string) =>
  value.replace(/[&<>"]/g, (character) => {
    if (character === "&") return `&${"amp"};`;
    if (character === "<") return `&${"lt"};`;
    if (character === ">") return `&${"gt"};`;
    return `&${"quot"};`;
  });

const safeName = (name: string) =>
  name.trim().slice(0, 100) || "there";

const socialText = () =>
  socialLinks.length
    ? socialLinks.map(([label, url]) => `${label}: ${url}`).join("\n")
    : `Official updates: ${websiteUrl}`;

const socialHtml = () =>
  socialLinks.length
    ? socialLinks
        .map(
          ([label, url]) =>
            `<a href="${escapeHtml(url)}" style="color:#7c3aed;text-decoration:none;margin-right:16px">${escapeHtml(label)}</a>`,
        )
        .join("")
    : `<a href="${escapeHtml(websiteUrl)}" style="color:#7c3aed;text-decoration:none">Official updates</a>`;

const layout = (preview: string, heading: string, name: string, content: string) => `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;background:#f4f4f7;font-family:Arial,sans-serif;color:#18181b">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preview)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f7;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #e4e4e7">
<tr><td style="padding:28px;background:linear-gradient(135deg,#18181b,#4c1d95);color:#fff"><div style="font-size:14px;letter-spacing:2px;text-transform:uppercase">${escapeHtml(appName)}</div><h1 style="margin:10px 0 0;font-size:30px;line-height:1.2">${escapeHtml(heading)}</h1></td></tr>
<tr><td style="padding:32px"><p style="font-size:18px;margin-top:0">Hi ${escapeHtml(safeName(name))},</p>${content}
<p style="margin:28px 0"><a href="${escapeHtml(websiteUrl)}/app" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:13px 22px;border-radius:9px;font-weight:bold">Open ${escapeHtml(appName)}</a></p>
<div style="border-top:1px solid #e4e4e7;padding-top:22px"><strong>Follow us</strong><p style="line-height:2">${socialHtml()}</p></div>
<p style="font-size:12px;color:#71717a;margin-bottom:0">This security notification never contains your password, access token, or other credentials. If you did not perform this action, secure your account from the website.</p>
</td></tr></table></td></tr></table></body></html>`;

export const buildWelcomeEmail = ({ firstName }: Recipient) => {
  const content = `<p style="line-height:1.7">Your registration was successful—welcome to ${escapeHtml(appName)}. We are delighted to have you here.</p>
<h2 style="font-size:20px">Everything you need to grow</h2>
<ul style="padding-left:22px;line-height:1.8"><li>Connect and manage your social channels in one workspace.</li><li>Use AI-powered tools to plan, create, and refine social content.</li><li>Explore performance insights and streamlined publishing workflows.</li></ul>
<p style="line-height:1.7">Visit the dashboard to discover the available tools, platform features, and social-media services.</p>`;
  return {
    subject: `Welcome to ${appName}`,
    text: `Hi ${safeName(firstName)},\n\nYour registration was successful. Welcome to ${appName}!\n\nUse AI-powered social content tools, connect social channels, explore performance insights, and streamline your publishing workflow.\n\nOpen your dashboard: ${websiteUrl}/app\n\nOfficial social links:\n${socialText()}\n\nThis email never contains passwords, tokens, or credentials.`,
    html: layout(
      `Your ${appName} account is ready.`,
      `Welcome to ${appName}`,
      firstName,
      content,
    ),
  };
};

export const buildWelcomeBackEmail = ({ firstName, loginAt }: LoginNotification) => {
  const formattedLogin = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "long",
    timeZone: "UTC",
  }).format(loginAt);
  const content = `<p style="line-height:1.7">You successfully logged in to ${escapeHtml(appName)}.</p>
<div style="background:#f4f4f5;border-radius:10px;padding:16px;margin:20px 0"><strong>Login date and time</strong><br>${escapeHtml(formattedLogin)} (UTC)</div>
<h2 style="font-size:20px">Pick up where you left off</h2>
<ul style="padding-left:22px;line-height:1.8"><li>Create and improve social content with AI-assisted tools.</li><li>Manage connected channels and publishing workflows.</li><li>Review your dashboard and performance insights.</li></ul>`;
  return {
    subject: `Welcome back to ${appName}`,
    text: `Hi ${safeName(firstName)},\n\nYou successfully logged in to ${appName} on ${formattedLogin} (UTC).\n\nContinue with AI-assisted social content tools, connected-channel workflows, and performance insights.\n\nOpen your dashboard: ${websiteUrl}/app\n\nOfficial social links:\n${socialText()}\n\nIf this was not you, secure your account from the website. This email never contains passwords, tokens, or credentials.`,
    html: layout(
      `Successful login to ${appName} at ${formattedLogin} UTC.`,
      "Welcome Back",
      firstName,
      content,
    ),
  };
};

const deliver = async (
  recipient: Recipient,
  message: ReturnType<typeof buildWelcomeEmail>,
  options: DeliveryOptions = {},
): Promise<NotificationResult> => {
  if (env.AUTH_NOTIFICATION_EMAILS_ENABLED !== true || !isMailConfigured) {
    return { status: "skipped", reason: "disabled" };
  }
  const validation = recipientSchema.validate(recipient.email);
  if (validation.error) return { status: "failed" };

  try {
    await (options.send ?? sendMail)({
      to: validation.value,
      ...message,
    });
    return { status: "sent" };
  } catch {
    // Authentication must remain available during provider outages. Never log PII or secrets.
    console.error("Authentication notification delivery failed.");
    return { status: "failed" };
  }
};

export const sendWelcomeEmail = (
  recipient: Recipient,
  options?: DeliveryOptions,
) => deliver(recipient, buildWelcomeEmail(recipient), options);

export const sendWelcomeBackEmail = (
  recipient: LoginNotification,
  options?: DeliveryOptions,
) => deliver(recipient, buildWelcomeBackEmail(recipient), options);
