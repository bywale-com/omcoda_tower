# Tower V1 — Top-level outcomes (craft)

**Inputs:** [`WORLD.md`](./WORLD.md) · [`personas.md`](./personas.md) · format law [`08-outcome-so-that.md`](../build-foundation/08-outcome-so-that.md)  
**Prior art (not edited):** `src/app/register/theory/outcomes.ts`  
**Posture:** top-level outcome statements only — no How-tree, no leaves, no solutioning.

---

## How I built the lattice

### Entities and order

The old lattice keyed outcomes to three seats (Consultant / Engagement contact / Operator-as-one). That world is gone. The current model has **one persona** and a first-class **operator/house layer** split into surfaces. Lattice entities, in value-chain read order:

1. **House-global console surfaces** — acquire, activate, author packs, hold reference data, oversee fleet, audit, evolve (prototype tooling), bound the agency, queue support.
2. **Per-tenancy admin surfaces** — provision, commercial, bind house packs, book readiness, firm health, activation state, support context.
3. **Customer-support / customer-success** — agency ticket seat (house-global queue + per-tenancy context); so-that lands on the running Consultant.
4. **Consultant** — the only application-desk persona.
5. **Engagement contact** — not a persona; participation hop that closes the Consultant’s core so-that.

### How the so-thats close

```text
House acquires (Approach)
  → House activates / forward-deploys (and/or Per-tenancy provisions)
    → House authors packs + reference data
      → Per-tenancy binds packs + readies the book
        → Consultant runs the desk loop
          → Engagement contact consents / self-reports / books
            → Consultant takes the meeting          ← closes onto Consultant

Support answers the running firm
  → Consultant’s firm stays running               ← closes onto Consultant

Register (house prototype tooling) regenerates methodology
  → Configuration libraries carry next ops
    → … into Consultant’s desk                    ← same spine, never firm-facing
```

No so-that lands on “the system,” “the dashboard,” or process language. Register has **no firm-facing outcome**.

### Carried vs rebuilt

| Source (`outcomes.ts`) | Disposition |
|---|---|
| **Consultant core** | **Carried — capability verbs untouched.** So-that clause **added** (format law + lattice closure). **FLAGGED below.** |
| Consultant Access | Carried (secondary; wording tightened to firm session). |
| Engagement contact Consent / Refresh / Silence / Book | Carried; Book so-that made explicit so the chain closes onto Consultant. |
| Operator Approach supply | Rebuilt under **Acquisition & ads** (same job; new home). |
| Operator Activation supply (was operator core) | Rebuilt under **Activation & forward-deploy** — was the old combined operator core; now an honest house surface. |
| Operator Assisted door | Rebuilt under **Per-tenancy Provision**. |
| Everything else on the operator/house layer | **Added** — prior art had no honest outcomes for config libraries, reference data, bind, health, audit, Register-as-tooling, founder controls, or support. |

### Core-outcome change (loud flag)

**Consultant core — so-that only.** Capability clause is regarded as sound and is preserved verbatim in verbs and scope. I appended `— so that the Engagement contact can…` because (1) format law requires every core to carry a so-that to a lattice entity, and (2) the Engagement contact is the hop that closes the desk loop. Changing a core capability would change the product; this does not change the capability — only closes the lattice.

---

## Lattice

### A. Consultant (persona — firm desk)

#### Access — secondary

> As Consultant, I can sign in to Tower and land in my firm workspace.

- **Carried** from `consultant-access`; so-that omitted (local / obvious — access enables the desk).

#### Core — **core**

> As Consultant, I can keep my private contact book reachable, engage through opt-in → nudge → reactivation, refresh Client Data through touchpoints, re-evaluate service eligibility as facts and rules move, and campaign eligible people toward a booked meeting — without rechecking every file by hand — so that the Engagement contact can consent, answer self-reportable facts, and book a meeting when invited.

- **Changed (so-that only; capability carried).** See loud flag above. Prior statement lacked a so-that; format law and lattice closure require one onto Engagement contact.

---

