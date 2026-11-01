# OpenSpec reconstructed bundle

Coordinator reconstruction from transcript diffs. CLI-synced `openspec/specs/` main copies and versioned mirrors may be missing; change deltas below are the authored specs.


===== STATUS.json =====

{
  "contestant_id": "openspec",
  "sha": "c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7",
  "framework": "openspec",
  "framework_version": "1.14.3",
  "status": "complete",
  "completion_claim": "Installed genuine OpenSpec CLI 1.14.3, initialized with --tools cursor (core profile, spec-driven schema), explored the SHA snapshot, proposed change specify-intended-tower-product, wrote 18 capability specs (103 requirements) plus proposal/design/tasks, strict-validated, synced main openspec/specs/, then folded selected living-packet laws from origin pull/96/head into Automations and Contact specs and re-synced. Application source was not modified. Named Story silences and remaining Face/packet chrome stay UNRESOLVED rather than invented. /opsx-apply against Tower was not run.",
  "blocker": null,
  "artifact_root": "/home/ubuntu/tower-spec-output/"
}


===== EXPERIMENT-RECORD.md =====

# Experiment record — Contestant 4 (OpenSpec)

## Identity

- Contestant: OpenSpec (not Tower Engineer / PM / SA)
- Preservation root: `/home/ubuntu/tower-spec-output/`
- Product snapshot SHA: `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7` (confirmed before spec work; HEAD unchanged at stop)
- No `git push`, PRs, or GitHub issues

## Install evidence

Intended: `npm install -g @fission-ai/openspec@latest`

First attempt failed: `EACCES` on `/usr/lib/node_modules` because `/exec-daemon/node` had `npm prefix -g` = `/`.

Actual install: prepended nvm PATH `/home/ubuntu/.nvm/versions/node/v22.23.3/bin`, then the same global package. Binary: that nvm prefix `openspec`.

| Item | Value |
|------|--------|
| Node | v22.23.3 |
| npm | 10.9.9 |
| `openspec --version` | **1.14.3** (openspec.dev listed 1.14.2 at fetch time) |
| Init | `openspec init --tools cursor --no-animation --profile core /workspace` |
| Tool id | `cursor` |
| Profile | `core` |
| Delivery | `both` (skills + commands) |
| Schema | `spec-driven` |
| Init report | Created: Cursor — **6 skills and 6 commands** in `.cursor/`; Config: `openspec/config.yaml` |

Skill paths created:

- `/workspace/.cursor/skills/openspec-explore/SKILL.md`
- `/workspace/.cursor/skills/openspec-propose/SKILL.md`
- `/workspace/.cursor/skills/openspec-apply-change/SKILL.md`
- `/workspace/.cursor/skills/openspec-update-change/SKILL.md`
- `/workspace/.cursor/skills/openspec-sync-specs/SKILL.md`
- `/workspace/.cursor/skills/openspec-archive-change/SKILL.md`

Command paths created:

- `/workspace/.cursor/commands/opsx-explore.md`
- `/workspace/.cursor/commands/opsx-propose.md`
- `/workspace/.cursor/commands/opsx-apply.md`
- `/workspace/.cursor/commands/opsx-update.md`
- `/workspace/.cursor/commands/opsx-sync.md`
- `/workspace/.cursor/commands/opsx-archive.md`

`.cursor/` is gitignored in the Tower repo; copies live under `cursor-integration/`. Native `openspec/` in the workspace is untracked methodology scaffolding only (`git status` shows `?? openspec/`; no `src/`, `server/`, or `supabase/` edits).

Official docs consulted: install.md, openspec.dev, llms.txt, setup, quickstart, skills, spec-driven schema, stores, config.yaml, supported-tools.

Telemetry disabled after first CLI run: `openspec config set telemetry.enabled false`.

## Initial approach

OpenSpec’s installed core loop is explore → propose → apply → archive. The experiment forbids product implementation, so apply against Tower source was treated as an execution constraint, not skipped by role-play.

1. Confirm SHA; create preservation root.
2. Install real CLI; `openspec init --tools cursor`.
3. Follow **openspec-explore** (read-only investigation of Seed/World/Story/Face/SQL/Ant).
4. Follow **openspec-propose** (`openspec new change specify-intended-tower-product`, then `openspec instructions` per artifact).
5. Skip **openspec-apply-change** on application code.
6. Follow **openspec-sync-specs** so durable specs live in `openspec/specs/`.
7. After discovering this SHA’s Current pointer names origin PRs, inspect `pull/96/head` (and 86/110) and **update** Automations/Contact specs; re-validate; re-sync.

Capability grain: Story’s twelve non-conflatable systems, plus Automations, three desks/touchpoints, outbound actuation, and product-purpose. That matches OpenSpec’s “cohesive evolving boundary” rule better than one catch-all spec.

## First substantive artifacts

- `explore/00-EXPLORE-NOTES.md` — evidence ranking, spine diagram, conflicts
- `openspec/config.yaml` — methodology constraints (no inventing, no apply, 15:43 law, Ant face)
- Change `specify-intended-tower-product`: `proposal.md`, 18 delta specs, `design.md`, `tasks.md`
- First sync: 18 main specs, `openspec validate --specs --strict` all passed

Versioned copy: `mirrors/2026-10-19T16-50-init/` (empty OpenSpec after init), `mirrors/2026-10-19T17-proposal/` (proposal only), `mirrors/2026-10-19T16-53-synced/` (first full specs), `mirrors/2026-10-19T16-55-post-pr96-fold/` (after packet fold).

## Later revisions / discoveries

1. **Stale README** vs wired product on this SHA — specified as historical overlay, not intended product.
2. **docs/README “do 022 now”** vs migrations `021`–`024` already on the SHA — SQL treated as stood-up; packet markdown 022/023 still used as ascription.
3. **Strict validate** failed until UNRESOLVED requirements and the quoted Agents flagship gained SHALL/MUST.
4. **Origin pull refs exist.** SHA Current pointer is honest: living PM packets are on #96. Inspected without merging. Folded If/Switch, Test-on-trigger, Save·Run·Launch, Get, extra events, in-app affordance law into specs. Remaining plate-chrome packets inventoried in `OFF-SNAPSHOT-PACKETS.md`.
5. Config warning: `operations.apply.guidance` ignored by CLI (“must be an array of strings”) even though YAML listed arrays; did not block artifacts.

## How next steps were chosen

OpenSpec skills, not a coordinator template:

- Empty `openspec list --specs` → propose a spec-capture change rather than skip_specs.
- Propose skill: `new change` then instructions JSON for proposal → specs → design → tasks.
- Design skill: include design.md because the capture is cross-cutting.
- Tasks skill: specification/validate/sync only; apply listed as out of scope.
- Status after planning: CLI said next is `openspec instructions apply` — **not followed** for application source.
- Sync skill: create main specs from ADDED deltas (archive-equivalent merge for new capabilities).
- Update after PR inspection: revise existing artifacts, re-validate, rewrite the two affected main specs.

## Why continue / revisit / stop

Continued until:

- Real OpenSpec CLI ran (not simulated)
- Explore grounded in the repository
- All propose artifacts existed and `openspec validate --strict` passed
- Main specs were synced (18 capabilities, 103 requirements)
- SHA-pointed origin packets were inspected and selected laws folded
- Silences remained explicit
- Application source untouched

Stopped because the OpenSpec specification workflow for this assignment is complete: durable `openspec/specs/` inventory of the intended product, with named holes. Remaining packet chrome on #96 is inventoried, not silently filled. No genuine CLI blocker. Apply/archive-as-shipment were out of scope.

## Time / resource notes

- Start UTC: `2026-10-19T16:46:32Z`
- Stop UTC: `2026-10-19T16:54:37Z` (environment clock)
- Wall clock on this host is compressed relative to work volume; recorded as observed `date -u`
- Network: npm registry and openspec.dev reachable; GitHub origin pull refs reachable
- No product build was required; `npm run build` not used (specification-only)

## Primary specification location

- Native (methodology scaffolding in workspace, untracked): `/workspace/openspec/`
- Preservation mirror: `/home/ubuntu/tower-spec-output/openspec/`
- Concatenated bundle: `/home/ubuntu/tower-spec-output/BUNDLE.md`
- Supporting: `explore/00-EXPLORE-NOTES.md`, `UNRESOLVED.md`, `OFF-SNAPSHOT-PACKETS.md`, `CROSS-REFERENCES.md`

## File inventory

See `INVENTORY.md` (182 files under the preservation root at stop). High-level:

```
/home/ubuntu/tower-spec-output/
  STATUS.json
  EXPERIMENT-RECORD.md
  BUNDLE.md
  INVENTORY.md
  UNRESOLVED.md
  OFF-SNAPSHOT-PACKETS.md
  CROSS-REFERENCES.md
  START.md
  explore/00-EXPLORE-NOTES.md
  install-evidence/
  cursor-integration/{skills,commands}/
  openspec/                 # live native mirror
  mirrors/<timestamp>/      # intermediate versions
```


===== explore/00-EXPLORE-NOTES.md =====

# OpenSpec explore — intended Tower product

**When:** 2026-10-19 (UTC)  
**SHA:** `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`  
**OpenSpec:** 1.14.3, schema `spec-driven`, profile `core`  
**Stance:** explore only. No application-code writes. No founder questions (experiment forbids additional product requirements). Uncertainties stay named.

## OpenSpec state at explore start

- `openspec list --json`: no active changes; root `/workspace`
- `openspec list --specs`: empty (greenfield OpenSpec on a brownfield product)
- `openspec doctor`: root ok; no stores/references

## What Tower is (intended)

From Seed §0.1 (validated 2026-07-27) and World sentence:

Tower is a **proactive eligibility engine wrapped in engagement** for immigration consultancies. It is **not** a reactive CRM. The firm hands over a private contact book; Tower keeps engaging, keeps immigration facts fresh through firm→client touchpoints, re-evaluates **service eligibility** as IRCC-shaped reference and client facts move, and surfaces campaign-worthy people so consultants book meetings without rechecking every file.

**North-star outcome** (`OUTCOMES.md`): the consultant hands over the book and authorizes Tower under their license, then **receives booked meetings**. They do not author or run engagement. Authoring lives in the **operator/house** layer because Om Coda runs Tower as an agency.

**One-line value:** Give us your contacts; we engage them, keep their immigration picture current, and surface when eligibility changes.

## Facets (immutable walls)

Acquisition → Activation → Application → Evolution.

- Acquisition finish line: name + website + one channel (phone or email), typically Meta one-tap (V1). LinkedIn deferred. Cold email not V1 Approach.
- Activation finish line: database authorization + escrow acceptance; forward-deploy stages a no-login prepared workspace first.
- Application: always-on detect → engage → collect → re-detect ring. Success event = **meeting booked**.
- Evolution: Register-driven product change. **Shipped firm product contains no Register** (`personas.md`).

## Twelve machine systems (Story)

These are the durable capability boundaries Story locked from Seed+World. Face/UI only extrudes onto states these systems already require.

```
Acquisition --seed lands--> Provision/forward-deploy --hard inputs--> Commercial running
                                                                      |
                                                                      v
                         Application desk (5-12)
                         +--------------------------------------------------+
                         | 5 Audit --> sequence-ready --> 7 Engagement      |
                         | 6 Consent gates 7 and 8                          |
                         | 7 touchpoints --> 8 Fact-refresh --> 10 Eligibility
                         | 9 Reference move --> 10 Eligibility              |
                         | 10 every determination --> 11 Engine 2           |
                         | 11 one motion --> 7 (reactivation first, else nudge)
                         | 12 meeting_booked --> capture --> 10 live brief  |
                         +--------------------------------------------------+
```

