# Pass1+Pass2 — Platform ads / Meta policy & feed trust

**Seat:** 5 — Platform ads / Meta policy & feed trust  
**Producer:** SME (domain) — not PM/CTO  
**Inputs:** Seed §0.2 · §6.2 · §8.1 · Assump. 11–13 · KU #3/#8 · SME-GRAPH seat 5 · How `operator-acquisition.md`  
**Focus gap:** Meta one-tap Approach must survive platform review **and** consultant disbelief without persuasion theater.  
**Boundaries:** Not end-client CEM consent except first-text adjacency (seat 3). Not escrow (seat 6). Not running desk. No sales-call/credits as peer activation doors.  
**Status:** Pass1+Pass2 combined · no UI  
**Item count:** 25

---

### ads-01 — Outsized-but-true claim shape vs Unacceptable Business Practices

**Question:** What claim shape keeps “one tap → prepared campaign under your firm identity” policy-safe while remaining outsized-but-true to a skeptical consultant?

**References:**
- https://transparency.meta.com/policies/ad-standards/fraud-scams/unacceptable-business-practices
- https://transparency.meta.com/policies/ad-standards/
- https://www.facebook.com/business/help/757209948405699

**Thesis gap:** Seed §8.1 / Assump. 13 need a claim that is large enough to earn a tap yet does not read as exaggerated success, free-scheme bait, or a functionality that does not exist after capture.

**Solution:** State a **deliverable-bounded readiness outcome** (prepared campaign workspace from public firm facts + named follow-up) and forbid ROI, revenue, “bookings guaranteed,” or “we already have your clients” language so that review and consultant disbelief both test the same true object.

**Handoff:** both (PM: Approach claim affordance texture; CTO: none beyond creative version tags for rejected variants)

---

### ads-02 — Personal attributes on professional B2B creative

**Question:** How must Approach creative address immigration consultants without asserting or implying personal attributes Meta bans?

**References:**
- https://transparency.meta.com/policies/ad-standards/objectionable-content/privacy-violations-personal-attributes
- https://transparency.meta.com/policies/ad-standards/
- https://www.facebook.com/business/help/757209948405699

**Thesis gap:** Targeting a professional niche tempts “you’re an immigration consultant who loses clients…” you-language that implies attributes or PII awareness — review risk and feed creepiness collide.

**Solution:** Keep creative **product/service-forward** (what the tap yields for a firm desk) and avoid you/your + attribute stacks (role anxiety, financial vulnerability, identity) so that policy and feed-trust share one creative grammar.

**Handoff:** pm (Approach copy/affordance law)

---

### ads-03 — Landing / destination continuity for “prepared campaign”

**Question:** What must be true of the post-tap surface so Meta’s destination-match / non-deceptive rules and consultant check both pass?

**References:**
- https://transparency.meta.com/policies/ad-standards/
- https://www.facebook.com/business/help/757209948405699
- https://www.facebook.com/business/help/761812391313386

**Thesis gap:** Ad promises a prepared campaign; if capture ends on a thank-you dashboard, sales CTA, or empty shell, review and disbelief both treat the claim as bait.

**Solution:** Require **claim ↔ capture ↔ continue-scroll continuity**: intro + ending message restate the same readiness deliverable and agent-follow, with no peer sales-call/credits door so that destination honesty equals Seed §6.2 Approach strip.

**Handoff:** both (PM: Capture strip + ending copy contract; CTO: provision-on-capture must be real before first agent text)

---

### ads-04 — Free / “no cost” framing vs free-scheme scam species

**Question:** Can Approach say the prepared workspace is free / zero-risk without triggering Meta’s free-scheme / exaggerated-claim enforcement clusters?

**References:**
- https://transparency.meta.com/policies/ad-standards/fraud-scams/unacceptable-business-practices
- https://transparency.meta.com/policies/ad-standards/fraud-scams/fraud-scams-deceptive-practices/

**Thesis gap:** Contingent-cost / escrow lives in activation; acquisition copy that screams “FREE for firms” clusters with scam categories Meta already watches.

**Solution:** Prefer **legible deliverable naming** (“prepared campaign from your public site”) over FREE/ZERO-RISK sensationalism; reserve money posture for activation so that acquisition avoids free-scheme species while staying true.

**Handoff:** pm (Approach claim dictionary; sync seat 6 only on what must *not* appear in ads)

---

