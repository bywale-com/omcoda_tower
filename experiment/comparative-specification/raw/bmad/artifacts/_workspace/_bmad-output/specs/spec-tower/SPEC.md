---
id: SPEC-tower
companions:
  - brownfield.md
  - glossary.md
  - open-questions.md
  - ../../planning-artifacts/briefs/brief-Tower-2026-10-19/brief.md
  - ../../planning-artifacts/briefs/brief-Tower-2026-10-19/addendum.md
  - ../../planning-artifacts/prds/prd-Tower-2026-10-19/prd.md
  - ../../planning-artifacts/prds/prd-Tower-2026-10-19/addendum.md
  - ../../planning-artifacts/ux-designs/ux-Tower-2026-10-19/DESIGN.md
  - ../../planning-artifacts/ux-designs/ux-Tower-2026-10-19/EXPERIENCE.md
  - ../../planning-artifacts/architecture/architecture-Tower-2026-10-19/ARCHITECTURE-SPINE.md
sources:
  - SHA c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7
created: 2026-10-19
updated: 2026-10-19
headless: true
skill: bmad-spec
---

# Tower

## Why

**Vision to realize, plus a pain to solve.** Immigration consultancies cannot recheck every file as IRCC-shaped facts move. Om Coda wants an agency-run workspace that engages the private book, keeps facts fresh, re-evaluates service eligibility, and campaigns toward a booked meeting — with house-authored open-box operations, not a sealed CRM and not public-before-contact detection. The repository already holds Seed, World, Story, faces, plates, packets, and a stood-up machine; this spec is the kernel so independently built units do not drift from that intended product.

## Capabilities

- **CAP-1**
  - **intent:** A consultant can inhabit a firm desk over a real book and see engagement, eligibility, and meetings as query results so they book work without rechecking every file.
  - **success:** Board/Contacts/Activity/Meetings are keyed by live `contact_records` (and related writes); empty book renders empty; a path to `meeting_booked` is visible when rows exist.

- **CAP-2**
  - **intent:** An operator can author Automations (event → operation → forks → in-app or Agents actions) and Agents sequences (campaigns, channel order, attempt/channel rules, overrides, goal-as-escalation) without a code deploy.
  - **success:** Smallest legal automation (trigger · rule · action) and a two-campaign sequence can be saved, bound to a firm, and enrolled from both doors (on event; mission now).

- **CAP-3**
  - **intent:** After any Automations node, the next node can pick from every write that run made.
  - **success:** If/Switch/mapped-box/subsequent action resolve against `previousWrites`/`chainWrites` for that run, not a client field catalog or “latest audit for this firm.”

- **CAP-4**
  - **intent:** The system can listen to the named event catalog (form submitted, campaign failed, opt-out, firm created, audit finished, contact imported, objective met) at Global or Local grain, plus schedule/manual/webhook-in.
  - **success:** A graph can be armed on “this form” vs all forms of that kind; webhook is inbound only; “any row changed” is rejected.

- **CAP-5**
  - **intent:** Outreach can run one channel-owned attempt at a time, escalate by channel then attempt rules, honor consent/halt/silence, and treat objective met as the endpoint (other agent, other workflow, or end).
  - **success:** Dispatch gates block silenced/halted sends; Engine 2 yields one motion; objective completion is a Local event others may subscribe to.

- **CAP-6**
  - **intent:** House can keep versioned IRCC-shaped reference and open-box eligibility rules, re-evaluate as facts move, and request only self-reportable missing facts via Automations-owned forms.
  - **success:** Rule outcomes are inspectable; document-dependent facts never become form questions; data-request form occupancy is this run’s required-data listing.

- **CAP-7**
  - **intent:** Om Coda can acquire via ALG seed inputs and/or assisted provision, forward-deploy a prepared workspace, and land both paths in one application — without presentation agents fulfilling.
  - **success:** Seed input set is name + website + one channel; hard inputs stay out of the click budget; scrape/template/send/evaluate/OTP/money are not done by the chat surface.

- **CAP-8**
  - **intent:** Operator per-tenancy admin can provision, bind house packs, audit book readiness, observe firm health, and support a tenancy; house-global can oversee, audit, and halt.
  - **success:** Bind changes what runs under a firm identity; consultant desk does not author libraries; Register is absent from the firm product.

## Constraints

- Flagship 15:43 wording is read-only; do not generate a substitute Agents list (especially not triggers-inside-Agents).
- Do not recut `workflowWalk.ts` 015 handle.
- Product face is `/prototype-ant`; Hub is plant; Register is not shipped to firms.
- Records on modules come from tables; never hard-code SPA demo people.
- Do not mint tables from pictures or teaching captions.
- Presentation ≠ fulfillment.
- Automations does not create agents (assign existing or from template).
- Webhook is not an action; If/Switch is not an action; `⋯` Switch-kind is not the Switch node.
- Engine 2: one client, one motion.
- Escrow is firm↔Om Coda contingent terms, not immigrant settlement funds.
- Facet walls: do not pull hard inputs into acquisition; do not shrink Application to cheapen ALG.
- Brownfield stack (React 18 + Vite 6 + Hono + Postgres + Ant 6) is adopted; do not re-platform to satisfy this spec.

## Non-goals

- Reactive CRM as the product.
- Public-before-contact end-client eligibility detection.
- Meta ads go-live, escrow money movement, enrich crawl, Postmaster, warmup, list-unsubscribe ingress as live fulfillment (named stand-ins).
- LinkedIn or cold-email Approach in V1.
- Self-serve long onboarding as the primary door.
- Shipping Register to firms or planting Hub as the app.
- A goal table or destination column for escalation (subscription to the completion event instead).
- Inventing founder answers for FACE “Open” catalogs (full operations list, full exit points, remaining output classes).
- Implementing this spec in the present experiment (application code is read-only here).

## Success signal

A reviewer can sit in `/prototype-ant` on a session firm, see empty-or-personalized desks, author and bind a real Automations+Agents pair, enroll from both doors, and trace a contact from book → motion → send gates → Activity → meeting without painted scenery and without Hub being required as the app. Gaps in §Open Questions remain labeled, not silently filled.

## Assumptions

- Intended product is Seed/World/Story/FACE/primitives + named live packets, not stale root README “mock-only prototype.”
- SHA SQL `019`–`024` is stood-up machine even where SHA `docs/README.md` Current still says cut 022.
- PR #96 / #86 / #110 docs fetched from origin are admissible intended-glass/machine packets this SHA points at.
- Packet 022 housing for 15:43 is AD-11 (Local event + subscription).
- Headless BMad: no founder confirmation this run.

## Open Questions

See companion `open-questions.md` (PRD §8 preserved). Load-bearing before treating this kernel as implementation-complete: form-as-node vs embedded; Story §7 wording promotion; README vs register authority; WCAG/SLA unstated; Meta/escrow remain deferred by plan.