### B. Engagement contact (referenced participation — closes the loop)

Not a persona. Outcomes exist so the Consultant’s so-that has somewhere to land, and so the chain can close back onto the Consultant.

#### Consent — secondary

> As Engagement contact, I can receive a firm-branded consent request and agree or ignore before deeper collection.

- **Carried** from `client-consent`.

#### Refresh facts — secondary

> As Engagement contact, I can answer one consolidated form for outstanding self-reportable facts, and reply when my situation changes.

- **Carried** from `client-refresh`.

#### Silence — secondary

> As Engagement contact, I can silence or opt out at any point in my journey.

- **Carried** from `client-silence`.

#### Book — **core**

> As Engagement contact, I can book a meeting when invited and arrive where the firm already knows my current facts — so that the Consultant can take the meeting with a live brief.

- **Changed** from `client-book`: so-that made explicit onto Consultant (closes the lattice). Capability carried.

---

### C. House-global console surfaces

#### Acquisition & ads — secondary (supply)

> As House (acquisition & ads), I can run Meta Approach surfaces (feed → ad → capture → continue scroll), keep capture to seed inputs inside the click budget, and instrument don’t-understand vs understand-don’t-tap — so that House (activation & forward-deploy) can stage a prepared workspace for a captured Consultant.

- **Carried/re-homed** from `operator-approach` into the Acquisition surface; so-that now names Activation (next lattice entity) instead of dangling.

#### Activation & forward-deploy — **core** (house supply finish line)

> As House (activation & forward-deploy), I can forward-deploy a no-login prepared workspace from house templates plus public firm facts, present the readiness walkthrough, and earn database authorization plus escrow acceptance — so that the Consultant can reach a running firm desk.

- **Rebuilt** from `operator-activation` (former operator core). Same capability spine; now owned by the Activation surface personas named. Remains a **core** because activation’s finish line is what makes the application desk runnable. **Not a silent core drop** — re-homed with reason: operator-as-one seat is retired; this surface is the honest owner.

#### Reference data — secondary

> As House (reference data), I can maintain versioned immigration reference tables as data without a code deploy — so that house-authored evaluation packs can re-score eligibility the Consultant acts on.

- **Added.** World places versioned public-reference tables inside the operator/house layer; prior outcomes had no statement for this.

#### Configuration libraries — **core** (agency authorship)

> As House (configuration libraries), I can author and version open-box evaluation/rules packs, automation workflows, and sequence/campaign templates — so that Per-tenancy admin can bind those house-authored packs under a firm identity the Consultant’s desk runs.

- **Added.** Agency thesis as architecture: house authors; firms do not. Prior art had no authorship outcome (Hub tooling existed in product awareness only). Covers evaluation open-box, automation admin, and sequence/template authoring as one authorship capability at top level.

#### Oversight (cross-firm sequence health) — secondary

> As House (oversight), I can observe sequence and engagement health across firms and drill into a tenancy — so that Customer support and Per-tenancy firm health can keep a Consultant’s engagement performing.

- **Added.** Fleet observability the firm never asks for; so-that lands on Support / per-tenancy health → Consultant.

#### Operator audit trail — secondary

> As House (audit trail), I can examine who changed which open-box operations, when, and on which tenancy — so that Customer support and Founder controls can account for house changes over real firm books.

- **Added.** Open-box over real books requires accountable change history.

#### Register & evolution — secondary (prototype-time house tooling only)

> As House (Register & evolution), I can document running-firm gaps and regenerate methodology into house build tooling — so that House (configuration libraries) can carry the next authored operations into tenancies the Consultant runs.

- **Added.** House-side prototype tooling only. **No firm-facing Register outcome** — shipped product contains no Register. So-that lands on configuration libraries, not on the firm desk as a Register surface.

#### Founder & agency controls — secondary

> As House (founder & agency controls), I can set cross-firm bounds, kill-switches, and agency policy — so that house surfaces can configure and oversee many tenancies without leaking controls a Consultant never asked for.

- **Added.** Multi-tenant agency necessity.

