# Engagement contact — Enrichment Can'ts

**Subject:** Engagement contact  
**Count:** 20  
**Status:** paper — Register Enrichment

Spoken as the Engagement contact on firm-branded touchpoints (Consent request, refresh facts, Silence / Opt out, Book, prepared-workspace-adjacent, firm-branded pages). Design gaps for the contact loop-closer — not Wiring, not World-persona desk chrome.

### `contact-cant-01` — Who is asking
- **Right now I can't:** Tell whether this request is from my immigration firm or from some other platform brand, so I know who is accountable for the ask.
- **SurfaceIds:** ["opt-in-message", "consent-request", "firm-branded-pages"]
- **Gap:** Firm-on-whose-behalf identity is easy to miss; Om Coda chrome can displace the firm face.
- **Need:** Dominant firm name + contact coords on every CEM and Consent request, with Om Coda only as send-platform disclosure when required.

### `contact-cant-02` — What happens after Agree
- **Right now I can't:** See what agreeing unlocks next (deeper facts form, later nudges, or nothing yet) before I tap Agree.
- **SurfaceIds:** ["consent-request"]
- **Gap:** Agree / Ignore is a binary with no consequence preview; Agree feels like a blank cheque.
- **Need:** Short after-Agree path disclosure on Consent request before the affirmative Agree control commits.

### `contact-cant-03` — Silence mid-form
- **Right now I can't:** Silence or opt out while I am mid-way through Nudge form, Update facts, or Loop-closer form without abandoning to a different message.
- **SurfaceIds:** ["nudge-form", "update-facts", "loop-closer-form", "silence-opt-out"]
- **Gap:** Silence lives on message footers; open forms bury or omit it.
- **Need:** Persistent Silence / Opt out on every form chrome, honor-bound the same as channel footer.

### `contact-cant-04` — Resume refresh
- **Right now I can't:** Resume a partially answered Nudge form or Update facts after I close the tab, lose the link, or get interrupted.
- **SurfaceIds:** ["nudge-form", "update-facts", "nudge-message"]
- **Gap:** Consolidated form assumes one sitting; no draft / resume path.
- **Need:** Save-and-resume (or return-link) that restores outstanding fields without restarting from blank.

### `contact-cant-05` — Booking is with my consultant
- **Right now I can't:** Tell that the slot I am booking is with my firm's consultant (named person / practice), not a generic calendar or third-party screener.
- **SurfaceIds:** ["meeting-invitation", "booking"]
- **Gap:** Slot picker can read as anonymous scheduling; consultant identity is missing.
- **Need:** Consultant / firm host identity on Meeting invitation and Booking before Confirm booking.

### `contact-cant-06` — Language / expiry confusion
- **Right now I can't:** Tell whether a language-test or similar dated fact is asking for the test date, the expiry, or “still valid,” so I don't guess wrong.
- **SurfaceIds:** ["nudge-form", "update-facts", "loop-closer-form"]
- **Gap:** Self-reportable date fields lack plain-language expiry framing the contact understands.
- **Need:** Field labels / helper copy that distinguish test date vs validity window without asking for document uploads.

### `contact-cant-07` — Channel scope of consent
- **Right now I can't:** Limit Agree to email only (or SMS only) when I do not want the other channel.
- **SurfaceIds:** ["consent-request"]
- **Gap:** Single Agree is easy to read as all-channels forever.
- **Need:** Explicit channel-scope choice (Email / SMS / disclosed multi) at Agree time.

### `contact-cant-08` — Ignore vs Silence
- **Right now I can't:** Tell whether Ignore means “not now / no deeper forms” or “stop contacting me,” so I don't pick the wrong exit.
- **SurfaceIds:** ["consent-request", "silence-opt-out"]
- **Gap:** Ignore and Silence are adjacent exits with unspoken policy mapping.
- **Need:** Plain distinction copy plus a visible Silence / Opt out when withdrawal is the intent.

### `contact-cant-09` — Why collect immigration facts
- **Right now I can't:** See the purpose of collecting self-reportable immigration facts separately from agreeing to receive firm messages.
- **SurfaceIds:** ["consent-request", "nudge-form"]
- **Gap:** One Agree conflates CEM engagement with deeper PI collection.
- **Need:** Split purpose disclosure (CEM vs PIPEDA collection of self-reportable facts) before deeper forms unlock.

### `contact-cant-10` — Link still valid
- **Right now I can't:** Tell whether this Consent / Nudge / Booking / prepared-workspace-adjacent link has expired or was already used.
- **SurfaceIds:** ["consent-request", "nudge-form", "booking", "prepared-workspace-adjacent", "firm-branded-pages"]
- **Gap:** Dead or replayed tokens fail silently or reopen the wrong purpose.
- **Need:** Clear expired / already-used / wrong-purpose states with a firm-safe next step (not a blank error).

