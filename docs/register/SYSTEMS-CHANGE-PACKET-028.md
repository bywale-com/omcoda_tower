# Systems — change packet 028 (Wait kind + approval note)

**Seat:** Systems Analyst.  
**When:** 2026-08-26 19:35 UTC.  
**What this is:** the cut so Engineer only implements. No analysis.  
**Why:** Founder + PM locked the Wait note. Face: [`WAIT-NOTE-APPROVER-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/WAIT-NOTE-APPROVER-PACKET.md) (pickup) + frozen [`WAIT-NOTE-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/WAIT-NOTE-PACKET.md). Ascribe [`SYSTEMS-STAGED-START-ASCRIBE.md`](./SYSTEMS-STAGED-START-ASCRIBE.md) **11:11** (title + count; instance in this workflow). **19:35** answers the SA paste and names the store.  
**Join:** 015 handle (do not recut) · 017 left handle for **N** · 019 kinds on the graph (Additive) · T4 consultant person desk ([`SHELL-CHROME-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/SHELL-CHROME-PACKET.md)). Face: `git fetch origin pull/96/head`.  
**Flag:** 15:43 untouched. **Do not recut 015.** Do not put this on `action.type` (Spine 3). Additive: new graph kind + occupancy table alongside.  
**Instructions:** founder only.

Plates (ignore Start strings, Harbor, `optin`, **24**, teaching): **W1** · **W2b** (not W2) · **W3** · **N1** · **N1b** · **N2**.

---

## What this is / is not

| This | Not this |
|------|----------|
| Graph type **`wait`**. Two shapes on that node: approval · duration | `action.type = await_approval` / Hub `delay` as Switch |
| Approval: title text + Approver Consultant \| Operator. Desk = that title + **count** + **Approve now** · **Approve later** | Sequence picker. Form chip. Infer from the next node. **Start** / Start now / Start later |
| Count = open occupancy of **this Wait node in this workflow** | `sequence_ready` as the listing. A second bar because titles match across workflows |
| Duration: amount + unit. Park the run. **No** N1 / N2 | Approver on Duration. A consultant note for a clock |
| Resume **this** run’s outgoing on Approve / clock | Two canvases. A new `event_name` that starts a second graph |

---

## Live (quote `origin/main` — do not guess)

| Live | Gap |
|------|-----|
| `WorkflowNodeType` = `trigger` · `constant` · `branch` · `switch` · `rule` · `action` · `exit` · `get`. Walker visits those. Unknown **continues** (`goOn`). | No **`wait`**. Palette / `WIRE_ADD_KINDS` have no Wait. |
| Action visit: write, then **`goOn` outgoing**. `action.type` CHECK widened; `agent_ref` nullable. | Parking on `action.type` recuts Action’s visit. **Refuse.** |
| `workflow_run.status` CHECK `running` \| `success` \| `failed` \| `stopped`. `finished_at` set when the walk returns. | No **`waiting`**. A park today either finishes the run or walks the next node. |
| `untilNodeId` returns **before** visiting that node. | That is Run-up-to. It does **not** resume on Approve. |
| `node_status` jsonb on the run. `commitWrites` + 015 last-writer handle. | No person row for “parked at this Wait across **runs**.” Two imports = two runs. `node_status` cannot COUNT the bar. |
| Cascade already ticks **schedule** `workflow_trigger` rows. | Duration / Approve-later clocks have no resume SELECT. |
| Consultant person desk = `ConsultantAntScene` (T4: Consultant only). Operator desk = `OperatorAntScene`. | No occupancy SELECT. No N1 / N2. |
| `configured === false` stops the visit (Run packet). | Wait has no configured check yet. |

`sequence_ready` stays the If. Do not overload it.

---

## What’s new on the plates (since ascribe 11:11)

Specified and clear — cut them:

1. **W2b Approver.** Wait for approval: **Title** + **Approver: Consultant · Operator**. Two values. Segment (as drawn). Not Contact. Not a people list. Duration hides Approver (W3).
2. **Buttons.** Always **Approve now** · **Approve later**. PNG still says Start — **do not build Start.**
3. **N1b.** Approve later opens a small popover **beneath** that button: date · time · tiny **X**. The two buttons stay. Tiny X closes only the nest.
4. **N2.** Solid bar. Same title + count. **Approve now** on the **right**, inside the bar. Click the rest of the bar → N1. N1 **X** → N2 (bar remains).
5. **W1.** Wait on the palette and on the wire **+** (A28 family). Badge on the node = this shape (`approval` / duration). Canvas label = the title.

PM specified-but-not-clear — **decided here** so the cut is not blocked:

| Gap | Cut |
|-----|-----|
| One title field vs title + prompt template / “contacts” box | **One title field** (`data.title`). Note heading **is** that string. W2b has no second box. “Approve opt-in” / “contacts” / **24** on the PNGs = example. Do not persist a noun. Count is the number; the word next to it on N1 is chrome for people (do not freeze `contacts` as a type). |
| N1 first vs N2 first | First occupancy for that group this session → **N1**. If they already **X**’d to N2, later arrivals **only bump the count** on the bar. Do not open a second note. |
| Date/time needs its own confirm? | **No.** Picking date + time **is** the schedule. Tiny X on the nest = no schedule. |
| Consultant = that firm’s person vs any consultant role | **That firm’s consultant desk** (T4 / `ConsultantAntScene` for the occupancy row’s `firm_id`). Operator = `OperatorAntScene` overlay, same N1/N2 chrome. Do not invent an Operator Board module. |
| Segment vs dropdown | **Segment.** Two values. W2b. |

---

## Hard decisions

### 1. Kind `wait`. Not Action.

```
WorkflowNodeType += "wait"
```

Palette + `WIRE_ADD_KINDS`: **Wait**. Walker: `type === "wait"` **before** the unknown-type `goOn`. Do not fall through.

| Shape (`data.shape`) | Interior | Visit |
|----------------------|----------|--------|
| **`approval`** (default on new Wait) | W2b: Title + Approver | INSERT occupancy. **Stop.** Resume on Approve now / scheduled later. |
| **`duration`** | W3: amount + unit. No Approver | Set this run `waiting` + `resume_at`. **Stop.** No desk note. Resume on the clock. |

⋯ **Switch** on this node still means change **this** Wait’s shape (A26). That is not the Switch node.

Canvas: `data.title` is the node label when set; else “Wait”. Badge = shape.

### 2. Occupancy table (approval). Duration does not list.

`node_status` is per run. The bar is **across runs**. Mint one table. Do not overload `sequence_ready`. Do not mint an approver table. Do not mint an events copy.

```sql
-- 021_wait_occupancy.sql  (packet 028; next file after 020_workspace_opt_out.sql)

ALTER TABLE workflow_run
  DROP CONSTRAINT IF EXISTS workflow_run_status_check;
ALTER TABLE workflow_run
  ADD CONSTRAINT workflow_run_status_check
    CHECK (status IN ('running', 'waiting', 'success', 'failed', 'stopped'));
ALTER TABLE workflow_run
  ADD COLUMN IF NOT EXISTS resume_at TIMESTAMPTZ;
ALTER TABLE workflow_run
  ADD COLUMN IF NOT EXISTS waiting_node_id TEXT;

CREATE TABLE wait_occupancy (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  workflow_id TEXT NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
  wait_node_id TEXT NOT NULL,
  workflow_run_id TEXT NOT NULL REFERENCES workflow_run(id) ON DELETE CASCADE,
  contact_id TEXT NOT NULL,
  title TEXT NOT NULL,
  approver TEXT NOT NULL CHECK (approver IN ('consultant', 'operator')),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'scheduled', 'approved')),
  approve_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workflow_run_id, wait_node_id, contact_id)
);
CREATE INDEX wait_occupancy_open_idx
  ON wait_occupancy (workflow_id, wait_node_id, status);