### ads-05 — Non-existent functionality: agent as presentation only

**Question:** How should creative describe the agent so Meta does not treat “agent prepares / runs your campaign” as advertising a functionality that does not exist?

**References:**
- https://transparency.meta.com/policies/ad-standards/fraud-scams/unacceptable-business-practices
- Seed doctrine: agent = presentation; automation executes (external to Meta but binds truth of claim)

**Thesis gap:** “AI agent builds and runs your reactivation” is outsized but false under Seed — review and consultant both punish overclaim.

**Solution:** Claim **agent follows / walks you through a prepared workspace** (presentation) and never claim agent scrapes, enrolls, or runs sequences so that the advertised function matches what Automations actually do.

**Handoff:** both (PM: claim dictionary; CTO: no marketing telemetry that labels automation jobs as “agent did X”)

---

### ads-06 — Instant Form as one-tap capture vehicle

**Question:** What Instant Form pattern still yields name + website + channel inside a one-click / minimal-friction budget?

**References:**
- https://www.facebook.com/business/help/761812391313386
- https://www.facebook.com/business/help/435270316658768
- https://www.facebook.com/business/help/1019886738092553

**Thesis gap:** Seed forces name + website + phone/email; Meta best practice says few questions + prefills — website is not a standard prefill and threatens the click budget.

**Solution:** Use Instant Form with **prefill name + one channel (email or phone)** plus **one short-answer firm website field**, keep total questions at the seed minimum, and treat higher-intent form type only if completion collapses so that seed quota stays inside acquisition friction law.

**Handoff:** both (PM: Capture strip field contract; CTO: Lead webhook → provision attributes)

---

### ads-07 — Prohibited Instant Form questions (do not smuggle activation)

**Question:** Which fields are forbidden on the Approach form so DB auth, credentials, and sensitive firm data never enter click budget?

**References:**
- https://www.facebook.com/business/help/219356599612120
- https://transparency.meta.com/policies/ad-standards/
- https://www.facebook.com/business/help/829597887147190

**Thesis gap:** Temptation to qualify via CRM login, passport/IRCC, revenue, or passwords would both violate Lead Ads Standards and break Seed §14 (DB/escrow not in acquisition).

**Solution:** Hard-exclude usernames/passwords, financials, government IDs, and any DB-upload proxy from Instant Form questions so that capture stays seed-only and policy-legal.

**Handoff:** both (PM: never-ask list on Capture; CTO: reject/ignore non-seed fields if they appear)

---

### ads-08 — Website field quality without multi-step theater

**Question:** How do we get a usable firm website in one tap without multi-screen qualification that reintroduces persuasion / form theater?

**References:**
- https://www.facebook.com/business/help/435270316658768
- https://www.facebook.com/business/help/761812391313386

**Thesis gap:** Short-answer website is required for forward-deploy credibility (Assump. 12) but Meta warns short answers kill completion; multi-choice “do you have a site?” is useless for scrape.

**Solution:** Keep **one short-answer website** as the only typed firm fact; defer URL normalization/repair to post-capture automation (not more form screens) so that tap budget stays one-shot while provision can still fail-closed on bad URLs.

**Handoff:** both (PM: single website question; CTO: URL normalize + soft-fail provision path)

---

### ads-09 — Channel choice: phone vs email on Meta (KU #8)

**Question:** When should Approach collect phone vs email so agent follow-up is reachable without inventing cold-email-as-Approach?

**References:**
- https://www.facebook.com/business/help/435270316658768
- https://www.facebook.com/business/help/761812391313386
- Seed KU #8; Seed §14 cold email V1 Approach on ideas forbidden

**Thesis gap:** Prefill email is easy; SMS/voice may be better for agents; collecting both breaks friction; email-from-Meta-as-Approach is a known unknown.

**Solution:** V1 default **one channel field** (prefer phone when SMS/voice agent path is live; else email), instrument channel quality separately, and do not treat Meta-sourced email as license for cold idea blasts so that KU #8 is measured not assumed.

**Handoff:** both (PM: channel field policy; CTO: channel enum + delivery proof; sync seat 3 on first-text legality)

---

### ads-10 — Privacy policy URL + reasonably prominent notice as trust, not theater

**Question:** What disclosure stack must Instant Form carry so Lead Ads Terms and consultant trust both hold?

