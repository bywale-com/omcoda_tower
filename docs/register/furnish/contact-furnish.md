# Engagement contact — Furnish

**Subject:** Engagement contact  
**Count:** 20  
**Status:** paper — Register Furnish

Supporting affordances around the contact loop-closer (Consent → Refresh → Silence → Book). Non-invasive chrome — does not change Core Function leaves. Not Wiring.

### `contact-furnish-01` — Firm-on-whose-behalf chrome
- **Supporting affordance:** Dominant firm name + mailing/contact coords on every firm-branded CEM and Consent request; Om Coda only as a small send-platform disclosure when needed.
- **SurfaceIds:** ["opt-in-message", "consent-request", "nudge-message", "meeting-invitation", "firm-branded-pages"]
- **implementationProblem:** Without firm-first chrome, the contact cannot trust who is asking and may treat Om Coda as the sender.
- **implementation:** On Opt-in message, Nudge message, Meeting invitation, and Consent request, view the firm name as the on-whose-behalf row with mailing/contact coordinate fields; Om Coda appears only as a send-platform chip where disclosure requires it.
- **Does not change Core Function:** Agree / Ignore and deeper-collection unlock stay the same; chrome only identifies the firm.

### `contact-furnish-02` — After-Agree path preview
- **Supporting affordance:** Short “what happens next” panel on Consent request before affirmative Agree commits.
- **SurfaceIds:** ["consent-request"]
- **implementationProblem:** Agree feels unbounded when the next nudge / facts step is invisible.
- **implementation:** On Consent request, view the After-Agree path panel listing that deeper self-reportable forms may follow and that Silence / Opt out remains available; then select the unchecked Affirmative Agree checkbox and click Agree.
- **Does not change Core Function:** Still Agree or Ignore before deeper collection; preview is supporting copy only.

### `contact-furnish-03` — Silence on open forms
- **Supporting affordance:** Persistent Silence / Opt out control in Nudge form, Update facts, and Loop-closer form chrome.
- **SurfaceIds:** ["nudge-form", "update-facts", "loop-closer-form", "silence-opt-out"]
- **implementationProblem:** Mid-form contacts cannot withdraw without hunting a different message footer.
- **implementation:** On Nudge form, Update facts, and Loop-closer form, click Silence / Opt out in the form footer; confirm if prompted. That commit writes the same silenced state as channel-footer Silence.
- **Does not change Core Function:** Silence still stops automatic outreach; location expands, Core stop semantics unchanged.

### `contact-furnish-04` — Resume draft banner
- **Supporting affordance:** Resume / continue draft banner when returning to an incomplete Nudge form or Update facts.
- **SurfaceIds:** ["nudge-form", "update-facts", "nudge-message"]
- **implementationProblem:** Interrupted answers force a blank restart and drop outstanding progress.
- **implementation:** Starting from the firm-branded Nudge message or Update facts link, open Nudge form / Update facts; when a prior draft exists, click Continue draft on the resume banner to restore typed/selected self-reportable fields, then click Submit.
- **Does not change Core Function:** Still one consolidated self-reportable submit path; draft is supporting continuity.

### `contact-furnish-05` — Consultant host on Booking
- **Supporting affordance:** Named consultant / firm host identity on Meeting invitation and Booking before Confirm booking.
- **SurfaceIds:** ["meeting-invitation", "booking"]
- **implementationProblem:** Anonymous slots hide that the meeting is with their consultant.
- **implementation:** On Meeting invitation and Booking, view the Consultant host row (name + firm) above the Slot picker; then select a slot and click Confirm booking.
- **Does not change Core Function:** Book-a-time → slot → confirm path unchanged; host identity is furniture.

### `contact-furnish-06` — Language / dated-fact helper
- **Supporting affordance:** Helper text on dated self-reportable fields that names test date vs validity / expiry window in plain language.
- **SurfaceIds:** ["nudge-form", "update-facts", "loop-closer-form"]
- **implementationProblem:** Contacts guess whether to enter exam day, expiry, or “still valid.”
- **implementation:** On Nudge form, Update facts, and Loop-closer form, view helper text under language-test and similar date fields clarifying test date vs validity window; enter values in the date fields and click Submit. No document upload fields appear.
- **Does not change Core Function:** Still self-reportable-only collection; helpers do not add document-dependent asks.

