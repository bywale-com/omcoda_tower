import { createPgPool } from "./pgConnect.ts";
import { generateOtpCode, sha256 } from "../server/auth-service/crypto.ts";

const BASE = "https://omcoda-tower.vercel.app";
const pool = createPgPool(process.env.DATABASE_URL as string);
const email = "admin@try-tower.com";
const firmId = "a0000000-0000-4000-8000-0000000000ad";
const apexId = "272744d3-0fed-4ee7-934e-4c7f2d915f93";

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
  const v = await fetch(`${BASE}/api/auth/otp/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const cookie = (v.headers.get("set-cookie") || "").split(";")[0];
  console.log("verify", v.status);

  const consultants = await fetch(`${BASE}/api/wire/machine/consultants`, {
    headers: { cookie },
  });
  const cj = await consultants.json();
  console.log(
    "consultants",
    consultants.status,
    (cj.consultants ?? []).map((c: { email: string; firmName: string; firmId: string }) => ({
      email: c.email,
      firmName: c.firmName,
      firmId: c.firmId,
    })),
  );

  for (const path of [
    "/api/wire/machine/contact-records",
    "/api/wire/machine/meetings",
    "/api/wire/machine/engagement-records",
    "/api/wire/machine/board",
  ]) {
    const r = await fetch(`${BASE}${path}`, {
      headers: { cookie, "x-firm-id": apexId },
    });
    const body = await r.json();
    console.log(path, r.status, JSON.stringify(body).slice(0, 280));
  }
} finally {
  await pool.end();
}
