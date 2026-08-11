/**
 * Mint a direct access link for a provisioned email (prints URL once).
 * Usage: npx tsx --env-file=.env scripts/issue-access-link.ts user@firm.com
 */
import { mintAccessLink } from "../server/auth-service/accessLinks.ts";
import { resolveUserByEmail } from "../server/auth-service/db.ts";
import { createPgPool } from "./pgConnect.ts";

const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!email) {
  console.error("Usage: issue-access-link.ts <email>");
  process.exit(1);
}

const origin = (
  process.env.PUBLIC_APP_URL ??
  process.env.APP_ORIGIN ??
  process.env.PRODUCTION_BASE_URL ??
  "https://omcoda-tower.vercel.app"
).replace(/\/$/, "");

const pool = createPgPool(process.env.DATABASE_URL as string);
try {
  const user = await resolveUserByEmail(pool, email);
  if (!user) {
    console.error(`No user for ${email}`);
    process.exit(1);
  }
  const minted = await mintAccessLink(pool, user);
  console.log(
    JSON.stringify(
      {
        email: user.email,
        firmId: user.firm_id,
        accessPath: minted.accessPath,
        accessUrl: `${origin}${minted.accessPath}`,
        expiresAt: minted.expiresAt.toISOString(),
      },
      null,
      2,
    ),
  );
} finally {
  await pool.end();
}
