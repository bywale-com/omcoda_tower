# Systems — change packet enrichment (C0 / C9 / C11 / C13 + 010 ratify)

**Seat:** Systems Analyst.  
**When:** 2026-08-16 17:05 UTC.  
**What this is:** the next cut. Implementer **only implements**. No analysis.  
**Why:** (1) `010_sequence_campaign_housing.sql` landed on **main** — ratify extras vs the 02:31 packet. (2) PR [#89](https://github.com/bywale-com/omcoda_tower/pull/89) [`IMPLEMENTER-FACE-PASS.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/implementer-face-pass-2bec/docs/register/IMPLEMENTER-FACE-PASS.md) adds C0 / C9 / C11 / C13. Most maps onto 010. **Variations do not.**  
**Flag:** 15:43 untouched. Captions: [`IMAGE-CAPTION-AUDIT.md`](./IMAGE-CAPTION-AUDIT.md). Parent packet: [`SYSTEMS-CHANGE-PACKET.md`](./SYSTEMS-CHANGE-PACKET.md).  
**Instructions:** founder only.

---

## 010 on main — ratify / leftover

They cut the 02:31 packet. Housing tables match. No `qualify_gate`. No `launch_window` types. Next campaign = `ord`.

| They did | Vs packet | Decision |
|----------|-----------|----------|
| `action.type` includes **`run_audit`** | Not in the CHECK list I wrote | **Accept.** A15 “Audit the contacts” is an in-app action. Write = INSERT `audit_runs` (`status='complete'`) then `dispatchEventToWorkflows('audit.completed')`. That is the write-as-event. Keep the token. |
| `seq_attempt_cycle` defaults 3 / 86400 | Packet defaulted 1 / nullable | **Accept.** Matches C6 example values. |
| `campaign_failure` uses `created_at`, no `failed_at` | Packet had `failed_at` | **Accept.** The INSERT time is the event. Do not add a second timestamp. |
| Seed objective name **“They opt in”** | Caption said title, not a class | **E.** `kind='form'` is the spec. Name is seed copy. Operator renames. Do not CHECK that string. |
| `enrollment.sequence_id` still nullable | Packet said NOT NULL after backfill | **Leftover.** Backfill then NOT NULL in **011** if any nulls remain. Not a new grain. |
| `rule_attempt_criteria.campaign_channel_id` | Packet asked for it | Stood up. **C11 channel-rules node uses this.** Do not mint a second rules table. |

Do not reopen 010. 011 is this file.

---

## What #89 needs in the machine

Written spec is the product. Copy the grain. Extrapolate to every channel. No extra PNG.

### C0 — no new table

Agents settings **gear** on the catalog (next to New template) **opens C6**. Persist = existing NULL-firm `seq_attempt_cycle` (`sac-global`) + NULL-firm `rule_*` / `seq_*`. Do not invent a third Settings surface. Ignore mock beats on that PNG.

### C9 — no new table (chrome for columns we already have)

When **Override this** is on, the campaign shows:

- **Attempt count** → `campaign.attempt_count`
- **Distance between attempts** → `campaign.wait_after_last_failed_seconds`

Attempts are cycles of the same channel order. Not on a channel. `nth_exception` jsonb stays on `campaign` (C6/C7 grain; not this plate’s purpose).

**Do not** copy **+ Add channel** from the C9 PNG. Add channel is **written** (below). Ignore qualify leftover on that PNG.

### C11 — **new table** (this is the gap)

Dead: three radios on one composer locking a single block.

**Copy:** **+ Add variation** at the **top** of the channel node. Adds another **content** block on **that same channel**. Then **each variation** has how it applies in the attempt cycle: **every attempt** / **only this attempt** / **every attempt except this one**. Selector lives **on the variation**.

Not A/B. Same channel, more than one content, each tied to the attempt cycle. **On every channel** (Text, Email, Call, any added). C11 showing Text does not mean Email/Call have none.

Variations **share** channel rules. Not per variation. Not per attempt.

```sql
-- 011 (spec — implementer cuts)

CREATE TABLE campaign_channel_variation (
  id TEXT PRIMARY KEY,
  campaign_channel_id TEXT NOT NULL REFERENCES campaign_channel(id) ON DELETE CASCADE,
  ord INT NOT NULL DEFAULT 0,
  apply_mode TEXT NOT NULL DEFAULT 'every'
    CHECK (apply_mode IN ('every', 'only_this', 'every_except')),
  attempt_n INT,                         -- required when apply_mode <> 'every'
  content JSONB NOT NULL DEFAULT '{}'::jsonb,  -- same keys as campaign_channel.content
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX campaign_channel_variation_ord_idx
  ON campaign_channel_variation (campaign_channel_id, ord);

ALTER TABLE campaign_channel_variation
  ADD CONSTRAINT campaign_channel_variation_attempt_n
  CHECK (apply_mode = 'every' OR attempt_n IS NOT NULL);
```

**Migrate:** for each existing `campaign_channel`, INSERT one variation `ord=0`, `apply_mode='every'`, `content` = that row’s `content`. After that, **runtime reads variations**, not `campaign_channel.content`. The parent `content` column **stays** (like `sequence_template.cells`) — leftover, not the spine. Save writes variations. Do not persist the dead three radios.

Composer keys unchanged (C5b): text `{to,body}` · email `{subject,from,reply_to,body_html,body_text}` · call `{voice,script,listening_prompt,goal,notes}`.

### Channel rules — no new table

Seat: extra **wired node** off that channel (C5 / C11). Fill with **toggles**, not the teaching caption.

**Grain:** this **channel** in this **campaign**. Shared by all variations and all attempts.

Use stood-up `rule_attempt_criteria` with `campaign_channel_id` set. `enabled` = the toggle. `threshold` / `threshold_unit` = **within time**. Do not put Form rows on a Call node.

| Channel | Toggle rows (`label` / `when_clause` grain) |
|---------|-----------------------------------------------|
| **text** | not opened · not delivered · within time |
| **email** | not opened · link not clicked · within time |
| **call** | not answered · not completed · within time |
| **any added** | same family for **that** medium, this campaign |

Fallback: this campaign’s this channel → C7 sequence defaults per medium → C6 global. Override toggle **above** the modulators; off = inherit (greyed); on = edit. Inherit = `campaign_channel_id IS NULL` rows at sequence/global. Local = rows with this `campaign_channel_id`.

Do not put attempt-count / distance on this node (those are C9 on the campaign).

### C13 — no new table (query)

Activity tab = Ant **table**. Columns: **Time · Name · Firm · Channel · What happened**. Search. Pagination. Real names and firms.

Query `engagement_records` (and send/outbound as needed) **join** `contact_records` for name / firm. Map `event_kind` to a **prose** “what happened”. Do **not** show `event_kind` + UUID. Not the engagement chart. Reports may stay empty.

### Contacts — no new table

Same table chrome as C13. Columns: **Name · Firm · Enrolled date**. Rows from `enrollment` join `contact_records`. Add contact = C8 modal (Every firm / Select from). Not a thin popover.

### + Add channel — no new table

On the open campaign (Override this on): INSERT `campaign_channel` with a `token` from `{text,email,call}` **not already on that campaign**. Do not stub. Do not change a number first. **No fourth medium this pass** — CHECK stays three tokens. “Any channel you add” = those three until a new medium is a **new ask**.

### Channels independently open — no column

Open/closed is **canvas chrome**. Any mix. Opening one must not close the others. Do **not** add `is_open`. Save does not have to restore which nodes were expanded.

### Rename in place — no table

Node / campaign title: click, edit. Campaign `name`. Workflow graph node `label`. Including If. Already rows / jsonb.

### Override toggle above modulators — already specified

C0 → C6 global. Sequence tab → C7 (`firm_sequence_binding.override_*`). Campaign Override this → C9 attempt columns. Channel = composer + variations + channel rules. Channels nest **inside** a campaign; they are not a fourth CSS sibling of sequence/global.

### Modals scroll — chrome, not a table

Fix the UI. No column.

---

## Plate → 011

| Plate / writing | Persist |
|-----------------|---------|
| **C0** | Gear opens C6. `sac-global`. |
| **C6 / C7** | Already 010. Channel-rules **defaults** here; canvas node is campaign-local. |
| **C9** | `campaign.attempt_count` · `wait_after_last_failed_seconds`. |
| **C11** | `campaign_channel_variation` as specified. + Add variation. Apply mode on the variation. **Every** channel. |
| **Channel rules node** | `rule_attempt_criteria` where `campaign_channel_id` = this channel. Toggles per table above. |
| **C13** | Query, not DDL. |
| **Contacts** | Query `enrollment` + `contact_records`. C8 modal. |
| **+ Add channel** | INSERT `campaign_channel` remaining token. |
| **A12 / A14 / A11** | Still parent packet. Match those plates. |

---

## Files for 011

| File | Why |
|------|-----|
| `supabase/migrations/011_channel_variations.sql` | `campaign_channel_variation` + migrate one `every` row per channel |
| `server/wire-service/campaignHousing.ts` | Load/save variations; cascade send picks variation by attempt n |
| `server/wire-service/cascade.ts` | Attempt cycle: which variation’s `content` fires |
| Ant Agents canvas | + Add variation on every channel; C9 fields; channel-rules toggles; C13 table; C0 gear |

`npm run build`. Manual: Override this on → set attempt count + distance → add a second text variation “only attempt 2” → Save → row exists. Activity table shows names, not UUIDs.

---

## What this is not

- Not overwriting 15:43.
- Not a `qualify` node (C9 leftover caption ignored).
- Not freezing Launch window / Launch day.
- Not three radios as the variation model.
- Not channel rules per variation or per attempt.
- Not Form rows on a Call node.
- Not a fourth channel token.
- Not `is_open` on channels.
- Not the engagement chart.
- Not asking the founder for SQL.
