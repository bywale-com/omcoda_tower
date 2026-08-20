# Systems — change packet 020 (operation writes; module is a pane)

**Seat:** Systems Analyst.  
**When:** 2026-08-20 13:05 UTC.  
**What this is:** the cut for the Operator gap. Implementer **only implements**. Founder model: an **operation writes a table**; the module **displays those rows**. That is already UI law (control vs pane) and A34 (Audit field).  
**Why:** Activation state (and cousins) currently **compute in React** or **paint**. That is untraceable. The wrong fix is a `firm_readiness` table that **copies** other writes (same bug as an events log that copies the INSERT).  
**Join:** [`SYSTEMS-OPERATOR-MODULES-ASCRIBE.md`](./SYSTEMS-OPERATOR-MODULES-ASCRIBE.md) · A34 [`SYSTEMS-AUDIT-FIELD-ASCRIBE.md`](./SYSTEMS-AUDIT-FIELD-ASCRIBE.md).  
**Flag:** 15:43 untouched. **Do not recut 015.**  
**Instructions:** founder only.

---

## The argument (not taste)

**One fact, one write.** The grant row **is** “book authorized.” `campaign_states.running` **is** “running.”

A `firm_readiness` row that stores `authorized = true` because the grant exists is a **second copy of the same fact**. Then the machine has two answers to one question. The second write can be skipped; the copy is then a lie.

That is the events law already locked: the INSERT **is** the event. Do not also insert a row that says the INSERT happened ([`SYSTEMS-EVENTS.md`](./SYSTEMS-EVENTS.md)). `firm_readiness` would be that second row, for Operator.

History is different: an **append** (`audit_events` at time T) is a new fact (“this happened then”), not a second current boolean. Current truth stays on the gate table.

---

## Judgment (locked)

**Yes — an operation writes a table; the module displays those rows.** Not a calculator in the SPA. Same law as control vs pane, and as A34.

**Grain:** one **operation** → one write (existing table, or mint **the** table for that operation). A **module** is allowed to pane **several** of those writes. Activation state is that case: six operations, six tables, one list. Do **not** collapse six operations into one `firm_readiness` row.

**No — do not mint a sixth table that shadows the five gates.** The CRM grant **is** authorize-book. `campaign_states.running` **is** running. Copying those into `firm_activation.book_authorized` drifts the next time Bind flips and Activation forgets to UPDATE.

Test for every Operator sider module:

1. Is there a **write-button** (Save, Hydrate, Bind, New gap) with nowhere to INSERT/UPDATE? → use the existing table, or mint **that** operation’s table.
2. Is the screen a **list of writes that already exist**? → SELECT those rows. Chrome (percent, “next”, grade) stays unpersisted.
3. Would a new table **copy** another table’s truth? → refuse. Same bug as an events log that copies the INSERT.

Split the opportunities:

| Kind of module | What to do |
|----------------|------------|
| **Paint pretending to be an operation** (Commercial Save, Register gaps) | Make the button write. Use the table that already exists, or mint **one** table that **is** that operation. |
| **Projection dashboard** (Firm health, Oversight) | Leave as SELECT over enrollments / runs / attempts. Do **not** mint `firm_health`. Health is those writes. |
| **Composite pane** (Activation state) | Same as A34. Show the **existing** gate rows. Percent / “next” is chrome on that list. |
| **Trace / journey over time** | The operation **appends** `audit_events` (table already exists). Audit trail is the history. Do not mint a second log. |

---

## Activation state — pane, not a new ledger

No `firm_activation`. No percent column.

The module **lists** these current rows for the selected firm. Missing row = that gate empty (honest).

| Gate on glass | Table.field (source of truth) | Written by |
|---------------|-------------------------------|------------|
| Firm exists | `ct_firms` row | Provision |
| Forward-deployed | `prepared_workspaces.status` hydrated / `body.staging` | Forward-deploy Hydrate |
| Authorize book | `crm_oauth_grants.granted AND NOT revoked` | Prepared Authorize |
| Ready to send | `sending_domains.status` (verified) | Sending allocate + DNS verify — **not** a fixture chip |
| Escrow held | `escrow_acceptances` (020 Commercial below) | Commercial Save / accept |
| Running | `campaign_states.state = 'running'` | Bind **Active** |

