# Workspace until they opt out — evolution of SHELL-CHROME + CONTACT-WORKSPACE

**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**. One pocket. Do not lose this.  
**When:** 2026-08-21. Pickup **this file**.  
**What this is:** evolution of [`SHELL-CHROME-PACKET.md`](./SHELL-CHROME-PACKET.md) (Contact ▾ filter) and [`CONTACT-WORKSPACE-PACKET.md`](./CONTACT-WORKSPACE-PACKET.md) (foot). **Do not mutate those bodies.** Implementer **only implements this delta**. If they already built Contact ▾ as “opted in + has a workspace,” they only cut this. If they have not, they skip that filter and use this.  
**SA already:** PR [#86](https://github.com/bywale-com/omcoda_tower/pull/86) **026**. Same cut. Do not ask them to recut 025.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite. Read: [`PLATE-READ.md`](./PLATE-READ.md).  
**Does not:** plant; recut 015; mint tables; build the email unsubscribe button; recut Consultant ▾ chrome; recut Now / History / Upload interiors; mutate SHELL-CHROME-PACKET or CONTACT-WORKSPACE-PACKET.

---

## Do not miss

“Opted in” on Contact ▾ **pollutes**. The opt-in **is** a Now state on the seat (P3). Everyone has a workspace **until they opt out of the workspace**.

**Two doors. Do not glue them.**

| Door | Where | What it does | Emails | Seat |
|------|-------|----------------|--------|------|
| **Workspace opt-out** | Foot of the workspace | They leave the seat | still go | gone (Contact ▾ drops them; their link refuses) |
| **Email opt-out** | In the email | **Not designed. Do not build.** | — | — |

If they later opt out of email, that will take the seat with it. Opting out of the workspace **never** stops email. We have not designed the email button.

Contact ▾ = that firm’s **book**, minus people who foot-opted-out of the workspace. Ignore still listed. People who have not Agreed yet still listed. Not “opted in.” Token is how **they** land (C16) — not whether the seat exists. Operator view-as does not need a token.

T3 helper “opted in” = **do not build.** No extra PNG.

---

## Paste — engineer

```text
Read docs/register/WORKSPACE-UNTIL-OPT-OUT-PACKET.md ALL THE WAY THROUGH. Then SHELL-CHROME-PACKET.md and CONTACT-WORKSPACE-PACKET.md as priors (do not re-implement their opted-in filter or foot-as-email-silence). SA 026 on PR #86 is the same delta. PLATE-READ.md.

You are cutting a delta on CT Ant. Product face = /prototype-ant. Hub is not the app. Do not recut 015. Do not overwrite 15:43. Do not plant. Do not mint tables.

If you already built SHELL-CHROME-PACKET Contact ▾ as opted-in + has-workspace: replace that list with this firm’s contacts who have not opted out of the workspace. If you have not built that filter yet: skip it; use this.

Contact ▾ = the selected firm’s book minus workspace opt-out. Include people who have not Agreed (Ignore still listed). Do not require a token to appear. Do not list people who foot-opted-out.

Foot “Opt out” on the contact workspace: leaves the workspace only. Do not halt email. Do not wire it as unsubscribe / Silence / handleConsentSilence. Email unsubscribe is not this packet. Do not build that button.

T3 teaching “opted in” is not spec. No new PNG.

Read docs/register/PLATE-READ.md. Five buckets are in this file.
```

## Paste — Systems Analyst

```text
You are Tower’s Systems Analyst. Identity: docs/README.md § Systems Analyst. Log: docs/register/SYSTEMS-ANALYST-LOG.md. 15:43 stands. This PM face is docs/register/WORKSPACE-UNTIL-OPT-OUT-PACKET.md. You already cut SYSTEMS-CHANGE-PACKET-026.md on PR #86. Do not recut 025. Do not recut 015.

Confirm this face matches 026 (seat until workspace_opted_out; foot does not set silenced; Contact ▾ is the book minus that flag). Stamp if it matches. Silent if a slice is still silent. Do not mint a second column.

Stamp SYSTEMS-ANALYST-LOG.
```

---

## What the prior packets said that this replaces

| Packet | Retracted | Why |
|--------|-----------|-----|
| [`SHELL-CHROME-PACKET.md`](./SHELL-CHROME-PACKET.md) Contact ▾ | “opted in **and** have a workspace” | Opt-in happens **on** the seat. Token is the no-login door, not existence. |
| [`CONTACT-WORKSPACE-PACKET.md`](./CONTACT-WORKSPACE-PACKET.md) foot | Opt out = How Silence / email halt | That is the **send** door. Workspace-out must not stop email. |

Everything else in those packets stands (Consultant ▾ is the dropdown, Operator only, Now states, History, C16 lands in Now).

---

## Five buckets (PLATE-READ)

1. **Copy:** Foot opt-out leaves the **workspace**. Contact ▾ lists that firm’s contacts who still have a seat (not Agreed yet included). Operator-only switcher still SHELL-CHROME-PACKET.
2. **Do not build:** T3 “opted in” helper. Email unsubscribe button. Gluing foot to silenced / consent opt-out. Filtering Contact ▾ to express/implied consent. Requiring a token to appear in Contact ▾.
3. **Implied:** Ignore still has a seat. Agree is still a Now state (P3). C16 still lands in Now when they have a token.
4. **Completes:** After foot opt-out they disappear from Contact ▾ and cannot open the seat; emails still go. No extra PNG. Email-out-implies-seat-out when that button exists later — not this build.
5. **Out of scope this build:** Consultant ▾ chrome. Now / History / Upload interiors. Email unsubscribe design. Recutting 015. Mutating the prior packet files.

---

## Founder comments (preserve)

- Everyone has a workspace until or unless they opt out.
- The opt-in action itself takes place by what we just designed (Now).
- Opt out from receiving emails from the firm would opt them out of the workspace. **That button is not designed yet.**
- Opt out of the workspace does **not** mean they opted out of receiving emails.
- Hierarchy takes place inside the workspace: they have a workspace unless they opt out — that control at the bottom.
- A recut is a **new packet**. Changing 025 in place is invisible. They are looking for 026.

---

## Method (this seat)

A locked packet is a cut. Recut = **next packet**, same PR. Pointer on the old file; **body stays**. Pickup is the new file. Do not ask the engineer to re-read every packet.

---

## Do not

- Plant. Recut 015. Overwrite 15:43. Mint tables.
- Edit SHELL-CHROME-PACKET or CONTACT-WORKSPACE-PACKET bodies to sneak this in.
- Build email unsubscribe.
- Glue the two opt-outs.
- Filter Contact ▾ to opted-in.
