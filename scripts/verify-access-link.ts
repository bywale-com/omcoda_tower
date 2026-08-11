/**
 * Smoke: mint access link in DB → redeem on live → session valid.
 */
import { mintAccessLink } from "../server/auth-service/accessLinks.ts";
import { resolveUserByEmail } from "../server/auth-service/db.ts";
import { createPgPool } from "./pgConnect.ts";

const BASE = (process.env.PRODUCTION_BASE_URL ?? "https://omcoda-tower.vercel.app").replace(
  /\/$/,
  "",
);
const email = (process.argv[2] ?? "admin@try-tower.com").trim().toLowerCase();
const pool = createPgPool(process.env.DATABASE_URL as string);

try {
  const user = await resolveUserByEmail(pool, email);
  if (!user) {
    console.error("BLOCKER: user missing", email);
    process.exit(1);
  }

  const minted = await mintAccessLink(pool, user);
  const redeem = await fetch(`${BASE}/api/auth/access/redeem`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token: minted.rawToken }),
  });
  const redeemText = await redeem.text();
  let redeemBody: {
    ok?: boolean;
    user?: { firmId?: string };
    error?: string;
    message?: string;
  } = {};
  try {
    redeemBody = JSON.parse(redeemText) as typeof redeemBody;
  } catch {
    console.error("redeem_non_json", redeem.status, redeemText.slice(0, 200));
    process.exit(1);
  }
  const cookie = (redeem.headers.get("set-cookie") || "").split(";")[0];

  const session = await fetch(`${BASE}/api/auth/session`, {
    headers: cookie ? { cookie } : {},
  });
  const sessionBody = (await session.json().catch(() => ({}))) as {
    authenticated?: boolean;
  };

  // Second redeem must fail (one-time).
  const again = await fetch(`${BASE}/api/auth/access/redeem`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token: minted.rawToken }),
  });

  const report = {
    email,
    accessPath: minted.accessPath,
    redeemStatus: redeem.status,
    redeemOk: Boolean(redeemBody.ok),
    firmId: redeemBody.user?.firmId,
    sessionOk: Boolean(sessionBody.authenticated),
    secondRedeemStatus: again.status,
    oneTime: again.status === 401,
  };
  console.log(JSON.stringify(report, null, 2));

  if (!report.redeemOk || !report.sessionOk || !report.oneTime) {
    process.exit(1);
  }
} finally {
  await pool.end();
}
