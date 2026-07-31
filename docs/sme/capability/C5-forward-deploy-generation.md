# Seat C5 — Forward-deploy generation (public facts → prepared workspace)

**Pass:** Pass2 + implementation (combined)  
**Axis:** CAPABILITY (adds product) — not compliance. Know-how to generate a firm-branded no-login prepared campaign from public facts before the firm connects anything.  
**Producer:** SME (scraping/enrichment + templating engineer) — not PM/CTO  
**Brief:** Capability roster C5 — residual vs “Prepared Workspace shell exists.”  
**Status:** Paper only — NOT Register-integrated. Awaiting validation.  
**Who:** scraping/enrichment + templating engineer.  
**Residual:** public-facts extraction, branding capture, and secure no-login token access — specialist and entirely unbuilt.  
**Revealed:** Public firm-facts enrichment **new**; Template hydration → Prepared Workspace **partial** (surface exists, generator doesn’t); No-login secure token + expiry **new**; Branding extraction **new**.  
**Plugs:** Activation & forward-deploy · Prepared Workspace · contact touchpoints · Approach.  
**Boundaries:** Not Approach claim-dictionary / Meta trust (ads seat). Not CASL consent for firm→client CEMs (seat 3). Not book ingestion (C4). Not deliverability (C1). Not UI wireframes as solutions. Solutions = `<mechanism> so that <purpose>` domain practice.  
**Anchors:** Capability `00-ROSTER.md` C5; Activation & forward-deploy · Forward-deploy · Readiness walkthrough; Prepared Workspace; Approach campaigns (deliverable = prepared campaign from public firm facts); Activation state / Progress; Opt-in / Consent / Nudge touchpoints (token-gated adjacency).  
**Vocab:** [`../implementation/00-SURFACE-VOCAB.md`](../implementation/00-SURFACE-VOCAB.md)  
**Style:** Question · References · Thesis gap · Solution (`<mechanism> so that <purpose>`) · Handoff · implementationProblem · implementation · implementationAdds.

**Item count:** 22 (`fwd-01` … `fwd-22`)

**Surfaces in scope:** **Activation & forward-deploy** · **Forward-deploy** · **In-flight activations** · **Readiness walkthrough** · **Prepared Workspace** · **Approach campaigns** (deliverable adjacency) · contact touchpoints (token access) · **Activation state** / **Progress** · **Audit trail** (enrichment / token events)

---

## Focus gap 1 — Public firm-facts enrichment

### fwd-01 — Enrichment starts from a verified public firm URL, not a free-text name alone
**Question:** What must be true of the firm seed before Tower may run public-facts enrichment toward a Prepared Workspace?  
**References:**
- Google Search Central — URL inspection / canonical URLs — https://developers.google.com/search/docs/crawling-indexing/canonicalization
- Schema.org `Organization` / `LocalBusiness` — https://schema.org/LocalBusiness
- Approach claim adjacency: prepared campaign from public firm facts (ads seat claim dictionary)
**Thesis gap:** Approach and Activation name “public firm facts,” but Register never locks that enrichment requires a resolvable, firm-controlled public URL (not a bare practice name that could match the wrong entity).  
**Solution:** Require a verified, resolvable public firm URL as the enrichment root (with optional listing IDs as secondary) before any scrape or hydrate job runs so that Prepared Workspace instances are bound to one identifiable public presence, not a guessed firm.  
**Handoff:** both

**implementationProblem:**  
Forward-deploy can start from a capture name or email alone. Enrichment hits the wrong site; the prepared campaign shows another firm’s facts and destroys Approach credibility on first open.

**implementation:**  
On Activation & forward-deploy → Forward-deploy, you can now require a verified public firm URL before Enrichment run may start.  
On In-flight activations, you can now see enrichment blocked when the URL fails resolve / firm-match checks.  
On Activation state Progress, prepared-workspace-ready stays closed until the enrichment root URL is bound.

**implementationAdds:** `["enrichment-root-url", "url-verified", "firm-match", "enrichment-blocked"]`

---

### fwd-02 — robots.txt and crawl directives are fail-closed gates, not courtesy headers
**Question:** How must Tower treat robots.txt / crawl directives when extracting public firm-site facts for forward-deploy?  
**References:**
- RFC 9309 — Robots Exclusion Protocol — https://www.rfc-editor.org/rfc/rfc9309.html
- Google Search Central — robots.txt introduction — https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Google — Overview of Google Crawler Behavior (respect robots; rate) — https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers
**Thesis gap:** “Scrape the firm site” is implied by Approach; without robots / crawl posture, enrichment is built as unbounded fetch and inherits legal and reputation risk.  
**Solution:** Fetch and honor robots.txt (and equivalent crawl directives) for the enrichment user-agent before path fetch, fail closed on disallowed paths, and record the robots decision on the run so that public-facts extraction stays inside declared crawl permission.  
**Handoff:** cto

