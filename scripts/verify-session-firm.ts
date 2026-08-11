/**
 * Prove session-only firm scope (no demo-tenant default).
 *
 * - AUTH_DISABLED + DEV_SESSION_FIRM=A → sees only A rows
 * - Wrong x-firm-id / firmId claim → 403
 * - No session + AUTH_DISABLED off → 401
 * - Firm B session does not see firm A rows
 *
 * Run: npm run verify:session-firm
 */
import { randomUUID } from "node:crypto";
import { createPgPool } from "./pgConnect.ts";
import { Hono } from "hono";
import { createWireRoutes } from "../server/wire-service/routes.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

const pool = createPgPool(connectionString);
const report: Array<{ step: string; ok: boolean; detail: string }> = [];

function ok(step: string, detail: string) {
  report.push({ step, ok: true, detail });
  console.log(`✅ ${step}: ${detail}`);
}
function fail(step: string, detail: string) {
  report.push({ step, ok: false, detail });
  console.error(`❌ ${step}: ${detail}`);
}

const firmA = `firm-sess-a-${randomUUID().slice(0, 8)}`;
const firmB = `firm-sess-b-${randomUUID().slice(0, 8)}`;

function appWithEnv(): Hono {
  const app = new Hono();
  app.route("/wire", createWireRoutes());
  return app;
}

async function getCampaign(firmEnv: string, headers: Record<string, string> = {}) {
  const prevAuth = process.env.AUTH_DISABLED;
  const prevVite = process.env.VITE_AUTH_DISABLED;
  const prevDev = process.env.DEV_SESSION_FIRM;
  process.env.AUTH_DISABLED = "true";
  process.env.VITE_AUTH_DISABLED = "true";
  process.env.DEV_SESSION_FIRM = firmEnv;

  const app = appWithEnv();
  const qs = headers["x-firm-id"]
    ? `?firmId=${encodeURIComponent(headers["x-firm-id"])}`
    : "";
  const res = await app.request(`/wire/machine/campaign-state${qs}`, {
    headers: { ...headers },
  });

  process.env.AUTH_DISABLED = prevAuth;
  process.env.VITE_AUTH_DISABLED = prevVite;
  process.env.DEV_SESSION_FIRM = prevDev;
  return { status: res.status, body: await res.json() };
}

async function getCampaignNoSession() {
  const prevAuth = process.env.AUTH_DISABLED;
  const prevVite = process.env.VITE_AUTH_DISABLED;
  const prevDev = process.env.DEV_SESSION_FIRM;
  process.env.AUTH_DISABLED = "false";
  process.env.VITE_AUTH_DISABLED = "false";
  delete process.env.DEV_SESSION_FIRM;

  const app = appWithEnv();
  const res = await app.request("/wire/machine/campaign-state");

  process.env.AUTH_DISABLED = prevAuth;
  process.env.VITE_AUTH_DISABLED = prevVite;
  if (prevDev !== undefined) process.env.DEV_SESSION_FIRM = prevDev;
  return { status: res.status, body: await res.json() };
}

