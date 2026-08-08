# Tower — Outcome ↔ System map (systems-analyst, module-grain pass)

**Seat:** Systems analyst.
**Job:** map every top-level outcome to the system(s) that constrain it, both directions, and surface the gaps.
**Inputs (only):** [`SEED.md`](./SEED.md) · [`WORLD.md`](./WORLD.md) · [`SYSTEMS-STORY.md`](./SYSTEMS-STORY.md) · [`OUTCOMES.md`](./OUTCOMES.md) · [`personas.md`](./personas.md).
**Grain:** module / outcome only. Orphan **controls** are out of scope — that's the Priors/Weak pass ([`priors/`](./priors/00-INDEX.md) · [`weak/`](./weak/00-INDEX.md)).
**Governing principle:** the system story constrains only behaviors that **must happen a specific way**. An outcome that reaches no system defaults to **Free** (the "how" is unconstrained → a builder produces something sufficient); it is a **Gap** only when it plainly touches a rule / gate / precedence / threshold that must be exact.

Systems are numbered per `SYSTEMS-STORY.md`: 1 Acquisition · 2 Provision/forward-deploy · 3 Commercial/hard-input · 4 Tenancy & access · 5 Reachability/audit · 6 Consent/suppression · 7 Engagement/sequencing · 8 Fact-refresh · 9 Reference-currency · 10 Eligibility re-eval · 11 Engine 2 (signal/motion) · 12 Meeting/loop-closer.

---

## Forward table — outcome → origin → system