CREATE INDEX wait_occupancy_desk_idx
  ON wait_occupancy (firm_id, approver, status);
```

**Pane key (desk GROUP):** `(workflow_id, wait_node_id)` where `status IN ('open','scheduled')`. Count = row count. Title on the note = any row’s `title` (same node). Approve completes **that set**.

Different workflow or different Wait node → different bar. Matching titles across workflows do **not** merge.

`wait_node_id` + `workflow_run_id` stay on the **row** so Approve resumes **that** visit’s outgoing. Listing does not group by run.

Duration: **zero** `wait_occupancy` rows. Only `workflow_run.status='waiting'`, `waiting_node_id`, `resume_at`.

### 3. Title is one field. Approver is two values on the graph.

On `workflow.graph` node `data`:

```ts
type WaitNodeData = {
  shape: "approval" | "duration";
  title: string;                         // approval; canvas label
  approver: "consultant" | "operator";   // approval only; default "consultant"
  durationAmount: number;                // duration
  durationUnit: "minutes" | "hours" | "days";
  configured?: boolean;
};
```

Do not persist “Approve ” as a prefix. Do not persist a contacts noun. Snapshot `title` + `approver` onto each occupancy row at INSERT (desk does not read the graph). Changing Title / Approver on a **later** Save restamps **open** rows for that node; already approved rows stay.

**Configured:** approval → non-empty title + approver. Duration → `durationAmount > 0` and a unit. Else `configured: false` → stop (existing break). Do not mark silent success.

Input / Output tabs = shared NODE-INTERIOR. Parameters = this packet.

### 4. Visit (do not recut 015)

People on the left = 017: mapped chip if occupied, else `ctx.contactIds` / person ids on `previousWrites`. Set-verb: **one** Wait visit for that handle. Default this slice. Do not N-loop notes.

**Approval**

1. INSERT one `wait_occupancy` per person (`status=open`). Skip a UNIQUE hit (same run parked twice).
2. `commitWrites` those rows (`table: "wait_occupancy"`, `contact_id`). 015: Wait **is** a writer.
3. `workflow_run.status='waiting'`, `waiting_node_id=this`, `resume_at` NULL, **no** `finished_at`.
4. `node_status[this] = waiting`. **Do not** `goOn`. **Do not** finish the run as success.

Empty handle → no rows, no note, still stop (nothing to approve). Honest.

**Resume (Approve now, or scheduled `approve_at` / duration `resume_at` due)**

1. Set occupancy `approved` + `approved_at` (approval). Set run `running`, clear `waiting_node_id` / `resume_at`.
2. Continue **from this Wait’s outgoing** with `previousWrites` = those occupancy writes and `ctx.contactIds` = those people. Do **not** re-visit Wait (would INSERT again).
3. Then Action (Call agent, …) walks as today.

Approve now on a group: every **open + scheduled** row for that `(workflow_id, wait_node_id)` — may resume **several** runs. All of them. Founder: approve all at once.

After that set is approved, new arrivals INSERT new `open` rows → a **new** count (new note). Do not mix with people already walking the outgoing.

**Duration**

`resume_at = now() + amount·unit`. Same park on the run. Cascade tick already fires schedule triggers — **also** `SELECT workflow_run WHERE status='waiting' AND resume_at <= now()` and resume. Same tick. Do not mint a second worker. Do not reuse Hub `delay` / Switch.

**Approve later**

Set those open rows `scheduled` + `approve_at`. Run stays `waiting` with `resume_at = approve_at`. Same tick. Nest without a datetime is not a schedule.

Do not `dispatchEventToWorkflows` a new event_name for Approve. Resume is **this** run, not a second graph.

`untilNodeId` unchanged.

### 5. Desk (N1 · N1b · N2)

Not an Automations modal. Workspace lists occupancy.

```
SELECT workflow_id, wait_node_id, title, COUNT(*) AS n
  FROM wait_occupancy
 WHERE status IN ('open','scheduled')
   AND approver = $session          -- 'consultant' | 'operator'
   AND ($session = 'operator' OR firm_id = $this_firm)
 GROUP BY workflow_id, wait_node_id, title
