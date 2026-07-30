# PM implementation — Platform ads / Meta policy & feed trust (seat 5)

**Source:** `pass2/05-platform-ads-meta-trust.md`  
**Vocab:** `implementation/00-SURFACE-VOCAB.md`  
**Style:** implementationProblem / implementation / implementationAdds (paper only — no CT plant)  
**Skipped (NEEDS VERIFICATION):** `ads-09` (KU #8), `ads-18` (KU #3)

**Surfaces in play:** Acquisition & ads · Approach campaigns · Capture strip · Approach instrumentation

---

### ads-01 — Outsized-but-true claim shape vs Unacceptable Business Practices

**implementationProblem:**
Approach creative has no bound claim object — ROI, revenue, “bookings guaranteed,” or “we already have your clients” can pass into feed. Review and skeptical consultants then test different objects; one rejects exaggeration, the other disbelieves bait.

**implementation:**
On Approach campaigns, you can now set Claim dictionary to deliverable-bounded readiness: prepared campaign workspace from public firm facts plus named agent follow-up.
On Approach campaigns, Claim dictionary forbids roi-claim, revenue-claim, bookings-guaranteed, and clients-already-held language.

**implementationAdds:** ["deliverable-bounded", "roi-claim", "revenue-claim", "bookings-guaranteed", "clients-already-held"]

---

### ads-02 — Personal attributes on professional B2B creative

**implementationProblem:**
Niche targeting tempts “you’re an immigration consultant who…” stacks. That implies personal attributes Meta bans and reads as feed creepiness to the consultant.

**implementation:**
On Approach campaigns, you can now set Claim dictionary Creative grammar to product-service-forward — what the tap yields for a firm desk.
On Approach campaigns, Claim dictionary blocks you-attribute stacks (role anxiety, financial vulnerability, identity).

**implementationAdds:** ["product-service-forward", "you-attribute"]

---

### ads-03 — Landing / destination continuity for “prepared campaign”

**implementationProblem:**
Ad promises a prepared campaign; if capture ends on thank-you theater, sales CTA, or empty shell, Meta destination-match and consultant check both treat the claim as bait.

**implementation:**
On Capture strip, you can now set Intro and Ending message to restate the same readiness deliverable and agent-follow as Claim dictionary.
On Capture strip, Ending message has no peer sales-call or credits door.

**implementationAdds:** ["claim-capture-continuity"]

---

### ads-04 — Free / “no cost” framing vs free-scheme scam species

**implementationProblem:**
Acquisition copy that screams FREE / ZERO-RISK clusters with Meta free-scheme enforcement while contingent cost lives only in activation. True deliverable gets lost inside scam-species language.

**implementation:**
On Approach campaigns, Claim dictionary prefers legible deliverable naming (“prepared campaign from your public site”) over free / zero-risk sensationalism.
On Approach campaigns, money posture stays out of Claim dictionary — reserved for activation, not ads.

**implementationAdds:** ["legible-deliverable", "free-scheme", "zero-risk"]

---

### ads-05 — Non-existent functionality: agent as presentation only

**implementationProblem:**
“AI agent builds and runs your reactivation” is outsized but false under Seed — agent is presentation; automation executes. Review and consultant both punish the overclaim.

**implementation:**
On Approach campaigns, Claim dictionary describes agent as agent-follows / walks-through prepared workspace only.
On Approach campaigns, Claim dictionary never claims agent-scrapes, agent-enrolls, or agent-runs-sequences.

**implementationAdds:** ["agent-follows", "agent-scrapes", "agent-enrolls", "agent-runs-sequences"]

---

### ads-06 — Instant Form as one-tap capture vehicle

**implementationProblem:**
Seed requires name + website + channel; Meta Instant Form wants few questions + prefills. Website is not a standard prefill and threatens the one-tap budget if the form balloons.

**implementation:**
On Capture strip, you can now set fields to Prefill name, one Channel (email or phone), and one short-answer Website.
On Capture strip, question count stays at the seed minimum — no higher-intent form type unless completion collapses.

**implementationAdds:** ["prefill-name", "channel", "website-short-answer"]

---

### ads-07 — Prohibited Instant Form questions (do not smuggle activation)

**implementationProblem:**
Temptation to qualify via CRM login, passwords, revenue, or government IDs would violate Lead Ads Standards and pull DB/escrow into acquisition click budget.

**implementation:**
On Capture strip, you can now see Never-ask list: usernames/passwords, financials, government IDs, and any DB-upload proxy stay off Instant Form questions.
On Capture strip, only seed fields (name, website, channel) are askable.

**implementationAdds:** ["never-ask", "password", "financials", "government-id", "db-upload-proxy"]

---

### ads-08 — Website field quality without multi-step theater

**implementationProblem:**
Usable firm website is required for forward-deploy credibility, but multi-screen qualification reintroduces persuasion theater and Meta short-answer completion risk.

**implementation:**
On Capture strip, Website short-answer is the only typed firm fact — no multi-screen “do you have a site?” branch.
On Capture strip, URL repair stays off the form; bad URLs fail closed after capture, not via more Instant Form screens.

**implementationAdds:** ["website-only-typed", "post-capture-normalize"]

---

### ads-09 — Channel choice: phone vs email on Meta (KU #8)

**Skipped — NEEDS VERIFICATION** (KU #8 measure; do not assume cold-email Approach).

---

### ads-10 — Privacy policy URL + reasonably prominent notice as trust, not theater

**implementationProblem:**
Lead Ads Terms require a live privacy URL and prominent notice; consultants also need to know why name/site/channel are taken — without turning Capture into legal theater.

**implementation:**
On Capture strip, you can now set Privacy policy URL to a live HTTPS policy (not PDF).
On Capture strip, you can now set Prominent notice naming purposes: provision prepared workspace + agent follow-up on the stated channel only.

**implementationAdds:** ["privacy-https", "prominent-notice", "purpose-workspace", "purpose-agent-follow"]

---

### ads-11 — Intro section as legibility (ad job = understand output)

**implementationProblem:**
Ad job is make one-tap output legible, never persuade. Meta intro “what you receive” slides easily into testimonials, urgency, and ROI hype.

**implementation:**
On Capture strip, Intro is constrained to three facts: what is prepared, from which inputs (public site + given seed), and that an agent will follow on the channel.
On Capture strip, Intro has no testimonials, urgency, or ROI copy.

**implementationAdds:** ["intro-three-facts"]

---

### ads-12 — Pre-frame agent-follows without spam feel

**implementationProblem:**
Without explicit pre-frame, first agent text fails consultant trust and sits adjacent to CEM posture as unsolicited spam.

**implementation:**
On Capture strip, Intro, Prominent notice, and Ending message name channel and purpose (“walkthrough of prepared campaign”) before submit.
On Capture strip, Purpose lock marks agent-follow as expected contact for that stated purpose only.

**implementationAdds:** ["pre-frame-agent-follow", "expected-contact"]

---

### ads-13 — Ending / completion screen: continue-scroll, not thank-you dashboard

**implementationProblem:**
Meta completion CTAs push website / book-time; Seed wants continue-scroll + agent comes to them. Ending that becomes a sales peer door breaks ALG shape and Founder §14.

**implementation:**
On Capture strip, Ending message confirms agent-follow and may offer optional deep link to prepared workspace when ready.
On Capture strip, Ending message never offers book-a-call or buy-credits as peer CTAs.

**implementationAdds:** ["agent-follow-confirm", "workspace-deep-link", "book-a-call", "buy-credits"]

---

### ads-14 — Lead response latency as trust + quality (not desk redesign)

**implementationProblem:**
Pre-frame promises near-immediate agent follow. If ads run while outbound is dark, latency reads as scam/spam and Meta lead quality decays — without any desk redesign fixing it.

**implementation:**
On Approach campaigns, you can now see Outbound readiness before ads are armed.
On Approach campaigns, you can now arm supply only when near-real-time lead pull → first agent text path is live.

**implementationAdds:** ["outbound-ready", "outbound-dark"]

---

### ads-15 — Instrumentation: don’t-understand vs understand-don’t-tap

**implementationProblem:**
Seed requires both disbelief modes; Meta does not expose “understood.” Without proxies, Operator cannot split creative failure from offer decline.

**implementation:**
On Approach instrumentation, you can now read Proxy pair A: impression → no form open / bounce at Intro = don’t-understand-or-disbelieve-claim.
On Approach instrumentation, you can now read Proxy pair B: form open / Intro complete → abandon before submit, or submit then silence = understand-enough-don’t-commit.

**implementationAdds:** ["dont-understand", "understand-dont-commit", "intro-bounce", "submit-silence"]

---

### ads-16 — Creative tests as understanding instruments (not persuasion A/B)

**implementationProblem:**
Classic ads A/B optimizes CTR/persuasion. ALG needs which claim phrasing makes the deliverable understood — vanity CTR alone teaches the wrong lesson.

**implementation:**
On Approach campaigns, you can now set Variant matrix that holds deliverable constant and varies only claim phrasing / Intro clarity.
On Approach instrumentation, you can now score variants on form-open and intro-complete rates (not vanity CTR alone).

**implementationAdds:** ["variant-matrix", "form-open", "intro-complete"]

---

### ads-17 — Continue-scroll as allowed disbelief (cheap check)

**implementationProblem:**
High ignore can mean bad targeting, bad claim, or healthy self-selection. Treating continue-scroll as failure pushes Operator into persuasion spend against Seed’s cheap-check doctrine.

**implementation:**
On Approach instrumentation, continue-scroll / non-open reads as valid self-selection — not a spend-escalation trigger by itself.
On Approach instrumentation, you can now escalate only when form-open is healthy but submit is not (or the inverse).

**implementationAdds:** ["continue-scroll", "self-selection"]

---

### ads-18 — Targeting realism for immigration consultants (KU #3)

**Skipped — NEEDS VERIFICATION** (KU #3 / Special Ad misfit & CAC realism; counsel if category forced).

---

### ads-19 — Early falsifiers for Meta door (cheap learn)

**implementationProblem:**
Growth bet says learn on ads + planted click-through, but without pre-declared kill/continue signals product time absorbs a dead Meta door.

**implementation:**
On Approach instrumentation, you can now set Kill / continue criteria on: qualified cost per seed capture, % captures with valid website, % first-text answered, % reaching prepared-workspace open.
On Approach instrumentation, you can now falsify the door when seed CAC or quality fails while claim variants are already legible.

**implementationAdds:** ["kill-continue", "seed-cac", "valid-website-pct", "first-text-answered-pct", "workspace-open-pct"]

---

### ads-20 — Maximize leads vs qualified leads (quality vs click budget)

**implementationProblem:**
Maximize leads cheapens CAC optics; garbage websites break provision credibility. Cheap volume fakes acquisition success.

**implementation:**
On Approach campaigns, you can now set Performance goal to maximize-qualified-leads once conversion/CRM signals exist.
On Approach campaigns, until those signals exist, Performance goal stays constrained by tight geo + website-required Capture strip (reject-provision bad domains off-form).

**implementationAdds:** ["maximize-qualified-leads", "maximize-leads"]

---

### ads-21 — Account authenticity / verification under scam-category watch

**implementationProblem:**
Immigration/finance-adjacent categories draw scam-watch verification. Approach dies if Business/Page assets are inauthentic or inconsistent with Om Coda identity.

**implementation:**
Starting from Acquisition & ads, you can now open Account hygiene and require verified Business + Page before Approach campaigns arm.
On Account hygiene, you can now keep creative and domain consistent with Om Coda identity across Approach campaigns.

**implementationAdds:** ["verified-business", "verified-page"]

---

### ads-22 — No cloaking / bait destination swaps

**implementationProblem:**
Mild review destination + hard-sell live destination is cloaking — instant policy fail and consultant betrayal on the same claim object.

**implementation:**
On Approach campaigns, you can now set Destination freeze: same Instant Form + same Claim dictionary object across review and delivery.
On Approach campaigns, Destination freeze blocks post-approval bait swap of Capture strip or claim object.

**implementationAdds:** ["destination-freeze", "bait-swap"]

---

### ads-23 — Firm identity claim without implying client-list possession

**implementationProblem:**
“Under your firm identity” can be read as Om Coda already holds or scrapes the firm’s client book — false, scammy, and activation-boundary breaking.

**implementation:**
On Approach campaigns, Claim dictionary bounds firm identity to public branding / site facts only.
On Approach campaigns, Claim dictionary states client book is never-required-at-tap.

**implementationAdds:** ["public-branding-only", "never-required-at-tap"]

---

### ads-24 — Work-email / phone verification features vs friction budget

**implementationProblem:**
Meta phone OTP / work-email validation raise lead quality but each step burns the one-tap constraint. Enabling by default violates Seed’s force-one-click; relax only as finding.

**implementation:**
On Capture strip, Friction ladder defaults Phone verification and work-email validation to off.
On Capture strip, you can now enable Phone verification on Friction ladder only when bot/junk rate falsifies seed quality.

**implementationAdds:** ["friction-ladder", "phone-verification-off", "phone-verification-on"]

---

### ads-25 — Lead data use purpose-lock (first-text adjacency only)

**implementationProblem:**
Meta Terms: use lead data only for stated purpose. Without purpose-lock, capture drifts into resale, unrelated nurture, or end-client messaging — breaking ads Terms and first-text adjacency (seat 3 owns CEM substance).

**implementation:**
On Capture strip, you can now set Purpose lock to activation-walkthrough-only (no resale, no unrelated nurture, no end-client messaging from this capture).
On Capture strip, Purpose lock is the stated purpose Intro, Prominent notice, and Ending message must name before submit.

**implementationAdds:** ["activation-walkthrough-only", "no-resale", "no-unrelated-nurture"]

---

## Counts

| Bucket | Count |
|---|---|
| Source items | **25** |
| Written (implementationProblem + implementation) | **23** |
| Skipped NEEDS VERIFICATION | **2** (`ads-09`, `ads-18`) |
| With implementationAdds | **23** |

### By surface (primary touch)

| Surface | Items |
|---|---|
| **Approach campaigns** (Claim dictionary, Variant matrix, Performance goal, Outbound readiness, Destination freeze) | ads-01, 02, 04, 05, 14, 16, 20, 22, 23 |
| **Capture strip** (fields, Intro, Ending, notice, Purpose lock, Friction ladder) | ads-03, 06, 07, 08, 10, 11, 12, 13, 24, 25 |
| **Approach instrumentation** (Proxy pair, Kill / continue, continue-scroll) | ads-15, 16, 17, 19 |
| **Acquisition & ads** → **Account hygiene** | ads-21 |

### Invented labels (beyond vocab parents)

Claim dictionary · Creative grammar · Intro · Ending message · Prominent notice · Privacy policy URL · Never-ask list · Purpose lock · Outbound readiness · Variant matrix · Proxy pair · Kill / continue criteria · Performance goal · Account hygiene · Destination freeze · Friction ladder