| # | outcome | origin (Seed/World §) | system(s) | tag | justification |
|---|---|---|---|---|---|
| 1 | **Consultant · Core** (hand over book, authorize, receive booked meetings) | Seed §4, §0.1; World §0.2, §1.4 | 3, 4, 5, 6, 7, 8, 10, 11, 12 | Constrained | North-star; handover/authorize verbs hit Commercial(3)+Tenancy(4); "get clients booked" rides the whole detect→engage→collect→re-detect ring to Meeting(12). |
| 2 | **Consultant · Governance** (keep running under license; halt what I won't stand behind) | Seed §9, §8.2; World §4 | — | **Gap** | Sits on the hard gate "refuse illegal/unethical outreach" + a license/consent-bound halt, but no system defines how a consultant halt interacts with live motion / suppression. |
| 3 | **Consultant · Access** (sign in, land in firm workspace) | Seed §4, §5.10; World §1.3, §4 | 4 | Constrained | Tenancy & access (OTP send→verify→session→guard). |
| 4 | **Engagement contact · Consent** (consent request; agree/ignore before deep collection) | Seed §8.2, §5.3; World §4 | 6 | Constrained | Opt-in gate = Consent/suppression. |
| 5 | **Engagement contact · Refresh facts** (one consolidated form; reply on change) | Seed §5.4, §5.8; World §0.4, §3.3 | 8, 11 | Constrained | Capture = Fact-refresh(8); "one consolidated form" = Engine 2 precedence #3 (11). |
| 6 | **Engagement contact · Silence** (silence/opt out any point) | Seed §5.3, §8.2; World §0.4, §4 | 6 | Constrained | Silenced/opted-out = Consent/suppression. |
| 7 | **Engagement contact · Book** (book when invited; arrive with current facts) | Seed §4, §5.8; World §4, §0.4 | 12, 10 | Constrained | meeting_booked + live brief = Meeting(12); "current facts" = Eligibility(10). |
| 8 | **Operator · Acquisition & ads** (run Approach; read understood-vs-tapped) | Seed §6.2; World §1.2 | 1 | Constrained | Acquisition, incl. continue-scroll non-action trigger. |
| 9 | **Operator · Activation & forward-deploy** (stage workspace; secure DB auth + escrow) | Seed §6.3; World §1.2, §0.4 | 2, 3 | Constrained | Forward-deploy = Provision(2); DB auth + escrow = Commercial(3). |
| 10 | **Operator · Reference data** (versioned/current as data, no code deploy) | Seed §5.7 (Directive 3); World §1.3, §2.2 | 9 | Constrained | Reference-currency (no-human-click reference-move initiator). |
| 11 | **Operator · Configuration libraries** (author/version packs, workflows, templates) | Seed §5.6, §5.5; World §2.1, §3.4, §2.3 | 10, 7 | Constrained | Packs feed Eligibility(10); templates feed Engagement(7); open-box authorability asserted in system 10. |
| 12 | **Operator · Oversight** (cross-firm engagement/sequence health; drill in) | World §2.1, §1.1 | — | Free | Observability over the engagement record; "how" builder-sufficient. *Watch:* "caught before the Consultant loses meetings" hints at an unspecified failure threshold. |
| 13 | **Operator · Audit trail** (who changed which operation, when, which firm) | World §2.1, §3.4 | — | Free | Change-accountability over the open-box layer; standard. *Watch:* open-box change over real books raises stakes; no rule constrains it. |
| 14 | **Operator · Register & evolution** (document friction; regenerate methodology) | Seed §0.1, §6.1; World §0.1, §1.4 | — | Free | House prototype tooling, explicitly not shipped; no system in the 12; how unconstrained. |
| 15 | **Operator · Founder & agency controls** (cross-firm bounds, kill-switches, policy) | World §1.1, §2.1 | — | Free | Orphan *controls* — out of scope this pass; no application system constrains them. |
| 16 | **Operator · Provision (assisted)** (mint firm + user via assisted door) | Seed §5.10, §6.5; World §4, §1.2 | 4 | Constrained | Assisted/OLG provision = Tenancy & access (seed-manifest door). |
| 17 | **Operator · Commercial** (hold/oversee escrow + contingent terms) | Seed §7, §6.3; World §1.3, §4 | 3 | Constrained | Commercial/hard-input. *Watch:* escrow-release trigger is a named Silence. |
| 18 | **Operator · Firm operations bind** (bind house packs under firm identity) | World §1.2, §2.1; Seed §5.6 | 10, 7 | Constrained | Binding attaches open-box operator-layer ops — Eligibility(10) + Engagement(7); no-code-deploy/open-box governs it. |
| 19 | **Operator · Book readiness** (run reachability gate over book) | Seed §5.2; World §3.1 | 5 | Constrained | Reachability/audit. |
| 20 | **Operator · Firm health** (engagement health scoped to one firm) | World §2.1, §1.1 | — | Free | Per-tenancy observability over the record. *Watch:* same latent failure-threshold as #12. |
| 21 | **Operator · Activation state** (forward-deploy + hard-input progress to running) | Seed §6.3; World §0.4, §1.4 | 2, 3 | Constrained | Surfaces constrained state transitions of Provision(2) + Commercial(3): readiness → hard inputs → running. |
| 22 | **Operator · Keep the firm running** (work tickets with bind/health/commercial context) | World §2.1, §1.1 | — | Free | Support/CS = builder-sufficient aggregation of context from owned systems (3,7,10 + record); no required-specific rule. |

## Reverse table — system → outcome

| # | system | outcomes | tag | unrouted? |
|---|---|---|---|---|
| 1 | Acquisition (seed-capture) | 8 | Owned | — |
| 2 | Provision / forward-deploy | 9, 21 | Owned | — |
| 3 | Commercial / hard-input | 1, 9, 17, 21 | Owned | — |
| 4 | Tenancy & access | 1, 3, 16 | Owned | — |
| 5 | Reachability / audit | 1, 19 | Owned | — |
| 6 | Consent / suppression | 1, 4, 6 | Owned | — |
| 7 | Engagement / sequencing (7a calendar + 7b attempt engine) | 1, 5, 11, 18 | Owned | — |
| 8 | Fact-refresh / data-collection | 1, 5 | Owned | — |
| 9 | Reference-currency | 10 | Owned | — |
| 10 | Eligibility re-evaluation | 1, 7, 11, 18 | Owned | — |
| 11 | Signal / motion orchestration (Engine 2) | 1, 5 | Owned | — |
| 12 | Meeting / loop-closer | 1, 7 | Owned | — |

**All 12 systems Owned. No Faceless systems → no unrouted behaviors at module grain.** Every system surfaces through at least one specific (non-core) outcome — none leans solely on the compound Consultant core.

---

## Orphan pile 1 — Gap outcomes

- **#2 Consultant · Governance / halt** — "keep everything running under my license and halt anything I won't stand behind." Must-be-specific because it sits on the ratified hard gate *refuse illegal/unethical outreach* (`World §4`, `Seed §9`) and on the license/consent regime the outreach runs under. No system defines the halt: specifically, what a consultant halt does to an **in-flight motion** (its interaction with Engine 2's "one client, one motion" and the attempt engine's live-override) is unstated. **The only true forward Gap.** *(Caveat: the halt **control** belongs to the orphan-controls pass; the **gate/precedence behavior** it triggers is the module-grain gap flagged here.)*

## Orphan pile 2 — Faceless-must-be-specific systems

- **None.** No system is Faceless; nothing to route.

---

## Silences / uncertainties (named, not guessed)

- **Observability has no system by design.** #12 Oversight, #20 Firm health, #13 Audit trail, #22 Support all read from the engagement record / open-box layer but reach no system → Free. The one latent must-be-specific thread: "catch a failing tenancy **before** the Consultant loses meetings" (#12/#20) implies a failure threshold nobody has specified. If the founder wants a defined "unhealthy" trigger, these flip toward Gap.
- **Bind (#18) and author config libraries (#11) have no dedicated system.** They route to 10/7 via the open-box operator-layer assertion in system 10's chain-note, not to a standalone bind/authoring engine. Defensible, but a seam — the *act* of binding/authoring is a property of the eligibility/engagement systems, not its own initiation.
- **Escrow release** (owner #17 → system 3) is a system-story Silence: the release-terms trigger is a Known Unknown (`Seed §7, §13.1`). The outcome maps; the trigger inside it does not.
- **Evolution facet has no system.** #14 is Free because the 12 systems are acquisition→application only; Evolution is named but deliberately unbuilt (`Seed §11`, `World §1.4`). Not a gap.
- **Consent-regime specifics** (CASL/SMS, first agent text) are a system-story Silence tied to #2/#4/#6; outcomes route to Consent/suppression(6) but the regime conditions inside it are explicitly not closed (`Seed §8.2, §13.14`).
- **Founder/agency controls (#15)** set aside as orphan controls per scope; if the controls pass finds a kill-switch that must interact with live motion the way #2 does, reconcile the two.
