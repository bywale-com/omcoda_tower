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

> I really do like the look of this I don't like how now now always has the Now will always contain The objective … It will always contain What we need from them now even meeting books will show in that Right to always be the first thing they see clear instruction of what we need

> I Want to see how this compares to what we initially built for the contact seat? Right because it's a persona right … it's a natural persona and it has outcomes and usually our core modules are birthed from those outcomes So I want to see what Modules needs … that came out first before we even go into Wants and furnish

> yeah I'm definitely more of a fan of this new … I will ask for a redesign because I don't feel like it matches our current design system … that's fine we'll talk about that

> the idea of that now module is clear

> history clear reason why we need history as a module because it contains history of outreach or requests not necessarily the outreach but their requests right basically the thing that prompted need for outreach

> files is good … they should also be able to … upload information into the system … the automation possibility there … whenever a contact uploads information or of even a certain kind … I think upload can be a module itself … modal submodal submodules … trigger this … trigger a reevaluation operation

---

## Law of the seat (short)

1. **The contact has a workspace.** It is a **seat**. No login. Access is the link (same family as `/a/<token>`). Firm-branded. Not Tower. Not the Operator desk. Not the Consultant desk.
2. **The 10 CT surfaces are not the nav.** Live `/prototype-ant` Contact aside (Opt-in message · Consent request · Nudge form · … · Link state) is a **scene flipper** for us. Priors already: not contact-facing. Do not ship that list as modules.
3. **Now always contains the objective.** The first thing they see. Clear instruction of **what we need from them now**. Consent, the data-request form, **meeting book** — those are **states of Now**, not extra nav. Whatever the current Agents objective is, it shows here.
4. **Not too many modules.** Light. Do not say Dashboard on the glass. Left panel like every workspace:

| Entry | Need or want | What it is |
|-------|--------------|------------|
| **Now** | **Need** | Always the **objective** — what we need from them now |
| **History** | **Need** (reason named) | History of **requests** — the asks that prompted outreach. Not the outreach log |
| **Upload** | **Need** (function named) | Contact **puts information into the system**. Any type, or a specific kind. Submodules later. This is what Automations **hears** |
| **Files** | Store | Where that information **lives** after. Not the act. Not Now’s form |

5. **Opt out** is chrome — How Silence. Not a module.
6. **On behalf of the firm.** Harbor in the pictures is **example**. Same grain as C16.
7. **Touchpoints still exist.** Email still goes out (C16). The link **lands in this workspace**, on Now, with that ask open. Channel messages are **not** nav.
8. **Do not build everything now.** Do not open Furnish. Do not regenerate plates for design-system match until asked.
9. **Three doors. Do not collapse them.**

| Door | Who starts | What it is | Event Automations hears |
|------|------------|------------|-------------------------|
| **Now** | The firm (the objective) | They answer **this** ask | Form submitted / objective met — already named |
| **Upload** | The contact | They **put information in** (any / this kind) | **Contact uploaded information** — named on purpose. Not import. Not form-submitted |
| **Files** | — | Store. Browse what is already there | Not an event by sitting there |

Upload can have kinds (modals / submodules). Global = all uploads. Local = **this kind**. Then Automations: hear that → operation (re-evaluate is one) → exits. Same definite middle. Do not put a Rule on the contact canvas.

**Now’s form stays self-reportable-only** (Refresh How). Document-dependent never enter that form. Upload is the other door for information that is not that form.

**PM on Files vs Upload:** Upload is the **function** (and the event). Files is the **store**. Same family. Not a fourth unrelated module — Files sits with Upload (submodule / second view) unless we later need browse-without-put as its own entry. History stays. Now stays. Left panel stays light: **Now · History · Upload** (Files inside Upload). Ask if Files must stay a sibling.

**Old paper (honest):** [`personas.md`](./personas.md) said contact is referenced, not a persona, touchpoint-only. [`OUTCOMES.md`](./OUTCOMES.md) still has four **Engagement contact** outcomes (all secondary). Founder: it is a **natural persona**. This seat uses those four outcomes to birth modules. Approach still does not acquire them (World). Do not copy the consultant desk. Do not overwrite 15:43.

---

## Needs first (Function) — what the outcomes birthed

| Outcome | What it birthed (How) | Kind | P1 housing |
|---------|----------------------|------|------------|
| **Consent** | Opt-in message → **Consent request** (Agree / Ignore) | Channel + page | Channel = C16. Page = **Now** |
| **Refresh facts** | Nudge message → **Nudge form** / **Update facts** (one consolidated self-reportable form) | Channel + page | Channel = C16. Page = **Now** |
| **Silence** | Silence / Opt out on every foot | **Chrome**, not a module | Sider foot |
| **Book** | Meeting invitation → **Booking** (+ loop-closer fields, still the form family) | Channel + page | Channel = C16. Page = **Now** (meeting book shows here) |

**Not modules:** Nudge form vs Update facts vs Loop-closer form are **one form family** (outstanding self-reportables). They are not three nav items. Opt-in / Nudge / Meeting invitation are **channel** surfaces — outbound, not left-panel entries.

**What CT built:** one **Client portal** module with **10** aside items (`CONTACT_SURFACES`). Priors: scene flipper, **not contact-facing**. That list mixed needs + furnish (Link state) + channels as if they were modules.

**Furnish / Enrichment:** 20 contact-cants + 20 furnish, planted on that flipper. **Wait.** Needs/modules first.

Compare plates: [`P0`](./contact-blueprint/P0-contact-ct-portal-built.png) (CT as built — **copy the 10-item sider only**; interior drifted) · [`P2`](./contact-blueprint/P2-contact-needs-vs-built.png) (needs vs built vs P1).

**Not this workspace:** Prepared workspace (consultant activation). Consultant Board / Client Data. Operator libraries.

---

## What this is not

- Not overwriting 15:43.
- Not making the contact a Consultant.
- Not 10 modules from 10 CT labels.
- Not minting a files table this stamp.
- Not planting `/prototype-ant` Contact as the product face of this seat (that scene is still the flipper until we recut it).
- Not Gmail. C16 stays the email. This is after they click.
- Not collapsing **Upload** with **Now’s form submitted**, or with **operator contact-file import**.
- Not regenerating P1 for design-system match until asked.