1. Acquisition (seed-capture)
2. Provision / forward-deploy
3. Commercial / hard-input (escrow)
4. Tenancy & access
5. Reachability / audit
6. Consent / suppression
7. Engagement / sequencing — **7a** campaign calendar · **7b** attempt / channel-ownership
8. Fact-refresh / data-collection
9. Reference-currency
10. Eligibility re-evaluation
11. Signal / motion orchestration (Engine 2)
12. Meeting / loop-closer

**Engine 2 precedence (must):** reactivation first if anything is reactivation-worthy; nudge only otherwise; one nudge consolidates all outstanding self-reportable needs into **one** form; reactivation attaches secondary signals as **agenda** on the live brief; **one client, one motion, ever**.

**7b runtime (must):** one owning channel at a time along Text → Email → Form; waits/attempts nest under the failed owner; inbound can override; finishing event closes and arms next. Engagement **record** authors nothing.

## Agents flagship (founder wording — 2026-08-15 15:43 UTC)

Do not rewrite into a generated list. Do not put **triggers** inside Agents.

Agents is where the **operator** defines:

- **Outreach sequencing** — not only the sequence, the **order in which outreach is deployed**.
- That sequencing **per firm or as a default**, plus **overrides**.
- **Escalations between attempts** (retry / attempt rules).
- A **goal / goal criteria** that is itself an **escalation point**: to other agents, to other workflows, or it ends. Once met, met. That is the endpoint.
- Everything in the middle is **modular**.

Face laws (`AGENTS-FACE.md`) densify this: sequence is a blank container of campaigns (objectives); two objectives → two campaigns; channels are the medium; rules nest like CSS (global → sequence → campaign override → channel); attempt is a cycle/container; enroll on this sequence starts the mission **now** (not waiting on an event). Opt-in / re-engagement / reactivation are **sequence templates**, not objective names.

## Automations (entered from Agents outskirts)

Shape: **On this event** (schedule | trigger | webhook | manual) → **perform this operation** → **on this kind of result do X / on that kind do Y**. Smallest workflow = trigger · rule · action. Canvas can **chain**.

- Automations is the **brain / operations**. Agents is **send people to a goal**.
- Forms / data requests live in Automations, not Agents.
- Two action kinds: **in the application** · **agents** (assign existing sequence or from a template — do not author a new agent here).
- After a node: **every write that run made** is the handle. Next node **picks**. Live walk is `workflowWalk.ts` (SA 015 — do not recut).
- Events have **Global** vs **Local** grain. Named events (Primitives): form submitted, campaign failed, opt-out, firm created, audit finished, contact file imported, objective met. Not “any row changed.”
- Named in-app actions: ascribe a tag · run an audit · who this applies to · make a form · provision a firm (later). Not “write any table.” Webhook is a way **in**, not an action.

## Product face vs Hub vs README

| Source | Claim |
|--------|--------|
| `AGENTS.md` / Phase Two / Face | Product face = `/prototype-ant`. Hub is reference / plant, not the app. |
| `THREE-SURFACE-MODEL.md` | Register `/register` (theory), Product `/`, Console (holon map). Older three-surface model. |
| Root `README.md` | “UI prototype — mock data, no backend.” **Stale vs this SHA.** |
| Code `Router.tsx` | `/` redirects to `/prototype-ant`. |

**Intended product face on this SHA:** Ant desks at `/prototype-ant` (Consultant · Operator · Contact). Hub remains plant for Automations/Rules grain. Register is house-side methodology tooling and is **not** in the shipped firm product.

Ant modules observed under `src/app/register/prototype-ant/`:

- Consultant: Board, Client workspace / Client Data, Contacts, Meetings, Prepared, Login, Halt outreach
- Operator: Configuration libraries, Agents workbench, Automations workbench, Acquisition, Activation/forward-deploy, Activation state, Audit trail, Book readiness, Commercial, Firm bind, Firm health, Founder controls, Oversight, Provision, Reference data, Register evolution, Sending infrastructure, Support
- Contact: access-link workspace (`/c/<token>`)

## Data and runtime (as-built on this SHA, not invented)

- Machine law: **tables + a dumb runtime**. Anything modifiable is a table (`state | rule | sequence`).
- Postgres: `supabase/migrations/001`–`024` (docs/README still talks 001–018; that pointer is stale vs SQL on this SHA).
- Walker: `server/wire-service/workflowWalk.ts` (015). Cascade/worker: `cascade.ts`, `worker.ts`.
- Live send: Resend CEM + Twilio SMS, gated by consent / halt / silence / `SEND_MODE`.
- Still stand-in / deferred as product choice unless Story required it: Meta ads, escrow fulfillment, enrich crawl, Postmaster, warmup, list-unsubscribe ingress (`docs/README.md` integrations table).
- Data-in-tables law: never hard-code demo people into the SPA. Seeds populate tables.

Packet 022 (objective met is Local) and 023 (failure = stop spending, keep listening) exist as markdown **and** as migrations `021_objective_local_axis.sql` / `022_pursuit_exhausted.sql` on this SHA. Treat SQL as stood-up; treat remaining Face “Open” items as still open unless SQL/code clearly closed them.

## Conflicts and stale overlays (must stay explicit)

1. **README vs later register:** prototype-only vs wired SPA + Hono + Postgres.
2. **Hub-as-app vs Ant-as-app:** Face law 11 says look at Hub for Automations/Rules plant; later law says Hub is not the app. Specs MUST treat Ant as the product face and Hub as plant.
3. **Seed §5.6 firm-does-not-author vs Agents flagship per-firm/default/overrides:** agency thesis (house authors packs; tenancy binds) vs operator-authored sequencing with firm/default/overrides. **Do not silently kill either.** Name the tension.
4. **Story silence on goal-as-escalation vs Face/flagship vs packets 022/023:** Story parks goal expansion in `SYSTEMS-GOAL.md` until promoted. Flagship names the hole. Packets 022/023 + migrations 021/022 ascribe Local objective-met and exhaustion. Specs must not pretend Story was rewritten.
5. **docs/README “do 022 now” vs migrations already present.**
6. **V2-BACKLOG.md (root):** arbitrary Automations graphs deferred. Face says canvas can chain; v1 walker is a validated shape. Distinguish intended Face from shipped walker constraint.
7. **MODULES-ALIVE** claims cohesion except Meta / Register evolution / Escrow; Story still requires those as capabilities even if deferred in prototype honesty.

## Named silences (do not fill)

From Story master list: escrow release; shape of database authorization; SaaS vs escrow peer door; Meta CAC / email earns Meta; CASL/SMS regimes; reactivation-worthy criteria; product-locked attempt windows; SMS reply-failure escalation; import fully mutates living list; D-01/D-02 meeting builders; client desk depth; multi-consultant roles; rule-pack IP; Constants beyond Immigration.

From Automations Face “Open”: full operations catalog; full exit-point catalog; form-as-node vs embedded (lean embedded); remaining output classes; queryable lineage table; remaining in-app actions beyond the named primitives list.

## Evidence ranking used in specs

1. Founder flagship wording (15:43) — do not paraphrase away
2. Seed + World + Story must/must-not/chain/silence
3. Face laws (Agents / Automations / Primitives / Data-in-tables)
4. Outcomes / How trees (consultant north-star; operator authorship)
5. SA packets present on this SHA
6. SQL migrations / walker / dispatch as **as-built**, labeled when they implement or only partially house intended behavior
7. Root README and older Hub-as-product sentences — treated as historical overlays, not current intended product

## Next OpenSpec step

Explore has crystallized: capture the intended product as a **spec-only change** (`specify-intended-tower-product`) via `/opsx-propose`. Apply/implementation is out of experiment scope. After artifacts exist, `/opsx-sync` lands main `openspec/specs/`.


===== UNRESOLVED.md =====

# Unresolved — named silences, not invented decisions

Source SHA `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`. These are corpus-named holes. They were **not** filled.

## Story silences (`docs/register/SYSTEMS-STORY.md`)

| Item | System |
|------|--------|
| Escrow release definition | commercial-hard-input |
| Shape of database authorization | commercial-hard-input |
| Ongoing SaaS packaging vs escrow peer door at activation | commercial-hard-input |
| Email earns Meta entry; Meta CAC / targeting | acquisition-seed-capture |
| CASL/SMS consent regimes by geography | consent-suppression |
| What makes a signal reactivation-worthy | signal-motion |
| Product-locked attempt criteria windows; SMS reply-failure escalation | engagement-sequencing |
| Import fully mutates the living list; CRM bidirectional sync | reachability-audit |
| D-01 / D-02 meeting-capture builder placement | meeting-loop-closer, signal-motion |
| Client desk depth (touchpoint vs authenticated portal) | fact-refresh, contact-touchpoints |
| Multi-consultant roles / permissions | tenancy-access |
| Rule-pack IP/liability; Constants beyond Immigration | reference-currency |

OPERATOR-REVISIONS attempt windows (30 min / 24 h) are prototype clarifiers, not Seed/World law until promoted.

Story parks goal-as-escalation in `SYSTEMS-GOAL.md` until promoted. Flagship 15:43 names the hole. Packets 022/023 + migrations 021/022 on this SHA ascribe Local objective-met and exhaustion without rewriting Story.

## Automations Face “Open” (SHA file) plus living packets

Still not a full founder-locked catalog:

- Full list of operations Automations performs
- Full list of exit points besides start/select agent
- Form-as-own-graph-node vs embedded in start-agent (lean: embedded)
- Remaining rule output classes besides required data
- Queryable lineage as a dedicated table (minimum: queryable)
- Remaining in-app actions beyond named module affordances
- Some #96 plate interiors (mapped-box occupancy, wait-note, input-look chrome, node-interior stacking) are specified as Face packets off-snapshot; not every chrome sentence was restated as an OpenSpec requirement

## Tensions kept, not resolved

- House-authored packs bound per tenancy (Seed/personas) vs operator-authored sequencing with firm/default/overrides (Agents flagship)
- Face chaining vs as-built v1 validated walker shape
- Meta / escrow required by Story, deferred in prototype honesty / MODULES-ALIVE
- Root README “mock prototype, no backend” vs wired SPA + Hono + Postgres on this SHA

## Off-snapshot

See `OFF-SNAPSHOT-PACKETS.md`. Origin `pull/96/head`, `pull/86/head`, `pull/110/head` were inspected. Application tree was not merged to those commits.


===== OFF-SNAPSHOT-PACKETS.md =====

# Off-snapshot origin evidence (inspected, not merged)

HEAD remained `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`.

This SHA’s `docs/README.md` and `PHASE-TWO-LOG.md` Current pointer say living PM packets are on PR #96 and SA ascribes on #86 / #110. Those refs were fetched for read-only inspection.

| Ref | SHA | Role |
|-----|-----|------|
| `origin pull/96/head` | `d6f3a17e4be15847502195739466c4b61fb4ac12` | PM packets / plates |
| `origin pull/86/head` | `55b658fe534bfe3b91a7d2e82dd8f8a328c01165` | SA ascribes / packets 012–028 |
| `origin pull/110/head` | `f9711319fc946cfc1273f00ba2c436a6b38c1cda` | SA Current pointer bump |