**implementationProblem:**  
Enrichment fetches every path that looks useful. Disallowed areas are scraped anyway; firms and counsel later treat Om Coda as a hostile crawler, and Approach deliverables become evidence of overreach.

**implementation:**  
On Activation & forward-deploy → Forward-deploy, you can now see Enrichment run robots status (allowed / disallowed paths) before content fetch.  
On Audit trail, you can now examine robots-decision events per enrichment run.  
Disallowed paths never contribute firm-facts used in Prepared Workspace hydration.

**implementationAdds:** `["robots-honored", "robots-fail-closed", "disallowed-path", "enrichment-user-agent"]`

---

### fwd-03 — Public-facts allowlist: only facts a stranger could already see
**Question:** Which classes of firm data may enrichment store and hydrate into a Prepared Workspace before the firm connects a book or authorizes deeper access?  
**References:**
- PIPEDA fair-information principles — Limiting Collection — https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/principles/p_collection/
- Schema.org publicly marked business fields (`name`, `address`, `telephone`, `url`, `logo`) — https://schema.org/LocalBusiness
- Google Business Profile — information businesses share publicly — https://support.google.com/business/answer/3038177
**Thesis gap:** Enrichment without an allowlist drifts into staff PII, private pages behind login, or inferred client lists — contradicting “public facts before connect.”  
**Solution:** Constrain pre-connect enrichment to a public-facts allowlist (legal name, public address/phone, public site copy, public hours, public services blurbs, public logo/OG assets) and forbid private, authenticated, or person-sensitive fields so that Prepared Workspace content is defensible as already-public.  
**Handoff:** both

**implementationProblem:**  
Scrapers pull staff bios with personal emails, portal URLs, or non-public PDFs into the workspace. The consultant opens a “prepared” pack that exposes data the firm never published for cold outreach.

**implementation:**  
On Activation & forward-deploy → Forward-deploy, you can now see Public-facts allowlist classes applied to Enrichment run output.  
On Prepared Workspace, hydrated blocks only show allowlisted public facts — private/authenticated extractions never land.  
On Audit trail, you can now examine dropped-by-allowlist events.

**implementationAdds:** `["public-facts-allowlist", "pre-connect-only", "dropped-private", "person-sensitive-forbid"]`

---

### fwd-04 — Google Business Profile / listing facts are a secondary public source with provenance
**Question:** How should Google Business Profile (and similar public listings) contribute firm facts relative to the firm’s own site?  
**References:**
- Google Business Profile APIs — Business Information — https://developers.google.com/my-business/content/business-information
- Google Maps Platform Places API (New) — Place details — https://developers.google.com/maps/documentation/places/web-service/place-details
- Google Business Profile — how info appears to customers — https://support.google.com/business/answer/3038177
**Thesis gap:** Roster names “site, Google, listings”; product never specifies conflict resolution or provenance when listing data disagrees with the firm site.  
**Solution:** Treat GBP/listing Place details as a secondary public source keyed by place identity, store provenance per field (site vs listing), and prefer firm-site values on conflict unless the field is listing-native (e.g. maps pin) so that hydration remains attributable and reviewable.  
**Handoff:** both

**implementationProblem:**  
Enrichment merges Google hours and a stale site phone into one undifferentiated blob. Consultant cannot tell which source is wrong; correcting the pack means guessing.

**implementation:**  
On Activation & forward-deploy → Forward-deploy, you can now see firm-facts fields with Source provenance (site / Google Business Profile / listing).  
On Prepared Workspace, you can now examine conflicting values and which source won under Prefer firm-site rules.  
On Readiness walkthrough, you can now confirm listing-native fields (maps pin) separately from site copy.

**implementationAdds:** `["gbp-secondary", "field-provenance", "prefer-firm-site", "listing-native"]`

---

