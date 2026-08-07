/**
 * Sync founder-account fixtures from server capabilities.
 * Only flips true when secrets are actually present — fixture honesty.
 */
import { markFixture } from "../fixtures/store";
import { wireFetch } from "../http";

export type WireCapabilities = {
  resend: boolean;
  twilio: boolean;
  database: boolean;
  twilioFromNumber: string | null;
  mailRoot: string;
};

export async function bootstrapRealAccountFixtures(): Promise<WireCapabilities | null> {
  try {
    const caps = await wireFetch<WireCapabilities>("/capabilities");
    if (caps.resend) {
      markFixture({
        id: "esp_account_provisioned",
        present: true,
        markedBy: "founder",
        note: "RESEND_API_KEY present",
      });
    }
    if (caps.twilio) {
      markFixture({
        id: "sms_account_provisioned",
        present: true,
        markedBy: "founder",
        note: "Twilio secrets present",
      });
      markFixture({
        id: "ca_sms_number_provisioned",
        present: true,
        markedBy: "founder",
        note: `TWILIO_FROM_NUMBER=${caps.twilioFromNumber ?? "set"}`,
      });
    }
    return caps;
  } catch {
    return null;
  }
}
