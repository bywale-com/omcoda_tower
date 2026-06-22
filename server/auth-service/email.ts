import { Resend } from "resend";
import { log, logError } from "./logger.ts";

let resend: Resend | null = null;

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required");
  }
  if (!resend) {
    resend = new Resend(apiKey);
  }
  return resend;
}

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL ?? "Tower <onboarding@resend.dev>";
  try {
    const { error } = await getResend().emails.send({
      from,
      to,
      subject: "Your Tower verification code",
      html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
    });
    if (error) {
      logError("auth.otp.send.resend_error", error, { to_domain: to.split("@")[1] });
      throw new Error(error.message);
    }
    log("auth.otp.send.resend_ok", { to_domain: to.split("@")[1] });
  } catch (error) {
    logError("auth.otp.send.resend_error", error, { to_domain: to.split("@")[1] });
    throw error;
  }
}