### fwd-05 — Rate limits, identity, and cache: enrichment must look like a polite crawler
**Question:** What operational limits keep firm-site enrichment from looking like abuse or burning the target during Approach scale?  
**References:**
- RFC 9309 — crawl-delay / polite crawling norms (implementer practice alongside REP) — https://www.rfc-editor.org/rfc/rfc9309.html
- Google Search Central — Manage crawl budget / rate — https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget
- OWASP Scraping & automation ethics adjacency — do not bypass access controls (ASVS access control) — https://owasp.org/www-project-application-security-verification-standard/
**Thesis gap:** Approach volume implies many concurrent firm enrichments; without rate/cache/identity rules, Tower DDoS’s prospect sites and gets blocked mid-campaign.  
**Solution:** Enforce per-host rate limits, a clear enrichment user-agent + contact URI, and TTL cache of public fetches so that Approach-scale forward-deploy does not hammer firm origins or retry storm on failure.  
**Handoff:** cto

**implementationProblem:**  
Parallel Forward-deploy jobs refetch the same firm site aggressively. Origins block the house IP; enrichment fails loudly on the leads Approach just paid for.

**implementation:**  
On Activation & forward-deploy → Forward-deploy, you can now see Enrichment run rate-limit and cache-hit status per host.  
On In-flight activations, retry storms stay capped; failed hosts show polite-backoff rather than tight loops.  
On Oversight Fleet health (adjacency), enrichment blocklist/backoff for a host is visible when Approach volume spikes.

**implementationAdds:** `["per-host-rate-limit", "enrichment-cache-ttl", "polite-user-agent", "backoff"]`

---

### fwd-06 — Structured extraction beats raw HTML dump for hydration
**Question:** How should public pages be turned into firm-fact fields a template can hydrate without hand-editing HTML?  
**References:**
- Schema.org JSON-LD for `Organization` / `LocalBusiness` — https://schema.org/Organization
- Open Graph protocol — https://ogp.me/
- Google Search Central — structured data general guidelines — https://developers.google.com/search/docs/appearance/structured-data/sd-policies
**Thesis gap:** Prototype Prepared Workspace implies “we scraped their site”; without a structured fact model, hydration is paste-of-HTML and branding breaks.  
**Solution:** Extract into a typed firm-facts record (prefer JSON-LD / OG / explicit public fields; HTML heuristics only as fallback with lower confidence) so that template hydration binds to stable keys rather than brittle page markup.  
**Handoff:** both

**implementationProblem:**  
Enrichment stores raw HTML blobs. Template hydration breaks on every redesign; operators paste fixes by hand and Approach “prepared” packs look unfinished.

**implementation:**  
On Activation & forward-deploy → Forward-deploy, you can now see Firm-facts record fields (name, phone, address, services blurb, hours, logo URL, …) with confidence and extract method (json-ld / og / heuristic).  
On Prepared Workspace, hydration binds to those keys — not raw HTML paste.  
On Readiness walkthrough, low-confidence heuristic fields are flagged for confirm before consultant trust.

**implementationAdds:** `["firm-facts-record", "json-ld-prefer", "og-fallback", "heuristic-low-confidence"]`

---

### fwd-07 — Freshness clock: public facts expire; stale packs must not ship as current
**Question:** How long may an enriched firm-facts snapshot remain the basis of a Prepared Workspace before re-fetch is required?  
**References:**
- HTTP caching semantics (RFC 9111) — freshness & revalidation — https://www.rfc-editor.org/rfc/rfc9111.html
- Google Business Profile — keeping info up to date — https://support.google.com/business/answer/3038177
- Capability roster C5 — generator behind Prepared Workspace must own currency of public facts
**Thesis gap:** Forward-deploy can mint a pack once and leave it forever; firms change phones/hours; Approach delivers outdated “your public facts.”  
**Solution:** Stamp every firm-facts snapshot with fetched-at + TTL, block hydrate/ship of Prepared Workspace when TTL lapsed without re-enrich, and allow forced refresh so that the pack always reflects a bounded-age public snapshot.  
**Handoff:** both

**implementationProblem:**  
A lead captured weeks ago opens a Prepared Workspace with a disconnected phone number scraped at capture time. Trust dies before Authorize book.

**implementation:**  
On Activation & forward-deploy → Forward-deploy, you can now see firm-facts Freshness (fetched-at, TTL, stale).  
On Prepared Workspace, you can now refuse ship/open-as-ready when snapshot is stale until Refresh enrichment completes.  
On Activation state Progress, you can now see freshness as a readiness gate beside token and branding gates.

**implementationAdds:** `["facts-fetched-at", "facts-ttl", "stale-block", "refresh-enrichment"]`

---

## Focus gap 2 — Branding extraction

