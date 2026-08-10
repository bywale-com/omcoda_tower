/**
 * Read the latest Tower OTP from Resend for a given inbox.
 * Usage: npx tsx --env-file=.env scripts/read-latest-otp.ts [email]
 */
import { readFileSync } from "node:fs";

function loadEnv(): Record<string, string> {
  try {
    return Object.fromEntries(
      readFileSync(".env", "utf8")
        .split("\n")
        .filter((l) => l && !l.startsWith("#") && l.includes("="))
        .map((l) => {
          const i = l.indexOf("=");
          return [l.slice(0, i), l.slice(i + 1)];
        }),
    );
  } catch {
    return {};
  }
}

const env = { ...loadEnv(), ...process.env };
const email = (process.argv[2] || env.TEST_EMAIL_TO || "").toLowerCase();
const key = env.RESEND_API_KEY;
if (!key || !email) {
  console.error("Need RESEND_API_KEY and email");
  process.exit(1);
}

const list = await fetch("https://api.resend.com/emails?limit=20", {
  headers: { Authorization: `Bearer ${key}` },
});
if (!list.ok) {
  console.error("Resend list failed", list.status, await list.text());
  process.exit(1);
}
const data = (await list.json()) as {
  data: Array<{ id: string; to: string[]; subject: string; created_at: string }>;
};
const candidates = data.data.filter(
  (e) =>
    e.to.some((t) => t.toLowerCase() === email) &&
    /verification code/i.test(e.subject),
);
if (!candidates.length) {
  console.error(`No OTP emails for ${email}`);
  process.exit(2);
}
const latest = candidates[0];
const detail = await fetch(`https://api.resend.com/emails/${latest.id}`, {
  headers: { Authorization: `Bearer ${key}` },
});
const body = (await detail.json()) as { html?: string; text?: string; subject: string };
const hay = `${body.html ?? ""}\n${body.text ?? ""}`;
const m = hay.match(/verification code is\s*<strong>(\d{4,8})<\/strong>/i) ||
  hay.match(/verification code is\s*(\d{4,8})/i) ||
  hay.match(/\b(\d{6})\b/);
if (!m) {
  console.error("OTP not found in email", latest.id, body.subject);
  process.exit(3);
}
console.log(
  JSON.stringify({
    email,
    code: m[1],
    subject: body.subject,
    id: latest.id,
    created_at: latest.created_at,
  }),
);