### `contact-furnish-07` — Channel-scope segmented control
- **Supporting affordance:** Email / SMS / multi-channel scope control at Agree time.
- **SurfaceIds:** ["consent-request"]
- **implementationProblem:** A single Agree silently authorizes every channel.
- **implementation:** On Consent request, set Channel scope with the segmented control (Email, SMS, or disclosed multi-channel), select the Affirmative Agree checkbox, then click Agree.
- **Does not change Core Function:** Agree still unlocks deeper collection under the chosen scope; scope is supporting consent furniture.

### `contact-furnish-08` — Ignore vs Silence clarify row
- **Supporting affordance:** Plain distinction row for Ignore versus Silence / Opt out on Consent request.
- **SurfaceIds:** ["consent-request", "silence-opt-out"]
- **implementationProblem:** Contacts conflate “not now” with “stop forever.”
- **implementation:** On Consent request, view the Ignore policy row (no express consent / no deeper forms; optional firm policy note) beside Silence / Opt out; click Ignore or Silence / Opt out intentionally.
- **Does not change Core Function:** Agree / Ignore / Silence outcomes unchanged; clarify copy only.

### `contact-furnish-09` — Split CEM / collection purpose panels
- **Supporting affordance:** Split disclosure panels for CEM consent and PIPEDA self-reportable immigration-fact purposes.
- **SurfaceIds:** ["consent-request", "nudge-form"]
- **implementationProblem:** One Agree conflates messaging consent with deeper PI collection.
- **implementation:** On Consent request, view CASL CEM purpose and PIPEDA collection-purpose panels; include both purpose chips in the Affirmative Agree checkbox before Nudge form unlocks.
- **Does not change Core Function:** Still agree-before-deeper-collection; split disclosure is supporting honesty furniture.

### `contact-furnish-10` — Link state page
- **Supporting affordance:** Expired / already-used / wrong-purpose states for consent, form, booking, and prepared-workspace-adjacent links.
- **SurfaceIds:** ["consent-request", "nudge-form", "booking", "prepared-workspace-adjacent", "firm-branded-pages"]
- **implementationProblem:** Dead tokens fail blankly or open the wrong purpose surface.
- **implementation:** On redeem of a firm-branded link, view Link state (Valid, Expired, Already used, or Wrong purpose) with a firm-safe next step; Valid continues to Consent request, Nudge form, Booking, or the declared adjacent page only.
- **Does not change Core Function:** Core leaves still open only when the token is valid for that purpose.

### `contact-furnish-11` — Not-me / wrong-person control
- **Supporting affordance:** Wrong-person / not-me exit on Consent request and form chrome.
- **SurfaceIds:** ["consent-request", "nudge-form", "opt-in-message", "silence-opt-out"]
- **implementationProblem:** Wrong recipients can only Ignore or invent answers about someone else.
- **implementation:** On Consent request or Nudge form, click Not me / Wrong person; confirm. That commit stops deeper collection for this send and records a wrong-recipient signal without writing immigration facts.
- **Does not change Core Function:** Agree / Ignore / Submit paths remain; Not me is an adjacent supporting exit.

### `contact-furnish-12` — Already-held vs outstanding strip
- **Supporting affordance:** Read-only already-held strip beside outstanding self-reportable fields.
- **SurfaceIds:** ["nudge-form", "update-facts", "loop-closer-form"]
- **implementationProblem:** Full blank forms look like net-new intake.
- **implementation:** On Nudge form, Update facts, and Loop-closer form, view Already held as read-only chips and Outstanding as editable self-reportable fields; edit only outstanding fields and click Submit.
- **Does not change Core Function:** Still one consolidated outstanding form; strip is glance furniture.

### `contact-furnish-13` — Self-reportable-only legend
- **Supporting affordance:** Legend that this touchpoint asks only self-reportable answers — never document uploads.
- **SurfaceIds:** ["nudge-form", "loop-closer-form", "update-facts"]
- **implementationProblem:** Contacts stall waiting for letters, bank proofs, or certificates.
- **implementation:** On Nudge form, Loop-closer form, and Update facts, view the Self-reportable only legend; form fields stay text / dropdown / checkbox / date — no upload controls.
- **Does not change Core Function:** Self-reportable-only rule already Core; legend makes it visible.