try {
  // Seed distinct campaign rows for two firms
  await pool.query(
    `INSERT INTO campaign_states (firm_id, state, updated_at)
     VALUES ($1,'running',now()), ($2,'armed-for-activation',now())
     ON CONFLICT (firm_id) DO UPDATE SET state=EXCLUDED.state, updated_at=now()`,
    [firmA, firmB],
  );
  ok("seed-two-firms", `${firmA}=running ${firmB}=armed-for-activation`);

  const a = await getCampaign(firmA);
  if (a.status !== 200 || a.body.firmId !== firmA || a.body.state !== "running") {
    fail("session-a", JSON.stringify({ status: a.status, body: a.body }));
  } else {
    ok("session-a", `sees own state=${a.body.state}`);
  }

  const b = await getCampaign(firmB);
  if (b.status !== 200 || b.body.firmId !== firmB || b.body.state !== "armed-for-activation") {
    fail("session-b", JSON.stringify({ status: b.status, body: b.body }));
  } else {
    ok("session-b", `sees own state=${b.body.state}`);
  }

  // Wrong-tenant: session A claims firm B header (non-admin DEV_SESSION_EMAIL).
  const prevEmail = process.env.DEV_SESSION_EMAIL;
  process.env.DEV_SESSION_EMAIL = "consultant@harbor.test";
  const wrong = await getCampaign(firmA, { "x-firm-id": firmB });
  if (wrong.status !== 403) {
    fail("wrong-tenant", `expected 403, got ${wrong.status} ${JSON.stringify(wrong.body)}`);
  } else {
    ok("wrong-tenant", "session A + x-firm-id B → 403");
  }

  // Platform admin (prototype / DEV_SESSION_EMAIL) may view-as another firm.
  process.env.DEV_SESSION_EMAIL = "admin@try-tower.com";
  const adminView = await getCampaign(firmA, { "x-firm-id": firmB });
  if (adminView.status !== 200 || adminView.body.firmId !== firmB) {
    fail(
      "admin-view-as",
      `expected 200 firm B, got ${adminView.status} ${JSON.stringify(adminView.body)}`,
    );
  } else {
    ok("admin-view-as", "DEV_SESSION_EMAIL=admin + x-firm-id B → scoped to B");
  }
  if (prevEmail !== undefined) process.env.DEV_SESSION_EMAIL = prevEmail;
  else delete process.env.DEV_SESSION_EMAIL;

  // Cross-read: A must not receive B's state even if query claims B (blocked above).
  // Also confirm A listing path never returns B's firmId.
  if (a.body.firmId === firmB) {
    fail("isolation", "firm A response leaked firm B id");
  } else {
    ok("isolation", "firm A response scoped to A only");
  }

  const none = await getCampaignNoSession();
  if (none.status !== 401) {
    fail("no-session", `expected 401, got ${none.status} ${JSON.stringify(none.body)}`);
  } else {
    ok("no-session", "AUTH_DISABLED off + no cookie → 401 (fail closed)");
  }

  // AUTH_DISABLED without DEV_SESSION_FIRM → 401
  const prevDev = process.env.DEV_SESSION_FIRM;
  const prevAuth = process.env.AUTH_DISABLED;
  process.env.AUTH_DISABLED = "true";
  delete process.env.DEV_SESSION_FIRM;
  const app = appWithEnv();
  const missingDev = await app.request("/wire/machine/campaign-state");
  const missingBody = await missingDev.json();
  process.env.AUTH_DISABLED = prevAuth;
  if (prevDev !== undefined) process.env.DEV_SESSION_FIRM = prevDev;
  if (missingDev.status !== 401) {
    fail("no-dev-firm", `expected 401, got ${missingDev.status} ${JSON.stringify(missingBody)}`);
  } else {
    ok("no-dev-firm", "AUTH_DISABLED without DEV_SESSION_FIRM → 401");
  }

  // Request-path grep: machine.ts / real machineApi must not hardcode firm-cedar
  const { readFileSync } = await import("node:fs");
  const machineSrc = readFileSync(new URL("../server/wire-service/machine.ts", import.meta.url), "utf8");
  const apiSrc = readFileSync(new URL("../src/app/wire/reals/machineApi.ts", import.meta.url), "utf8");
  if (machineSrc.includes("firm-cedar") || apiSrc.includes("firm-cedar")) {
    fail("grep-request-path", "firm-cedar still hardcoded in machine.ts or reals/machineApi.ts");
  } else {
    ok("grep-request-path", "machine.ts + reals/machineApi.ts clean of firm-cedar");
  }
} finally {
  await pool.query(`DELETE FROM campaign_states WHERE firm_id = ANY($1::text[])`, [[firmA, firmB]]);
  await pool.end();
}

const failed = report.filter((r) => !r.ok);
console.log("\n--- Session firm summary ---");
console.log(JSON.stringify(report, null, 2));
if (failed.length) process.exit(1);
console.log("\nSession firm proofs passed.");