### fwd-08 — Logo capture from public brand surfaces, with fail-soft placeholder
**Question:** How should Tower obtain a firm logo for branding before the firm uploads assets?  
**References:**
- Open Graph `og:image` — https://ogp.me/
- Schema.org `Organization.logo` — https://schema.org/Organization
- Google Business Profile media / business photos practice — https://support.google.com/business/answer/6103860
**Thesis gap:** Firm-branded Prepared Workspace is committed; logo source-of-truth before connect is unspecified — operators invent stock marks or Om Coda chrome.  
**Solution:** Resolve logo from a priority chain (schema.org logo → apple-touch / clear site icon → OG image when clearly a mark → GBP profile photo) and fail soft to a neutral placeholder with “logo unconfirmed” so that branding never fabricates a mark or shows Om Coda as the firm face.  
**Handoff:** both

**implementationProblem:**  
Packs ship with Om Coda’s mark or a random OG photo of the office exterior labeled as logo. Consultants see someone else’s brand identity on “their” workspace.

**implementation:**  
On Activation & forward-deploy → Forward-deploy, you can now see Logo resolution (source in chain, or placeholder + logo-unconfirmed).  
On Prepared Workspace, firm mark shows resolved logo or neutral placeholder — never Om Coda as firm face.  
On Readiness walkthrough, you can now confirm or replace logo before consultant-facing ready.

**implementationAdds:** `["logo-chain", "logo-unconfirmed", "neutral-placeholder", "og-image-guard"]`

---

### fwd-09 — Palette extraction is constrained to accessible, attributable colors
**Question:** How should brand colors be derived from a public site without inventing a palette that misrepresents the firm?  
**References:**
- W3C WCAG 2.2 — contrast (relative luminance) — https://www.w3.org/TR/WCAG22/#contrast-minimum
- CSS `theme-color` / manifest theme practice — https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name/theme-color
- Material Design / brand color extraction practice (dominant color from brand assets, not random hero photos) — https://m3.material.io/styles/color/system/overview
**Thesis gap:** “Branding extraction” can overfit to a hero photograph (sky blue / skin tones) and ship an unusable, inaccurate palette.  
**Solution:** Derive a small brand palette from attributable surfaces (CSS theme-color, header/nav computed styles, logo dominant colors) with WCAG contrast checks for text-on-brand pairs, and keep a safe neutral fallback so that hydration never paints unreadable or photo-biased chrome.  
**Handoff:** both

**implementationProblem:**  
Palette picker samples a beach hero image. Buttons are unreadable; firm doesn’t recognize the colors as theirs.

**implementation:**  
On Activation & forward-deploy → Forward-deploy, you can now see Brand palette candidates (theme-color / nav / logo-dominant) with contrast pass/fail.  
On Prepared Workspace, applied palette uses contrast-safe pairs; photo-biased samples stay rejected.  
On Readiness walkthrough, you can now accept palette or fall back to neutral brand chrome.

**implementationAdds:** `["brand-palette", "theme-color", "contrast-safe", "neutral-fallback"]`

---

### fwd-10 — Voice / tone snippets are quoted public copy, not LLM-invented brand voice
**Question:** May enrichment synthesize a “brand voice” paragraph for the Prepared Workspace from model inference alone?  
**References:**
- FTC Endorsement Guides / truth-in-advertising adjacency — do not fabricate affiliation — https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking
- Approach claim dictionary: deliverable-bounded readiness from public firm facts (no invented client possession)
- OWASP LLM Prompt Injection / uncontrolled generation risks — https://owasp.org/www-project-top-10-for-large-language-model-applications/
**Thesis gap:** Templating engineers will “summarize voice” with an LLM; Approach then presents invented slogans as the firm’s own words.  
**Solution:** Ground voice fields only in quoted or lightly truncated public site copy (tagline, about blurb) with source URL + excerpt hash — forbid free-invented brand voice so that Prepared Workspace language remains attributable to the firm’s public pages.  
**Handoff:** both

**implementationProblem:**  
Workspace hero reads a model-written slogan the firm never published. Consultant assumes Om Coda fabricated their brand; Approach claim collapses.

**implementation:**  
On Activation & forward-deploy → Forward-deploy, you can now see Voice snippets only as sourced excerpts (URL + hash) from public pages.  
On Prepared Workspace, brand copy blocks show attributable excerpts — Invented voice is not offered.  
On Audit trail, you can now examine excerpt provenance for each hydrated voice field.

**implementationAdds:** `["voice-excerpt", "source-url", "excerpt-hash", "invented-voice-forbid"]`

---

