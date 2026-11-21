import "server-only";

import nodemailer from "nodemailer";
import { getDb } from "@/lib/db/client";

const FROM = process.env.SMTP_FROM?.trim() || "TerraNova <no-reply@example.com>";

type AuthEmailKind = "verification" | "password-reset";

type AuthEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
  kind: AuthEmailKind;
};

export async function sendVerificationEmail(to: string, url: string): Promise<void> {
  await sendAuthEmail({
    to,
    kind: "verification",
    subject: "Verify your TerraNova account",
    text: [
      "Welcome to TerraNova.",
      "",
      "Verify your email address to activate your account and continue to checkout:",
      url,
      "",
      "This link expires in one hour. If you did not create this account, you can ignore this message.",
    ].join("\n"),
    html: `<p>Welcome to TerraNova.</p><p>Verify your email address to activate your account:</p><p><a href="${escapeHtml(url)}">Verify my email</a></p><p>This link expires in one hour. If you did not create this account, you can ignore this message.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, url: string): Promise<void> {
  await sendAuthEmail({
    to,
    kind: "password-reset",
    subject: "Reset your TerraNova password",
    text: [
      "A password reset was requested for your TerraNova account.",
      "",
      "Choose a new password:",
      url,
      "",
      "This link expires in one hour and can only be used once.",
      "If you did not request this, you can ignore this message.",
    ].join("\n"),
    html: `<p>A password reset was requested for your TerraNova account.</p><p><a href="${escapeHtml(url)}">Choose a new password</a></p><p>This link expires in one hour and can only be used once. If you did not request this, you can ignore this message.</p>`,
  });
}

async function sendAuthEmail(email: AuthEmail): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();

  if (host) {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS || "",
          }
        : undefined,
    });

    await transporter.sendMail({
      from: FROM,
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
    return;
  }

  const developmentMailbox =
    process.env.NODE_ENV !== "production" ||
    process.env.DEV_MAILBOX_ENABLED === "1";

  if (!developmentMailbox) {
    throw new Error(
      "SMTP is not configured. Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM to send account emails.",
    );
  }

  const now = new Date();
  await getDb().collection("devMailbox").insertOne({
    ...email,
    createdAt: now,
    expireAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
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
