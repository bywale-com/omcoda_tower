# Wire log — implementations wired with stand-ins

**Method:** [`../STANDIN-WIRING.md`](../STANDIN-WIRING.md)  
**Code:** `src/app/wire/`  
**Founder edge:** [`../FOUNDER-INPUT-CHECKLIST.md`](../FOUNDER-INPUT-CHECKLIST.md)

| Implementation | Status | Stand-ins | CT entry |
|---|---|---|---|
| Login OTP (Send code / Verify) | wired | mailer · otpStore | plant + Ant Login — [LOGIN-OTP.md](./LOGIN-OTP.md) |
| Halt outreach (Confirm halt / Lift / Resume) | wired | haltStore · auditTrail | plant + Ant Halt — [HALT-OUTREACH.md](./HALT-OUTREACH.md) |
| Pool send + Send gates (+ ESP policy chip) | wired | sendingPool · warmup · ipPool · sendGate · espMailer · consentSilence | Sending infrastructure · Firm bind — [POOL-SEND-GATES.md](./POOL-SEND-GATES.md) |
| CRM OAuth grant/revoke · Meta review/delivery · Activation readiness | wired | crmOAuth · metaAds · escrow | Prepared · Acquisition · Activation — [CRM-OAUTH-META-CHIPS.md](./CRM-OAUTH-META-CHIPS.md) |
| GO cutover — real Resend/Twilio/Postgres | cut over | espMailer · smsApi · otpStore · sendingPool · halt · consent · oauth · audit · primaryStore | `/wire` API — [GO-CUTOVER.md](./GO-CUTOVER.md) |

**Still stand-in (deferred):** Meta · escrow · enrich · Postmaster · warmup counters

Add a row per wired implementation. Do not graph here — this is the as-built list.
