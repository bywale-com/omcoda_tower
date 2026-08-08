type TwilioFactory = typeof import("twilio").default;

let factory: TwilioFactory | null = null;

async function loadTwilio(): Promise<TwilioFactory> {
  if (!factory) {
    const mod = await import("twilio");
    factory = mod.default;
  }
  return factory;
}

export async function getTwilio() {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  if (!sid || !token) throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required");
  const twilio = await loadTwilio();
  return twilio(sid, token);
}

export function twilioFromNumber(): string {
  const from =
    process.env.TWILIO_FROM_NUMBER?.trim() || process.env.TWILIO_PHONE_NUMBER?.trim();
  if (!from) throw new Error("TWILIO_FROM_NUMBER is required");
  return from;
}