**References:**
- https://www.facebook.com/business/help/1247534515288168
- https://www.facebook.com/business/help/1582353715248057
- https://www.facebook.com/business/help/1019886738092553
- https://www.facebook.com/business/help/829597887147190

**Thesis gap:** Privacy URL + prominent notice are Meta requirements; consultants also need to know why name/site/channel are taken — without turning the form into legal theater.

**Solution:** Ship a **live HTTPS privacy policy URL** (not PDF) plus a short prominent notice that names purposes: provision prepared workspace + agent follow-up on the stated channel only so that Terms compliance doubles as feed-trust.

**Handoff:** both (PM: notice copy contract; CTO: policy URL uptime + lead purpose logging)

---

### ads-11 — Intro section as legibility (ad job = understand output)

**Question:** What belongs in Instant Form intro so the one-tap output is legible without persuasion copy?

**References:**
- https://www.facebook.com/business/help/435270316658768
- https://www.facebook.com/business/help/1019886738092553
- https://www.facebook.com/business/help/761812391313386

**Thesis gap:** Seed: ad job = make output legible, never persuade; Meta recommends intro for “what you receive” — easy to slide into hype.

**Solution:** Constrain intro to **three facts**: what is prepared, from which inputs (public site + given seed), that an agent will follow on the channel — no testimonials, urgency, or ROI so that intro is the instrumentation of understanding.

**Handoff:** pm (intro copy law / Approach affordance)

---

### ads-12 — Pre-frame agent-follows without spam feel

**Question:** How must the ad/form pre-frame the first agent text so it is expected contact, not unsolicited spam?

**References:**
- https://www.facebook.com/business/help/1582353715248057
- https://www.facebook.com/business/help/2246428158756947
- https://www.facebook.com/business/help/314132612401196

**Thesis gap:** Seed §6.2 pre-frame is mandatory; without it first text fails consultant trust and sits adjacent to seat 3 CEM posture.

**Solution:** Make **agent-follow explicit before submit** (intro + prominent notice + ending message) naming channel and purpose (“walkthrough of prepared campaign”), and fire first text only against that stated purpose so that expectation matches Meta’s “message only for collected purpose” guidance.

**Handoff:** both (PM: pre-frame copy; CTO: first-outbound gated on capture purpose flags; **sync seat 3**)

---

### ads-13 — Ending / completion screen: continue-scroll, not thank-you dashboard

**Question:** What post-submit ending keeps Approach as continue-scroll rather than a product tour or sales door?

**References:**
- https://www.facebook.com/business/help/314132612401196
- https://www.facebook.com/business/help/435270316658768
- Seed §6.2 post-capture surface

**Thesis gap:** Meta completion CTAs push website/book-time; Seed wants continue scroll + agent comes to them — conflict if ending becomes OLG/sales peer door.

**Solution:** Ending message = **confirmation of agent-follow + optional deep link to prepared workspace when ready**, never book-a-call or buy-credits as peer CTAs so that post-capture stays ALG-shaped.

**Handoff:** pm (ending contract; Founder §14 peer-door ban)

---

### ads-14 — Lead response latency as trust + quality (not desk redesign)

**Question:** How fast must agent-follow land after Instant Form submit to avoid “scam/spam” perception and Meta quality decay?

**References:**
- https://www.facebook.com/business/help/2246428158756947
- https://www.facebook.com/business/help/435270316658768

**Thesis gap:** Meta recommends immediate CRM capture and business-hours readiness; ALG agent path is automated presentation — latency still reads as spam or drop.

**Solution:** Treat **near-real-time lead pull → first agent text** as an Approach reliability requirement (schedule ads when outbound path is live) so that pre-frame promise is operationally true.

**Handoff:** cto (lead webhook, queue, first-outbound SLA); pm (operator readiness when ads are on)

---

### ads-15 — Instrumentation: don’t-understand vs understand-don’t-tap

**Question:** What measurable proxies distinguish “didn’t understand the one-tap yield” from “understood and declined”?

**References:**
- https://www.facebook.com/business/help/435270316658768 (engagement custom audience: started form unfinished)
- https://www.facebook.com/business/help/782657799338685
- Seed §6.2 two failure modes; How `operator-acquisition` Leaf 1.2

**Thesis gap:** Seed requires both modes; Meta does not expose “understood”; Operator How assumes readable counts — practice must define proxies without fake psychometrics.

