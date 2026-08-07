import type { SmsApiPort } from "../standins/smsApi";
import { wireFetch } from "../http";

export const realSmsApi: SmsApiPort = {
  tag: "real",
  async send(input) {
    return wireFetch("/send/sms", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
