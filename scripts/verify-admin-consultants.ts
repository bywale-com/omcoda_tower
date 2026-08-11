import { createPgPool } from "./pgConnect.ts";
import { generateOtpCode, sha256 } from "../server/auth-service/crypto.ts";

const BASE = "https://omcoda-tower.vercel.app";
const email = "admin@try-tower.com";
const firmId = "a0000000-0000-4000-8000-0000000000ad";
const pool = createPgPool(process.env.DATABASE_URL as string);
try {
  const unauth = await fetch(`${BASE}/api/wire/machine/consultants`);
  console.log("unauth", unauth.status, await unauth.text());

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
  const vj = await v.json();
  const c = await fetch(`${BASE}/api/wire/machine/consultants`, { headers: { cookie } });
  const cj = await c.json();
  console.log(
    JSON.stringify(
      {
        verifyOk: vj.ok,
        email: vj.user?.email,
        consultantsStatus: c.status,
        count: cj.consultants?.length ?? 0,
        sample: (cj.consultants ?? []).slice(0, 5),
      },
      null,
      2,
    ),
  );
} finally {
  await pool.end();
}