### `contact-furnish-14` — Silence confirmation receipt
- **Supporting affordance:** Immediate confirmation state after Silence / Opt out or SMS STOP keyword honor.
- **SurfaceIds:** ["silence-opt-out", "opt-in-message", "nudge-message"]
- **implementationProblem:** Withdrawal feels unacknowledged; contacts keep expecting more CEMs.
- **implementation:** After clicking Silence / Opt out (or when SMS STOP is recorded), view the Silence confirmation receipt stating automatic firm messages will stop; no further Agree is implied.
- **Does not change Core Function:** Silenced state write and runner honor unchanged; receipt is supporting feedback.

### `contact-furnish-15` — Reschedule / cancel on confirm
- **Supporting affordance:** Reschedule and Cancel controls on booking confirmation under the same firm brand.
- **SurfaceIds:** ["booking", "meeting-invitation"]
- **implementationProblem:** Booked contacts must invent an email thread to move the slot.
- **implementation:** On Booking confirm, click Reschedule to reopen the Slot picker or click Cancel booking; Confirm booking / cancel commits still write meeting state the Consultant Meetings rows read.
- **Does not change Core Function:** Initial book path unchanged; reschedule/cancel are supporting post-book furniture.

### `contact-furnish-16` — Meeting purpose line
- **Supporting affordance:** One short firm-authored purpose line on Meeting invitation / Booking chrome.
- **SurfaceIds:** ["meeting-invitation", "booking"]
- **implementationProblem:** Invitations feel abrupt without a plain why-meet signal.
- **implementation:** On Meeting invitation and Booking, view the Meeting purpose line above Book a time / Slot picker; then select a slot and click Confirm booking.
- **Does not change Core Function:** Invitation → book → confirm unchanged; purpose is supporting copy.

### `contact-furnish-17` — Purpose chip vs prepared workspace
- **Supporting affordance:** Purpose chip that labels contact touchpoints separately from prepared-workspace-adjacent firm activation pages.
- **SurfaceIds:** ["prepared-workspace-adjacent", "consent-request", "firm-branded-pages"]
- **implementationProblem:** Activation preview pages and client consent/facts pages bleed into one another.
- **implementation:** On prepared-workspace-adjacent firm pages, view a Prepared workspace purpose chip; on Consent request and contact firm-branded pages, view a Client touchpoint purpose chip — Authorize book controls never appear on contact Consent / Nudge / Booking.
- **Does not change Core Function:** Contact Agree / form / book leaves stay contact-only; chip prevents purpose confusion.

### `contact-furnish-18` — SMS STOP instruction strip
- **Supporting affordance:** On SMS CEMs, STOP / Unsubscribe reply instructions that map to the same Silence ledger as in-page Silence / Opt out.
- **SurfaceIds:** ["opt-in-message", "nudge-message", "silence-opt-out"]
- **implementationProblem:** SMS contacts do not see that keywords equal the web Silence control.
- **implementation:** On Opt-in message and Nudge message when the channel is SMS, view the STOP / Unsubscribe instruction strip; keyword honor writes the same silenced chip as Silence / Opt out.
- **Does not change Core Function:** Silence semantics unchanged; SMS copy is channel furniture.

### `contact-furnish-19` — Outstanding fields progress
- **Supporting affordance:** Progress count of outstanding self-reportable fields remaining on Nudge form / Loop-closer form.
- **SurfaceIds:** ["nudge-form", "loop-closer-form", "update-facts"]
- **implementationProblem:** Long consolidated forms hide how much is left.
- **implementation:** On Nudge form, Loop-closer form, and Update facts, view Outstanding remaining as a progress count that updates as fields are completed; click Submit when remaining is clear or all required outstanding are filled.
- **Does not change Core Function:** Submit still writes facts; progress is supporting glance chrome.

### `contact-furnish-20` — Facts-already-on-file chip at book
- **Supporting affordance:** “Firm already holds your current facts” chip on Booking confirm when Loop-closer has nothing outstanding (or after Loop-closer Submit).
- **SurfaceIds:** ["booking", "loop-closer-form"]
- **implementationProblem:** Contacts fear re-explaining their whole story at the meeting.
- **implementation:** On Booking confirm (and after Loop-closer form Submit), view the Facts already on file chip when outstanding self-reportables are clear; if outstanding remain, Loop-closer form fields stay visible until Submit.
- **Does not change Core Function:** Loop-closer still captures outstanding self-reportables for Live brief; chip is reassurance furniture.