**Solution:** Instrument a **proxy pair**: (A) impression → no form open / bounce at intro = don’t-understand-or-disbelieve-claim; (B) form open / intro complete → abandon before submit, or submit then silence = understand-enough-don’t-commit — report both to Operator so that creative vs offer falsification splits.

**Handoff:** both (PM: Approach instrumentation outcomes; CTO: event taxonomy + Meta + first-party join)

---

### ads-16 — Creative tests as understanding instruments (not persuasion A/B)

**Question:** How should creative variants be tested so results teach legibility failure rather than persuasion lift?

**References:**
- https://www.facebook.com/business/help/435270316658768
- https://www.facebook.com/business/help/757209948405699
- Seed doctrine: ad = legibility, never persuade

**Thesis gap:** Classic ads A/B optimizes CTR/persuasion; ALG needs which claim phrasing makes the deliverable understood.

**Solution:** Hold **deliverable constant**, vary only claim phrasing / intro clarity, and score variants on form-open and intro-complete rates (not vanity CTR alone) so that tests falsify understanding, not hype.

**Handoff:** both (PM: variant matrix rules; CTO: creative_id on events)

---

### ads-17 — Continue-scroll as allowed disbelief (cheap check)

**Question:** How should non-tap / post-impression ignore be interpreted under Seed’s “disbelief OK if cheap to check”?

**References:**
- Seed §8.1; §6.2 Approach strip
- https://www.facebook.com/business/help/435270316658768

**Thesis gap:** High ignore rate can mean bad targeting, bad claim, or healthy self-selection — Operator must not “fix” ignore into persuasion spend.

**Solution:** Treat **continue-scroll / non-open as valid self-selection**, escalate spend only when form-open is healthy but submit is not (or inverse), so that ALG learns which disbelief mode dominates before rewriting product.

**Handoff:** pm (Operator Acquisition instrumentation reading rules)

---

### ads-18 — Targeting realism for immigration consultants (KU #3)

**Question:** What targeting posture is realistic for Canadian (or analogous) immigration consultancy operators without discriminatory or Special-Ad misfires?

**References:**
- https://www.facebook.com/business/help/298000447747885
- https://transparency.meta.com/policies/ad-standards/
- https://www.facebook.com/business/help/435270316658768

**Thesis gap:** Assump. 11 / KU #3 — professional B2B niche on Meta is thin; over-narrow interest stacks or wrong Special Ad Category either starve delivery or throttle.

**Solution:** Start with **geo + professional interest/employer proxies + lookalikes from known good firms** (not form-fillers), avoid housing/employment/credit Special Ad misfit unless counsel says otherwise, and treat thin delivery as early falsifier so that CAC realism is tested before activation build deepens.

**Handoff:** both (PM: Approach campaign targeting doctrine; CTO: audience ↔ quality feedback when CRM exists)

---

### ads-19 — Early falsifiers for Meta door (cheap learn)

**Question:** What early metrics falsify “Meta can reach this buyer at acceptable CAC” without burning product time?

**References:**
- https://www.facebook.com/business/help/782657799338685
- https://www.facebook.com/business/help/435270316658768
- Seed KU #3; Assump. 11

**Thesis gap:** Growth bet says learn on ads + planted click-through — need concrete kill/continue signals.

**Solution:** Pre-declare **kill/continue thresholds** on: qualified cost per seed capture, % captures with valid website, % first-text answered, % reaching prepared-workspace open — falsify door if seed CAC or quality fails while claim variants are already legible so that product does not absorb a dead channel.

**Handoff:** both (PM: Operator Acquisition criteria; CTO: funnel metrics store)

---

### ads-20 — Maximize leads vs qualified leads (quality vs click budget)

**Question:** Which Lead ads performance goal fits ALG seed quality without flooding junk firms?

**References:**
- https://www.facebook.com/business/help/782657799338685
- https://www.facebook.com/business/help/435270316658768

**Thesis gap:** Maximize leads cheapens CAC optics; garbage websites break Assump. 12 provision credibility.

**Solution:** Prefer **Maximize number of qualified leads** once conversion/CRM signals exist; until then constrain with tight geo + website-required form and reject-provision bad domains so that cheap volume does not fake acquisition success.

**Handoff:** both (PM: campaign goal policy; CTO: CAPI/CRM quality signals when available)

---

### ads-21 — Account authenticity / verification under scam-category watch

**Question:** What advertiser authenticity practices reduce restriction risk for a category adjacent to immigration/finance scam patterns?

