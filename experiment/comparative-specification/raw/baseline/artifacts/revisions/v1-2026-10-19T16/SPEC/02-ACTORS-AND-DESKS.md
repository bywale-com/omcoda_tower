# 2. Actors and desks

## 2.1 Personas vs stakeholders

**One acquired persona:** Consultant.

Everyone else fails the acquired-seat test:

| Party | Ruling |
|-------|--------|
| Firm | Tenancy container. Not a persona. |
| Engagement contact | Referenced participant. Delivery-only. Not a branded Tower customer seat. |
| Om Coda house | Served as the Operator layer. Not a customer persona. |
| Ads supply / reference upkeep / Register tooling | House functions, not personas. |
| Agent presentation | Capability across Approach, prepared workspace, and routing. Not a seat. |

**Operator** is one house/agency human working many surfaces — not many personas.

**UNRESOLVED (Seed/World silence):** multi-consultant roles and permissions inside a firm. Not minted.

## 2.2 Three desks (product face)

The intended product face is **`/prototype-ant`**, with a seat switcher for modeling:

| Desk | Who | Job |
|------|-----|-----|
| **Consultant** | Firm operator | Hand over the book, authorize license, inhabit Board/Contacts/Meetings, halt outreach, take meetings with a live brief |
| **Operator** | Om Coda house | Author packs, bind them per firm, acquire/activate firms, oversee health, support |
| **Contact** | Engagement contact | Firm-branded consent, facts, booking, silence; no-login workspace at `/c/<token>` |

Platform admin may **view-as** a consultant firm and (in this snapshot) open contact workspaces. Ordinary consultant login sees only the consultant desk.

Hub (`/hub` in older plant) is **not** the app. It is an advanced plant for Automations/Rules. Seed’s “Hub lives in the firm shell” is **existing-wrong-seat** relative to Personas/Outcomes.

Register (`/register`) is **house-side methodology tooling**. The shipped firm product contains no Register. House-global **Register & evolution** is prototype-time gap writing, not a consultant module.

## 2.3 Consultant outcomes

**Core (sole north-star)**

> As Consultant, I can hand my private book to Tower and authorize it to work under my license, and get eligible clients booked onto my calendar — without setting up, configuring, or running any of the engagement myself — so that an eligible contact arrives at a booked meeting already re-engaged and current.

Verbs: **hand over · authorize · receive**. In the application layer under ALG the consultant initiates nothing and configures nothing. Opt-in / nudge / reactivation / refresh / re-evaluate are **machinery**, not consultant outcomes.

**Governance (secondary)**

> As Consultant, I can keep everything running under my license and halt anything I won't stand behind — so that the book is worked lawfully in my name.

**Access (secondary)**

> As Consultant, I can sign in and land in my firm workspace to see what's being done in my name and take the meetings booked for me.

## 2.4 Engagement-contact outcomes (loop closers)

- **Consent:** receive a firm-branded consent request; agree or ignore before deeper collection.
- **Refresh facts:** answer **one** consolidated form for outstanding self-reportable facts; reply when the situation changes.
- **Silence:** opt out at any point.
- **Book:** book a meeting when invited; arrive so the firm already knows current facts (live brief).

Contacts pay Om Coda nothing.

## 2.5 Operator outcomes (house-global)

| Surface | Outcome (so that) |
|---------|-------------------|
| Acquisition & ads | Captured firm can be staged for activation |
| Activation & forward-deploy | Consultant reaches a running desk (candidate co-core) |
| Reference data | Evaluation packs score on today’s rules, no code deploy |
| Configuration libraries | Firm operations are bound from house-authored packs |
| Oversight | Failing tenancy caught before lost meetings |
| Audit trail | Support and founder can account for every change |
| Register & evolution | Next authored operations reach the libraries (house tooling) |
| Founder & agency controls | Many tenancies overseen without leaking controls into a firm workspace |
| Customer support | Tickets answered with firm context |

## 2.6 Operator outcomes (per-tenancy)

| Surface | Outcome |
|---------|---------|
| Provision | Assisted door into the same desk |
| Commercial | Escrow / contingent terms held so the consultant can accept and reach running |
| Firm operations bind | House packs run under the firm identity |
| Book readiness | Only reachable contacts enter engagement |
| Firm health | Support can restore a tenancy |
| Activation state | Stalled firm moved to running |

## 2.7 Authorship vs inhabit

**House authors. Tenancy binds. Consultant inhabits.**

Configuration libraries (evaluation packs, automation workflows, engagement templates) are authored house-globally and **published**. Firm operations bind selects **published** versions under a firm identity and sets **Armed** (ready, nothing sending) vs **Active** (executing). The consultant Board shows phase chips and records; it does not contain pack editors.

## 2.8 Admission

- Firms/users enter via **assisted Provision** or **ALG seed → forward-deploy → hard inputs**. Both land in **one** application / session matrix.
- Consultant access: passwordless **OTP** (`tower_session` HttpOnly cookie) or **magic access link** `/a/<token>` (single-use, TTL). Unprovisioned emails: generic success, **no code** (anti-enumeration).
- Operator is **not** a firm Board login persona.
- Do not mint an Agent seat in admission.
- Register unlock (`REGISTER_PASSWORD`) is internal Om Coda tooling, not firm product chrome.

**UNRESOLVED:** production onboarding beyond manifests / Provision UI; multi-user roles.