Percent and “next” stay chrome: count how many of those rows are present / true. Do not persist the percent.

Automations: Get firm / If already can pick those tables once they are on the handle. Do not invent `activation_pct`.

---

## Paint → write (the other spots)

### Commercial — use `escrow_acceptances` (exists)

Live Ant Save / Release is `setState` on DEMO rows. The table is already there and unused.

```sql
-- 020: status is the instrument. terms stay jsonb.
ALTER TABLE escrow_acceptances
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'held'
    CHECK (status IN (
      'held',
      'release_pending_window',
      'released',
      'returned',
      'disputed'
    ));
```

Save terms → UPSERT `terms` + `accepted`. Release / Return / Dispute → `status`. Activation “escrow held” reads `status IN ('held','release_pending_window')` or `accepted` — **one** rule, pick `status = 'held'` unless the glass says pending window still counts as held. **Held on glass = `held` or `release_pending_window`.** Released / returned / disputed = not held.

Kill DEMO_FIRMS as the instrument list. Index = session/real firms (same honesty as Bind).

Escrow **provider** rail stays stand-in. This packet is the **acceptance / status row**, not Stripe.

### Sending — Activation reads `sending_domains`

Allocate already INSERT `sending_domains`. Ready-to-send = that row `status` verified (or `verified_at IS NOT NULL`). Stop using `isSendingIdentityReady` fixture as the Activation gate.

### Register & evolution — mint one table (the operation has none)

The Gap modal is an operation with **nowhere to write**. `SEED_GAPS` is paint.

```sql
CREATE TABLE IF NOT EXISTS register_gaps (
  id TEXT PRIMARY KEY,
  summary TEXT NOT NULL,
  ticket TEXT,
  firm_id TEXT,
  source TEXT,
  written BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Save / New gap UPSERT. List = SELECT. Reasonable seed: a few rows, not a fake world. Do not stuff this into `primary_store_rows`.

### Audit trail — append on the operations (table exists)

Provision, Bind Active, escrow status change, domain allocate, hydrate: INSERT `audit_events` (`kind`, `subject_type='firm'`, `subject_id=firm_id`). That **is** the journey history. Activation does not query it for the percent; Audit trail does.

Many of those handlers are silent today. 020 = append. Do not mint `firm_activation_event`.

---

## Do not materialize

| Module | Why |
|--------|-----|
| Firm health | Already SELECT `enrollment` / `active_attempts` / `engagement_records`. A `firm_health` copy drifts. |
| Oversight | Same projection, fleet grain. |
| Acquisition Meta | Port still stand-in. `primary_store_rows` bag stays until ads are real. Do not mint `meta_campaigns` this packet. |
| Support tickets | `primary_store_rows` bag. First-class `support_tickets` is a later mint if tickets become Automations-visible. Not 020. |
| Policy bounds on Founder card | Paint. Kill-switch already writes `halt_records`. Do not mint `agency_policy` from those four DEMO rows. |

---

## Files

| File | Why |
|------|-----|
| `supabase/migrations/018_operator_panes.sql` | `escrow_acceptances.status` · `register_gaps` · seed a few gaps |
| `server/wire-service/machine.ts` | Commercial upsert; gaps list/upsert; Activation list query of the six gates; `audit_events` append on provision / bind / escrow / domain / hydrate |
| `ActivationStateModule.tsx` | Render that list. Percent chrome. No local OR of stand-ins as source of truth |
| `CommercialModule.tsx` | Write `escrow_acceptances`. No DEMO instrument list |
| `RegisterEvolutionModule.tsx` | Write `register_gaps` |
| Sending / Bind / Provision | Already write; add audit append + Activation reads `sending_domains` |

Filename **018** on main is unused (017 is event contract). If 018 is taken when you cut, next number. Do not recut packet 018 A34.

`npm run build`. Manual: Provision a firm → Activation shows existence. Bind Active → Running gate true. Commercial Save → Escrow gate from that row. Register New gap → row survives refresh.

---

## What this is not

- Not overwriting 15:43.
- Not recutting 015.
- Not `firm_readiness` / `activation_pct`.
- Not copying `crm_oauth_grants` into a second boolean column.
- Not turning Firm health into a stored grade.
