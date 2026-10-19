# Tower architecture prior art

Research date: 2026-10-19. Inventory: [`TOWER-LOAD-BEARING-ARCHITECTURE-DOSSIER.md`](TOWER-LOAD-BEARING-ARCHITECTURE-DOSSIER.md).

This document records how production systems implement the same fifteen constructs. It does not change application code. The recommendation is one shared set of mechanisms, not a new stack per construct.

## How a claim is graded

| Grade | Meaning |
| --- | --- |
| Verified | Read in this pass: a Tower file, or a fetched upstream source named below. |
| Prior pass | Read in the research pass that produced the dossier, and not re-fetched here. |
| Inference | A conclusion from those sources. Not a quote from an upstream file. |
| Unresolved | A material question this pass did not close. |

## The decision

Keep Tower’s domain interpreter and Postgres ledger. Do not adopt Temporal, Inngest, or n8n as the product runtime. Those systems solve durable execution for arbitrary workflows. Tower’s product is a named campaign and automation machine with a fixed action set. Replacing the walker replaces the product boundary.

Borrow four mechanisms that those systems already proved:

1. A Postgres job queue with a unique job key, row locks, and crash recovery. Graphile Worker v0.16.6 is the concrete implementation.
2. A transactional outbox: the domain write and the “do this later” row commit together.
3. Provider idempotency keys on the send, plus a unique receipt row on the webhook.
4. A server-side tenant check that does not become true when the tenant claim is missing. Row Level Security is defense in depth after that check, not a substitute for it.

## Compact recommendation

| # | Construct | Call | Shared mechanism |
| --- | --- | --- | --- |
| 1 | Separate application entry points | Keep | Vite multi-page build + React Router. Already in the repo. |
| 2 | Role-based multi-sided app over one ledger | Adapt | One Postgres ledger. `requireSessionFirm` stays the gate. Fix the RLS predicate. |
| 3 | Control plane vs tenant operating plane | Keep | Same database, different routes and roles. No second control-plane product. |
| 4 | Configuration-driven architecture | Keep | `workflow.graph` JSONB interpreted by the existing walker. |
| 5 | Database-backed UI | Adapt | The desk reads the table. Remove localStorage / seed-pack as the live source. |
| 6 | Table-driven interpreter | Keep | `walkValidatedWorkflow`. Do not replace it with a general engine. |
| 7 | Domain event-driven workflow engine | Adapt | Outbox + job queue around the walker. The walker stays the interpreter. |
| 8 | Run-scoped typed outputs (`RunWrite`) | Keep | Writes belong to the run. The next node reads that set. |
| 9 | Node-based direct-manipulation editor | Keep | `@xyflow/react`, already a dependency. Persist `workflow.graph`. |
| 10 | Workflow lifecycle (Save / Run / Launch) | Adapt | Save is a row. Run is one execution. Launch is an enabled trigger plus jobs. |
| 11 | Hierarchical campaign orchestration | Adapt | Keep the hierarchy. Enforce it with unique constraints and one state transition. |
| 12 | Hierarchical configuration inheritance | Keep | Resolve pack → firm override at read time. No feature-flag service. |
| 13 | Centralized fail-closed policy gate | Adapt | One function in front of send. Close the stubs. Do not add OPA or Casbin. |
| 14 | Presentation, orchestration, fulfillment split | Adapt | UI does not send. Orchestration decides. Resend/Twilio fulfill, with idempotency keys. |
| 15 | Closed loop ending on durable `meeting_booked` | Adapt | One completion write, unique per objective. Webhook receipt dedupes the signal. |

Nothing in this table is “replace the construct with a product.” The adaptations are constraints, locks, and keys around code Tower already has.

## What already exists in Tower

Verified from `package.json` and the files named below.

Present: React 18.3.1, React Router 7.17.0, Vite 6.4.3, Hono, `pg` 8.14.1, `@xyflow/react` 12.11.0, Resend 4.5.1, Twilio 5.13.1.

Absent: Graphile Worker, Zod, Temporal, Inngest, json-rules-engine, n8n, OPA, Casbin.

The worker is `server/wire-service/worker.ts`. It calls `tickOnce` on a `setInterval` (default 60s). There is no `FOR UPDATE`, no `locked_at`, and no idempotency key in that file. Two processes can tick the same due work.

