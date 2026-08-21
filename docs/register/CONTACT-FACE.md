# Contact workspace — app-facing form

**Seat:** Product Manager.  
**Why:** Founder 2026-08-21: the contact has a **seat**. It is a workspace. No login. Portal. We specified (and even built) the **touchpoints** — we did not house them as a place. C17 as a naked form page was the miss. Entered from Agents outbound (C16).  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite.  
**Plates:** [`CONTACT-UI-BLUEPRINT.md`](./CONTACT-UI-BLUEPRINT.md).  
**Do not:** plant; mint tables; copy Operator / Consultant nav; freeze the 10 CT touchpoint names as modules; call it a dashboard on the glass.

---

## Founder excerpts (do not paraphrase away)

> the people definitely need … this is a super value ad that we talked about we like we even documented detailed Specified but we did and we haven't and we've even built in a way, but we've not built it like it's its own Like place it's a seat. The contact has their seat

> What we need to spec is something else … We need to spec the contact workspace We need to spec the contacts workspace, it's genuinely a legit workspace It's no login as well

> we're not going to build everything out right now

> It doesn't they're not they're not it's not going to be too many modules

> it's really just gonna house like mostly like a history and like it's where they … and maybe like a like a like a place to upload stuff and also store stuff

> Portal it's a portal … see What that would look like given our system Especially since we want to keep it light … dashboard can look like … I don't want even just calling a dashboard makes it seem heavy But like there's a left panel, of course like in every workspace And … I want to see what those entries are What they could be?

---

## Law of the seat (short)

1. **The contact has a workspace.** It is a **seat**. No login. Access is the link (same family as `/a/<token>`). Firm-branded. Not Tower. Not the Operator desk. Not the Consultant desk.
2. **The 10 CT surfaces are not the nav.** Live `/prototype-ant` Contact aside (Opt-in message · Consent request · Nudge form · … · Link state) is a **scene flipper** for us. Priors already: not contact-facing. Do not ship that list as modules.
3. **Not too many modules.** Light. Do not say Dashboard on the glass. Left panel like every workspace — three entries this stamp:

| Entry | What it is | From |
|-------|------------|------|
| **Now** | What is asked of them **right now**. Consent, the data-request form, booking — those are **states of Now**, not extra nav. C17’s form **lives here**. | Founder: “it’s where they…” · How: consent / refresh / book |
| **History** | What happened. Light chronology. Not the consultant engagement chart. Not a UUID dump. | Founder named |
| **Files** | Upload and store. A place. **Not** the data-request form (that stays self-reportable; no document upload on Now). | Founder named (“maybe”) |

4. **Opt out** is chrome (sider foot / every Now footer) — How Silence. Not a fourth module.
5. **On behalf of the firm.** Harbor in the pictures is **example**. Same grain as C16.
6. **Touchpoints still exist.** Email still goes out (C16). The link **lands in this workspace**, on Now, with that ask open. Do not invent a second naked form page.
7. **Do not build everything now.** Spec the place. Draw the entries. Files interior and History density wait.

**Old paper (honest):** Personas / World craft said contact is referenced, touchpoint-only, do not plant a client console that mirrors the consultant IA. This stamp **seats the workspace**. It does not copy the consultant desk. It does not overwrite 15:43.

**Not this workspace:** Prepared workspace (consultant activation). Consultant Board / Client Data. Operator libraries.

---

## What this is not

- Not overwriting 15:43.
- Not making the contact a Consultant.
- Not 10 modules from 10 CT labels.
- Not minting a files table this stamp.
- Not planting `/prototype-ant` Contact as the product face of this seat (that scene is still the flipper until we recut it).
- Not Gmail. C16 stays the email. This is after they click.
