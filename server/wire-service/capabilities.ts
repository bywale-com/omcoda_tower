/** Server-side: which real accounts are provisioned (secrets present). */

export type WireCapabilities = {
  resend: boolean;
  twilio: boolean;
  database: boolean;
  twilioFromNumber: string | null;
  mailRoot: string;
  fromEmail: string | null;
};

export function getWireCapabilities(): WireCapabilities {
  const twilioFrom =
    process.env.TWILIO_FROM_NUMBER?.trim() ||
    process.env.TWILIO_PHONE_NUMBER?.trim() ||
    null;
  return {
    resend: Boolean(process.env.RESEND_API_KEY?.trim()),
    twilio: Boolean(
      process.env.TWILIO_ACCOUNT_SID?.trim() &&
        process.env.TWILIO_AUTH_TOKEN?.trim() &&
        twilioFrom,
    ),
    database: Boolean(process.env.DATABASE_URL?.trim()),
    twilioFromNumber: twilioFrom,
    mailRoot: process.env.MAIL_ROOT_DOMAIN?.trim() || "mail.try-tower.com",
    fromEmail: process.env.RESEND_FROM_EMAIL?.trim() || null,
  };
}