`workflow_run` (`supabase/migrations/004_machine_tables.sql`) is keyed only by `id`. There is no idempotency column. Migration `024_wait_occupancy.sql` adds `waiting` status, `resume_at`, and `wait_occupancy` unique on `(workflow_run_id, wait_node_id, contact_id)`. That uniqueness covers one wait slot. It does not cover “this trigger event already started a run.”

`enrollment` in `004` has no unique `(firm_id, contact_id, sequence_id)`.

`campaign` objective and channel tokens are unique: `010_sequence_campaign_housing.sql` has `UNIQUE (campaign_id)` on the objective and `UNIQUE (campaign_id, token)` on the channel.

Webhook intake already dedupes. `provider_webhook_receipts` is `UNIQUE (provider, provider_event_id)`. `server/wire-service/webhooks.ts` inserts the Resend receipt first and treats a unique violation as a replay (`deduped: true`). `messaging_events.provider_event_id` is also `UNIQUE`.

`dispatchSend.ts` calls `twilio.messages.create({ to, from, body })` with no idempotency field. A search of that file finds no `idempotencyKey`. Email send goes through the Resend client the same way: no key is passed.

RLS is enabled, and the predicate is fail-open. From `004_machine_tables.sql`:

```sql
USING (firm_id = COALESCE(current_setting('request.jwt.claims', true)::jsonb->>'firm_id', firm_id))
WITH CHECK (true)
```

If `request.jwt.claims` has no `firm_id`, `COALESCE` returns the row’s own `firm_id`, and the comparison is true for every row. `WITH CHECK (true)` does not constrain writes. The same predicate is on `workflow_trigger` in `006_workflow_trigger.sql`. Server code uses `requireSessionFirm` on the wire routes. That function is the real tenant gate today. RLS does not back it up when the setting is missing.

## Shared mechanisms

### 1. Durable jobs — Graphile Worker, not a second workflow engine