### fwd-11 — Brand package is versioned and separable from firm-facts
**Question:** How should branding artifacts relate to the firm-facts snapshot over refresh cycles?  
**References:**
- Design-token / brand-kit versioning practice (W3C Design Tokens community group) — https://www.w3.org/community/design-tokens/
- HTTP cache validators — ETag / Last-Modified revalidation — https://www.rfc-editor.org/rfc/rfc9111.html
**Thesis gap:** Refreshing facts silently mutates logo/palette under a consultant who already reviewed branding — or branding sticks while facts go stale with no independent version.  
**Solution:** Store a versioned brand package (logo asset ref, palette, voice excerpts) separate from firm-facts snapshot versions, with explicit re-extract vs keep-brand on refresh so that consultants can accept facts updates without surprise brand swaps.  
**Handoff:** both

**implementationProblem:**  
Refresh enrichment replaces the logo overnight. Consultant who already walked Readiness sees a different brand on the same token link and loses confidence.

**implementation:**  
On Activation & forward-deploy → Forward-deploy, you can now see Brand package version separate from Firm-facts version.  
On Refresh enrichment, you can now choose Update facts / Re-extract brand / Keep brand.  
On Prepared Workspace, you can now examine which brand package version is bound to the instance.

**implementationAdds:** `["brand-package-version", "facts-version", "keep-brand", "re-extract-brand"]`

---

### fwd-12 — Branding must never imply Om Coda is the consultancy
**Question:** What identification rule applies when branding extraction is incomplete on a firm-branded no-login surface?  
**References:**
- CASL sender-identity adjacency (firm on whose behalf) — seat `casl-09` / CRTC CEM ID — https://crtc.gc.ca/eng/archive/2012/2012-548.htm
- Approach claim: agent walks through prepared workspace — not Om Coda-as-firm
- Google Business Profile — representing the business accurately — https://support.google.com/business/answer/3038177
**Thesis gap:** Incomplete branding defaults to platform chrome; contacts and consultants misread the pack as Om Coda’s practice site.  
**Solution:** When brand package is incomplete, show firm legal/public name as the hero identity with neutral chrome and an explicit “branding unconfirmed from public sources” state — never substitute Om Coda marks as the firm brand — so that Approach deliverables stay firm-faced even before assets confirm.  
**Handoff:** pm

**implementationProblem:**  
Missing logo falls back to Om Coda wordmark. The no-login pack looks like an Om Coda product demo, not the firm’s prepared campaign.

**implementation:**  
On Prepared Workspace, incomplete brand package shows firm public name + neutral chrome + branding-unconfirmed — Om Coda marks stay platform-only.  
On Readiness walkthrough, you can now see branding-unconfirmed as a confirm item before consultant-ready.  
On Activation & forward-deploy, you can now track branding-unconfirmed vs branding-confirmed per activation.

**implementationAdds:** `["branding-unconfirmed", "firm-faced", "platform-marks-only", "neutral-chrome"]`

---

## Focus gap 3 — Template hydration → Prepared Workspace

### fwd-13 — Generator binds Engagement templates to a firm-facts + brand package instance
**Question:** What inputs must exist before Tower may instantiate a Prepared Workspace from house Engagement templates?  
**References:**
- Capability roster C5 — Template hydration → Prepared Workspace **partial**
- How / Configuration libraries — Engagement templates · Agent / sequence editor (shell)
- Server-side template / merge-field practice (SendGrid dynamic templates; Mailchimp merge tags) — https://docs.sendgrid.com/ui/sending-email/how-to-send-an-email-with-dynamic-templates
**Thesis gap:** Prepared Workspace surface exists; the generator that hydrates templates from enrichment is unnamed — PM would hand-build each pack.  
**Solution:** Run a hydrate job that binds a pinned Engagement template version to a firm-facts snapshot + brand package and emits a Prepared Workspace instance so that Approach’s deliverable is generated, not manually assembled per lead.  
**Handoff:** both

**implementationProblem:**  
Operators clone empty Prepared Workspace shells and paste facts by hand. Approach cannot scale; In-flight activations stall at “workspace exists” without content.

**implementation:**  
On Activation & forward-deploy → Forward-deploy, you can now run Hydrate (template version + firm-facts + brand package) to create Prepared Workspace instance.  
On Prepared Workspace, you can now examine bound template version and snapshot IDs.  
On Activation state Progress, hydrated becomes a distinct gate after enrichment — empty shells are not ready.

**implementationAdds:** `["hydrate-job", "template-version-pin", "workspace-instance", "hydrated"]`

---

