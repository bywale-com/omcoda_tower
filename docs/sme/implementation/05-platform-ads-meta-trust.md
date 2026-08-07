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
On Approach campaigns, click the Campaign row and open the Claim dictionary panel; select the Claim shape dropdown to deliverable-bounded readiness: prepared campaign workspace from public firm facts plus named agent follow-up.
In the Claim dictionary panel, view Forbidden terms chips for roi-claim, revenue-claim, bookings-guaranteed, and clients-already-held; click Save claim only when none appear in copy — Save claim stays disabled while any chip is present.

**implementationAdds:** ["deliverable-bounded", "roi-claim", "revenue-claim", "bookings-guaranteed", "clients-already-held"]

---

### ads-02 — Personal attributes on professional B2B creative

**implementationProblem:**
Niche targeting tempts “you’re an immigration consultant who…” stacks. That implies personal attributes Meta bans and reads as feed creepiness to the consultant.

**implementation:**
On Approach campaigns, click the Campaign row, open the Claim dictionary panel, and select the Creative grammar segmented control to product-service-forward: what the tap yields for a firm desk.
View the You-attribute blocker panel chips for role anxiety, financial vulnerability, and identity; click Review copy to flag any direct "you are..." stack before Operator would like to publish the creative to Meta from this campaign.

**implementationAdds:** ["product-service-forward", "you-attribute"]

---

### ads-03 — Landing / destination continuity for “prepared campaign”

**implementationProblem:**
Ad promises a prepared campaign; if capture ends on thank-you theater, sales CTA, or empty shell, Meta destination-match and consultant check both treat the claim as bait.

**implementation:**
On Capture strip, type Intro text area and Ending message text area copy that matches the Campaign row's Claim dictionary deliverable chip and agent-follow chip.
In the Ending controls panel, view the Completion CTA list allowing only continue-scroll or prepared-workspace deep link; book-a-call and buy-credits chips stay blocked.

**implementationAdds:** ["claim-capture-continuity"]

---

### ads-04 — Free / “no cost” framing vs free-scheme scam species

**implementationProblem:**
Acquisition copy that screams FREE / ZERO-RISK clusters with Meta free-scheme enforcement while contingent cost lives only in activation. True deliverable gets lost inside scam-species language.

**implementation:**
On Approach campaigns, in the Claim dictionary panel, type legible deliverable copy in the Deliverable name field such as "prepared campaign from your public site"; view Free-scheme guard chips on free and zero-risk in proposed text.
Set the Money posture field to activation-only; Operator would like to publish the variant to Meta from this campaign only when no ad-copy money claim appears in Claim dictionary copy.

**implementationAdds:** ["legible-deliverable", "free-scheme", "zero-risk"]

---

### ads-05 — Non-existent functionality: agent as presentation only

**implementationProblem:**
“AI agent builds and runs your reactivation” is outsized but false under Seed — agent is presentation; automation executes. Review and consultant both punish the overclaim.

**implementation:**
On Approach campaigns, in the Claim dictionary panel, select the Agent role dropdown to agent-follows / walks-through prepared workspace only.
View Agent overclaim blocker panel chips for agent-scrapes, agent-enrolls, and agent-runs-sequences; Operator would like to publish the variant to Meta from this campaign only when no overclaim blocker chip is active.

**implementationAdds:** ["agent-follows", "agent-scrapes", "agent-enrolls", "agent-runs-sequences"]

---

### ads-06 — Instant Form as one-tap capture vehicle

**implementationProblem:**
Seed requires name + website + channel; Meta Instant Form wants few questions + prefills. Website is not a standard prefill and threatens the one-tap budget if the form balloons.

**implementation:**
On Capture strip, keep exactly three rows in the Fields list: Prefill name, Channel radio group (email or phone), and Website short-answer field.
Set the Form type dropdown to seed-minimum; click Add question only when the Friction ladder panel records completion collapse — otherwise Add question stays disabled.

**implementationAdds:** ["prefill-name", "channel", "website-short-answer"]

---

### ads-07 — Prohibited Instant Form questions (do not smuggle activation)

