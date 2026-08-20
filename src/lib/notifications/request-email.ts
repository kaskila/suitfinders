/**
 * Sends the "new custom request" alert email via Resend. See
 * docs/architecture.md's Request Notification Behaviour section: this
 * function is awaited and can throw — the caller (the Server Action) is
 * responsible for wrapping the call in try/catch so a delivery failure
 * never blocks or fails the request write.
 *
 * Free-tier Resend has no verified domain: sends must come from
 * onboarding@resend.dev and go only to the account owner's address
 * (NOTIFICATION_EMAIL).
 */
import { Resend } from "resend";

const FROM_ADDRESS = "SuitFinders <onboarding@resend.dev>";

export interface RequestNotificationInput {
  requestId: string;
  contactName: string;
  contactPhone: string;
  contactWhatsapp: string | null;
  product: { name: string; size: string } | null;
  occasion: string | null;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
}

function waLink(number: string): string {
  return `https://wa.me/${number.replace(/^\+/, "")}`;
}

function budgetLine(min: number | null, max: number | null): string {
  if (min === null && max === null) return "Not specified";
  if (min !== null && max !== null) return `K${min} – K${max}`;
  if (min !== null) return `From K${min}`;
  return `Up to K${max}`;
}

function buildEmailText(input: RequestNotificationInput, adminUrl: string): string {
  const replyNumber = input.contactWhatsapp ?? input.contactPhone;
  const lines = [
    `New custom request from ${input.contactName}`,
    "",
    `Phone: ${input.contactPhone}`,
    input.contactWhatsapp ? `WhatsApp: ${input.contactWhatsapp}` : null,
    `Product: ${input.product ? `${input.product.name} (size ${input.product.size})` : "Open request"}`,
    `Occasion: ${input.occasion ?? "Not specified"}`,
    `Budget: ${budgetLine(input.budgetMin, input.budgetMax)}`,
    "",
    "Description:",
    input.description,
    "",
    `Reply on WhatsApp: ${waLink(replyNumber)}`,
    `View in admin: ${adminUrl}`,
  ];
  return lines.filter((line) => line !== null).join("\n");
}

export async function sendRequestNotificationEmail(input: RequestNotificationInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_EMAIL;
  if (!apiKey || !to) {
    throw new Error("RESEND_API_KEY or NOTIFICATION_EMAIL is not configured.");
  }

  const adminUrl = new URL("/admin/requests", process.env.BETTER_AUTH_URL).toString();
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `New request: ${input.contactName}`,
    text: buildEmailText(input, adminUrl),
  });

  if (error) {
    throw new Error(`Resend rejected the notification email: ${error.message}`);
  }
}