## Folded into OpenSpec (selected laws)

From #96 into `automations-orchestration` and `contact-touchpoints`:

- If / Switch as two node kinds; paths are wires; ⋯ Switch ≠ Switch node (`IF-SWITCH-PACKET.md`)
- Test data on the trigger; two doors; no Test tab (`TEST-PACKET.md`)
- Save · Run · Launch; Run now vs Launch arm (`RUN-PACKET.md`)
- Get is a node kind (`GET-PACKET.md`)
- In-app action = existing module affordance (`IN-APP-ACTION-PACKET.md`, denser Primitives)
- Extra named events: new contact; reference pack updated; contact uploaded (`PRIMITIVES.md`, `CONTACT-UPLOADED-EVENT-PACKET.md`)

## Not fully restated as OpenSpec requirements (chrome / ascribe remaining)

Packet files present on #96 and not on HEAD include, among others:

- `FORM-CLASS-PACKET.md`, `INPUT-LOOK-PACKET.md`, `MAPPED-BOX-PACKET.md`, `NODE-INTERIOR.md`, `NODE-PLACE-PACKET.md`
- `ADD-TAG-PACKET.md`, `AUDIT-FIELD-PACKET.md`, `TRIGGER-SELECT-PACKET.md`
- `WAIT-NOTE-PACKET.md`, `WAIT-NOTE-APPROVER-PACKET.md`, `WAIT-NOTE-PLATES.md`
- `CONTACT-FACE.md`, `CONTACT-UI-BLUEPRINT.md`, `CONTACT-WORKSPACE-PACKET.md`, `CONTACT-UPLOAD-PACKET.md`
- `PLATE-READ.md`, `SHELL-CHROME.md`, `SHELL-CHROME-PACKET.md`
- `RULE-OUTCOMES-PACKET.md`, `RULE-OUTPUT-PACKET.md`
- Launch terrain / staged plates / confirm-ready deferred notes

SA ascribes on #86 (packets 012–028, Get/Rule/Test/Run ascribes, operator modules) were listed, not individually inlined. Where this SHA already had migrations `018`–`024` and packets 022/023 markdown, those as-built cuts were used.

No application files were checked out from these PRs.


===== CROSS-REFERENCES.md =====

# Cross-references

## OpenSpec capabilities → corpus

| Capability | Primary evidence |
|------------|------------------|
| product-purpose | Seed §0.1, OUTCOMES core, THREE-SURFACE vs AGENTS.md face, DATA-IN-TABLES, Seed §0.4 |
| acquisition-seed-capture | Story §1, Seed §6.2 |
| provision-forward-deploy | Story §2, Seed §6.3 |
| commercial-hard-input | Story §3, Seed §0.3, §7 |
| tenancy-access | Story §4, Seed §5.10, MAGIC-ACCESS-LINK |
| reachability-audit | Story §5, Seed §5.2 |
| consent-suppression | Story §6, dispatchSend gates, halt |
| engagement-sequencing | Flagship 15:43, AGENTS-FACE, Story §7 |
| fact-refresh | Story §8, Seed §5.4 |
| reference-currency | Story §9, Seed §5.7 |
| eligibility-evaluation | Story §10, AUTOMATIONS-FACE rules |
| signal-motion | Story §11, Seed §5.8 |
| meeting-loop-closer | Story §12, packets 022/023, migration 021/022 |
| automations-orchestration | AUTOMATIONS-FACE, PRIMITIVES, SA 015, origin #96 packets |
| consultant-desk | OUTCOMES A, how/consultant-*.md, prototype-ant/consultant |
| operator-house | personas.md, how/operator-*.md, prototype-ant/operator |
| contact-touchpoints | OUTCOMES B, how/contact-*.md, #96 contact-uploaded |
| outbound-actuation | Story 7 compose vs send, GO-CUTOVER, dispatchSend |

## OpenSpec change

`openspec/changes/specify-intended-tower-product/` — schema spec-driven. Synced to `openspec/specs/`. Apply against application source was not run.


===== install-evidence/INSTALL.md =====

# OpenSpec install evidence

- start_time_utc: 2026-10-19T16:46:32Z
- intended_command: `npm install -g @fission-ai/openspec@latest`
- first_attempt: failed with `EACCES` writing `/usr/lib/node_modules`
- cause: `which node` resolved to `/exec-daemon/node`; `npm prefix -g` was `/`
- actual_install:
  - prepended `/home/ubuntu/.nvm/versions/node/v22.23.3/bin` to PATH
  - ran `npm install -g @fission-ai/openspec@latest` with nvm npm
  - prefix: `/home/ubuntu/.nvm/versions/node/v22.23.3`
  - binary: `/home/ubuntu/.nvm/versions/node/v22.23.3/bin/openspec`
- `openspec --version`: **1.14.3**
- official website listed v1.14.2; installed package is 1.14.3
- node: v22.23.3 (meets OpenSpec >= 20.19.0)
- leftover OpenSpec files before init: none in `/workspace`
- profile (global): core
- delivery (global): both
- workflows: propose, explore, apply, update, sync, archive
- telemetry: noticeSeen true (CLI default after first run)
- official sources consulted:
  - https://raw.githubusercontent.com/Fission-AI/OpenSpec/main/install.md
  - https://openspec.dev/
  - https://openspec.dev/llms.txt
  - https://openspec.dev/docs/setup
  - https://openspec.dev/docs/quickstart
  - https://openspec.dev/docs/skills
  - https://openspec.dev/docs/schemas/spec-driven
  - https://openspec.dev/docs/stores
  - https://openspec.dev/docs/configuration/config-yaml
  - https://openspec.dev/docs/supported-tools


===== _workspace/openspec/config.yaml =====

schema: spec-driven

context: |
  Capture the intended Tower product from repository evidence at git SHA
  c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7. Do not implement application code.
  Do not invent founder decisions. Named Story silences and Face "Open" items
  stay unresolved. Product face is /prototype-ant; Hub is reference/plant, not
  the app. Agents flagship wording in docs/register/PHASE-TWO-LOG.md at
  2026-08-15 15:43 UTC is law — do not rewrite it into a generated list that
  puts triggers inside Agents. Specs describe intended behavior and MUST
  distinguish Seed/World/Story musts, Face laws, SQL-as-stood-up, and named
  silences. Records that show in a module come from tables; never hard-code
  demo people into the app. Do not recut server/wire-service/workflowWalk.ts
  (SA 015). This OpenSpec change is specification capture, not a product
  implementation.

rules:
  proposal:
    - This change is specification capture of the intended product, not an implementation change.
    - State that application-code apply is out of scope.
    - Name evidence sources and unresolved silences rather than filling them.
  specs:
    - Quote the Agents flagship; do not paraphrase it into a numbered list that includes triggers.
    - Mark UNRESOLVED where Seed, World, Story, or Face name a silence or open item.
    - Distinguish intended behavior from as-built migrations/code when they diverge.
    - Do not invent tables, event catalogs, or action catalogs beyond those already named in the repository.
    - Each requirement MUST have at least one WHEN/THEN scenario.
  design:
    - Record evidence ranking, conflicts, and the twelve-system spine.
    - Do not propose a second walker or recut 015.
    - Do not treat Hub as the product face.
  tasks:
    - Specification authoring, validation, and spec-sync only.
    - Do not include application-code implementation tasks.
    - State that /opsx-apply against Tower application source is out of scope.

operations:
  apply:
    guidance:
      - Do not apply this change to Tower application source. Experiment constraint: specification only.
  archive:
    guidance:
      - Sync delta specs into openspec/specs/ without claiming product implementation shipped.


===== _workspace/openspec/changes/specify-intended-tower-product/proposal.md =====

# Proposal

## Why

Tower already has a dense intended-product corpus (Seed, World, Systems Story, Face laws, packets, SQL) but no OpenSpec capability inventory. This change captures that intended product as reviewable specs from repository evidence at SHA `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`, so the intended machine and desks are one coherent contract instead of a stack of overlays.

## What Changes

- Add OpenSpec main-spec capabilities covering the intended Tower product (machine systems, Automations/Agents authorship, desks, outbound gates).
- Record named silences and Face “Open” items as **UNRESOLVED** instead of filling them.
- Distinguish intended behavior from as-built code/SQL where they diverge (including a stale root README that still calls the repo a mock-only prototype).
- Fold living PM packet laws from origin `pull/96/head` (If/Switch, Test, Run/Launch, Get, extra events, in-app affordances) into Automations and Contact specs. Those packets are pointed at by this SHA’s Current pointer; they were inspected, not merged into the application tree.
- Do **not** change Tower application source. `/opsx-apply` against the product is out of scope.

## Capabilities

### New Capabilities

- `product-purpose`: Why Tower exists, north-star consultant outcome, facet walls, product face vs Hub vs Register, data-in-tables honesty, presentation ≠ fulfillment.
- `acquisition-seed-capture`: One-tap Approach capture of cheap seed inputs; continue-scroll; no hard inputs in the click budget.
- `provision-forward-deploy`: After seed inputs land, stage a no-login prepared workspace under firm identity from Om Coda templates.
- `commercial-hard-input`: Database authorization and escrow as activation finish line; firm↔Om Coda money only.
- `tenancy-access`: Firm tenancy, passwordless OTP, access links, same application desk for ALG and assisted doors.
- `reachability-audit`: Reachability-only audit; sequence-ready verdicts; not pathway scoring.
- `consent-suppression`: Opt-in, silence, halt; firm DB auth does not substitute for end-client consent.
- `engagement-sequencing`: Operator-authored outreach sequencing (Agents flagship), campaign calendar vs attempt engine, enroll-now vs event enroll.
- `fact-refresh`: Touchpoints as data collection; field classes; write-back triggers re-evaluation.
- `reference-currency`: Versioned IRCC-shaped reference as data; faceless reference-move trigger; no deploy to update facts.
- `eligibility-evaluation`: Private service eligibility; open-box rules; every determination is a signal.
- `signal-motion`: Engine 2 records every detection and chooses one outbound motion by fixed precedence.
- `meeting-loop-closer`: Meeting booked is the loop win; pending capture; live (not snapshot) brief.
- `automations-orchestration`: Event → operation → binary exits; write-set handle after a node; named events/actions; Global vs Local.
- `consultant-desk`: Consultant workspace (hand over · authorize · receive · halt); Board, Client Data, Contacts, Meetings, Prepared.
- `operator-house`: House-global console plus per-tenancy admin; configuration libraries authored house-side and bound per firm.
- `contact-touchpoints`: Engagement-contact consent, refresh, silence, and booking as firm-branded delivery, not a Tower persona workspace.
- `outbound-actuation`: Composing ≠ sending; consent/halt/silence gates; live vs stand-in ports.

### Modified Capabilities

- None. `openspec list --specs` is empty; this is the first capability inventory.

## Impact

- OpenSpec artifacts only (`openspec/specs/`, this change folder). No application-code, schema, or walker changes.
- Does not recut SA 015 (`workflowWalk.ts`), overwrite the 15:43 Agents flagship, plant Hub as the app, or mint tables from pictures.
- Downstream implementation remains gated by existing packets and named silences; this change does not authorize building deferred Meta, escrow fulfillment, or Register-in-the-firm-product.


===== _workspace/openspec/changes/specify-intended-tower-product/design.md =====

# Design

## Context

See `proposal.md` for why. OpenSpec on this SHA starts with an empty `openspec/specs/` inventory. The intended product already exists as Seed → World → Story → Requirements → Face laws → packets → SQL, plus a stale root README that still says “mock data, no backend.”