**implementationProblem:**
Temptation to qualify via CRM login, passwords, revenue, or government IDs would violate Lead Ads Standards and pull DB/escrow into acquisition click budget.

**implementation:**
On Capture strip, view locked Never-ask list panel chips for usernames/passwords, financials, government IDs, and DB-upload proxy.
The Fields list accepts only Name, Website, and Channel rows; click Add field rejects any question mapped to a locked Never-ask chip.

**implementationAdds:** ["never-ask", "password", "financials", "government-id", "db-upload-proxy"]

---

### ads-08 — Website field quality without multi-step theater

**implementationProblem:**
Usable firm website is required for forward-deploy credibility, but multi-screen qualification reintroduces persuasion theater and Meta short-answer completion risk.

**implementation:**
On Capture strip, mark Website short-answer as the only typed firm-fact row in the Fields list; Add branch stays disabled for "do you have a site?" screens.
Turn the URL repair toggle off in the Form behavior panel; view post-capture fail-closed chips on malformed Website entries instead of routing through additional Meta form screens.

**implementationAdds:** ["website-only-typed", "post-capture-normalize"]

---

### ads-09 — Channel choice: phone vs email on Meta (KU #8)

**Skipped — NEEDS VERIFICATION** (KU #8 measure; do not assume cold-email Approach).

---

### ads-10 — Privacy policy URL + reasonably prominent notice as trust, not theater

**implementationProblem:**
Lead Ads Terms require a live privacy URL and prominent notice; consultants also need to know why name/site/channel are taken — without turning Capture into legal theater.

**implementation:**
On Capture strip, type a live HTTPS URL in the Privacy policy URL field; the field validator rejects PDF and non-HTTPS destinations.
Type Prominent notice text area copy naming only two purpose chips: provision prepared workspace and agent follow-up on the stated channel.

**implementationAdds:** ["privacy-https", "prominent-notice", "purpose-workspace", "purpose-agent-follow"]

---

### ads-11 — Intro section as legibility (ad job = understand output)

**implementationProblem:**
Ad job is make one-tap output legible, never persuade. Meta intro “what you receive” slides easily into testimonials, urgency, and ROI hype.

**implementation:**
On Capture strip, fill the Intro editor three required rows: Prepared object, Inputs used (public site + given seed), and Agent follow channel.
View Copy guard panel blocking testimonials, urgency, and ROI chips; click Save Intro only when Copy guard is clear.

**implementationAdds:** ["intro-three-facts"]

---

### ads-12 — Pre-frame agent-follows without spam feel

**implementationProblem:**
Without explicit pre-frame, first agent text fails consultant trust and sits adjacent to CEM posture as unsolicited spam.

**implementation:**
On Capture strip, require the same Channel chip and purpose text "walkthrough of prepared campaign" in the Intro editor, Prominent notice text area, and Ending message text area before Save strip enables.
The Purpose lock panel sets agent-follow to expected contact for that stated purpose only; click Save strip refuses unrelated purpose chips.

**implementationAdds:** ["pre-frame-agent-follow", "expected-contact"]

---

### ads-13 — Ending / completion screen: continue-scroll, not thank-you dashboard

**implementationProblem:**
Meta completion CTAs push website / book-time; Seed wants continue-scroll + agent comes to them. Ending that becomes a sales peer door breaks ALG shape and Founder §14.

**implementation:**
On Capture strip, type Ending message text area copy confirming agent-follow; enable the Prepared workspace deep-link toggle when the workspace is ready.
View the Completion CTA list blocking book-a-call and buy-credits rows; continue-scroll remains the default completion action configured for Meta delivery.

**implementationAdds:** ["agent-follow-confirm", "workspace-deep-link", "book-a-call", "buy-credits"]

---

### ads-14 — Lead response latency as trust + quality (not desk redesign)

**implementationProblem:**
Pre-frame promises near-immediate agent follow. If ads run while outbound is dark, latency reads as scam/spam and Meta lead quality decays — without any desk redesign fixing it.

**implementation:**
On Approach campaigns, view the Campaign row Outbound readiness panel Lead pull status chip and First agent text status chip.
Click Arm ads only when both chips read live — Arm ads stays disabled until the near-real-time lead pull → first agent text path is ready.

**implementationAdds:** ["outbound-ready", "outbound-dark"]

---

### ads-15 — Instrumentation: don’t-understand vs understand-don’t-tap

**implementationProblem:**
Seed requires both disbelief modes; Meta does not expose “understood.” Without proxies, Operator cannot split creative failure from offer decline.

**implementation:**
On Approach instrumentation, view Proxy pair table row A with columns impression, no form open, and Intro bounce; its verdict chip reads don't-understand-or-disbelieve-claim.
View Proxy pair table row B with columns form open, Intro complete, abandon before submit, and submit then silence; its verdict chip reads understand-enough-don't-commit.

**implementationAdds:** ["dont-understand", "understand-dont-commit", "intro-bounce", "submit-silence"]

---

### ads-16 — Creative tests as understanding instruments (not persuasion A/B)

**implementationProblem:**
Classic ads A/B optimizes CTR/persuasion. ALG needs which claim phrasing makes the deliverable understood — vanity CTR alone teaches the wrong lesson.

**implementation:**
On Approach campaigns, lock the Deliverable chip in the Variant matrix panel; edit only Claim phrasing field and Intro clarity field per Variant row.
On Approach instrumentation, view Variant score table with form-open rate and intro-complete rate columns ahead of CTR; click Promote variant only when form-open and intro-complete win — CTR-only winners are ignored.

**implementationAdds:** ["variant-matrix", "form-open", "intro-complete"]

---

### ads-17 — Continue-scroll as allowed disbelief (cheap check)

**implementationProblem:**
High ignore can mean bad targeting, bad claim, or healthy self-selection. Treating continue-scroll as failure pushes Operator into persuasion spend against Seed’s cheap-check doctrine.

**implementation:**
On Approach instrumentation, view the Continue-scroll row marking non-open with a self-selection chip; Spend escalation stays disabled for that row alone.
View the Escalation rule panel enabling only when form-open health chip and submit health chip diverge, in either direction.

**implementationAdds:** ["continue-scroll", "self-selection"]

---

### ads-18 — Targeting realism for immigration consultants (KU #3)

**Skipped — NEEDS VERIFICATION** (KU #3 / Special Ad misfit & CAC realism; counsel if category forced).

---

### ads-19 — Early falsifiers for Meta door (cheap learn)

**implementationProblem:**
Growth bet says learn on ads + planted click-through, but without pre-declared kill/continue signals product time absorbs a dead Meta door.

**implementation:**
On Approach instrumentation, open the Kill / continue criteria panel and fill threshold fields for qualified cost per seed capture, valid-website percent, first-text-answered percent, and prepared-workspace-open percent.
View the Door verdict list marking falsified only when seed CAC or quality threshold rows fail while the Claim legibility chip is already green.

**implementationAdds:** ["kill-continue", "seed-cac", "valid-website-pct", "first-text-answered-pct", "workspace-open-pct"]

---

### ads-20 — Maximize leads vs qualified leads (quality vs click budget)

**implementationProblem:**
Maximize leads cheapens CAC optics; garbage websites break provision credibility. Cheap volume fakes acquisition success.

**implementation:**
On Approach campaigns, view Conversion signal chip and CRM signal chip on the Campaign row; when both are present, set Performance goal intent to maximize-qualified-leads — Operator would like to set maximize-qualified-leads in Meta for this campaign.
Until those chips exist, keep tight geo intent fields on the Campaign row and the Website-required Capture strip chip locked; Operator would like to apply tight geo targeting in Meta only after qualified-lead signals land — bad domains rejected off-form by provision.

**implementationAdds:** ["maximize-qualified-leads", "maximize-leads"]

---

### ads-21 — Account authenticity / verification under scam-category watch

**implementationProblem:**
Immigration/finance-adjacent categories draw scam-watch verification. Approach dies if Business/Page assets are inauthentic or inconsistent with Om Coda identity.

**implementation:**
Starting from Acquisition & ads, open the Account hygiene panel; view Business verification chip and Page verification chip synced from Meta — Operator may click Open in Meta Business Settings deep link to complete verification there.
Fill Creative identity field and Domain identity field in Account hygiene to match Om Coda identity; click Arm ads only when both identity rows match — Arm ads blocks inconsistent rows.

**implementationAdds:** ["verified-business", "verified-page"]

---

### ads-22 — No cloaking / bait destination swaps

**implementationProblem:**
Mild review destination + hard-sell live destination is cloaking — instant policy fail and consultant betrayal on the same claim object.

**implementation:**
On Approach campaigns, turn on Destination freeze toggle for the Campaign row; it pins the Capture strip selector and Claim dictionary version field across Meta review and delivery phases.
After approval, Capture strip selector and Claim dictionary version field become read-only in-app, blocking post-approval bait swaps before Operator would like to resume delivery in Meta.
Name the phases themselves as status chips — Campaign review state (draft/in_review/approved/rejected) and Campaign delivery state (not_started/scheduled/active/paused/ended) — so Destination freeze has explicit states to pin across, not just an implicit before/after.

**implementationAdds:** ["destination-freeze", "bait-swap", "review-state-chip", "delivery-state-chip"]

---

### ads-23 — Firm identity claim without implying client-list possession

**implementationProblem:**
“Under your firm identity” can be read as Om Coda already holds or scrapes the firm’s client book — false, scammy, and activation-boundary breaking.

**implementation:**
On Approach campaigns, in the Claim dictionary panel, select Firm identity source dropdown to public branding / site facts only.
View Client book requirement chip locked to never-required-at-tap; Operator would like to publish the variant to Meta from this campaign only when copy does not imply existing client-list possession.

**implementationAdds:** ["public-branding-only", "never-required-at-tap"]

---

### ads-24 — Work-email / phone verification features vs friction budget

**implementationProblem:**
Meta phone OTP / work-email validation raise lead quality but each step burns the one-tap constraint. Enabling by default violates Seed’s force-one-click; relax only as finding.

**implementation:**
On Capture strip, view Friction ladder panel with Phone verification toggle and Work-email validation toggle defaulted off.
Unlock Phone verification toggle only when Bot/junk rate row shows seed-quality-failed chip; otherwise click Save strip preserves one-tap capture configuration.

**implementationAdds:** ["friction-ladder", "phone-verification-off", "phone-verification-on"]

---

### ads-25 — Lead data use purpose-lock (first-text adjacency only)

**implementationProblem:**
Meta Terms: use lead data only for stated purpose. Without purpose-lock, capture drifts into resale, unrelated nurture, or end-client messaging — breaking ads Terms and first-text adjacency (seat 3 owns CEM substance).

**implementation:**
On Capture strip, select Purpose lock dropdown to activation-walkthrough-only; view locked exclusion chips no-resale, no-unrelated-nurture, and no-end-client-messaging.
Require the same Purpose lock chip in Intro editor, Prominent notice text area, and Ending message text area before Operator would like to submit the Instant Form configuration in Meta.

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
| **Approach campaigns** (Claim dictionary, Variant matrix, Performance goal intent, Outbound readiness, Destination freeze) | ads-01, 02, 04, 05, 14, 16, 20, 22, 23 |
| **Capture strip** (fields, Intro, Ending, notice, Purpose lock, Friction ladder) | ads-03, 06, 07, 08, 10, 11, 12, 13, 24, 25 |
| **Approach instrumentation** (Proxy pair, Kill / continue, continue-scroll) | ads-15, 16, 17, 19 |
| **Acquisition & ads** → **Account hygiene** | ads-21 |

### Invented labels (beyond vocab parents)

Claim dictionary · Creative grammar · Intro · Ending message · Prominent notice · Privacy policy URL · Never-ask list · Purpose lock · Outbound readiness · Variant matrix · Proxy pair · Kill / continue criteria · Performance goal intent · Account hygiene · Destination freeze · Friction ladder