**References:**
- https://transparency.meta.com/policies/ad-standards/fraud-scams/unacceptable-business-practices
- https://transparency.meta.com/policies/ad-standards/
- https://www.facebook.com/business/help/829597887147190

**Thesis gap:** Meta may demand extra verification when categories look scam-prone; Approach dies if Business/Page assets are inauthentic.

**Solution:** Run Approach only from a **verified legitimate Business + Page**, complete verification early, and keep creative/domain consistent with Om Coda identity so that review friction is operational readiness, not surprise.

**Handoff:** both (PM: operator ads hygiene outcome; CTO: domain/Page asset inventory)

---

### ads-22 — No cloaking / bait destination swaps

**Question:** How must review-time and live destinations stay aligned so Approach does not circumvent ad review?

**References:**
- https://transparency.meta.com/policies/ad-standards/
- https://www.facebook.com/business/help/757209948405699

**Thesis gap:** Temptation to show a mild landing in review and a hard sell live — instant policy fail and consultant betrayal.

**Solution:** Freeze **same Instant Form + same claim object** across review and delivery; no cloaking, no post-approval bait swap so that policy survival and feed trust are one system.

**Handoff:** cto (destination integrity); pm (change-control on Approach creative)

---

### ads-23 — Firm identity claim without implying client-list possession

**Question:** How can creative say “under your firm identity” without implying Om Coda already holds or scrapes the firm’s client book?

**References:**
- https://transparency.meta.com/policies/ad-standards/fraud-scams/unacceptable-business-practices
- Seed §6.3 / §6.4; §8.1

**Thesis gap:** “Your firm’s campaign” can be read as we have your clients — false, scammy, and activation-boundary breaking.

**Solution:** Explicitly bound identity to **public branding/site facts only**, and state client book is never required at tap so that outsized claim stays true and Seed structural gap stays honest in-feed.

**Handoff:** pm (claim dictionary); sync seat 7 only as “not in acquisition”

---

### ads-24 — Work-email / phone verification features vs friction budget

**Question:** Should Approach enable Meta phone OTP or work-email validation on Instant Form?

**References:**
- https://www.facebook.com/business/help/761812391313386
- https://www.facebook.com/business/help/435270316658768

**Thesis gap:** Verification raises lead quality and cuts spam bots; each step burns the one-tap constraint.

**Solution:** Default **off** for V1 click-budget purity; enable phone verification only if bot/junk rate falsifies seed quality, treating it as a measured relaxation so that Seed’s “force one click; relax only as finding” holds.

**Handoff:** both (PM: friction ladder; CTO: feature flags on form config)

---

### ads-25 — Lead data use purpose-lock (first-text adjacency only)

**Question:** What purpose-lock on Lead Ads data keeps Meta Terms and CASL-adjacent first text aligned without owning end-client CEM?

**References:**
- https://www.facebook.com/business/help/1582353715248057
- https://www.facebook.com/business/help/829597887147190
- https://www.facebook.com/business/help/2246428158756947

**Thesis gap:** Meta: use lead data only for stated purpose; seat 3 owns CEM legality of first text — this seat must not invent end-client consent law.

**Solution:** Purpose-lock captured consultant channel to **ALG activation walkthrough only** (no resale, no unrelated nurture, no end-client messaging from this capture) so that ads Terms and first-text adjacency stay coherent; defer CEM substance to seat 3.

**Handoff:** both (**sync seat 3**); PM purpose copy; CTO purpose flags on send gates

---

## Count

**25** items (`ads-01` … `ads-25`)

## Focus coverage

| Pressure | Items |
|---|---|
| (1) Claim shapes policy-safe / outsized-but-true | ads-01–05, ads-22–23 |
| (2) One-tap name+website+channel | ads-06–10, ads-24 |
| (3) Pre-frame agent-follows without spam feel | ads-11–14, ads-25 |
| (4) Instrumentation don’t-understand vs understand-don’t-tap | ads-15–17 |
| (5) Targeting/CAC realism (KU #3) | ads-18–21 |

## Explicit non-ownership (boundaries held)

- End-client CEM/CASL beyond first-text adjacency → seat 3  
- Escrow / contingent commercial terms → seat 6  
- Running desk inhabit → seat 4 / PM  
- Sales-call or credits as peer activation doors → Founder §14 (forbidden in Approach endings)