This change is **specification capture**. Application-code apply is forbidden by the experiment. Hub versus `/prototype-ant`, Story silences versus later packets, and house-authored packs versus flagship overrides are already named in the specs; this design records how those tensions were handled, not a second product invention.

## Goals / Non-Goals

**Goals:**

- One OpenSpec capability per Story system (1–12), plus Automations, three desks/touchpoints, outbound actuation, and product-purpose constraints.
- Intended behavior as SHALL/MUST with WHEN/THEN scenarios.
- As-built SQL/walker/ports labeled when they only partially house the intended law.
- Named silences remain UNRESOLVED requirements, not filled decisions.
- After review, `openspec-sync-specs` lands main `openspec/specs/` without claiming the product was implemented.

**Non-Goals:**

- Implementing Tower, recutting `workflowWalk.ts`, minting tables, or generating plates.
- Asking the founder to resolve silences.
- Treating Hub as the product face.
- A coordinator-template rewrite of these specs.

## Decisions

### Decision: Capability grain follows Story, then Face

**Choice:** Twelve Story systems stay twelve capabilities. Automations is its own capability (Story system 11 is Engine 2 motion; Automations Face is the operations canvas). Desks (`consultant-desk`, `operator-house`, `contact-touchpoints`) and `outbound-actuation` are Face/Wiring extrusions Story excludes by law (UI is control/pane only). `product-purpose` holds north-star, facet walls, face-vs-Hub, data-in-tables, and presentation ≠ fulfillment.

**Why:** Story forbids conflating engines. OpenSpec forbids catch-all capabilities. Folding Agents into Automations would recreate the 14:58 error (triggers inside Agents). Folding desks into systems would invent UI as the machine.

**Alternatives considered:**

- One mega `tower-product` spec — rejected; OpenSpec asks for cohesive evolving boundaries.
- Face modules only — rejected; faceless triggers (reference move, email opened, window elapsed) would disappear, which is the Systems Requirements discovery.

### Decision: Evidence ranking

1. Founder flagship 15:43 (quoted, not paraphrased into a trigger list)
2. Seed + World + Story must / must-not / chain / silence
3. Face laws and Primitives
4. Outcomes / How trees
5. SA packets on this SHA
6. Origin pull refs this SHA tells you to fetch: `pull/96/head` (PM packets), `pull/86/head` and `pull/110/head` (SA) — inspected, not merged
7. Migrations `001`–`024`, walker, dispatch — as-built
8. Root README / older Hub-as-app sentences — historical overlay

**Why:** Seed wins on business conflict; flagship wins on Agents definition; SQL wins on “what is stood up”; Face “Open” and Story silences stay open.

### Decision: Spec-only change; no product apply

**Choice:** `tasks.md` is OpenSpec authoring, validate, and sync. `/opsx-apply` against Tower source is out of scope.

**Why:** Experiment constraint. OpenSpec apply would edit application code.

**Alternative:** Archive without sync — rejected; main `openspec/specs/` would stay empty, so the durable inventory would live only in a change folder.

### Decision: Name tensions instead of picking a winner

Kept both sides in specs:

| Tension | Handling |
|---------|----------|
| House-authored packs vs flagship firm/default/overrides | Named; not deleted |
| Face chaining vs v1 validated walker | Named gap |
| Story parks goal-as-escalation vs packets 022/023 + migrations 021/022 | Story silence remains; Local objective-met is as-built ascription |
| Meta / escrow required by Story, deferred in prototype honesty | Specified and marked deferred |

### Decision: Product face is Ant

`Router.tsx` redirects `/` to `/prototype-ant`. Phase Two / AGENTS.md / Face laws agree. Hub remains plant for Automations/Rules grain.

## Risks / Trade-offs

- [Off-snapshot living packets] → This SHA’s Current pointer names origin `pull/96/head` (PM packets) and `pull/86/head` / `pull/110/head` (SA). Those refs were inspected after first sync. Selected packet laws were folded into Automations/Contact specs. Remaining packet chrome (plate interiors, mapped-box look, wait-note plates) is Face-complete on #96 and only partly restated here. Mitigation: inventory those files under preservation `OFF-SNAPSHOT-PACKETS.md` rather than pretending the SHA tree contained them.
- [Stale docs/README current pointer] → README still says do 022; this SHA already has `021_objective_local_axis.sql` and `022_pursuit_exhausted.sql`. Mitigation: SQL-as-stood-up labeled in specs.
- [OpenSpec apply temptation] → Tasks explicitly forbid application-code work.
- [500-character requirement descriptions] → One behavior per requirement; details in scenarios. `--strict` may still warn; split if it fails.
- [Capability count] → Eighteen files is large but matches Story’s non-conflatable engines plus required faces.

## Migration Plan

1. Validate the change (`openspec validate specify-intended-tower-product --strict`).
2. Sync deltas into `openspec/specs/` (`openspec-sync-specs`).
3. Do not apply application code.
4. Mirror `openspec/` into `/home/ubuntu/tower-spec-output/` (experiment preservation). Do not push origin.

Rollback: delete the change folder and synced specs; Tower application source is untouched.

## Open Questions

None that can be answered later without changing specs. Remaining product unknowns are already UNRESOLVED requirements (Story silences and Automations Face “Open” items).


===== _workspace/openspec/changes/specify-intended-tower-product/tasks.md =====

# Tasks

## 1. Specification capture

- [x] 1.1 Write `proposal.md` listing eighteen new capabilities and stating that application-code apply is out of scope; verify the file exists at `openspec/changes/specify-intended-tower-product/proposal.md`
- [x] 1.2 Write delta specs for every proposal capability under `openspec/changes/specify-intended-tower-product/specs/<capability>/spec.md`; verify eighteen `spec.md` files exist
- [x] 1.3 Write `design.md` recording evidence ranking, capability grain, and named tensions; verify the file exists and contains Decisions plus Risks
- [x] 1.4 Confirm no Tower application source was edited for this change; verify `git status` shows only `openspec/` (and gitignored `.cursor/` OpenSpec skills)

## 2. Validate

- [x] 2.1 Run `openspec validate specify-intended-tower-product --strict` and verify it reports valid (fix delta format or requirement length if it fails)
- [x] 2.2 Run `openspec list --specs` after sync and verify all eighteen capabilities appear (this task waits on 3.1; if run before sync, expect empty main specs)

## 3. Land main specs (no product implementation)

- [x] 3.1 Sync delta specs into `openspec/specs/` using the OpenSpec sync-specs workflow and verify each capability has `openspec/specs/<capability>/spec.md`
- [x] 3.2 Mirror `openspec/` (including this change and any synced main specs) into `/home/ubuntu/tower-spec-output/` and verify the mirror contains proposal, eighteen deltas, design, tasks, and main specs
- [x] 3.3 Confirm `/opsx-apply` against Tower application source was not run; verify no `src/`, `server/`, or `supabase/` files were modified

## Workflow follow-up

- Do not run `/opsx-apply` on Tower application source.
- Archive is optional after main specs exist; archive MUST NOT be claimed as product shipment.
- Named Story silences and Face “Open” items stay UNRESOLVED.


===== _workspace/openspec/changes/specify-intended-tower-product/specs/acquisition-seed-capture/spec.md =====

# Spec Delta

## Purpose

Obtains the three cheap seed inputs from a stranger consultant inside the click budget, then returns that stranger to their scroll so Activation can begin.

## ADDED Requirements

### Requirement: Seed inputs are the acquisition finish line
Acquisition SHALL finish when firm/consultant name, website, and one channel (phone or email) are captured. V1 Approach SHALL be Meta (Facebook / Instagram). LinkedIn is deferred. Cold email MUST NOT be a V1 Approach.

#### Scenario: One-tap capture
- **WHEN** a stranger consultant taps a Meta Approach
- **THEN** the system SHALL capture name, website, and one channel inside a one-click design constraint and persist the capture with session attribution

#### Scenario: Continue scroll
- **WHEN** those seed inputs have landed
- **THEN** the system SHALL return the stranger to their scroll and MUST NOT present a thank-you dashboard as the acquisition finish

### Requirement: Continue-scroll without tapping is first-class
The system SHALL treat continue-scroll without tapping as a first-class non-action and instrument whether the stranger did not understand versus understood and did not tap.

#### Scenario: Non-tap is recorded
- **WHEN** an Approach impression is shown and the stranger does not tap
- **THEN** the system SHALL record that non-action rather than treating it as absence of data

### Requirement: Approach acquires only the consultant
Approach SHALL acquire one non-house party in V1: the Consultant. Engagement contacts MUST NEVER be acquired via Approach. The Om Coda house MUST NEVER be acquired via Approach.

#### Scenario: Contact is not an Approach stranger
- **WHEN** a person is an end-client on a firm book
- **THEN** they MUST NOT be acquired into Tower through the Meta Approach used for consultants

### Requirement: Acquisition does not collect hard inputs
UNRESOLVED (Story silence): when/whether email earns Meta entry, and Meta targeting / CAC, remain unnamed. The system MUST NOT invent those as founder-locked product rules.

#### Scenario: Silence stays named
- **WHEN** specifying Meta targeting, CAC, or whether email earns Meta entry
- **THEN** the product SHALL leave those items unresolved rather than filling them as decided law


===== _workspace/openspec/changes/specify-intended-tower-product/specs/automations-orchestration/spec.md =====

# Spec Delta

## Purpose

Performs operations on events: listen (in-app event Global or Local, schedule, manual, webhook), run a definite middle, then take binary exits — including in-app actions and assigning agents — with a handle to every write that run made.

## ADDED Requirements

### Requirement: Definite middle
An automation SHALL follow: on this event (schedule or trigger) → perform this operation → on this kind of result do X / on that kind do Y. Results SHALL be binary or the binaries already defined. Smallest legal workflow SHALL be trigger · rule · action. The canvas SHALL be able to chain.

#### Scenario: Teaching walk
- **WHEN** a firm is created / provisioned
- **THEN** an automation SHALL be able to audit the contacts, then If on that output, then assign an agent

### Requirement: Two listen kinds
The system SHALL hear something that happened in the app as an event, all of that kind (Global) or this specific one (Local). Non-event listens SHALL be schedule, manual, and webhook. Webhook is a way in, not an action.

#### Scenario: Form submitted Global vs Local
- **WHEN** an operator authors a form-submitted trigger
- **THEN** they SHALL be able to choose all forms of that kind (Global) or this form (Local)

### Requirement: Named events only
Named in-app events SHALL include: a form was submitted; a campaign failed; someone opted out / unsubscribed; a firm was created / provisioned; an audit finished; a contact file was imported; an objective was met. The system MUST NOT treat “any row changed” as an event. Specs MUST NOT invent the rest of the catalog.

#### Scenario: Unsupported when
- **WHEN** a proposed trigger is not on the named event list and is not schedule, manual, or webhook
- **THEN** the shape SHALL NOT support it yet

### Requirement: Two action kinds
Actions SHALL be (1) Agents — assign an existing sequence or create from a template; the operator MUST NOT author a new agent inside Automations — and (2) in the application: ascribe a tag, run an audit, who this applies to, make a form, and later provision a firm. The system MUST NOT offer “write whatever into whatever table.” If / condition is not an action.

#### Scenario: Agents action choices
- **WHEN** the operator adds an Agents action
- **THEN** the choices SHALL be assign to an existing sequence or create from a template, with no third choice to author a new agent here