```

Consultant person (T4): `approver='consultant'` AND `firm_id` = their workspace firm.  
Operator: `approver='operator'` (house graph may span firms; still one bar per Wait instance).  
Contact: **no** this note (not an Approver value).

Chrome (PM): N1 title + **n** + Approve now · Approve later. X → N2. N2 solid bar, title · **n**, Approve now on the right; rest reopens N1. N1b nest under Approve later.

Do not restore the campaign / objective table. Do not paint Launch window.

Law 41: the desk button completes. Completing = §4 resume.

### 6. Seed / house

Empty `wait_occupancy`. Do **not** INSERT 24 demo rows. Do **not** recut the 014 house graph. Operator places Wait (W1). `optin` / Harbor / Ana = example.

---

## Files

| File | Why |
|------|-----|
| `supabase/migrations/021_wait_occupancy.sql` | This packet |
| `server/wire-service/workflowWalk.ts` | `type === "wait"` park / resume; **before** unknown `goOn`. Do not recut Action visit or 015 handle. |
| `server/wire-service/cascade.ts` | Tick waiting runs (`resume_at <= now()`) on the existing schedule tick |
| `src/app/data/automationWorkflows.ts` | `WorkflowNodeType` += `wait`; node data |
| `src/app/data/automationTriggerSelect.ts` | `WIRE_ADD_KINDS` Wait |
| `src/app/register/prototype-ant/operator/AntAutomationWorkbench.tsx` | Palette · wire + · badge |
| Wait Parameters plate (new, A28 family) | W2b / W3. W2 is prior. |
| `ConsultantAntScene` / Board | N1 · N1b · N2 when `approver='consultant'` |
| `OperatorAntScene` | Same overlay when `approver='operator'` |

`npm run build`. No `tsc`.

---

## Verify

1. Palette + wire **+** place Wait. Save. Graph node `type='wait'`. Not an `action` row.
2. W2b: Wait for approval, title `optin`, Approver Consultant. W3: Duration 2 days — Approver gone. No desk note on duration.
3. Import one contact through If-valid onto that Wait → N1 on **that consultant firm desk**, count **1**, buttons **Approve now** · **Approve later**. PNG Start ignored.
4. Import five more, same Wait, not yet approved → **same** note, count **6**. No second bar. After Approve now, Call agent (or whatever is next) walks those six. A later seventh is a new count **1**.
5. Same title on a **different** workflow → a **different** bar.
6. Approve later: nest **beneath** the button; date + time schedules; tiny X cancels the nest only. Clock fires → same resume as Approve now.
7. Approver Operator → note on Operator desk, not Consultant Board. Duration never paints N1/N2.
8. `action.type` CHECK unchanged. House import → audit → tag still walks if no Wait on that graph.

---

## What this packet does not do

- Recut 015. Recut Action visit. Recut 019 If/Switch.
- Stuff Wait into `action.type`. Overload `sequence_ready`.
- Mint an approver table / people picker / Contact as Approver.
- Restore campaign preview. Freeze `optin` / Approve opt-in / **24** / Harbor.
- Recut house seed. Recut 022/023. Overwrite 15:43. Plant Hub.
- First-open chrome table (session is enough).
