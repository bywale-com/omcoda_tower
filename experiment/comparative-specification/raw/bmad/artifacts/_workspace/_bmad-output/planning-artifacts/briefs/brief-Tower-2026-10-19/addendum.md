# Product Brief addendum — Tower

Depth that does not fit the 1–2 page brief. Downstream PRD / UX / architecture / spec should read this with the brief.

## Authority layers (do not conflate)

| Layer | What it is | Conflict rule |
|-------|------------|---------------|
| Seed + World | Validated 2026-07-27 ecosystem + bets | Under-claim; World does not fill Seed holes |
| Systems Story (12 systems) | Machine must / must-not / chain / silence | Requirements extract; they do not invent |
| Personas / How / Outcomes | Workspace seats and function trees | Consultant is the only acquired persona |
| Phase Two log **15:43** | Agents flagship — founder wording | Do not overwrite with generated lists |
| Agents / Automations FACE + UI blueprints | App-facing law + plates | Captions on plates are not nodes |
| PRIMITIVES | Event and action catalogs “shape so far” | Not “any row changed”; webhook is inbound only |
| Data-in-tables | Desk shows query results | Missing store = SA, not SPA fake rows |
| Postgres migrations on this SHA | Stood-up machine | `001`–`024_*` present; docs/README remap on SHA is stale vs SQL |
| Live PM packets | PR #96 (`git fetch origin pull/96/head`) | SHA tree does not contain most packets |
| Live SA packets | PR #86 (010–028) and PR #110 Current | SHA `docs/README.md` Current pointer is behind SQL |

## Source conflict: README.md vs register

Root `README.md` still describes a **UI prototype** (board → client, mock Sarah Jenkins / Marcus Webb, “no authentication, API, or persistence”). Register + `package.json` scripts + `server/` + `supabase/migrations/` describe a **wired product** with auth, wire, worker, and Postgres.

**Ruling for this specification (evidence-weighted, tagged):** treat register + Seed/World/Story/FACE as intended product; treat root README as a **stale earlier prototype description**. [ASSUMPTION] No founder stamp on this SHA says “README is withdrawn.”

## Dual-entry and causal ring (Phase Two 14:49 — context, not the 15:43 flag)

Automations decide whether / when / which motion → Agents define how engagement behaves → worker/cascade applies firm-bound template+rules → desks record → `meeting_booked` is the win.

Agents has two doors: from Automations (event), and from Agents itself (start the mission now — Contacts / Add contact). Do not put Automations triggers on the Agents canvas.

## Deferred by named product choice (not unfinished rewire unless Story already required it)

- Meta ads go-live
- Escrow fulfillment
- Enrich crawl / Postmaster / warmup / list-unsubscribe ingress (wiring stand-ins)
- Register as shipped firm surface
- LinkedIn Approach
- Cold email as V1 Approach

## Silences Seed/World name (do not fill)

- When/whether email earns Meta entry; Meta targeting / CAC
- Consent regime for the first agent→consultant text
- ALG Approach / forward-deploy / escrow door remain bets not fully built in prototype honesty
- Full Automations operations catalog and exit-point catalog (FACE “Open”)
- Form-as-own-node vs embedded in start-agent node (lean: embedded; not locked)
- Story §7 promotion of goal-as-completion wording vs packet 022 mechanism

## Product face vs plant

| Surface | Job |
|---------|-----|
| `/prototype-ant` | Product face (Operator → Configuration libraries → Agents / Automations; Consultant desk; Contact seat) |
| Hub | Advanced plant for Automations/Rules quality — not the app |
| `/register` | Theory workspace — not shipped to firms |
| `/system-map` | Interactive machine map — SA tool, not consultant product |

## Shell chrome (later packets on PR #96)

Consultant ▾ · Operator · Contact ▾. Workspace-until-opt-out and Wait-note/Approver are living packets on #96; SHA FACE files predate some of them. Specification of *intended* product includes those packets as named from the living log; implementation status on this SHA is a separate inventory (migrations through `024_wait_occupancy.sql` suggest Wait occupancy SQL has landed even if FACE docs on SHA have not).
