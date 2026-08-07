import { Resend } from "resend";

let client: Resend | null = null;

export function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is required");
  if (!client) client = new Resend(apiKey);
  return client;
}

export function mailRoot(): string {
  return process.env.MAIL_ROOT_DOMAIN?.trim() || "mail.try-tower.com";
}
