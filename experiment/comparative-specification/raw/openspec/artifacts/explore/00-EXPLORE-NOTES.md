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
