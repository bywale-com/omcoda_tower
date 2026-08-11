import { createPgPool } from "./pgConnect.ts";
import { generateOtpCode, sha256 } from "../server/auth-service/crypto.ts";

const BASE = (process.env.PRODUCTION_BASE_URL ?? "https://omcoda-tower.vercel.app").replace(
  /\/$/,
  "",
);
const email = "admin@try-tower.com";
const firmId = "a0000000-0000-4000-8000-0000000000ad";
const pool = createPgPool(process.env.DATABASE_URL as string);
try {
  const code = generateOtpCode();
  await pool.query(`DELETE FROM otp_send_log WHERE lower(email)=lower($1)`, [email]);
  await pool.query(
    `UPDATE otp_challenges SET invalidated_at=now()
     WHERE firm_id=$1::uuid AND lower(email)=lower($2) AND consumed_at IS NULL`,
    [firmId, email],
  );
  await pool.query(
    `INSERT INTO otp_challenges (firm_id, email, code_hash, expires_at)
     VALUES ($1::uuid,$2,$3,now()+interval '10 minutes')`,
    [firmId, email, sha256(code)],
  );
  const t0 = Date.now();
  const r = await fetch(`${BASE}/api/auth/otp/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const text = await r.text();
  console.log(JSON.stringify({ status: r.status, ms: Date.now() - t0, body: text.slice(0, 240) }, null, 2));
} finally {
  await pool.end();
}