Verified: [graphile/worker `sql/000011.sql` at v0.16.6](https://github.com/graphile/worker/blob/v0.16.6/sql/000011.sql) and [`sql/000016.sql`](https://github.com/graphile/worker/blob/v0.16.6/sql/000016.sql). Public-interface warning: [Database schema](https://worker.graphile.org/docs/schema).

What the SQL actually does:

- `jobs.key` is `UNIQUE`, length 1–512. `max_attempts` defaults to 25.
- `is_available` is a generated column: `locked_at IS NULL AND attempts < max_attempts`.
- `add_jobs` inserts with `ON CONFLICT (key) DO UPDATE` only while `locked_at IS NULL`. A second insert with the same key replaces payload and resets `attempts` to 0 if the job has not been locked.
- If a job with that key is already locked (or otherwise not available), `add_jobs` clears the key, sets `attempts = max_attempts`, and the new insert proceeds. The in-flight job is not silently dropped. The new facts get a new row.
- `job_key_mode = 'unsafe_dedupe'` does the opposite: `ON CONFLICT DO UPDATE` only bumps `revision`. The SQL comment says this can skip a state change that happened after the existing job started, and “If in doubt, DO NOT USE THIS.”
- `complete_jobs` deletes the row only when `locked_at` is null or older than 4 hours. A completion from a worker that lost its lock inside that window does not delete a job another worker may still hold.
- After insert, a statement trigger runs `pg_notify('jobs:insert', '')`.
- Migration `000016` renames the tables to `_private_jobs`, `_private_job_queues`, `_private_tasks`. The schema doc says those tables are not a public interface. Reading `jobs` inside a transaction can make the queue skip those rows. Completed jobs are deleted, so application status belongs in Tower’s own shadow table.

Inference: this is the queue for Tower waits, scheduled triggers, and send retries. It is not a replacement for `walkValidatedWorkflow`. The walker decides the next node. The queue only makes “run at time T” and “retry this send” safe under two workers.

Unresolved: the exact `get_job` statement that claims a row. `sql/000011.sql` drops `get_job` and later files in the v0.16.6 tree re-issue `add_job` / `complete_jobs`, not the claim query. The TypeScript claim file was not re-read in this pass (the guessed `src/sql/getJobs.ts` path returned 404). Do not cite `SKIP LOCKED` as verified from this pass. The verified recovery rule is the 4-hour `locked_at` window on complete, fail, remove, and reschedule.

Adoption boundary: add Graphile in its own schema, call `add_job` from the same transaction as the domain write, and keep task functions thin (load the run, call the existing walker or `dispatchSend`). Do not let Graphile’s task graph become a second automation language. `unsafe_dedupe` stays unused.

`graphile_worker` enables RLS on its own tables with no policy in `000011.sql`. The schema doc says the worker runs as the database owner, not superuser. A restricted role needs the schema and migrations table created first. Tower’s pool role has to be allowed to call the public functions. That is an install check, not a reason to copy the SQL by hand.

### 2. Transactional outbox

The pattern, stated as inference from the Graphile rule above and from Postgres transaction semantics: insert the domain row and the job (or an `outbox` row) in one transaction. A crash after commit leaves a durable job. A crash before commit leaves neither. Polling a side table with `UPDATE … WHERE id IN (SELECT … FOR UPDATE SKIP LOCKED)` is the same idea when the queue is hand-rolled.

Tower today writes some effects inline (`dispatchSend` inserts `outbound_messages` after the provider accepts). If the process dies after the provider accepts and before the insert, the provider has the message and Tower does not. An idempotency key at the provider plus a unique `provider_message_id` is what makes the retry safe. The outbox does not remove the need for that key. It removes the window where the domain committed and the send was never attempted.

Prior pass, not re-fetched here: the `outbox-postgres` claim shape `UPDATE … WHERE id IN (SELECT … FOR UPDATE SKIP LOCKED)`. Treat the library as an illustration. Graphile’s `add_job` inside the domain transaction is the smaller dependency.

### 3. Idempotency is three different keys

These are not interchangeable.

| Key | What it dedupes | Verified behavior |
| --- | --- | --- |
| Graphile `job_key` | Two enqueues of the same unit of work | Unique key. Replace if unlocked. New row if the old job is already locked. `unsafe_dedupe` is explicitly dangerous. |
| Resend `Idempotency-Key` | Two HTTP sends of the same email | [Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys). Held 24 hours. Same key and same payload returns the original email id. `400 invalid_idempotency_key` if length is outside 1–256. `409 invalid_idempotent_request` if the payload differs. `409 concurrent_idempotent_requests` if the first request is still in progress; retry later. Node SDK: second argument `{ idempotencyKey }` on `emails.send` and `batch.send`. |
| Twilio webhook retry | Two deliveries of one callback | [Webhook connection overrides](https://www.twilio.com/docs/usage/webhooks/webhooks-connection-overrides). Default retry count is 1. Default retry policy is connect-timeout only. Header `I-Twilio-Idempotency-Token` distinguishes attempts. The fragment (`#ct=…`) is not part of the signature. |
| Tower receipt | Two posts of one provider event | `UNIQUE (provider, provider_event_id)` and the unique-violation branch in `webhooks.ts`. |

Temporal’s version of the same split, verified from [Handling Signals, Queries, & Updates](https://docs.temporal.io/handling-messages): Update IDs are deduped by the server for one workflow run. Signal delivery is at least once; the workflow must dedupe with its own key. Retried client calls are deduped by request ID without application code. Continue-As-New resets Update ID dedupe, so the application key has to survive that boundary.

Inference for Tower: a run idempotency key is `(firm_id, workflow_id, trigger_event_id)` or `(firm_id, contact_id, campaign_id, attempt_id)`, stored unique on `workflow_run` or `outbound_messages`. The Resend key should be that same id, not a random UUID generated at send time. A random UUID changes on retry and defeats the header.

Unresolved: whether `twilio@5.13.1` `messages.create` accepts an idempotency key of its own. This pass verified webhook retry headers, not the create-message API. Until that is confirmed, SMS dedupe is the Tower unique constraint on `provider_message_id` / a send-intent row inserted before the API call, plus `I-Twilio-Idempotency-Token` on the status callback.

### 4. Tenant isolation — predicate must fail closed

Verified Tower SQL is above. The production rule, prior pass from Supabase and Postgres row-security docs: enabling RLS without a policy denies rows for ordinary roles. `service_role` bypasses RLS. Policies and grants are separate. A policy written `TO` a role does not apply to other roles. The usual Supabase predicate is `(select auth.uid())` against a claim the user cannot edit (`app_metadata`, not `user_metadata`).

Tower’s predicate does the reverse of default deny. Missing claim becomes “match every firm.” `WITH CHECK (true)` allows a write even when the `USING` clause would have failed a read.

Inference: keep `requireSessionFirm` on every mutating route. Change the policy to `firm_id = current_setting(...)` with no `COALESCE` fallback, and use a real `WITH CHECK` of the same expression. Apply it to the service role only if that role is not the one the server uses; if the server connects as a bypass role, RLS never sees the request. In that setup the server check is the only gate, and the policy is documentation unless a second client role exists.

Do not add a second tenant-enforcement product.

### 5. Rules — evaluate JSON, do not execute the campaign

Prior pass: [json-rules-engine Almanac](https://github.com/CacheControl/json-rules-engine/blob/master/docs/almanac.md). Facts are cached for one `engine.run`, keyed by fact id plus params. A new run builds a new Almanac unless the caller passes one. The library evaluates rules. It does not durably run side effects, retry, or lock.

Inference: useful only if Tower extracts boolean conditions (trigger condition, channel rule, attempt rule) into one evaluator. It is the wrong place for send, wait, or enrollment. OPA and Casbin are the same category of “no” for the send gate: a general policy language for a handful of domain predicates (`consent`, `halt`, `silenced`, `workspace_opted_out`). One function that returns `{ allow, deny, detail }` is the smaller mechanism. The current defect is that the function is stubbed (`anyPass = true` in the eligibility cascade, recorded in the dossier), not that the language is too weak.

### 6. Authoring surface — React Flow is already the library

`@xyflow/react` 12.11.0 is a dependency. Prior pass: `useNodesState` is documented as a prototyping convenience; production graphs often move node state to a store such as Zustand; `toObject()` is the supported serialize path.

Inference: keep the editor. Persist the graph JSON Tower already stores. Do not adopt a second canvas library. Move off `useNodesState` only when a real state bug shows up. The `⋯` Switch that changes a node’s kind stays a menu action. It is not the Switch node.

### 7. HTTP edges — parse, then act

Prior pass: Zod `safeParse` returns `{ success: true, data }` or `{ success: false, error }` and does not throw. React Router 7 `errorElement` catches render and loader failures inside the router. It does not validate a webhook body.

Inference: Zod (or an equivalent parser) belongs on Hono inputs: webhook JSON, run-start body, graph save. Router error boundaries stay a UI concern. Tower does not depend on Zod today. Adding it is a boundary parser, not a workflow engine.

### 8. Hosted durable execution — read for guarantees, do not host the product

Temporal, verified this pass at the message-handling doc above. Additional prior-pass notes, not re-read here: TypeScript `condition` in `packages/workflow/src/workflow.ts`; signals are at least once; activities retry until the retry policy says stop.

Inngest, prior pass: `step.run` memoizes a successful step and retries that step. Code outside a step replays. Side effects outside `step.run` still need their own idempotency key. `NonRetriableError` stops retries. It is a hosted service.

n8n, inference: a general automation product with its own node catalog. Adopting it would replace Tower’s named actions and the walker. That violates the product boundary the dossier records.

Use these as the checklist for Tower’s own runner:

- A step that has succeeded must not run its side effect again (Inngest memoization / Temporal activity id).
- A message that arrives twice must be recognized (Temporal signal key, Tower receipt unique).
- A worker that dies mid-step must be able to retry after a lock timeout (Graphile 4-hour window).
- A non-retryable domain denial (no consent, halted) must not be retried into a send.

## Construct by construct

Each section names the construct, the production mechanism, the Tower gap that mechanism does or does not close, and how to verify the recommendation. UI and code evidence for the construct itself stays in the dossier.

### 1. Separate application entry points

Vite multi-page builds and React Router multi-entry apps are the ordinary mechanism. Tower already has `index.html` and `prototype-ant.html`, `main.tsx` and `main-prototype-ant.tsx`.

Keep. Do not merge Hub, `/register`, and `/prototype-ant` into one shell to “simplify.” The production pattern is separate entries that share a library, which is what the repo is.

Verify: `/prototype-ant` boots the operator/consultant desks; `/hub` does not become that desk; a failed route renders a router error boundary (prior pass: React Router `errorElement`) and does not catch a failed send.

### 2. Role-based multi-sided application over one ledger

One database, many roles, row filter by tenant. Salesforce-style “one org, many profiles” and Supabase “one project, RLS by `firm_id`” are the same shape.

Adapt the policy. Keep the single ledger and `requireSessionFirm`.

Verify: with RLS on and no `firm_id` claim, a non-bypass role selects zero rows. With a claim, it selects only that firm. `WITH CHECK` rejects an insert whose `firm_id` is not the claim. The server still rejects a mismatched session even if RLS is bypassed.

### 3. Control plane vs tenant operating plane

Control plane: platform admin, reference data, firm provisioning. Operating plane: a firm’s contacts, workflows, sends. Same Postgres, different routes and role checks. A second database or an admin SaaS does not add a guarantee the schema does not already have.

Keep.

Verify: a firm session cannot call a founder route; a founder route does not write a tenant workflow without an explicit firm id; both writes land in the same tables.

### 4. Configuration-driven architecture

The configuration is data: `workflow.graph` JSONB, trigger rows, campaign rows. The interpreter is code. That split is the whole pattern. A general rules product does not replace it (see mechanism 5).

Keep the split. Parse the JSON at the boundary (mechanism 7) so a bad graph fails save, not mid-send.

Verify: an invalid graph is rejected before `workflow_trigger` materializes. A valid graph round-trips through save and load without a client-side catalog of fields.

### 5. Database-backed UI / single source of truth

The production rule is dull: the screen renders the query. localStorage, a bundled seed, and a hand-built catalog are caches or plants. They are not the source once the table exists.

Adapt the client. The tables are already specified.

Verify: two browsers on the same firm see the same workflows after one save. Clearing localStorage does not delete or resurrect the live graph. Empty tables render empty.

### 6. Table-driven interpreter

`walkValidatedWorkflow` is a domain interpreter. Temporal and Inngest are durable interpreters for arbitrary code. json-rules-engine is a predicate evaluator. Graphile is a job runner. None of them know Sequence, Campaign, or `RunWrite`.

Keep the walker. Put durability under it (mechanisms 1 and 2). Do not recut it into a second machine.

Verify: a graph fixture walks the same nodes before and after a job-queue adoption. Wait and send are the only steps that enqueue. The walker does not gain a plugin node type.

### 7. Domain event-driven workflow engine

Production event-driven workflow has four parts: an event row, a subscription (Tower’s `workflow_trigger`), a claim, and a handler. Graphile plus the existing `dispatchEventToWorkflows` path is that shape. Temporal’s signal handler is the hosted version of “an event resumed this run,” with the idempotency rule in mechanism 3.

Adapt the delivery. Keep the event names and the walker.

Verify: publishing one event in a transaction with the domain write enqueues one job. Two workers claim distinct jobs. A retry of the same event id does not start a second run. A locked job that is enqueued again does not lose the new payload (Graphile’s clear-key-and-insert behavior).

### 8. Run-scoped typed outputs and lineage

Temporal activity results and Inngest `step.run` return values are the hosted analogue: the output is addressable by the step that produced it, and a replay returns the stored value instead of repeating the side effect.

Tower’s version is `RunWrite` / `previousWrites` on the run. That stays in Postgres next to `workflow_run`. A workflow engine’s history store would duplicate it.

Keep. The gap is durability of the run, not the shape of the write.

Verify: after a node, the next node’s choices are the writes that run persisted. A replayed step returns the stored write and does not call Resend again.

### 9. Node-based direct-manipulation editor

React Flow is the production library for this editor. Tower already depends on it. n8n’s canvas is not extractable as a library without taking n8n’s node model.

Keep.

Verify: node positions and edges survive save and reload from `workflow.graph`. Changing a trigger’s kind uses the Switch menu and writes the node type. It does not insert a Switch node.

### 10. Workflow lifecycle: Save, Run, Launch

Save is an upsert of the graph. Run is one execution, synchronous or a single job. Launch is “enabled trigger rows exist, so events and schedules will enqueue.” Agent Launch is the same lifecycle with a different terminal action. A workflow SaaS (Temporal namespaces, Inngest apps) adds account machinery around this and does not define Save vs Launch.

Adapt the durability of Run and Launch. Keep the three verbs.

Verify: Save does not send. Run executes once and records one `workflow_run`. Launch survives a process restart because the trigger row and the job exist. Two clicks on Launch do not create two enabled triggers for the same `(workflow_id, node_id)` — that unique constraint already exists in `006`.

### 11. Hierarchical campaign orchestration

The hierarchy is domain data: Sequence contains Campaign, one objective, ordered channels, channel rules, attempt rules. Production systems enforce a hierarchy with foreign keys, unique constraints, and one transition function. A BPM suite (Temporal, Camunda, n8n) can model it and will also model everything else.

Adapt the constraints and the transition. Keep the tables.

Already verified: one objective row per campaign (`UNIQUE (campaign_id)`), one channel token per campaign. Missing: a unique enrollment of a contact into a sequence, and a unique “this attempt already sent.”

Verify: a second objective insert for the same campaign fails. A second enrollment of the same contact into the same sequence fails. Advancing a channel is one transaction that updates the enrollment and enqueues the next send. A crash retries the job and does not send the previous channel again.

### 12. Hierarchical configuration inheritance

Published pack, then firm binding, then per-record override. Read-time resolution with an explicit order is the whole mechanism. Feature-flag services (LaunchDarkly and similar) solve a different problem: percentage rollout of code paths. They are the wrong tool for “this firm’s sequence overrides the pack cell.”

Keep. The dossier’s gap is unread override flags, which is a missing reader in Tower, not a missing product.

Verify: for one firm, resolution order is visible in a single query or function. A flag that no reader consults is either wired or deleted. Pack edits do not mutate a firm row that has its own value.

### 13. Centralized fail-closed policy-enforcement point

Payment and messaging systems put one gate in front of the side effect: Stripe’s idempotency and decline codes, Resend’s key, a consent check. The gate returns a denial that must not be retried as if it were a timeout.

Adapt `consentAndHaltGate` and the eligibility cascade so denial is denial. Do not introduce OPA, Casbin, or a policy sidecar.

Verified gap: the dossier records `anyPass = true` in `runContactEligibilityCascade`, and the UI `sendGate` is always the stand-in. `dispatchSend.ts` does call `consentAndHaltGate` on the live path. Two gates exist. The live one has to be the only one that can send, and it has to fail closed.

Verify: missing consent, halt, or silence returns `allow: false` and enqueues nothing. A retry of that job does not call Resend. The UI stand-in cannot send when the wire is real. Opt-out writes the same flag the gate reads (`silenced` / `workspace_opted_out` are currently different, per the dossier).

### 14. Separation of presentation, orchestration, and fulfillment

Presentation proposes. Orchestration decides and records. Resend and Twilio accept or reject. This is the standard three-tier split. The provider SDKs are already dependencies.

Adapt fulfillment so retries are safe (mechanism 3). Keep the split.

Verify: the browser never holds the Resend or Twilio secret. A replayed orchestration job uses the same Resend idempotency key and gets one email id. A Twilio status callback replay hits `provider_webhook_receipts` and returns `deduped`. A provider 5xx retries. A provider 4xx that is a domain denial does not.

### 15. Closed loop ending on durable `meeting_booked`

The terminal fact is a row, written once, that stops further attempts. Stripe’s “payment intent succeeded” and a support desk’s “ticket closed” are the same shape: a unique terminal transition. Temporal would model it as a signal that completes the workflow, and would still require the signal key.

Adapt the completion write so it is unique and stops the campaign. Keep `meeting_booked` as the domain fact. `webhooks.ts` already calls `onCompletionWrite` on a clicked event after the receipt insert. The receipt unique is the right dedupe point; the completion write still needs its own uniqueness so two different event ids cannot book two meetings for one objective.

Verify: two deliveries of one click insert one receipt and one completion. A second click event for an already-booked objective does not enroll a new attempt. The campaign is not advanced after that row exists.

## Priority

Ordered by harm if left as-is, then by how little new machinery each step adds.

1. **Fail closed, then idempotent send.** One gate. Denials do not retry. Resend `idempotencyKey` set from the attempt id. SMS send-intent row before `messages.create` until Twilio’s create-call idempotency is confirmed.
2. **RLS predicate.** Remove the `COALESCE(…, firm_id)` fallback and the `WITH CHECK (true)`. Keep `requireSessionFirm`.
3. **Unique run and enrollment.** One run per triggering event. One enrollment per contact per sequence. One completion per objective.
4. **Job claim for waits and schedules.** Graphile `add_job` in the same transaction as the domain write, or a small queue with the same key and lock rules. `setInterval` + `tickOnce` stops being the lock. The walker is unchanged. Do not use `unsafe_dedupe`.
5. **Outbox for “row committed, send never attempted.”** Covered if step 4’s `add_job` shares the domain transaction. A hand-rolled outbox is only needed if Graphile is rejected.
6. **Zod (or equivalent) on Hono bodies** that become graphs, runs, and webhooks.
7. **Desk reads tables.** localStorage and the client pack catalog stop being the live workflow source.

Steps 1–3 are constraints and arguments on code that already exists. Step 4 is the first new dependency, and only for the queue.

## Verification criteria

A recommendation is done only when the check below passes. These are checks, not implementations.

| Check | Pass |
| --- | --- |
| Resend retry | Same attempt id, same payload, two `emails.send` calls, one provider email id. Different payload with that key returns 409. |
| Resend concurrency | Overlapping sends with one key: the second gets `concurrent_idempotent_requests` and a later retry returns the first id. |
| Webhook replay | Second post of the same `svix-id` or `I-Twilio-Idempotency-Token` returns deduped and does not call `onCompletionWrite` again. |
| Worker crash | Kill the process after lock and before complete. A second worker does not run the send until the lock rule allows it, and then the provider key prevents a second email. |
| Double event | Two deliveries of one trigger id produce one `workflow_run`. |
| Missing tenant claim | Non-bypass SQL sees no firm rows. |
| Cross-firm write | Session firm A cannot update firm B even if the body says B. |
| Denied send | No consent: zero Resend calls, zero Twilio calls, a denial row. |
| Walker unchanged | Existing walk fixture passes without a new node type. |
| Graph round-trip | Save from the editor, reload, same nodes and edges. |

## Unresolved

- The v0.16.6 claim statement (`FOR UPDATE SKIP LOCKED` or otherwise). Lock recovery is verified on complete/fail/remove/reschedule. The claim query was not in the SQL files read here.
- Twilio `messages.create` idempotency in `twilio@5.13.1`. Webhook retry behavior is verified. The create API was not.
- Whether Tower’s runtime role bypasses RLS. If it does, policy edits do nothing until a non-bypass role is used for user-scoped queries.
- Graphile versus a short queue Tower owns. Graphile is the cited implementation. Compatibility of v0.16.6 with Tower’s `pg` 8.14 and a single Hono process was not installed or tested. Research only.
- json-rules-engine, Zod, React Flow `useNodesState`, Inngest `step.run`, and the Supabase RLS guide were verified in the prior pass and not re-fetched for this file. They are labeled prior pass above. They are not guesses, and they are not this pass’s diffs.

## Sources

- Tower: `package.json`, `server/wire-service/worker.ts`, `server/wire-service/dispatchSend.ts`, `server/wire-service/webhooks.ts`, `supabase/migrations/003_ct_wire_stores.sql`, `004_machine_tables.sql`, `006_workflow_trigger.sql`, `010_sequence_campaign_housing.sql`, `024_wait_occupancy.sql`.
- Graphile Worker v0.16.6: [`sql/000011.sql`](https://raw.githubusercontent.com/graphile/worker/v0.16.6/sql/000011.sql), [`sql/000016.sql`](https://raw.githubusercontent.com/graphile/worker/v0.16.6/sql/000016.sql), [schema docs](https://worker.graphile.org/docs/schema).
- Resend: [Idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys).
- Twilio: [Webhook connection overrides](https://www.twilio.com/docs/usage/webhooks/webhooks-connection-overrides).
- Temporal: [Handling Signals, Queries, & Updates](https://docs.temporal.io/handling-messages).