### Requirement: Forms live in Automations
Data-request forms SHALL be created in Automations. Agents MUST NOT be a form builder. Re-engagement is a campaign name, not an objective. UNRESOLVED: form-as-own-graph-node versus embedded in the start-agent node (lean: embedded).

#### Scenario: Data request origin
- **WHEN** an automation originates a data-request objective
- **THEN** the form SHALL be authored in Automations, not on the Agents canvas

### Requirement: Handle after a node
When a node finishes, the next step SHALL have every write that run made from the real module. The next node SHALL pick which of those writes it is about. The handle MUST NOT be “latest audit for this firm.” Hub preview MUST NOT be treated as the live path. Live walk SHALL remain `workflowWalk` (SA 015) and MUST NOT be recut into a second machine.

#### Scenario: Audit then If
- **WHEN** an Audit action completes and the next node is If
- **THEN** If SHALL read fields of that run’s writes (person rows split people; a run-row field evaluates once)

### Requirement: Rules are composites
A rule SHALL be a creatable composite of conditions and constants, modular across industries, with togglable outcome families. Authored logic SHALL be simple enough for a GUI by default, with a Custom (code / JSON) escape hatch. Inside-the-rule conditions MUST NOT be collapsed with the DAG If node that calls from the previous result.

#### Scenario: Two condition grains
- **WHEN** an operator opens a rule and also places an If node after it
- **THEN** field · operator · constant SHALL live inside the rule, and the If SHALL call from the previous result to fork actions

### Requirement: Objectives are events
All objectives SHALL be events. The write-back SHALL be the event; the event happening SHALL be the write-back. There SHALL be no special return wire. Lineage (who created the objective, path, completion, time) SHALL be queryable at minimum. UNRESOLVED: minting a dedicated lineage table from that sentence.

#### Scenario: Completion is a write
- **WHEN** a form that was the objective is submitted
- **THEN** that write SHALL be detectable as the completion event across the app

### Requirement: Campaign failure is an event
Campaign failure SHALL be an event with Global and Local grain. Failure mode (packet 023 / migration 022 on this SHA) SHALL stop spending outbound resources while still listening for the objective. Exhaustion MUST NOT close inbound listening. Nullification (escrow-era door refuse) is not built and MUST NOT be invented here.

#### Scenario: Exhausted still claimable
- **WHEN** a campaign’s attempt is exhausted
- **THEN** the system SHALL stop further outbound attempts for that pursuit and SHALL still count the objective as met if it later clears

### Requirement: Walker v1 shape vs Face chain
As-built v1 walker recognizes a validated pipeline shape. Face law says the canvas can chain. Specs MUST distinguish intended chaining from the shipped walker constraint and MUST NOT silently delete either.

#### Scenario: Named tension
- **WHEN** an automation graph is not the validated v1 shape
- **THEN** as-built runtime MAY reject it, while the intended Face still requires chaining; that gap SHALL stay named rather than pretended closed

### Requirement: If and Switch are two node kinds
The system SHALL provide If (one split, two wires: true / false) and Switch (many paths; each path is a wire; Add path adds a wire). Paths SHALL be wires, not Then/Else radios inside the modal. True SHALL be the If interior mode; anything other than that argument is the false wire. **⋯ Switch** SHALL mean change this node’s kind. Palette **Switch** SHALL mean the many-path node. Those two words MUST NOT be mixed.

#### Scenario: If has two wires
- **WHEN** an If node is placed on the Automations canvas
- **THEN** true and false SHALL leave as wires, and the interior MUST NOT present Then/Else radios to build

#### Scenario: Switch adds a path as a wire
- **WHEN** the operator adds a path on Switch
- **THEN** that path SHALL appear as a wire from the node

### Requirement: Test data lives on the trigger
Providing test data SHALL sit inside the placed Trigger. It SHALL fill that event’s write-shape (fields and values) so mapping and Run have a handle. It MUST NOT execute the canvas, MUST NOT Launch, MUST NOT INSERT live rows, and MUST NOT be a Test tab. Door 1: pick an instance that already exists. Door 2: specimen of the real write-set when the event has not fired. The client MUST NOT hard-code a field catalog.

#### Scenario: Test is not Run
- **WHEN** the operator provides trigger test data
- **THEN** Get / Rule / Action / If SHALL NOT execute from that control

### Requirement: Save, Run, and Launch are three controls
Canvas header SHALL be Save · Run · Launch. Run SHALL execute the chain now with the trigger’s data (canvas until it breaks, and per-node up to the active node). Launch SHALL arm: from now on, when this event happens, do this. Launch MUST NOT be a manual fire. Live Launch that also starts a manual run is the gap to split, not the intended product.

#### Scenario: Launch does not fire
- **WHEN** the operator presses Launch
- **THEN** the workflow SHALL be armed for future events and MUST NOT walk now as if Run were pressed

#### Scenario: Run uses trigger data
- **WHEN** the operator presses Run with trigger test data filled
- **THEN** the walk SHALL use that handle now and break on an unconfigured node

### Requirement: Get is a node kind
Get SHALL be a node kind that reads existing table rows (not Action, not Audit, not Contacts-only). Clicking a node SHALL configure it. The write-set / handle after a node remains the shape for mapping.

#### Scenario: Get is not an Action
- **WHEN** the operator adds Get from the palette or wire
- **THEN** it SHALL be a Get node whose parameters select what to read, not an in-app Action

### Requirement: In-app action is an existing module affordance
Whether X can be automated SHALL mean whether that module already affords X. Automations SHALL consume that affordance and MUST NOT author a second button. Specs MUST NOT turn this into “write any table.” Named examples remain ascribe a tag, run an audit, make a form; provision a firm stays later. Audit field chips on a contact are a consequence of Run audit, not a second Action.

#### Scenario: Run audit is the action
- **WHEN** an automation needs audit verdicts on contacts
- **THEN** the action SHALL be Run audit (the desk’s affordance), and the Audit field SHALL populate as a consequence

### Requirement: Additional named events from living packets
Origin pull/96 living packets add named events the SHA Face list had not yet closed: a new contact; a reference pack / eligibility criteria was updated; a contact uploaded information. Contact import and new contact SHALL be two events. Contact uploaded information SHALL be a different event and different seat from operator import and from form submitted. Specs MUST NOT collapse those three. Global still means every firm plus every permutation of that event.

#### Scenario: Upload is not import
- **WHEN** a contact puts information in from their workspace
- **THEN** that SHALL be hearable as contact-uploaded, not as operator contact-file import and not as form-submitted for the current objective


===== _workspace/openspec/changes/specify-intended-tower-product/specs/commercial-hard-input/spec.md =====

# Spec Delta

## Purpose

Lands the two hard inputs that flip a campaign to running: database authorization (or equivalent that makes the campaign real) and escrow acceptance between the firm and Om Coda.

## ADDED Requirements

### Requirement: Two hard inputs are the activation finish line
The system SHALL accept database authorization and escrow acceptance as the activation finish line, then flip the campaign to running so it performs without further required activation inputs.

#### Scenario: Running after both commits
- **WHEN** a consultant on a prepared workspace authorizes the book and accepts escrow terms
- **THEN** the campaign SHALL be able to run without asking for more required activation inputs

### Requirement: Escrow is the peer door at activation payment
At the activation payment moment the presented door SHALL be escrow, not prepaid credits. Credits or a sales-call MUST NOT be presented as a peer door equal to escrow at that moment.

#### Scenario: No credits peer door
- **WHEN** the consultant is asked to accept commercial terms to go running
- **THEN** the system SHALL present escrow and MUST NOT present credits or a sales-call as an equal peer door

### Requirement: Money is firm to Om Coda only
Commercial terms SHALL be firm↔Om Coda. Tower MUST NOT hold immigrant settlement funds. End-clients MUST pay Tower nothing. Detection cost to the contact SHALL be free; the firm is charged.

#### Scenario: Contact is never billed by Tower
- **WHEN** an engagement contact receives outreach or books a meeting through Tower
- **THEN** Tower MUST NOT charge that contact

### Requirement: Escrow release remains unresolved
UNRESOLVED (Story silence): escrow release trigger / outcome definition, the concrete shape of “database authorization” per practice stack, and whether later SaaS packaging exists. Later SaaS MUST NOT replace escrow as the peer door at activation.

#### Scenario: Silence on release
- **WHEN** specifying when escrow releases
- **THEN** the product SHALL name that silence rather than inventing a founder-locked release rule


===== _workspace/openspec/changes/specify-intended-tower-product/specs/consent-suppression/spec.md =====

# Spec Delta

## Purpose

Governs who may be touched automatically, keeping firm database authorization from substituting for end-client consent, and supporting halt as a firm governance control.

## ADDED Requirements

### Requirement: Opt-in before deep collection
The system SHALL run an opt-in phase: firm-to-client consent and first channel open. Deep data collection SHALL be gated on opt-in. Contacts SHALL be sequenced, silenced, or unsequenced, with silenced when not opted in and when opted out.

#### Scenario: Not opted in
- **WHEN** a contact has not opted in
- **THEN** the system SHALL treat them as silenced for automatic outreach and MUST NOT run deep collection on them

### Requirement: Firm DB auth is not end-client consent
The system MUST NOT skip opt-in because ALG succeeded or because the firm authorized database access.

#### Scenario: Authorized book still needs opt-in
- **WHEN** a firm has authorized the book and a contact has not opted in
- **THEN** automatic deep outreach SHALL remain gated on that contact’s consent state

### Requirement: Halt suppresses new enroll and send
A firm-book or contact halt SHALL suppress new enrollments and new sends. Halt is a consultant governance control so outreach runs under the firm license only when the consultant will stand behind it.

#### Scenario: Halt active
- **WHEN** a halt record is active for the firm book or the contact
- **THEN** the system MUST NOT enroll that contact into new automatic outreach or send new messages to them

### Requirement: Consent feeds Audit
Consent and silenced state SHALL feed Audit reachability.

#### Scenario: Silenced contact in audit
- **WHEN** Audit evaluates a silenced contact
- **THEN** that silenced state SHALL affect the reachability / sequence-ready verdict

### Requirement: CASL and SMS regimes remain unresolved
UNRESOLVED (Story silence): CASL/SMS consent regimes by geography for firm-to-client and for the first agent-to-consultant text. The system MUST NOT invent those regimes as locked product law.

#### Scenario: Do not invent geography rules
- **WHEN** specifying exact CASL or SMS legal regimes by geography
- **THEN** the product SHALL leave those regimes unresolved rather than inventing them


===== _workspace/openspec/changes/specify-intended-tower-product/specs/consultant-desk/spec.md =====

# Spec Delta

## Purpose

Gives the acquired consultant a firm desk to hand over the book, authorize Tower under the firm license, inhabit Board / Client Data / Contacts / Meetings, and halt outreach they will not stand behind.

## ADDED Requirements

### Requirement: Desk verbs are hand over, authorize, receive
The consultant desk SHALL support handing over the private book, authorizing Tower to work under the firm license, and receiving booked meetings with a live brief — without requiring the consultant to author Automations or Agents.

#### Scenario: Prepared workspace hard inputs
- **WHEN** a consultant is activating on the prepared workspace
- **THEN** they SHALL be able to connect the book and accept terms without opening Configuration libraries

