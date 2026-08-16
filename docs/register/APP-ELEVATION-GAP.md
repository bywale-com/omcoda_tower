# APP ELEVATION GAP

**Date:** 2026-08-11  
**Status:** open — **UI not ready; spine passes do not equal product ready**

We are moving past treating the current machine/bind passes as “ready.” The CT Ant UI is still missing critical product surface that already exists in the Hub / plant engagement model.

---

## Problem 1 — Access (closed on magic-access branch)

**Was:** Invite = OTP **code** email + a login form. No magic / no-login link.  
**Now:** Direct access link `/a/<token>` — one-time redeem into session, lands on consultant desk. OTP remains fallback. See `MAGIC-ACCESS-LINK.md`.

Session still carries firm + email, not desk/role.

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
2. **Keep** the prototype as the always-on prototype of the app — not deleted. Prototype (auth bypass) keeps the **admin-shaped** shell for modeling.
3. **Shell (admin only):** `Consultant ▾ | Operator | Contact` — first slot is a **consultant dropdown** (view-as that consultant’s workspace). Sole admin: `admin@try-tower.com`.
4. **Everyone else:** consultant workspace **only** (no switcher).
5. **Access:** direct/magic link (no portal-as-product) — **closed** (`/a/<token>`; see `MAGIC-ACCESS-LINK.md`).
6. **UI parity:** engagement record / Activity / client look-inside must exist in the elevated app at Hub depth — not a decorative tree over seeds.
---

## Gap list (honest)

| # | Gap | Notes |
|---|-----|-------|
| A | Magic / direct access link | **Shipped** — `/a/<token>` + provision `accessPath` |
| B | Role → correct app desk after access | Not on session |
| C | Elevate CT → `/` app; prototype kept at prototype URL | Naming + entry; **do not kill switcher on prototype** |
| D | **Engagement / Activity / client module parity** | **Largest visible UI hole vs Hub** |
| E | Agents / Automations / Audits look-inside parity | Likely same translation debt |
| F | Hub must remain loadable (`/hub`, activity) until D closes | Routing regression called out above |
| G | Contact preview under operator in **app** shell | Prototype may keep top-level Contact for modeling |

**Already real (insufficient alone):** firm bind spine, authored cells, `meeting_booked`, worker tick. Those do not replace missing engagement UI.

**Map + Pass A:** See `PLACEHOLDER-REAL-MAP.md` — consultant Board / Engagement / Meetings rewired off Sarah seeds to `contact_records` / `engagement_records` / `meeting_booked` (empty-or-personalized). Operator DEMO_FIRMS indexes = Pass B.

**Systems bind (before UI shape restore):** See `HUB-STRUCTURE-SYSTEM-BIND.md` — integrating Hub Client/Agents/Automations structures into Ant does **not** need new core tables; cohesion = project worker ledger (`engagement_records`, attempts, outbound, workflows) into Hub-shaped surfaces. Hub embed of seed `journeyByClient` = chrome.

---

## Pass posture

**Current number pass (bind / author-runtime / production walk): not a UI-ready pass.**  
Next pass starts from the system bind map (projection contract), then closes engagement-record / Activity translation — not Hub chrome first.