### `contact-cant-11` — Not me / wrong person
- **Right now I can't:** Say “this isn't me” or correct that the firm reached the wrong person without answering facts about someone else.
- **SurfaceIds:** ["consent-request", "nudge-form", "opt-in-message", "silence-opt-out"]
- **Gap:** Only Agree / Ignore / form fields; no wrong-recipient exit that protects the real contact.
- **Need:** Wrong-person / not-me control that stops deeper collection and signals the firm without inventing facts.

### `contact-cant-12` — What the firm already holds
- **Right now I can't:** See which self-reportable facts the firm already has versus what this form still needs from me.
- **SurfaceIds:** ["nudge-form", "update-facts", "loop-closer-form"]
- **Gap:** Consolidated outstanding list can look like a full blank intake.
- **Need:** Already-held vs outstanding split so I only answer gaps.

### `contact-cant-13` — Documents vs self-report
- **Right now I can't:** Tell that this touchpoint will never ask me to upload letters, bank proofs, or certificates — so I don't stall waiting for files I don't have.
- **SurfaceIds:** ["nudge-form", "loop-closer-form", "update-facts"]
- **Gap:** Immigration contacts expect document upload; self-reportable-only rule is invisible.
- **Need:** Explicit self-reportable-only framing; document asks stay off these forms.

### `contact-cant-14` — Silence was honored
- **Right now I can't:** Get confirmation that Silence / Opt out (or SMS STOP) actually stopped further automatic messages.
- **SurfaceIds:** ["silence-opt-out", "opt-in-message", "nudge-message", "meeting-invitation"]
- **Gap:** Silence click can feel like a black hole; no receipt, no “you won't hear from us automatically.”
- **Need:** Immediate silence confirmation state that matches channel STOP / unsubscribe honor.

### `contact-cant-15` — Change or cancel the booking
- **Right now I can't:** Reschedule or cancel a booked slot from the same firm-branded path without emailing the firm from scratch.
- **SurfaceIds:** ["booking", "meeting-invitation"]
- **Gap:** Confirm booking is one-way; no contact-side change path.
- **Need:** Reschedule / cancel controls on booking confirm that keep firm brand and consultant host identity.

### `contact-cant-16` — Why I was invited to meet
- **Right now I can't:** See a plain reason I am being invited (situation / rules changed enough to warrant a meeting) without reading like a sales pitch.
- **SurfaceIds:** ["meeting-invitation", "booking"]
- **Gap:** Invitation can feel abrupt; eligibility warrant is consultant-side only.
- **Need:** Short firm-authored meeting purpose line on the invitation / Booking chrome.

### `contact-cant-17` — Prepared workspace vs my client path
- **Right now I can't:** Tell a prepared-workspace-adjacent firm page from my own consent / facts / book touchpoints — so I don't treat a firm activation preview as my intake.
- **SurfaceIds:** ["prepared-workspace-adjacent", "consent-request", "firm-branded-pages"]
- **Gap:** Purpose-confused tokens / pages bleed activation chrome into contact loop-closer.
- **Need:** Distinct purpose labeling so contact touchpoints never look like Authorize book / prepared workspace admission.

### `contact-cant-18` — SMS STOP equals Silence
- **Right now I can't:** Tell that replying STOP / Unsubscribe on SMS has the same effect as the in-page Silence / Opt out control.
- **SurfaceIds:** ["silence-opt-out", "nudge-message", "opt-in-message"]
- **Gap:** Channel-native keywords and touchpoint Silence feel like different products.
- **Need:** On-SMS instruction copy + confirmation that keywords write the same silenced state.

### `contact-cant-19` — Withdraw after I already Agreed
- **Right now I can't:** Withdraw consent later from a firm-branded page as easily as I Agreed the first time.
- **SurfaceIds:** ["consent-request", "silence-opt-out", "nudge-message", "update-facts"]
- **Gap:** Agree path is clear; later withdrawal is footer-only and easy to miss once forms are open.
- **Need:** Always-reachable Silence / Opt out (and re-consent only via new affirmative Agree when required).

### `contact-cant-20` — Loop-closer before the meeting without re-explaining
- **Right now I can't:** Finish outstanding self-reportables after I book so the consultant already has current facts — without starting a whole new intake story.
- **SurfaceIds:** ["loop-closer-form", "booking", "meeting-invitation"]
- **Gap:** Booking confirm may skip pending capture; contact arrives cold or repeats answers.
- **Need:** Pending Loop-closer / Booking-confirm fields for outstanding self-reportables only, write-back for Live brief.