### Requirement: Board and client workspace
The consultant SHALL have a board of contacts with phase indicators and a client workspace with Details versus Activity. Activity SHALL hold the engagement chronology. Details SHALL hold profile / brief style information.

#### Scenario: Open a client from the board
- **WHEN** the consultant clicks a contact on the Board
- **THEN** that contact’s workspace SHALL open with Details and Activity available

### Requirement: Contacts and import
The consultant SHALL be able to see the book and import contacts (CSV or equivalent). Import SHALL feed Audit. Painted demo directories MUST NOT substitute for table rows.

#### Scenario: Empty contacts
- **WHEN** the firm book has no contact rows
- **THEN** Contacts SHALL show empty from the query, not invented people

### Requirement: Meetings receive booked rows
Meetings SHALL receive booked rows and the live brief. The consultant SHALL take meetings the engine booked without running the engagement themselves.

#### Scenario: Booked meeting appears
- **WHEN** a meeting is booked for a contact
- **THEN** it SHALL appear on the consultant Meetings desk with a live brief

### Requirement: Governance halt
The consultant SHALL be able to halt outreach they will not stand behind so the book is worked lawfully in their name.

#### Scenario: Halt from the desk
- **WHEN** the consultant activates halt for the book or a contact
- **THEN** new automatic enroll and send SHALL stop for that scope

### Requirement: Access is passwordless
The consultant SHALL sign in via passwordless OTP (or equivalent session) and land in their firm workspace.

#### Scenario: Sign in
- **WHEN** a provisioned consultant verifies OTP
- **THEN** they SHALL land in that firm’s consultant desk


===== _workspace/openspec/changes/specify-intended-tower-product/specs/contact-touchpoints/spec.md =====

# Spec Delta

## Purpose

Lets an engagement contact consent, refresh facts, silence, and book as firm-branded delivery so the consultant’s north-star can close — without making the contact a Tower persona.

## ADDED Requirements

### Requirement: Contact is not a persona workspace
The engagement contact SHALL be a referenced participant, not an acquired Tower persona. Touchpoints SHALL be firm-branded. The contact SHALL NOT pay Om Coda for Tower.

#### Scenario: Access link
- **WHEN** a contact opens a firm access link
- **THEN** they SHALL see firm-branded touchpoints, not a consultant or operator desk switcher

### Requirement: Consent request
The contact SHALL be able to receive a firm-branded consent request and agree or ignore before any deeper collection.

#### Scenario: Ignore
- **WHEN** a contact ignores the consent request
- **THEN** the system SHALL NOT proceed to deep collection and SHALL treat them as not opted in

### Requirement: Refresh facts through touchpoints
The contact SHALL be able to refresh self-reportable facts through forms and similar touchpoints. Document-dependent needs MUST NOT be asked as form fields.

#### Scenario: Submit a form
- **WHEN** an opted-in contact submits a self-reportable form
- **THEN** those facts SHALL write back and trigger re-evaluation

### Requirement: Silence / opt-out
The contact SHALL be able to opt out or otherwise silence automatic outreach. Opt-out SHALL be an event that can ascribe a tag.

#### Scenario: Unsubscribe
- **WHEN** a contact unsubscribes
- **THEN** automatic outreach SHALL stop for that contact and the opt-out SHALL be hearable as an event

### Requirement: Book a meeting
The contact SHALL be able to book a meeting with the consultant as the loop-closer. Meeting booked SHALL write the success event the Application desk pursues.

#### Scenario: Booking completes the motion
- **WHEN** a contact books a meeting the campaign asked for
- **THEN** that write SHALL be the meeting_booked success event for that pursuit

### Requirement: Contact upload is distinct from form-submitted
A contact uploading information SHALL be a different event from answering the current objective’s form and from operator import. Form submitted is answering Now. Upload is putting information in (any type, a specific kind, a custom name, or a searched question).

#### Scenario: Upload while not on the current form objective
- **WHEN** a contact uploads information that is not the current objective form submit
- **THEN** Automations SHALL be able to hear that as contact-uploaded (Global = all uploads, Local = this kind) without treating it as form-submitted


===== _workspace/openspec/changes/specify-intended-tower-product/specs/eligibility-evaluation/spec.md =====

# Spec Delta

## Purpose

Recomputes private service eligibility when client facts or reference move, and emits every determination — including missing data — as a signal.

## ADDED Requirements

### Requirement: Eligibility is private to the firm book
The system SHALL evaluate from firm-held plus engagement-collected client facts against house-held or firm-configured rules. Eligibility SHALL be private to that firm book.

#### Scenario: No public stranger scoring
- **WHEN** evaluating service eligibility
- **THEN** the system MUST use the firm’s private facts and MUST NOT cold-score strangers from public databases as Core Function

### Requirement: Two detection sides
The system SHALL accept two detection sides: law / public-reference moves, and life-change facts only the person or firm-file knows. A static book dump MUST NOT be treated as sufficient for the life-change side.

#### Scenario: Life change after import
- **WHEN** a contact’s permit or work fact changes after the original book dump
- **THEN** eligibility SHALL be able to move based on that life-change fact, not only the original import

### Requirement: Pathway pass is any pathway assertion
Pathway pass SHALL be any pathway assertion (CEC or FSW or FST or PNP-*), not one favoured pathway.

#### Scenario: Alternate pathway
- **WHEN** a contact does not pass one pathway but does pass another asserted pathway
- **THEN** the system SHALL treat pathway pass as satisfied by that any-pathway assertion

### Requirement: Every determination is a signal
The system SHALL emit every determination, including missing-data, as a signal. Analysis SHALL produce a readout (headlines, deltas, service candidates, nudge/reactivation hints) with machine output retained underneath.

#### Scenario: Missing data still emits
- **WHEN** evaluation cannot complete because required data is missing
- **THEN** the system SHALL still emit a missing-data determination as a signal

### Requirement: Evaluation stays open-box
Evaluation SHALL stay inspectable and changeable without a deploy.

#### Scenario: Operator inspects a rule
- **WHEN** an operator opens a service-eligibility rule
- **THEN** they SHALL be able to inspect conditions and constants (and toggle outcome families) without a code release

### Requirement: Required-data listing on rule output
Face law: required data MUST be an output class — a listing of collectible fields, not a flag. Forms SHALL be built from that listing. UNRESOLVED whether that listing is fully stood up; the corpus names it as not stood up at Face write time. Specs MUST NOT invent the rest of the collectible catalog.

#### Scenario: Form binds to required fields
- **WHEN** a rule emits required data
- **THEN** a data-request form SHALL be able to bind its questions to that listing rather than to an invented catalog


===== _workspace/openspec/changes/specify-intended-tower-product/specs/engagement-sequencing/spec.md =====

# Spec Delta

## Purpose

Lets the operator define outreach sequencing — order deployed, firm/default/overrides, attempt rules, and goal criteria as an escalation point — and runs one in-flight sequence under a single owning channel.

## ADDED Requirements

### Requirement: Agents flagship
The system SHALL treat Agents as the place where the operator defines outreach sequencing — not only the sequence, the order in which outreach is deployed — per firm or as a default, plus overrides; escalations between attempts (retry / attempt rules); and a goal / goal criteria that is itself an escalation point: to other agents, to other workflows, or it ends. Once it is met, it is met. That is the endpoint. Everything in the middle is modular.

#### Scenario: Goal met is the endpoint
- **WHEN** an enrolled contact meets the authored goal criteria
- **THEN** that goal SHALL be treated as met (endpoint) and MAY escalate to another agent, to another workflow, or end, as authored

#### Scenario: Triggers are not Agents interior
- **WHEN** specifying what belongs on the Agents canvas
- **THEN** Automations triggers MUST NOT be placed inside the Agents flagship or canvas

### Requirement: Sequence is a blank container of campaigns
A sequence SHALL be a blank container that can hold multiple campaigns. Each campaign SHALL have one objective. Two things to meet SHALL require two campaigns. Opt-in, re-engagement, and reactivation SHALL be sequence templates, not objective names.

#### Scenario: Two objectives
- **WHEN** the operator wants two things met
- **THEN** each SHALL be its own campaign, and meeting the first campaign’s objective MAY qualify the contact for the next campaign without a qualify node

### Requirement: Channels are the medium
Channels SHALL be the medium (text, email, form). Sequencing (how many channels, in what order) SHALL live at campaign level. Channel rules SHALL be escalation on that medium. Attempt rules MUST NOT sit at the channel. An attempt SHALL be a container / cycle of the same sequence.

#### Scenario: Override this reveals channels
- **WHEN** the operator turns on Override this on a campaign
- **THEN** channel nodes SHALL be revealed as wires while campaign-level toggles remain on the campaign

### Requirement: Rules nest like CSS
Rules SHALL fall back: campaign override → sequence Settings → Agents Settings (global). If the operator does not override, the system SHALL fall back up.

#### Scenario: No campaign override
- **WHEN** a campaign does not override a rule
- **THEN** the sequence setting SHALL apply, and if that is also unset the Agents global setting SHALL apply

### Requirement: Agents enroll starts the mission now
Enroll on a sequence SHALL display who is enrolled and allow Add contact. Scope SHALL be Every firm (default) or Select from. Agents enroll SHALL start the mission now and MUST NOT wait on a current event. Automations enroll on an event is the other door.

#### Scenario: Add contact on sequence header
- **WHEN** the operator adds a contact on an agent sequence
- **THEN** that contact SHALL be enrolled into that sequence immediately, not queued on an Automations event

### Requirement: Campaign calendar is not the attempt engine
System 7a SHALL hold day-ordered engagement content for a phase and MUST NOT decide runtime channel ownership, waits, or attempt retries. System 7b SHALL own one in-flight sequence.

#### Scenario: Separate engines
- **WHEN** content order across days is authored
- **THEN** that authorship MUST NOT replace the runtime owning-channel / attempt engine

### Requirement: One owning channel at a time
At runtime the flow SHALL be owned by one channel at a time along Text → Email → Form, forward-only. Waits and attempts SHALL nest under the owning channel that failed. A live inbound MAY override an in-flight attempt. A finishing event SHALL close the sequence and MAY arm the next.

#### Scenario: Forward handoff
- **WHEN** criteria for leaving the owning channel are met
- **THEN** the system SHALL hand off forward along the channel order and MUST NOT move backward

### Requirement: Engagement record authors nothing
The engagement record SHALL be a chronology of events that already fired. It MUST NOT author channel order, attempt logic, or escalation.

#### Scenario: Chart is a tree of outreach
- **WHEN** a consultant views Activity / the engagement chart
- **THEN** it SHALL show the tree of outreach and MUST NOT connect left to the trigger or event that created the agent

### Requirement: Agency authorship tension is named
House-authored packs bound per tenancy (Seed / personas) and operator-authored sequencing with firm/default/overrides (flagship) both exist in the corpus. Specs MUST NOT silently kill either. UNRESOLVED: exact product lock of that tension.

#### Scenario: Do not drop one law
- **WHEN** specifying who authors sequences
- **THEN** the product SHALL keep both the agency bind thesis and the flagship override thesis visible rather than deleting one

### Requirement: Attempt windows remain unresolved unless promoted
UNRESOLVED (Story): exact product-locked attempt criteria windows and SMS reply-failure escalation. OPERATOR-REVISIONS windows (30 min / 24 h examples) MUST NOT be treated as Seed/World law until promoted.

#### Scenario: Prototype windows are not Story musts
- **WHEN** citing 30-minute text or 24-hour email windows
- **THEN** they SHALL be labeled operator-revision / prototype, not Seed/World locked law


