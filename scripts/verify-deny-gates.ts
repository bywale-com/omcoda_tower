/**
 * Deny-path gates: silenced contact and firm-book halt must block send/enroll.
 */
import { randomUUID } from "node:crypto";
import { createPgPool } from "./pgConnect.ts";
import { enrollAndActuate } from "../server/wire-service/cascade.ts";
import { dispatchEmail } from "../server/wire-service/dispatchSend.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("BLOCKER: DATABASE_URL missing");
  process.exit(2);
}

const firm = "firm-cedar";
const pool = createPgPool(connectionString);
const contact = `ship-deny-${randomUUID().slice(0, 8)}`;
const email = process.env.TEST_EMAIL_TO ?? "deny@example.com";

await pool.query(
  `INSERT INTO contact_records (id, firm_id, email, name) VALUES ($1,$2,$3,$4)`,
  [contact, firm, email, "Deny Path"],
);
process.env.SEND_MODE = "live";
process.env.SEND_TEST_COHORT = contact;

await pool.query(
  `INSERT INTO consent_records (contact_id, firm_id, basis, silenced, status, updated_at)
   VALUES ($1,$2,'express',true,'silenced',now())
   ON CONFLICT (contact_id, firm_id) DO UPDATE SET silenced=true, status='silenced'`,
  [contact, firm],
);
const silenced = await dispatchEmail({
  to: email,
  subject: "should not send",
  bodyText: "deny",
  firmId: firm,
  contactId: contact,
  purpose: "cem",
});
if (silenced.ok) {
  console.error("❌ silence-deny: send allowed", silenced);
  process.exit(1);
}
console.log("✅ silence-deny:", silenced.deny, silenced.detail);

await pool.query(
  `UPDATE consent_records SET silenced=false, status='unsequenced' WHERE contact_id=$1 AND firm_id=$2`,
  [contact, firm],
);
const haltId = `halt-deny-${randomUUID().slice(0, 8)}`;
await pool.query(
  `INSERT INTO halt_records (id, consultant_id, firm_id, scope, reason, halted_at)
   VALUES ($1,'ship',$2,'firm-book','deny proof',now())`,
  [haltId, firm],
);
const halted = await enrollAndActuate({
  firmId: firm,
  contactId: contact,
  agentRef: "tpl.optin_launch.v1",
  purpose: "opt-in",
  ownerChannel: "email",
  fireFirstStep: true,
});
if (halted.blocked !== "halt" && !halted.skipped) {
  console.error("❌ halt-deny: enroll/send not blocked", halted);
  process.exit(1);
}
if (halted.send && "ok" in halted.send && halted.send.ok) {
  console.error("❌ halt-deny: send succeeded under halt", halted.send);
  process.exit(1);
}
console.log("✅ halt-deny: blocked=", halted.blocked, "send=", halted.send);

await pool.query(`UPDATE halt_records SET lifted_at=now() WHERE id=$1`, [haltId]);
await pool.end();
console.log("\nDeny-path gates PASSED");