### fwd-14 — Merge fields fail closed when required public facts are missing
**Question:** What happens when a template requires a field enrichment could not obtain?  
**References:**
- SendGrid / ESP dynamic template required-field patterns — https://docs.sendgrid.com/ui/sending-email/how-to-send-an-email-with-dynamic-templates
- JSON Schema validation — https://json-schema.org/understanding-json-schema/
- Capability roster — generator must produce a usable prepared campaign, not a half-blank pack sold as ready
**Thesis gap:** Partial scrape + optimistic hydrate ships “Your phone: {{phone}}” or blank CTAs; Approach promised a prepared campaign.  
**Solution:** Validate required merge fields against the firm-facts record before instance ready; leave workspace in needs-facts state with named missing keys so that incomplete hydrations never present as consultant-ready.  
**Handoff:** both

**implementationProblem:**  
Hydration succeeds with holes. Consultant opens Prepared Workspace and sees empty phone/hours blocks; the Approach promise feels like a demo.

**implementation:**  
On Activation & forward-deploy → Forward-deploy, Hydrate reports Missing required fields by key and keeps status needs-facts.  
On Prepared Workspace, you can now see which blocks are unbound — ready stays closed.  
On Readiness walkthrough, missing keys are listed for refresh or manual public-fact supply (still allowlisted).

**implementationAdds:** `["merge-required", "needs-facts", "missing-keys", "hydrate-validate"]`

---

### fwd-15 — Prepared Workspace instance is immutable snapshot + explicit regenerate
**Question:** May live template edits or re-enrichment silently change a workspace a consultant already opened?  
**References:**
- Event-sourcing / snapshot immutability practice for issued artifacts (audit packs) — https://martinfowler.com/eaaDev/EventSourcing.html
- OWASP — secure object references to issued resources — https://owasp.org/www-community/vulnerabilities/Insecure_Direct_Object_References
**Thesis gap:** Without instance immutability, token links become moving targets; Readiness walkthrough and consultant trust break.  
**Solution:** Treat each Prepared Workspace instance as an immutable hydrate snapshot; apply template or facts changes only via explicit Regenerate (new instance version, old token policy defined) so that what the consultant saw remains auditable.  
**Handoff:** both

**implementationProblem:**  
House edits Engagement templates and every in-flight pack mutates under active tokens. Consultants dispute what they were shown; support cannot replay the instance.

**implementation:**  
On Prepared Workspace, you can now see Instance version (immutable snapshot) and Regenerate as an explicit action.  
On Activation & forward-deploy → In-flight activations, you can now examine which instance version was issued.  
On Audit trail, hydrate and regenerate events are distinct — silent live-mutate is not available.

**implementationAdds:** `["instance-immutable", "regenerate", "instance-version", "issued-snapshot"]`

---

### fwd-16 — Readiness walkthrough is gated on hydrate quality, not shell existence
**Question:** When may Activation treat Prepared Workspace as ready for consultant / agent walkthrough?  
**References:**
- Capability roster C5 plugs — Readiness walkthrough; Activation state Progress
- Approach instrumentation adjacency — % reaching prepared-workspace open
- Google Business Profile / public accuracy — don’t show wrong business info — https://support.google.com/business/answer/3038177
**Thesis gap:** Progress can flip ready when an empty Prepared Workspace row exists; Approach metrics then celebrate opens of blank packs.  
**Solution:** Gate Readiness walkthrough and prepared-workspace-ready on hydrate validation + freshness + branding state (confirmed or explicitly accepted unconfirmed) so that “ready” means a reviewable firm-branded pack, not a shell.  
**Handoff:** both

**implementationProblem:**  
Activation state shows ready because the modal exists. Agent walks a blank workspace on first text; Approach conversion dies at the deliverable.

**implementation:**  
On Activation state Progress, prepared-workspace-ready requires Hydrated + Fresh + branding state accepted.  
On Readiness walkthrough, you can now open only when those gates pass — shell-only instances stay blocked.  
On Activation & forward-deploy → In-flight activations, you can now see gate detail (hydrate / freshness / branding) per firm.

**implementationAdds:** `["workspace-ready-gate", "hydrated-required", "branding-accepted", "shell-not-ready"]`

---

### fwd-17 — Approach deliverable contract: public-facts pack, not connected-book claims
**Question:** What must hydration promise — and refuse to promise — relative to book connect and sequences?  
**References:**
- Ads seat / Approach claim dictionary — prepared campaign from public firm facts; agent walks through; never agent-scrapes-enrolls-runs
- Seed Approach → Activation motion (connect comes after prepared deliverable)
- FTC truth-in-advertising — substantiation of claims — https://www.ftc.gov/business-guidance/resources/advertising-faq-guide-small-business
**Thesis gap:** Generator feature-creep will hydrate as if the book were already authorized or sequences already armed — contradicting Approach claims and escrow ordering.  
**Solution:** Limit Prepared Workspace hydration to pre-connect deliverable scope (public facts, brand, proposed engagement template preview, next-step Authorize book / Accept terms) and forbid copy or blocks that assert enrolled clients or live sending so that the generator matches the Approach contract.  
**Handoff:** pm