---

### D. Per-tenancy admin surfaces

#### Provision (assisted door) — secondary

> As Per-tenancy admin (provision), I can provision firm and user via the assisted door into the same application — so that the Consultant can access the same desk when ALG is not the path.

- **Carried/re-homed** from `operator-assisted`.

#### Commercial (escrow / contingent terms) — secondary

> As Per-tenancy admin (commercial), I can oversee escrow and contingent terms for this firm — so that the Consultant can accept the money door and reach running.

- **Added.** World’s activation hard input on the commercial side; house must operate the door the Consultant accepts.

#### Firm operations bind — **core** (agency bind)

> As Per-tenancy admin (firm operations bind), I can bind house-authored evaluation, automation, and campaign packs under this firm’s identity — so that the Consultant can run eligibility and engagement without authoring those operations.

- **Added.** Completes the authorship→bind→desk spine. Firms do not author packs.

#### Book readiness — secondary

> As Per-tenancy admin (book readiness), I can run the reachability audit gate over this firm’s book — so that the Consultant can engage sequence-ready contacts.

- **Added.** World’s reachability gate is a house/per-tenancy operational necessity before sequences run.

#### Firm health — secondary

> As Per-tenancy admin (firm health), I can see sequence and engagement health scoped to this tenancy — so that Customer support can restore performance and the Consultant’s desk can keep campaigning toward meetings.

- **Added.** Per-tenancy slice of fleet oversight.

#### Activation state — secondary

> As Per-tenancy admin (activation state), I can see this firm’s forward-deploy and hard-input progress toward running — so that House (activation) and Customer support can move a Consultant to a running desk.

- **Added.** Per-tenancy face of the Activation surface.

---

### E. Customer-support / customer-success

#### Keep the firm running — **core**

> As House (customer support), I can answer a running firm’s operational questions and work tickets with per-tenancy context (bind, health, commercial, recent house actions) — so that the Consultant’s running firm stays running.

- **Added.** Mandated miss from the persona pass. So-that closes onto Consultant. Not a persona — a house surface.

---

## Closure check

| Hop | Lands on |
|---|---|
| Acquisition → Activation | House surface (in lattice) |
| Activation → Consultant running | Consultant (in lattice) |
| Provision / Commercial → Consultant running | Consultant |
| Configuration libraries → Firm operations bind | Per-tenancy (in lattice) |
| Bind / Book readiness / Reference data → Consultant desk | Consultant |
| Consultant core → Engagement contact | Engagement contact (in lattice) |
| Engagement contact Book → Consultant takes meeting | **Consultant — closed** |
| Support → Consultant stays running | **Consultant — closed** |
| Register → Configuration libraries → … → Consultant | same spine; never firm-facing Register |

---

## Inventory (carried / changed / added)

| Outcome | Kind | Note |
|---|---|---|
| Consultant Access | secondary | Carried |
| Consultant Core | **core** | **Changed — so-that only; capability carried. FLAGGED.** |
| Engagement Consent | secondary | Carried |
| Engagement Refresh facts | secondary | Carried |
| Engagement Silence | secondary | Carried |
| Engagement Book | **core** | Changed — so-that explicit onto Consultant |
| Acquisition & ads | secondary | Carried/re-homed from operator-approach |
| Activation & forward-deploy | **core** | Rebuilt from operator-activation (former operator core) |
| Reference data | secondary | Added |
| Configuration libraries | **core** | Added |
| Oversight | secondary | Added |
| Operator audit trail | secondary | Added |
| Register & evolution | secondary | Added (house tooling only; no firm-facing Register) |
| Founder & agency controls | secondary | Added |
| Provision | secondary | Carried/re-homed from operator-assisted |
| Commercial | secondary | Added |
| Firm operations bind | **core** | Added |
| Book readiness | secondary | Added |
| Firm health | secondary | Added |
| Activation state | secondary | Added |
| Customer support | **core** | Added |

`theory/outcomes.ts` left untouched — regenerate from this lattice in a later pass.
