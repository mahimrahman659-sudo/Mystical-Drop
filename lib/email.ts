import "server-only";

import nodemailer from "nodemailer";
import { BRAND_NAME } from "./brand";
import { getDb } from "@/lib/db/client";
import { isDevelopmentMailboxEnabled } from "@/lib/dev-mailbox";
import { formatPrice } from "./format";
import { formatDeliveryAddress } from "./checkout";
import type { OrderConfirmation } from "./orders";

const FROM =
  process.env.SMTP_FROM?.trim() || `${BRAND_NAME} <no-reply@example.com>`;

type StoreEmailKind =
  | "verification"
  | "password-reset"
  | "order-confirmation"
  | "order-alert";

type StoreEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
  kind: StoreEmailKind;
};

export type AuthEmailDeliveryStatus = {
  available: boolean;
  mode: "smtp" | "development-mailbox" | "unavailable";
};

export async function sendVerificationEmail(to: string, url: string): Promise<void> {
  await deliverStoreEmail({
    to,
    kind: "verification",
    subject: `Verify your ${BRAND_NAME} account`,
    text: [
      `Welcome to ${BRAND_NAME}.`,
      "",
      "Verify your email address to activate your account and continue to checkout:",
      url,
      "",
      "This link expires in one hour. If you did not create this account, you can ignore this message.",
    ].join("\n"),
    html: `<p>Welcome to ${BRAND_NAME}.</p><p>Verify your email address to activate your account:</p><p><a href="${escapeHtml(url)}">Verify my email</a></p><p>This link expires in one hour. If you did not create this account, you can ignore this message.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, url: string): Promise<void> {
  await deliverStoreEmail({
    to,
    kind: "password-reset",
    subject: `Reset your ${BRAND_NAME} password`,
    text: [
      `A password reset was requested for your ${BRAND_NAME} account.`,
      "",
      "Choose a new password:",
      url,
      "",
      "This link expires in one hour and can only be used once.",
      "If you did not request this, you can ignore this message.",
    ].join("\n"),
    html: `<p>A password reset was requested for your ${BRAND_NAME} account.</p><p><a href="${escapeHtml(url)}">Choose a new password</a></p><p>This link expires in one hour and can only be used once. If you did not request this, you can ignore this message.</p>`,
  });
}

export async function getAuthEmailDeliveryStatus(): Promise<AuthEmailDeliveryStatus> {
  if (smtpConfigured()) {
    const transporter = createSmtpTransport();
    try {
      await transporter.verify();
      return { available: true, mode: "smtp" };
    } catch {
      return { available: false, mode: "unavailable" };
    } finally {
      transporter.close();
    }
  }

  if (isDevelopmentMailboxEnabled()) {
    return { available: true, mode: "development-mailbox" };
  }

  return { available: false, mode: "unavailable" };
}

async function deliverStoreEmail(email: StoreEmail): Promise<void> {
  if (smtpConfigured()) {
    const transporter = createSmtpTransport();
    try {
      await transporter.sendMail({
        from: FROM,
        to: email.to,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });
    } finally {
      transporter.close();
    }
    return;
  }

  if (isDevelopmentMailboxEnabled()) {
    const now = new Date();
    await getDb().collection("devMailbox").insertOne({
      ...email,
      createdAt: now,
      expireAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    });
    return;
  }

  throw new Error("Email delivery is currently unavailable.");
}

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST?.trim());
}

function createSmtpTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!.trim(),
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS || "",
        }
      : undefined,
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---------------------------------------------------------------------------
// Order notifications (Cash on Delivery)
//
// Notifications are fire-and-forget from the order API: they only run for a
// freshly created order (idempotent replays never resend), each send isolates
// its own failure, and sendOrderEmails never rejects — so an email problem can
// neither fail the order response nor cause a duplicate order.
// ---------------------------------------------------------------------------

function orderCreatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  });
}

function orderItemLinesText(order: OrderConfirmation): string {
  return order.items
    .map(
      (item) =>
        `• ${item.name} x ${item.quantity} — ${formatPrice(item.lineTotal)}`,
    )
    .join("\n");
}

function orderAddressLines(order: OrderConfirmation): string[] {
  return formatDeliveryAddress(order.customer);
}

export async function sendOrderConfirmationEmail(
  order: OrderConfirmation,
): Promise<void> {
  const to = order.customer.email.trim();
  if (!to) return;

  const text = [
    `Hi ${order.customer.fullName},`,
    "",
    "Thank you for your order. Here is your Cash on Delivery summary.",
    "",
    `Order: ${order.reference}`,
    `Placed: ${orderCreatedAt(order.createdAt)}`,
    "",
    "Items:",
    orderItemLinesText(order),
    "",
    `Subtotal: ${formatPrice(order.subtotal)}`,
    "Delivery: Free nationwide delivery",
    `Total: ${formatPrice(order.total)}`,
    "",
    `Amount payable on delivery: ${formatPrice(order.total)}`,
    "",
    "Deliver to:",
    ...orderAddressLines(order).map((line) => `  ${line}`),
    `Phone: ${order.customer.phone}`,
    "",
    "Payment: Cash on Delivery — pay in cash when your order arrives.",
    "We will call you to confirm your order and delivery details before dispatch.",
    "",
    `— ${BRAND_NAME}`,
  ].join("\n");

  const itemRows = order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e6e9e0;">${escapeHtml(item.name)} &times; ${item.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #e6e9e0;text-align:right;">${escapeHtml(formatPrice(item.lineTotal))}</td></tr>`,
    )
    .join("");
  const addressHtml = orderAddressLines(order)
    .map(escapeHtml)
    .join("<br/>");

  const html = `
<p>Hi ${escapeHtml(order.customer.fullName)},</p>
<p>Thank you for your order. Here is your Cash on Delivery summary.</p>
<p><strong>Order:</strong> ${escapeHtml(order.reference)}<br/>
<strong>Placed:</strong> ${escapeHtml(orderCreatedAt(order.createdAt))}</p>
<table style="width:100%;border-collapse:collapse;">
  ${itemRows}
  <tr><td style="padding:8px 0;">Subtotal</td><td style="padding:8px 0;text-align:right;">${escapeHtml(formatPrice(order.subtotal))}</td></tr>
  <tr><td style="padding:8px 0;">Delivery</td><td style="padding:8px 0;text-align:right;">Free nationwide delivery</td></tr>
  <tr><td style="padding:8px 0;font-weight:bold;">Total</td><td style="padding:8px 0;text-align:right;font-weight:bold;">${escapeHtml(formatPrice(order.total))}</td></tr>
</table>
<p style="background:#f2f5eb;padding:12px;border-radius:8px;"><strong>Amount payable on delivery: ${escapeHtml(formatPrice(order.total))}</strong></p>
<p><strong>Deliver to:</strong><br/>${addressHtml}<br/>
<strong>Phone:</strong> ${escapeHtml(order.customer.phone)}</p>
<p>Payment: Cash on Delivery — pay in cash when your order arrives.<br/>
We will call you to confirm your order and delivery details before dispatch.</p>
<p>&mdash; ${escapeHtml(BRAND_NAME)}</p>`;

  await deliverStoreEmail({
    to,
    kind: "order-confirmation",
    subject: `Your ${BRAND_NAME} order ${order.reference} is confirmed`,
    text,
    html,
  });
}

export async function sendOrderAlertEmail(
  order: OrderConfirmation,
): Promise<void> {
  const to = process.env.ORDER_ALERT_EMAIL?.trim();
  if (!to) return;

  const text = [
    `New Cash on Delivery order: ${order.reference}`,
    "",
    `Placed: ${orderCreatedAt(order.createdAt)}`,
    `Amount payable on delivery: ${formatPrice(order.total)}`,
    "",
    "Items:",
    orderItemLinesText(order),
    "",
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Total: ${formatPrice(order.total)}`,
    "",
    `Customer: ${order.customer.fullName}`,
    `Phone: ${order.customer.phone}`,
    `Email: ${order.customer.email || "not provided"}`,
    "Deliver to:",
    ...orderAddressLines(order).map((line) => `  ${line}`),
    order.customer.instructions
      ? `Instructions: ${order.customer.instructions}`
      : null,
    "",
    "Fulfilment status: pending — call the customer to confirm delivery.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const html = `
<p><strong>New Cash on Delivery order: ${escapeHtml(order.reference)}</strong></p>
<p><strong>Amount payable on delivery: ${escapeHtml(formatPrice(order.total))}</strong><br/>
Placed: ${escapeHtml(orderCreatedAt(order.createdAt))}</p>
<p>Customer: ${escapeHtml(order.customer.fullName)}<br/>
Phone: ${escapeHtml(order.customer.phone)}<br/>
Email: ${escapeHtml(order.customer.email || "not provided")}<br/>
Deliver to: ${addressHtmlSafe(order)}</p>
<p>Items:<br/>${order.items
    .map((i) => `${escapeHtml(i.name)} &times; ${i.quantity} — ${escapeHtml(formatPrice(i.lineTotal))}`)
    .join("<br/>")}</p>
<p>Status: pending — call the customer to confirm delivery.</p>`;

  await deliverStoreEmail({
    to,
    kind: "order-alert",
    subject: `New COD order ${order.reference} — ${formatPrice(order.total)} payable on delivery`,
    text,
    html,
  });
}

function addressHtmlSafe(order: OrderConfirmation): string {
  return orderAddressLines(order).map(escapeHtml).join("<br/>");
}

/**
 * Sends every notification for a freshly created order. Never rejects:
 * each send catches and logs its own failure.
 */
export async function sendOrderEmails(order: OrderConfirmation): Promise<void> {
  const sends: Array<[string, () => Promise<void>]> = [
    ["customer confirmation", () => sendOrderConfirmationEmail(order)],
    ["admin alert", () => sendOrderAlertEmail(order)],
  ];
  for (const [label, send] of sends) {
    try {
      await send();
    } catch (error) {
      console.error(
        `[email] order ${label} failed for ${order.reference}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }
}
