# APP ELEVATION GAP

**Date:** 2026-08-11  
**Status:** open — first problem before “product ready”

---

## Problem 1 — Access is wrong for the product you want

**What exists today**
- Provision mints a firm + user and returns a **login path**  
  `/login?tenancy=assisted&email=…`
- “Send invite” emails a **6-digit OTP code** (subject: “Your Tower verification code”).
- There is **no magic / no-login link**. Clicking a link never establishes a session by itself.
- Access is: open a login UI → enter email → enter code.

**What you planned**
- No login portal.
- Direct access link (invite = session, or equivalent passwordless deep link).

**Why this blocks “ready with a straight face”**
- Owner cannot be handed a single URL that puts them in their firm.
- After OTP, the shell still shows **Consultant | Operator | Contact** as a Segmented switcher — so you still don’t know *which role you are*. Session has `firmId` + email, **not a desk/role that routes you**.

Logged as of 2026-08-11 against live provision of **Omcoda Immigration** / `wale@marblespaces.com`.

---

## Target shape (tonight’s bar)

1. **Elevate CT Ant from “prototype” to the app** — product face, not a labeled translate.
2. **Separate desks**
   - **Consultant** — own world (own routes / no operator chrome).
   - **Operator** — own world; **Contact preview stays under Operator** (live look at contact UI).
   - Real contact-served experience later (same surfaces, different entry) — deferred from this cut only as delivery channel, not as mixed shell.
3. **Access** — invite/access path that does not feel like a login portal (magic link or one-shot token URL → land in the correct desk).

---

## Gap from here → that separation

| # | Gap | Today | Need |
|---|-----|-------|------|
| 1 | **Access model** | OTP code email + Login module / `/login` form | Magic (or one-shot) link: token in URL → set session cookie → redirect to desk. Optional: no dedicated “Login” product surface. |
| 2 | **Role on session** | `users` + session carry firm + email; provision `role` is not a routing authority | Persist role (or desk) on user/session; after auth, route by role (`consultant` → consultant app, operator/house → operator app). |
| 3 | **Shell is a persona switcher** | `PrototypeAntApp` Segmented: Consultant \| Operator \| Contact in one document | Kill cross-desk Segmented for product. Separate route trees (e.g. `/app` consultant, `/ops` operator+contact preview). |
| 4 | **Contact placement** | Top-level desk peer to Operator | Nest Contact preview **inside Operator** only; remove Contact from consultant-facing chrome. |
| 5 | **Elevate naming / entry** | `/prototype-ant`, “Prototype · Ant Design”, Source plant link | App routes own `/` (or `/app`); drop prototype labeling; AuthGate on desk entries. |
| 6 | **Two HTML worlds** | `index.html` (Hub router) vs `prototype-ant.html` MPA | One app entry that mounts the elevated CT shell (Hub stays quarantined or dies). |
| 7 | **Operator vs consultant auth** | Anyone with OTP for that email can flip Segmented to Operator | Desk separation + role check so consultant session cannot open `/ops` (and vice versa) without house credentials. |

**Not the gap (already real):** firm binding, Postgres book, bind/enroll spine. Those don’t fix identity or desk separation.

---

## Smallest mechanical cut (ordered)

1. Note + agree access = magic link (this doc).
2. Persist role from provision → session payload.
3. Split routes: consultant app vs operator app (contact nested under ops).
4. Remove Segmented desk switcher from product chrome.
5. Elevate entry (`/` → app shell); strip “Prototype” chrome.
6. Replace OTP-portal UX with invite link that lands in the right desk (keep OTP as fallback only if needed).

Until 1–5 land, “logged in” still means “has a cookie inside a prototype switcher.”