**implementationProblem:**  
Hydrated packs show “your 400 clients are ready to message.” Book was never connected; Approach claim and desk trust both break.

**implementation:**  
On Prepared Workspace, hydrated blocks stay inside pre-connect scope — public facts, brand, template preview, Authorize book / Accept terms next steps.  
On Engagement templates used for Forward-deploy, you can now see Pre-connect deliverable flag that strips enrolled-book / live-send assertions.  
On Approach campaigns (adjacency), Claim dictionary and hydrate scope stay aligned on public-facts pack only.

**implementationAdds:** `["pre-connect-scope", "template-preview", "no-enrolled-claim", "authorize-book-next"]`

---

## Focus gap 4 — No-login secure token access + expiry

### fwd-18 — Opaque capability tokens gate Prepared Workspace without account login
**Question:** How should consultants (and agent-guided sessions) open a Prepared Workspace before firm Login / SSO exists?  
**References:**
- OWASP Authentication Cheat Sheet — passwordless / magic links — https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- OWASP Forgot Password Cheat Sheet — token properties — https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
- RFC 6750 — Bearer token usage (Authorization patterns) — https://www.rfc-editor.org/rfc/rfc6750
**Thesis gap:** Roster marks no-login secure token **new**; product risks query-param workspace IDs (IDOR) or forcing Login before Approach’s deliverable can land.  
**Solution:** Issue an opaque, high-entropy capability token bound to one Prepared Workspace instance (bearer secret not a sequential id) so that no-login access works without exposing enumerable workspace identifiers.  
**Handoff:** cto

**implementationProblem:**  
Workspace links use `/prepared/123` or firm slug alone. Third parties enumerate packs; or product blocks all access behind Login and Approach cannot show the deliverable.

**implementation:**  
On Activation & forward-deploy → Forward-deploy, you can now issue Access token bound to Prepared Workspace instance (opaque capability).  
On Prepared Workspace (no-login), you can now open only with a valid token — sequential ids alone never authorize.  
On Audit trail, you can now examine token-issue events without storing the raw token in logs.

**implementationAdds:** `["capability-token", "opaque-token", "instance-bound", "no-login-access"]`

---

### fwd-19 — Token expiry, single-purpose scope, and rotation are mandatory
**Question:** What lifetime and scope rules must no-login tokens obey for Prepared Workspace and adjacent contact touchpoints?  
**References:**
- OWASP Forgot Password Cheat Sheet — short-lived tokens; single use where applicable — https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
- OAuth 2.0 — refresh vs access token lifetimes (RFC 6749) — https://www.rfc-editor.org/rfc/rfc6749
- OWASP Session Management Cheat Sheet — token expiration / rotation — https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
**Thesis gap:** Eternal magic links in agent SMS become a permanent backdoor to firm-branded packs and later touchpoints.  
**Solution:** Bind each token to purpose + expiry (short TTL for first open; optional rotating session token after redeem), refuse reuse outside scope, and allow operator revoke so that no-login access remains time-bounded and purpose-scoped.  
**Handoff:** both

**implementationProblem:**  
First-text links never expire. Months later anyone with the SMS screenshot still opens Prepared Workspace and downstream Consent request surfaces.

**implementation:**  
On Activation & forward-deploy, you can now set Token TTL and purpose scope (prepared-workspace-open / touchpoint-continue).  
On Prepared Workspace no-login, expired tokens show Expired — Regenerate link required.  
On In-flight activations, you can now Revoke token; Audit trail records revoke and expiry.

**implementationAdds:** `["token-ttl", "purpose-scope", "token-revoke", "rotate-after-redeem"]`

---

### fwd-20 — Tokens are hashed at rest; raw secrets only at issue time
**Question:** How must Tower store no-login tokens so database leakage does not equal workspace takeover?  
**References:**
- OWASP Forgot Password Cheat Sheet — store hashes of tokens — https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
- NIST SP 800-63B — authenticator secrets / verifiers — https://pages.nist.gov/800-63-3/sp800-63b.html
- OWASP Password Storage Cheat Sheet (verifier mindset for opaque secrets) — https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
**Thesis gap:** CTO-default “save the magic link string” leaves every Prepared Workspace readable after a DB dump.  
**Solution:** Persist only a cryptographic hash (plus metadata: instance, purpose, expiry, redeem count); show the raw token solely at issuance to the intended channel so that datastore compromise does not yield live capability URLs.  
**Handoff:** cto

