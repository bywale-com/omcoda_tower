# Agent-codeable vs human provisioning

**Parent doctrine:** [`DOCTRINE-sme-cto-implementation.md`](./DOCTRINE-sme-cto-implementation.md) §4  
**Audience:** CTO / Wiring · onboarding ops  
**Job:** Within any capability's build, separate work a sub-agent can finish from residue that is irreducibly human — before inventing desks or queues.

---

## Principle

Only one of these species is sub-agent-friendly; the other is the real operational cost:

| Species | Meaning | Example shape |
|---|---|---|
| **Agent-codeable** | Integration against a documented API with a testable outcome | Create sending domain, publish DKIM via API, wire webhook, warmup scheduler, suppression check |
| **Human-provisioning residue** | Real-world acts no agent can perform | DNS on the *firm's* zone, procure provider accounts / IPs, calendar-time warmup + receiver signals, TCR/brand filing |

The residue is the true per-firm onboarding cost and must be named as its own bucket — never blurred into "the CTO handles it" ([doctrine §2](./DOCTRINE-sme-cto-implementation.md)).

---

## Origin

Cross-checking Tower deliverability against how Weave / Attentive / managed platforms operate for many clients: one durable branded sending identity per firm (subdomain + aligned DKIM; registered brand + campaign for SMS). The platform can drive setup *on the client's behalf*, but DNS delegation, account procurement, warmup time, and registry filings stay human and per-firm. At ~6,500 Ontario firms that is an onboarding pipeline, not a one-time config.

---

## Mechanics

In the Wiring / CTO pass, tag each capability item's build as `agent-codeable` or `human-provisioning` (or both, with the split named). Size the human bucket deliberately as onboarding backlog.

---

## Not the same as

| Nearby cut | Doc | Difference |
|---|---|---|
| **Surface intent** | [`SURFACE-INTENT.md`](./SURFACE-INTENT.md) | Who *starts* / who *watches* a faced thing |
| **Handoff** | [`HANDOFF-ROUTING.md`](./HANDOFF-ROUTING.md) | Which *column* owns the problem (`pm` / `both` / `cto`) |
| **CTO sink filter** | doctrine §2 | Specialist accomplishment vs generic wiring |

Agent paths often need idempotency, retries, observability. Human paths need assignment, SLA, audit.
