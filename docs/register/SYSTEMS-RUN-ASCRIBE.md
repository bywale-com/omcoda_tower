# Systems — Run ascribe (law 43). Ignite 015. Do not recut 015.

**Seat:** Systems Analyst.  
**When:** 2026-08-20 11:45 UTC.  
**What this is:** answers to PM [`RUN-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/RUN-PACKET.md) (law 39 · 43). Test data on the trigger is [`SYSTEMS-TEST-ASCRIBE.md`](./SYSTEMS-TEST-ASCRIBE.md) / packet 016. **No run table.** **Do not recut 015.** Flag **15:43**.  
**Engineer cut in flight:** PR [#105](https://github.com/bywale-com/omcoda_tower/pull/105) (`untilNodeId`, Save · Run · Launch, payload `writes`). Bless that shape. Name leftovers against `origin/main`.

---

## A. Ignition

| Live `origin/main` | Packet / #105 |
|--------------------|----------------|
| Launch workflow = `activateWorkflow` **then** `startManualRun` with `payload: { manual: true }` | **Split.** Launch = arm only. Run = walk now. |
| `handleWorkflowRunStart` → `walkValidatedWorkflow` with `triggerPayload: body.payload ?? { manual: true }` | Run sends **`payload.writes`** = the trigger’s test data (016 contract / live instance). Same handle 015 uses when the event fires. |
| Canvas Test = `getEventTestContract` + `walkTestGraph` (no persist) | That fill **moves into the trigger**. Not a canvas Test. Not a Test tab. |

Honest block: no writes on the trigger → do not Run (`N = 0`). Do not invent `{ manual: true }` as a write-set.

`workflow_run` already exists. Do not mint a second run table. Manual fire still INSERT a `workflow_run` row — that is the run artifact.

---

## B. Two grains. One walker.

| Grain | How |
|-------|-----|
| Canvas Run | walk until it breaks |
| Per-node Run | `untilNodeId` — walk **up to** that node (PR #105 `goOn`) |

Misconfigured: `data.configured === false` → **failed**, stop (#105). Do not continue.

**Leftover on main (do not freeze as Run):** in-app Action that is not `run_audit` / `ascribe_tag` marks **success** `silent until wrap` and keeps walking. Run: that is **not configured**. Stop, or wrap the handler (014). Silent success is not a run.

Do not invent a third runner. Test-fill does not execute Get / Rule / Action / If.

---

## C. Launch vs Run

| Control | Machine |
|---------|---------|
| **Launch** | `activateWorkflow` / `workflow_state.status = 'active'`. Event dispatch on the write. **Does not** `startManualRun`. |
| **Run** | `POST .../runs` with trigger `writes`. Draft allowed. Sandbox = this app; writes persist. |
| **Test data** | Trigger interior only. 016 `event_test_data` / door 1 live instance. |

---

## Do not

Keep canvas Test because A30 drew it. Let Launch fire a run. Recut 015. Pad Tag onto A33 so the specimen has a picker row.
