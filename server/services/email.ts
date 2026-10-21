import nodemailer from 'nodemailer';
import type { Config } from '../config';
import type { Logger } from '../logger';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface Mailer {
  send(message: MailMessage): Promise<void>;
}

export function createMailer(config: Config, logger: Logger): Mailer {
  if (!config.SMTP_HOST) {
    return {
      async send(m) {
        // No SMTP configured: keep the app fully functional and make the message visible in logs.
        logger.info({ to: m.to, subject: m.subject }, 'email not sent (SMTP_HOST not configured)');
        if (!config.isProd) logger.debug({ body: m.text }, 'email body');
      }
    };
  }
  const transport = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    auth: config.SMTP_USER ? { user: config.SMTP_USER, pass: config.SMTP_PASS } : undefined
  });
  return {
    async send(m) {
      await transport.sendMail({ from: config.MAIL_FROM, to: m.to, subject: m.subject, text: m.text, html: m.html });
    }
  };
}

/** Fire-and-forget delivery: an email failure must never fail the business operation that triggered it. */
export function sendSafe(mailer: Mailer, logger: Logger, message: MailMessage): void {
  mailer.send(message).catch((err) => logger.error({ err, to: message.to, subject: message.subject }, 'failed to send email'));
}

export const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; unitPriceCents: number }>;
  totalCents: number;
  paymentMethod: string;
  estimatedDelivery: string | null;
}

const wrap = (title: string, body: string) =>
  `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#1c1917"><h1 style="letter-spacing:.2em;font-size:20px">SAYPHORA</h1><h2 style="font-weight:600">${escapeHtml(title)}</h2>${body}<p style="color:#78716c;font-size:12px;margin-top:32px">Sayphora Luxury Beauty</p></div>`;

export function orderConfirmationEmail(d: OrderEmailData, appUrl?: string): Omit<MailMessage, 'to'> {
  const lines = d.items.map((i) => `${i.quantity} × ${i.name} — ${money(i.unitPriceCents * i.quantity)}`);
  const text = [
    `Hello ${d.customerName},`,
    '',
    `Thank you for your order ${d.orderNumber}.`,
    ...lines,
    '',
    `Total: ${money(d.totalCents)} (${d.paymentMethod})`,
    d.estimatedDelivery ? `Estimated delivery: ${d.estimatedDelivery}` : '',
    appUrl ? `View your order: ${appUrl}` : ''
  ].filter((l) => l !== '' || true).join('\n');
  const html = wrap(
    `Order ${d.orderNumber} confirmed`,
    `<p>Hello ${escapeHtml(d.customerName)}, thank you for your order.</p><ul>${d.items
      .map((i) => `<li>${i.quantity} × ${escapeHtml(i.name)} — ${money(i.unitPriceCents * i.quantity)}</li>`)
      .join('')}</ul><p><strong>Total: ${money(d.totalCents)}</strong> (${escapeHtml(d.paymentMethod)})</p>${
      d.estimatedDelivery ? `<p>Estimated delivery: ${escapeHtml(d.estimatedDelivery)}</p>` : ''
    }`
  );
  return { subject: `Sayphora order ${d.orderNumber} confirmed`, text, html };
}

export function orderStatusEmail(d: { orderNumber: string; customerName: string; status: string; trackingNumber?: string | null; carrier?: string | null }): Omit<MailMessage, 'to'> {
  const tracking = d.trackingNumber ? `Tracking: ${d.carrier ?? 'Carrier'} ${d.trackingNumber}` : '';
  return {
    subject: `Your Sayphora order ${d.orderNumber} is now ${d.status}`,
    text: `Hello ${d.customerName},\n\nYour order ${d.orderNumber} status is now: ${d.status}.\n${tracking}`,
    html: wrap(`Order ${d.orderNumber}: ${d.status}`, `<p>Hello ${escapeHtml(d.customerName)}, your order is now <strong>${escapeHtml(d.status)}</strong>.</p>${tracking ? `<p>${escapeHtml(tracking)}</p>` : ''}`)
  };
}

export function passwordResetEmail(d: { name: string; resetUrl: string }): Omit<MailMessage, 'to'> {
  return {
    subject: 'Reset your Sayphora password',
    text: `Hello ${d.name},\n\nUse this link to choose a new password (valid for 1 hour):\n${d.resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: wrap('Reset your password', `<p>Hello ${escapeHtml(d.name)},</p><p><a href="${escapeHtml(d.resetUrl)}">Choose a new password</a> (valid for 1 hour).</p><p>If you did not request this, you can ignore this email.</p>`)
  };
}
