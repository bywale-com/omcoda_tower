# APP ELEVATION GAP

**Date:** 2026-08-11  
**Status:** open — **UI not ready; spine passes do not equal product ready**

We are moving past treating the current machine/bind passes as “ready.” The CT Ant UI is still missing critical product surface that already exists in the Hub / plant engagement model.

---

## Problem 1 — Access (still open)

**Today:** Invite = OTP **code** email + a login form. No magic / no-login link.  
**Wanted:** Direct access link; not a login portal as the product.

Session carries firm + email, not desk/role. Noted against live provision of **Omcoda Immigration** / `wale@marblespaces.com`.

---

## Problem 2 — Engagement / client UI translation gap (critical)

The **existing app (Hub)** client module has a deep engagement model: Activity / engagement tree, inspect-inside-each-touchpoint, chronology, the full client workspace around engagement.

**CT Ant today** only has a thin Engagement tab: Ant `Tree` + timeline over **seed** `journeyByClient` / `journeyTree` data — not the Hub Activity surface (`ClientDataContent` / activity tabs / touchpoint inspectors), and not a live `engagement_records` tree either.

Same class of gap is expected (not yet fully audited) in **Agents / Automations / Audits** seats: plant/Hub had look-inside; CT often has catalog chrome or empty Activity tabs (“will live here”).

**This is why we cannot call the product ready with a straight face** even when bind/enroll/`meeting_booked` are real — the consultant-facing engagement record is not translated.

| Surface | Hub / plant (existing) | CT Ant (current “app face”) |
|---------|------------------------|-----------------------------|
| Client engagement / Activity | Full Activity tab + client data / touchpoint inspect | Simplified Engagement tree + gantt from **demo journey seeds** |
| Look inside each node | Yes (Hub inspectors / activity focus) | No parity |
| Agents Activity tab | Hub AgentEditor activity | Placeholder copy in AntAgentWorkbench |
| Live machine engagement ledger | Partial elsewhere | Not the consultant engagement tree |

---

## Problem 3 — `/activity` and old app not loadable (routing)

**Cause (fixed on this branch):**
- React Router `*` sent unknown paths (including `/activity`) → `/prototype-ant`.
- `/login` success navigated to `/` → CT, so you could never stay in Hub after auth.
- Hub lives at `/hub` on `index.html`; CT is a separate MPA (`prototype-ant.html`) with **no** client router — there is no `/activity` inside CT.

**Intent:**
- Old app (Hub) remains reachable for comparison and as the reference engagement UI until CT catches up.
- Prototype persona switcher **stays** — it is how we see what is modeled while prototyping. Elevating design → app does **not** kill the prototype; prototype remains a prototype **of** the app.

---

## Target shape (corrected)

1. **Elevate** the new design system (CT Ant) to **app** entry for product use.
2. **Keep** the prototype (including Consultant | Operator | Contact switcher) as the always-on prototype of the app — not deleted.
3. **App desks** (elevated product): consultant world vs operator world; Contact **preview** under operator for live contact UI look; real contact delivery later.
4. **Access:** direct/magic link (no portal-as-product).
5. **UI parity first where it hurts:** engagement record / Activity / client look-inside must exist in the elevated app at Hub depth — not a decorative tree over seeds.

---

## Gap list (honest)

| # | Gap | Notes |
|---|-----|-------|
| A | Magic / direct access link | OTP-only today |
| B | Role → correct app desk after access | Not on session |
| C | Elevate CT → `/` app; prototype kept at prototype URL | Naming + entry; **do not kill switcher on prototype** |
| D | **Engagement / Activity / client module parity** | **Largest visible UI hole vs Hub** |
| E | Agents / Automations / Audits look-inside parity | Likely same translation debt |
| F | Hub must remain loadable (`/hub`, activity) until D closes | Routing regression called out above |
| G | Contact preview under operator in **app** shell | Prototype may keep top-level Contact for modeling |

**Already real (insufficient alone):** firm bind spine, authored cells, `meeting_booked`, worker tick. Those do not replace missing engagement UI.

---

## Pass posture

**Current number pass (bind / author-runtime / production walk): not a UI-ready pass.**  
Next pass must close engagement-record / Activity translation (and restore Hub access for comparison) before claiming the consultant product is ready.