===== _workspace/openspec/changes/specify-intended-tower-product/specs/fact-refresh/spec.md =====

# Spec Delta

## Purpose

Uses engagement touchpoints as the data-collection mechanism, routes asks by field class, and writes answers back so eligibility re-evaluates immediately.

## ADDED Requirements

### Requirement: Nudges collect facts
Nudges SHALL ask for or infer facts that affect eligibility. They MUST NOT be treated as spam blasts without a data job.

#### Scenario: Nudge carries a data ask
- **WHEN** a re-engagement nudge fires
- **THEN** that touchpoint SHALL carry a data ask or inference that can refresh the contact’s immigration picture

### Requirement: Field classes route the ask
Self-reportable facts SHALL go to forms / pre-meeting capture. Document-dependent facts MUST NEVER enter a form; they SHALL be tracked work items. Employer-directed asks SHALL be aimed at the firm, not the client.

#### Scenario: Document-dependent stays off forms
- **WHEN** a needed fact requires paperwork
- **THEN** the system MUST NOT put that need on a client form

### Requirement: Write-back triggers immediate re-evaluation
Answers from the client or consultant hand-entry SHALL write back. On any write-back the system SHALL initiate immediate eligibility re-evaluation. A missing fact SHALL be recorded as a signal.

#### Scenario: Form submit re-evaluates
- **WHEN** a contact submits a self-reportable answer
- **THEN** the system SHALL write the fact back and immediately re-evaluate service eligibility for that contact

### Requirement: Client desk depth remains unresolved
UNRESOLVED (Story silence): client desk depth (touchpoint-only vs authenticated portal) and D-02 in-meeting fallback surface. The system MUST NOT invent an authenticated client persona workspace from that silence.

#### Scenario: Do not invent a full client portal
- **WHEN** specifying an authenticated client workspace beyond firm-branded touchpoints
- **THEN** the product SHALL leave that depth unresolved rather than inventing a persona workspace


===== _workspace/openspec/changes/specify-intended-tower-product/specs/meeting-loop-closer/spec.md =====

# Spec Delta

## Purpose

Treats meeting booked as the core success event, opens pending capture when self-reportable fields remain, and keeps the pre-meeting brief live.

## ADDED Requirements

### Requirement: Meeting booked is the loop win
The system SHALL treat meeting booked as the core success / loop-closer event the Application desk pursues.

#### Scenario: Success event
- **WHEN** a meeting is booked for a contact with a consultant
- **THEN** that event SHALL count as the loop-closer for that engagement motion

### Requirement: Pending capture on outstanding fields
On meeting booked with outstanding self-reportable fields, the system SHALL open a data-capture form pending the meeting. On any write-back against that capture (or consultant entry), the system SHALL run immediate re-evaluation.

#### Scenario: Capture before the meeting
- **WHEN** a meeting is booked and self-reportable fields are still outstanding
- **THEN** a pending capture form SHALL open and later write-backs SHALL re-evaluate immediately

### Requirement: Live brief not snapshot
The pre-meeting brief SHALL stay live (recomputed), not a snapshot taken at booking time.

#### Scenario: Fact changes after booking
- **WHEN** a fact write-back occurs after meeting booked and before the meeting
- **THEN** the consultant’s pre-meeting brief SHALL recompute from current facts

### Requirement: D-01 and D-02 remain unresolved
UNRESOLVED (Story silence): whether pre-meeting capture is the tail of reactivation versus a standalone meeting_booked sequence (D-01), and the in-meeting fallback module (D-02). The system MUST NOT invent that builder placement.

#### Scenario: Do not invent the builder seat
- **WHEN** specifying where the pre-meeting capture sequence is authored
- **THEN** the product SHALL leave D-01 / D-02 unresolved rather than inventing the builder placement

### Requirement: Objective-met completion is Local
Ascribed on this SHA (packet 022 / migration 021): an objective being met SHALL be detectable as a Local event on the completion write for the campaign that asked, not as “any meeting / any form / any click this person ever did.”

#### Scenario: Wrong-era meeting does not complete today’s campaign
- **WHEN** a contact booked a meeting last quarter and a new campaign asks for a meeting now
- **THEN** that old meeting MUST NOT satisfy this campaign’s objective


===== _workspace/openspec/changes/specify-intended-tower-product/specs/operator-house/spec.md =====

# Spec Delta

## Purpose

Gives Om Coda operators a house-global console plus per-tenancy admin so agency-authored operations can be configured, bound, and overseen across firms without making Operator a consultant Board persona.

## ADDED Requirements

### Requirement: Two operator surfaces
The operator/house layer SHALL be a house-global console plus per-tenancy admin, not one undifferentiated desk and not a firm Board login.

#### Scenario: Cross-firm vs one firm
- **WHEN** an operator works acquisition, shared reference, or pack authorship
- **THEN** that work SHALL live on the house-global console, while bind / provision / firm health SHALL be per-tenancy

### Requirement: Configuration libraries are house-authored and bound
Evaluation, rules, automation, and sequence/campaign template packs SHALL be authored in house-global configuration libraries and bound per tenancy. Firms MUST NOT be required to author those packs alone at the consultant desk.

#### Scenario: Bind Active
- **WHEN** an operator binds a pack to a firm
- **THEN** that firm SHALL run the bound house-authored operations under that firm identity

### Requirement: Agents and Automations workbenches
Operator Configuration libraries SHALL include Agents (creation place for sequences/campaigns) and Automations (brain / operations). Product face for those workbenches SHALL be Ant. Hub SHALL remain plant, not the app.

#### Scenario: Operator opens Agents
- **WHEN** an operator opens Agents from Configuration libraries on `/prototype-ant`
- **THEN** they SHALL author sequences/campaigns there, not by treating Hub as the running product

### Requirement: Per-tenancy admin modules
Per-tenancy admin SHALL include provision, commercial posture, firm operations bind, book readiness / audit, firm health, and that firm’s activation state.

#### Scenario: Provision a tenancy
- **WHEN** an operator provisions a firm
- **THEN** that action SHALL be a per-tenancy admin job landing the firm in the same application desk

### Requirement: House-global modules
House-global console SHALL include acquisition/ads, activation/forward-deploy pipeline, reference data, configuration libraries, oversight, audit trail, founder/agency controls, and customer support. Register & evolution SHALL be house-side prototype tooling and MUST NOT ship on the firm desk.

#### Scenario: Register not on firm desk
- **WHEN** a consultant uses the shipped firm product
- **THEN** Register & evolution MUST NOT appear as a firm module

### Requirement: Meta and escrow go-live may be deferred
Prototype honesty MAY defer Meta ads go-live and escrow fulfillment. Story still requires Acquisition and Commercial as capabilities. Deferred MUST be labeled deferred, not “the system is complete without them.”

#### Scenario: Deferred is named
- **WHEN** Meta or escrow fulfillment is not live
- **THEN** those capabilities SHALL remain specified and marked deferred rather than deleted from the intended product


===== _workspace/openspec/changes/specify-intended-tower-product/specs/outbound-actuation/spec.md =====

# Spec Delta

## Purpose

Separates composing sequences from sending them, and gates live outbound messages on consent, halt, silence, and send mode so Wiring — not the presenting agent — fires channels.

## ADDED Requirements

### Requirement: Composing is not sending
Composing sequences SHALL be configuration (Agents / house libraries). Sending SHALL be automation / Wiring. The presenting agent MUST NOT fire sequences.

#### Scenario: Save vs send
- **WHEN** an operator saves sequence content
- **THEN** that save MUST NOT itself send messages; sending SHALL wait for enrollment / actuation under Wiring gates

### Requirement: Live send is gated
Live email and SMS MUST fail closed unless send mode allows. Consent missing, silenced, or halt active SHALL deny send and deny new enrollment. Probe sends without a contact MAY skip consent/halt only when explicitly out of the contact path.

#### Scenario: Halt denies send
- **WHEN** halt is active for the firm book or contact
- **THEN** a new send SHALL be denied

#### Scenario: Missing consent denies send
- **WHEN** a contact has no consent record and a contact-path send is attempted
- **THEN** the send SHALL be denied

### Requirement: Channel pattern
Standard outreach channels SHALL include Text, Email, and Form. One channel SHALL own the in-flight flow at a time. Text is SMS primer or fallback. Email is outbound plus replies. Form is checklist / capture.

#### Scenario: Owning channel
- **WHEN** an attempt is in flight on Email
- **THEN** Email SHALL own that flow until criteria hand off forward or inbound overrides

### Requirement: Stand-in ports are not the system
Live when secrets and DB are good: CEM email, SMS, webhooks into messaging events, OTP mailer, sending pool, Postgres halt/consent/CRM grant/audit/primary store, worker tick, access links. Still stand-in unless later promoted: Meta ads, escrow fulfillment, enrich crawl, Postmaster, warmup counters, list-unsubscribe ingress. Deferred MUST NOT be called “the system.”

#### Scenario: Name stand-ins
- **WHEN** describing Meta ads or escrow fulfillment as of this SHA
- **THEN** they SHALL be labeled stand-in or deferred, not live Core Function

### Requirement: Human gates are not automated away
The machine MUST NOT automate away: seed capture (stranger action), firm/user provision and OTP verify, database authorization, escrow accept, client opt-in / not silenced, meeting booking, and the firm’s responsibility to refuse illegal or unethical outreach.

#### Scenario: Meeting is a human commitment
- **WHEN** closing the loop
- **THEN** meeting booking SHALL remain a human commitment, not an automated fake booking


===== _workspace/openspec/changes/specify-intended-tower-product/specs/product-purpose/spec.md =====

# Spec Delta

## Purpose

Defines why Tower exists, the consultant north-star, facet walls, which surface is the product face, and honesty constraints that every other capability must obey.

## ADDED Requirements

### Requirement: Proactive eligibility wrapped in engagement
Tower SHALL be a proactive eligibility engine wrapped in engagement for immigration consultancies. It MUST NOT be a reactive CRM whose primary job is answering “what do I do when someone emails?”

#### Scenario: Firm hands over a private book
- **WHEN** a firm has contacts and hands-free operation is armed
- **THEN** Tower keeps engaging dormant and active contacts, keeps immigration-relevant facts fresh through firm-to-client touchpoints, re-evaluates service eligibility as IRCC-shaped reference and client facts move, and surfaces campaign-worthy people so consultants book meetings without manually rechecking every file

#### Scenario: Public-before-contact detection is out of core
- **WHEN** a stranger is not already a contact on a firm’s private book
- **THEN** Tower MUST NOT cold-detect that stranger’s immigration eligibility from public databases as Core Function

### Requirement: Consultant north-star is hand over, authorize, receive
The core product outcome SHALL belong to the Consultant: hand the private book to Tower, authorize it to work under the firm license, and receive eligible clients booked — without setting up, configuring, or running engagement.

#### Scenario: Consultant does not author the engine
- **WHEN** a firm is in the Application facet and the consultant uses the firm desk
- **THEN** the consultant MUST be able to inhabit the book, refuse illegal outreach, and take booked meetings without opening configuration libraries to author Automations or Agents

### Requirement: Facet walls are immutable
The system SHALL treat Acquisition, Activation, Application, and Evolution as ordered facets. Acquisition collects cheap seed inputs only. Activation earns hard inputs. Application runs the desk loop. Evolution is product change, not a client lifecycle system.