**implementationProblem:**  
Access tokens sit in plaintext in activation rows and logs. A read replica leak opens every in-flight Prepared Workspace.

**implementation:**  
On Activation & forward-deploy, raw token is shown once at Issue link — thereafter only status (active / redeemed / expired / revoked).  
On Audit trail, token events never include the raw secret.  
CTO store: hash-only verifiers for capability tokens (no plaintext column).

**implementationAdds:** `["token-hash-at-rest", "issue-once", "raw-secret-never-logged"]`

---

### fwd-21 — Channel delivery of tokens must not leak via Referer or intermediary logs
**Question:** What delivery and URL hygiene rules apply when agent SMS/email carries the Prepared Workspace token?  
**References:**
- OWASP Session Management — tokens in URLs / Referer leakage — https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- RFC 7231 Referer / sensitive data in URLs practice — prefer POST redeem or fragment/one-time exchange — https://httpwg.org/specs/rfc7231.html#header.referer
- Twilio / SMS deep-link delivery practice — https://www.twilio.com/docs/sms/tutorials/how-to-send-sms-messages
**Thesis gap:** Magic links in SMS are required for Approach; careless full-token URLs leak through analytics, proxies, and Referer to third parties.  
**Solution:** Prefer one-time redeem endpoints that exchange a short-lived link token for a session cookie/header (strip token from subsequent navigations) and mark links no-referrer so that Prepared Workspace capability secrets are not forwarded to third-party assets.  
**Handoff:** cto

**implementationProblem:**  
Long-lived token URLs stay in the address bar; third-party scripts and outbound clicks send Referer with the secret. Packs leak beyond the consultant.

**implementation:**  
On Prepared Workspace no-login open, you can now redeem via one-time exchange into a short session — token disappears from the address bar after redeem.  
On contact touchpoints reached from that session, subsequent navigations do not re-expose the capability secret.  
On Activation & forward-deploy, issued links use redeem URLs designed for SMS/email delivery.

**implementationAdds:** `["one-time-redeem", "session-after-redeem", "no-referrer", "link-hygiene"]`

---

### fwd-22 — Touchpoint continuation tokens are distinct from workspace tokens
**Question:** How do no-login tokens for Prepared Workspace relate to later Opt-in / Consent / Nudge touchpoints on the same activation?  
**References:**
- OAuth 2.0 — scope separation (RFC 6749) — https://www.rfc-editor.org/rfc/rfc6749
- OWASP Access Control — least privilege / function-level access — https://owasp.org/www-project-top-10-for-large-language-model-applications/ (least-privilege adjacency); classic: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- CASL touchpoint surfaces — Consent request · Opt-in message (seat 3) — token is access, not consent
**Thesis gap:** One eternal “firm token” will be reused to open Consent request and client forms — over-privilege and confused audit.  
**Solution:** Issue distinct purpose-scoped tokens (or scoped sessions) for Prepared Workspace vs later contact touchpoints, each with own expiry and revoke, so that stealing a workspace preview link is not authority to act on Consent request or book motions.  
**Handoff:** both

**implementationProblem:**  
A single magic link opens Prepared Workspace, Consent request, and Authorize book. Leakage of the Approach deliverable link becomes full activation authority.

**implementation:**  
On Activation & forward-deploy, you can now see separate Token purposes: prepared-workspace vs touchpoint-continue (Consent request / Opt-in adjacency).  
On Prepared Workspace token redeem, you do not gain Authorize book or Consent request authority without a new scoped issue.  
On Audit trail, you can now filter token events by purpose scope.

**implementationAdds:** `["purpose-workspace", "purpose-touchpoint", "scope-separation", "least-privilege-token"]`

---

## Cross-cutting (seat-local)

| Edge | Items | Sync before deep absorb |
|---|---|---|
| Approach claim dictionary ↔ hydrate scope | `fwd-17`, ads seat claims | PM: deliverable language = public-facts pack only |
| CASL identity ↔ firm-faced branding | `fwd-12`, `casl-09` | Firm is face; Om Coda platform-only |
| Contact touchpoints ↔ token scope | `fwd-18`–`fwd-22`, seat 3 surfaces | Token ≠ consent; purpose-scoped |
| Activation Progress ↔ generator gates | `fwd-07`, `fwd-14`, `fwd-16` | Ready ≠ empty shell |

**implementationPlant:** `not_done` on every item until CT plant.