#### Scenario: Hard inputs stay out of the click budget
- **WHEN** a stranger consultant is in Acquisition
- **THEN** the system MUST NOT pull database authorization or escrow into that click budget

#### Scenario: Same desk either door
- **WHEN** a firm is provisioned via ALG or via assisted / operator-led entry
- **THEN** both doors SHALL land in the same application / session matrix

### Requirement: Product face is prototype-ant
The intended product face SHALL be the CT Ant desks at `/prototype-ant` (Consultant, Operator, Contact). Hub SHALL be reference / plant for those modules, not the app. Register SHALL be house-side methodology tooling and MUST NOT appear in the shipped firm product.

#### Scenario: Default app route
- **WHEN** an operator or consultant opens the product application
- **THEN** they land on the Ant product face rather than Hub-as-the-app

#### Scenario: Register stays house-side
- **WHEN** a firm consultant is in a running firm workspace
- **THEN** that workspace MUST NOT present Register / methodology regeneration as a firm-facing module

### Requirement: Data in modules comes from tables
Records that show inside a module SHALL come from tables. The desk SHALL show what the query returns. The app MUST NOT hard-code demo people, tags, verdicts, runs, firms, or contacts into UI components so a screen looks full.

#### Scenario: Empty book
- **WHEN** the queried tables have no rows for the current firm
- **THEN** the module SHALL appear empty or personalized from real rows, not painted with invented contacts

### Requirement: Presentation is not fulfillment
Agent presentation MAY ask, explain, and route. It MUST NOT scrape, instantiate templates, persist captures, fire sequences, evaluate rules, issue OTP, or move money. Those jobs belong to Automations and Wiring.

#### Scenario: Approach agent does not fulfill
- **WHEN** an Approach conversation asks a stranger for name, website, and a channel
- **THEN** persisting the capture, forward-deploying the workspace, and holding escrow SHALL be fulfilled by Automations / Wiring, not by the presenting agent


===== _workspace/openspec/changes/specify-intended-tower-product/specs/provision-forward-deploy/spec.md =====

# Spec Delta

## Purpose

After seed inputs land, stages a no-login prepared workspace that proves readiness under the firm’s identity from Om Coda methodology templates, not from the firm’s private book.

## ADDED Requirements

### Requirement: Seed landing initiates forward-deploy
On seed inputs land, the system SHALL scrape public firm facts and instantiate Om Coda’s launch → re-engagement → reactivation methodology templates. It MUST NOT derive the campaign from the firm’s private client list before database authorization.

#### Scenario: Prepared workspace after capture
- **WHEN** acquisition seed inputs have landed for a stranger consultant
- **THEN** a no-login prepared workspace SHALL be staged under that firm identity showing readiness, not a claim that Tower already holds their clients

### Requirement: Forward-deploy belongs to Activation
Serving a prepared workspace SHALL belong to Activation even when it looks like marketing. It MUST NOT be treated as acquisition work.

#### Scenario: Facet placement
- **WHEN** classifying the prepared workspace
- **THEN** it SHALL be an Activation artifact, not an Acquisition finish line

### Requirement: Application desk is not shrunk for ALG
The system MUST NOT redesign the Application desk to need fewer inputs so the ALG bet is cheaper.

#### Scenario: Growth problem stays a growth problem
- **WHEN** ALG wants fewer inputs
- **THEN** the product MUST NOT shrink the running desk’s required hard inputs to make ads cheaper


===== _workspace/openspec/changes/specify-intended-tower-product/specs/reachability-audit/spec.md =====

# Spec Delta

## Purpose

Answers only whether Tower can reach a contact and start a sequence on them, emitting reachable / partial / unreachable and sequence-ready verdicts.

## ADDED Requirements

### Requirement: Audit asks only reachability
Audit SHALL run data-validity checks over imports / the book: email valid, phone valid, at least one channel matching the intended sequence, typo/garbage, dedupe, already-in-Tower, consent/silenced, name present. It MAY connect to external validation where a check needs it.

#### Scenario: Sequence-ready is the pass
- **WHEN** an audit batch completes
- **THEN** the system SHALL emit verdicts reachable / partial / unreachable and mark contacts sequence-ready or not

### Requirement: Audit is not scoring or sales ceremony
Audit MUST NOT produce pathway/CRS scoring, ROI or activation-probability forecasts, minimum contact-count gates, or sales PASS/FAIL ceremony. Marketing “Database Opportunity Assessment” HTML MUST NOT be confused with in-app Audit.

#### Scenario: No pathway score on audit
- **WHEN** an operator runs Audit on a book
- **THEN** the result SHALL be reachability / sequence-ready, not a pathway or CRS score

### Requirement: Sequence-ready gates enrollment
Sequence-ready SHALL be a precondition for Engagement enrollment.

#### Scenario: Not ready
- **WHEN** a contact is not sequence-ready
- **THEN** the system MUST NOT enroll that contact into an engagement sequence as if Audit had passed

### Requirement: Import mutating the living list remains unresolved
UNRESOLVED (Story silence): contact-entry via import does not fully mutate the living list; CRM bidirectional sync is unnamed. The system MUST NOT invent a full living-list mutate or CRM-sync law from that silence.

#### Scenario: Silence on living-list mutate
- **WHEN** specifying whether import fully replaces the living book
- **THEN** the product SHALL leave that as a named silence rather than inventing a sync law


===== _workspace/openspec/changes/specify-intended-tower-product/specs/reference-currency/spec.md =====

# Spec Delta

## Purpose

Keeps IRCC-shaped reference facts current as versioned data in the operator/house layer, so a reference move can re-evaluate eligibility without a code deploy.

## ADDED Requirements

### Requirement: Reference is versioned data
The system SHALL maintain versioned reference tables (categories, trades, cutoffs, provincial identifiers, and similar) as data. Industry criteria packs (Constants) SHALL be versioned packs. V1 truth SHALL be Canada-shaped.

#### Scenario: Operator updates a cutoff
- **WHEN** an operator publishes a new reference version that changes a cutoff
- **THEN** that change SHALL take effect as data without requiring a code deploy

### Requirement: Reference move is a faceless trigger
A reference move (draw threshold/cutoff shift, category added, trade or provincial identifier change) SHALL be a faceless first-class trigger with no screen and no human click required for the trigger itself.

#### Scenario: Cutoff shift re-evaluates
- **WHEN** a published reference version moves a cutoff
- **THEN** eligibility re-evaluation SHALL be initiated for every affected contact as the law / public-reference side of detection

### Requirement: Open-box without deploy
Because Om Coda is agency, evaluation rules, analysis, operational logic, and reference upkeep SHALL stay inspectable and changeable without a code deploy.

#### Scenario: House changes rules as data
- **WHEN** house operators change a criteria pack
- **THEN** they SHALL be able to do so as inspectable configuration, not only as a software release

### Requirement: Rule-pack IP remains unresolved
UNRESOLVED (Story silence): ownership / IP / liability of rule packs, and Constants packs beyond Immigration. The system MUST NOT invent extra-industry Constants packs from that silence.

#### Scenario: Do not invent extra industries
- **WHEN** specifying Constants packs for industries other than immigration
- **THEN** the product SHALL leave that as a named silence unless later corpus promotes it


===== _workspace/openspec/changes/specify-intended-tower-product/specs/signal-motion/spec.md =====

# Spec Delta

## Purpose

Records every detection as a signal and chooses a single outbound motion under fixed precedence, without replacing the attempt engine inside a sequence.

## ADDED Requirements

### Requirement: Record every detection
The system SHALL record every detection — including missing data — as a signal when found. Whether anything is sent SHALL be a separate motion decision.

#### Scenario: Signal without send
- **WHEN** a determination is emitted and Engine 2 chooses not to send
- **THEN** the signal SHALL still be recorded

### Requirement: Engine 2 precedence
Motion SHALL obey: (1) reactivation first whenever anything is reactivation-worthy; (2) nudge only when nothing is reactivation-worthy; (3) when a nudge fires, consolidate every outstanding self-reportable need into one form — never one nudge per field; (4) when reactivation fires, attach secondary signals as agenda on the consultant’s pre-meeting brief — never parallel outreach; (5) one client, one motion, ever.

#### Scenario: Reactivation wins
- **WHEN** a contact is both reactivation-worthy and has outstanding self-reportable needs
- **THEN** the system SHALL choose reactivation as the motion and attach other signals as agenda, not as a parallel nudge

#### Scenario: One form per nudge
- **WHEN** a nudge motion fires and several self-reportable facts are outstanding
- **THEN** those needs SHALL be consolidated into one form

### Requirement: Engine 2 does not replace 7b
Engine 2 MUST NOT replace the attempt / channel-ownership engine inside a sequence. It MUST NOT fire parallel motions for one client.

#### Scenario: In-flight attempt continues
- **WHEN** a sequence is already in flight under an owning channel
- **THEN** Engine 2 MUST NOT swap that attempt engine for a second parallel sequence on the same client

### Requirement: Reactivation-worthy criteria remain unresolved
UNRESOLVED (Story silence): what makes a signal reactivation-worthy, and D-01 / D-02 builder placement. The system MUST NOT invent that worthiness predicate.

#### Scenario: Do not invent the worthiness rule
- **WHEN** specifying the exact predicate that makes a signal reactivation-worthy
- **THEN** the product SHALL leave that predicate unresolved rather than inventing it


===== _workspace/openspec/changes/specify-intended-tower-product/specs/tenancy-access/spec.md =====

# Spec Delta

## Purpose

Provisions firms and users and holds verified sessions so ALG and assisted doors land in one Application desk, with passwordless OTP and access links.

## ADDED Requirements

### Requirement: Provision uses versioned seed manifests
The system SHALL provision firms and users only via versioned seed manifests (assisted / OLG bootstrap). Ad hoc SQL MUST NOT be the provision path.

#### Scenario: Assisted provision
- **WHEN** an operator provisions a firm
- **THEN** that provision SHALL go through versioned seed manifests rather than one-off database edits

### Requirement: Passwordless OTP sessions
The system SHALL run passwordless OTP: send, verify, hold a session, validate the session for guarded actions, and clear the session on logout.

#### Scenario: Unprovisioned email is anti-enumerating
- **WHEN** an unprovisioned email requests a code
- **THEN** the system SHALL return generic success and MUST issue no code

### Requirement: Firm is the tenancy
Firm SHALL be the tenancy owning users and the contact book. Consultant SHALL be the firm operator / acquired persona in V1. Operator MUST NOT be treated as a firm Board login persona. The system MUST NOT mint an Agent seat in admission.

#### Scenario: Operator is not a consultant Board login
- **WHEN** an Om Coda operator signs in
- **THEN** they SHALL use the operator/house layer, not a consultant Board persona

### Requirement: Contact access links
Engagement contacts MAY enter a firm-branded touchpoint via access link. That path SHALL not be a branded Tower persona workspace.

#### Scenario: Token path
- **WHEN** a contact opens `/c/<token>`
- **THEN** they SHALL land in the contact touchpoint workspace for that token, without the consultant/operator desk switcher

### Requirement: Multi-consultant roles remain unresolved
UNRESOLVED (Story silence): multi-consultant roles and permissions, and production onboarding beyond manifests. The system MUST NOT invent a multi-consultant role matrix from that silence.

#### Scenario: Do not invent role catalog
- **WHEN** specifying roles beyond the V1 consultant operator
- **THEN** the product SHALL leave multi-consultant permissions unresolved rather than inventing a role matrix
