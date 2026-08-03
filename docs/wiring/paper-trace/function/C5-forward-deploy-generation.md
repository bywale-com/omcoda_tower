# C5 Forward-deploy generation — Function wiring traces

Paper-only Wiring Function traces for capability seat C5: public firm facts, brand extraction, template hydration, and no-login access for a Prepared Workspace before a firm connects anything.

## Local node list

Shared seed nodes fused here:

| Node | Status | Local use |
|---|---|---|
| `firm_tenancy` | existing | Firm boundary, public identity, activation ownership. |
| `enrichment_fact` | existing | Public-facts crawl result and typed fact snapshot. |
| `brand_extract` | existing | Public brand assets, colors, and sourced copy. |
| `prepared_workspace` | existing | Hydrated workspace instance and readiness state. |
| `access_token` | existing | Opaque no-login capability token state. |
| `audit_trail` | existing | Append-only enrichment, hydrate, and token events. |

Seat-local nodes discovered while tracing:

| Node | Status | Local use |
|---|---|---|
| `enrichment_root` | new | Verified public URL and secondary listing identities for one firm. |
| `crawl_permission` | new | Robots.txt and crawl-directive decision per root and path set. |
| `public_fact_policy` | new | Versioned allowlist of pre-connect public fact classes. |
| `source_provenance` | new | Field-level source, confidence, conflict, and winner state. |
| `crawl_budget` | new | Per-host rate, user-agent identity, backoff, and cache posture. |
| `public_fetch_cache` | new | Reusable public fetch body/metadata within TTL. |
| `fact_schema` | new | Typed firm-fact keys and extract-method confidence. |
| `fact_freshness` | new | Fetched-at, TTL, stale, and refresh gate state. |
| `brand_contrast_result` | new | Accessible text-on-brand color pair results. |
| `voice_excerpt` | new | Sourced public copy excerpt, URL, and hash. |
| `brand_package` | new | Versioned logo, palette, and voice package bound to a workspace. |
| `engagement_template_version` | new | Pinned house template contract for forward-deploy hydration. |
| `hydrate_job` | new | Template plus fact plus brand binding run. |
| `merge_field_contract` | new | Required merge keys and validation result. |
| `workspace_readiness` | new | Hydration, freshness, branding, and issue gates. |
| `deliverable_scope` | new | Pre-connect public-facts promise applied to templates. |
| `token_policy` | new | Purpose, TTL, rotation, revoke, and verifier rules. |
| `redeem_session` | new | Short no-login session issued after one-time token redeem. |

## Traces

### `fwd-01` — Verified public URL starts enrichment
**Implementation (source):** Forward-deploy requires a verified, resolvable firm-controlled public URL before enrichment or workspace readiness can advance.
**Start:** `Starting from firm_tenancy (existing)`
**Path:**
1. When a forward-deploy firm is created in `firm_tenancy`, an `enrichment_root` is required before any public-facts run may open [firm-bound root, optional listing IDs only secondary].
2. When the root URL resolves and matches the firm identity, `enrichment_fact` may begin collecting public facts for that firm.
3. When the root URL fails resolve or firm-match, `prepared_workspace` keeps prepared-workspace-ready closed.
4. When either decision lands, `audit_trail` records the root, match result, and block or proceed event.
**Nodes touched:**
- `firm_tenancy`
- `enrichment_root`
- `enrichment_fact`
- `prepared_workspace`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; External Systems; Identity / Security / Compliance.

### `fwd-02` — Robots decisions gate crawl paths
**Implementation (source):** Enrichment fetches and honors robots.txt and crawl directives before path fetch, failing closed for disallowed paths.
**Start:** `Starting from enrichment_root (existing)`
**Path:**
1. When `enrichment_root` is verified, `crawl_permission` fetches robots and directive state for the enrichment user-agent [fail closed on unavailable or disallowed permission state].
2. When `crawl_permission` marks a path allowed, `enrichment_fact` may receive facts from that path.
3. When `crawl_permission` marks a path disallowed, `enrichment_fact` receives no content from that path.
4. When a robots decision is made, `audit_trail` appends the user-agent, root, path set, and allow/deny result.
**Nodes touched:**
- `enrichment_root`
- `crawl_permission`
- `enrichment_fact`
- `audit_trail`
**Facets swept:** Core Application & Runtime; External Systems; Identity / Security / Compliance; Infrastructure & Operations.

### `fwd-03` — Public-facts allowlist filters enrichment
**Implementation (source):** Pre-connect enrichment stores only already-public firm facts and drops private, authenticated, or person-sensitive fields.
**Start:** `Starting from enrichment_fact (existing)`
**Path:**
1. When page content is extracted into `enrichment_fact`, `public_fact_policy` evaluates each candidate field against the pre-connect allowlist [legal name, public contact, public site copy, hours, services, public logo assets].
2. When `public_fact_policy` accepts a field, `enrichment_fact` stores the field with its public class.
3. When `public_fact_policy` rejects a field, `prepared_workspace` cannot hydrate that value from enrichment output.
4. When fields are dropped, `audit_trail` records the policy version and rejected class without preserving private content.
**Nodes touched:**
- `enrichment_fact`
- `public_fact_policy`
- `prepared_workspace`
- `audit_trail`
**Facets swept:** Data Storage & Management; Identity / Security / Compliance; Core Application & Runtime.

### `fwd-04` — Listing facts are secondary with provenance
**Implementation (source):** GBP and similar listing facts supplement the firm site with field-level provenance and firm-site preference on conflicts.
**Start:** `Starting from enrichment_root (existing)`
**Path:**
1. When `enrichment_root` includes a listing identity, `enrichment_fact` may collect listing-native public fields after the firm site has been addressed.
2. When site and listing values differ, `source_provenance` stores both values, their source, and the conflict winner [prefer firm-site except listing-native fields].
3. When `prepared_workspace` hydrates a conflicted field, it binds the winning value and keeps source context reviewable.
4. When conflict resolution occurs, `audit_trail` records the field, sources, and selected provenance.
**Nodes touched:**
- `enrichment_root`
- `enrichment_fact`
- `source_provenance`
- `prepared_workspace`
- `audit_trail`
**Facets swept:** External Systems; Data Storage & Management; Core Application & Runtime.

### `fwd-05` — Polite crawler posture controls scale
**Implementation (source):** Per-host rate limits, crawler identity, backoff, and fetch caching keep enrichment from hammering firm origins.
**Start:** `Starting from enrichment_root (existing)`
**Path:**
1. When a root host is queued from `enrichment_root`, `crawl_budget` assigns the user-agent identity, contact URI, host rate, and backoff state.
2. When a fetch is requested, `public_fetch_cache` is checked before origin access [reuse fresh public fetches within TTL].
3. When the cache misses and `crawl_budget` allows a request, `enrichment_fact` receives the public response.
4. When the host blocks, throttles, or fails, `crawl_budget` moves into polite backoff and `audit_trail` records the capped retry posture.
**Nodes touched:**
- `enrichment_root`
- `crawl_budget`
- `public_fetch_cache`
- `enrichment_fact`
- `audit_trail`
**Facets swept:** External Systems; Infrastructure & Operations; Cost / FinOps; Core Application & Runtime.

### `fwd-06` — Structured firm facts feed hydration
**Implementation (source):** Public pages are extracted into typed firm-fact keys with preferred structured data and confidence on fallback heuristics.
**Start:** `Starting from enrichment_fact (existing)`
**Path:**
1. When allowed content reaches `enrichment_fact`, `fact_schema` maps it into typed keys such as name, phone, address, service blurb, hours, and logo URL [JSON-LD preferred, OG fallback, heuristic lower confidence].
2. When a key is populated, `source_provenance` stores extract method and confidence beside the value.
3. When `prepared_workspace` hydrates, it binds to `fact_schema` keys rather than raw page markup.
4. When a low-confidence heuristic key is used, `workspace_readiness` marks that key for confirm before ready.
**Nodes touched:**
- `enrichment_fact`
- `fact_schema`
- `source_provenance`
- `prepared_workspace`
- `workspace_readiness`
**Facets swept:** Data Storage & Management; Core Application & Runtime; External Systems.

### `fwd-07` — Freshness clock blocks stale packs
**Implementation (source):** Firm-fact snapshots carry fetched-at and TTL state, and stale facts block hydrate or ready until refresh.
**Start:** `Starting from enrichment_fact (existing)`
**Path:**
1. When `enrichment_fact` publishes a fact snapshot, `fact_freshness` stamps fetched-at, TTL, and source validators.
2. When `fact_freshness` is current, `hydrate_job` may use the snapshot for `prepared_workspace` generation.
3. When `fact_freshness` is stale, `workspace_readiness` closes the freshness gate and requires refresh before ship or open-as-ready.
4. When refresh completes, `audit_trail` links the old snapshot, new snapshot, and freshness decision.
**Nodes touched:**
- `enrichment_fact`
- `fact_freshness`
- `hydrate_job`
- `prepared_workspace`
- `workspace_readiness`
- `audit_trail`
**Facets swept:** Data Storage & Management; Core Application & Runtime; Infrastructure & Operations.

### `fwd-08` — Logo capture uses public brand surfaces
**Implementation (source):** Logo resolution follows a public-source priority chain and falls back to a neutral unconfirmed placeholder.
**Start:** `Starting from enrichment_fact (existing)`
**Path:**
1. When public assets are present in `enrichment_fact`, `brand_extract` resolves logo candidates from schema logo, touch icon, guarded OG image, and listing profile image [do not treat generic photos as marks].
2. When a candidate is accepted, `brand_package` receives the logo asset reference and source.
3. When no candidate is accepted, `brand_package` receives a neutral placeholder and logo-unconfirmed state.
4. When `prepared_workspace` renders the firm face, it uses the accepted logo or placeholder, never a platform mark as the firm mark.
**Nodes touched:**
- `enrichment_fact`
- `brand_extract`
- `brand_package`
- `prepared_workspace`
**Facets swept:** External Systems; Core Application & Runtime; Data Storage & Management.

### `fwd-09` — Palette extraction keeps colors attributable and readable
**Implementation (source):** Brand colors come from attributable public surfaces and must pass contrast checks before use.
**Start:** `Starting from brand_extract (existing)`
**Path:**
1. When `brand_extract` has theme-color, nav style, or logo-derived candidates, `brand_contrast_result` evaluates text-on-brand pairs [reject photo-biased samples].
2. When a color pair passes, `brand_package` stores the palette with source and contrast result.
3. When no pair passes, `brand_package` stores the neutral fallback palette.
4. When `prepared_workspace` hydrates chrome, it applies only the stored contrast-safe or neutral palette.
**Nodes touched:**
- `brand_extract`
- `brand_contrast_result`
- `brand_package`
- `prepared_workspace`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `fwd-10` — Voice snippets stay sourced
**Implementation (source):** Brand voice fields are sourced public excerpts, not model-invented copy.
**Start:** `Starting from enrichment_fact (existing)`
**Path:**
1. When public site copy is accepted into `enrichment_fact`, `voice_excerpt` stores quoted or lightly truncated snippets with source URL and excerpt hash.
2. When `brand_extract` assembles voice fields, it may use only `voice_excerpt` entries.
3. When `prepared_workspace` hydrates brand copy, it renders attributable excerpts and excludes invented brand voice.
4. When an excerpt is bound, `audit_trail` records the URL, hash, and target field.
**Nodes touched:**
- `enrichment_fact`
- `voice_excerpt`
- `brand_extract`
- `prepared_workspace`
- `audit_trail`
**Facets swept:** Data Storage & Management; Core Application & Runtime; Identity / Security / Compliance.

### `fwd-11` — Brand package versions separate from facts
**Implementation (source):** Logo, palette, and voice artifacts are versioned independently from fact snapshots with explicit re-extract or keep-brand behavior.
**Start:** `Starting from brand_extract (existing)`
**Path:**
1. When `brand_extract` publishes logo, palette, and voice outputs, `brand_package` creates a version independent of `enrichment_fact`.
2. When `enrichment_fact` refreshes, `hydrate_job` receives an explicit choice to keep the current `brand_package` or bind a re-extracted version.
3. When `prepared_workspace` is generated or regenerated, it records both the fact snapshot version and brand package version.
4. When the brand binding changes, `audit_trail` records keep-brand or re-extract.
**Nodes touched:**
- `brand_extract`
- `brand_package`
- `enrichment_fact`
- `hydrate_job`
- `prepared_workspace`
- `audit_trail`
**Facets swept:** Data Storage & Management; Core Application & Runtime; Infrastructure & Operations.

### `fwd-12` — Incomplete branding remains firm-faced
**Implementation (source):** Incomplete branding shows the firm public name and neutral chrome, never Om Coda marks as the firm's identity.
**Start:** `Starting from brand_package (existing)`
**Path:**
1. When `brand_package` is incomplete, `prepared_workspace` reads the firm public name from `firm_tenancy` and sets branding-unconfirmed.
2. When branding-unconfirmed is active, `prepared_workspace` renders neutral chrome and keeps platform marks only in platform identity positions.
3. When the consultant confirms or replaces branding, `brand_package` updates its confirmation state.
4. When confirmation state changes, `audit_trail` records the firm-faced fallback or confirmed package.
**Nodes touched:**
- `brand_package`
- `prepared_workspace`
- `firm_tenancy`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Identity / Security / Compliance; Data Storage & Management.

### `fwd-13` — Hydrate job binds templates to facts and brand
**Implementation (source):** A hydrate job pins a template version to a fact snapshot and brand package, then emits a Prepared Workspace instance.
**Start:** `Starting from engagement_template_version (new)`
**Path:**
1. When a forward-deploy template is selected, `engagement_template_version` is pinned for the activation.
2. When pinned template, current `enrichment_fact`, and selected `brand_package` are all available, `hydrate_job` creates a binding run.
3. When `hydrate_job` succeeds, `prepared_workspace` receives a workspace instance with template, fact, and brand identifiers.
4. When the instance is created, `workspace_readiness` marks hydrated as a separate gate and `audit_trail` records the binding inputs.
**Nodes touched:**
- `engagement_template_version`
- `enrichment_fact`
- `brand_package`
- `hydrate_job`
- `prepared_workspace`
- `workspace_readiness`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Infrastructure & Operations.

### `fwd-14` — Required merge fields fail closed
**Implementation (source):** Hydration validates required template fields against the fact record and leaves missing keys in needs-facts state.
**Start:** `Starting from hydrate_job (existing)`
**Path:**
1. When `hydrate_job` starts, `merge_field_contract` loads required keys from `engagement_template_version`.
2. When `merge_field_contract` finds all required keys in `enrichment_fact`, `prepared_workspace` may receive bound blocks.
3. When keys are missing, `prepared_workspace` records needs-facts and `workspace_readiness` keeps ready closed.
4. When missing keys are reported, `audit_trail` records the contract version and key names without treating blanks as success.
**Nodes touched:**
- `hydrate_job`
- `merge_field_contract`
- `engagement_template_version`
- `enrichment_fact`
- `prepared_workspace`
- `workspace_readiness`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `fwd-15` — Workspace instances are immutable snapshots
**Implementation (source):** Prepared Workspace instances do not silently change; template or fact changes require explicit regenerate into a new version.
**Start:** `Starting from prepared_workspace (existing)`
**Path:**
1. When `prepared_workspace` receives a successful hydrate result, it stores an immutable instance version with bound template, fact, and brand identifiers.
2. When `enrichment_fact`, `brand_package`, or `engagement_template_version` changes later, the existing `prepared_workspace` version remains unchanged.
3. When Regenerate is requested, `hydrate_job` emits a new `prepared_workspace` version and the old access policy remains explicitly governed.
4. When hydrate or regenerate occurs, `audit_trail` records the issued snapshot and replacement lineage.
**Nodes touched:**
- `prepared_workspace`
- `hydrate_job`
- `enrichment_fact`
- `brand_package`
- `engagement_template_version`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `fwd-16` — Readiness depends on hydrate quality
**Implementation (source):** Prepared-workspace-ready requires hydration, freshness, and accepted branding rather than mere shell existence.
**Start:** `Starting from prepared_workspace (existing)`
**Path:**
1. When a `prepared_workspace` instance exists, `workspace_readiness` evaluates hydrate status, `fact_freshness`, merge validation, and brand acceptance.
2. When all gates pass, `workspace_readiness` opens prepared-workspace-ready for walkthrough.
3. When any gate is closed, `prepared_workspace` remains shell-only or needs-review and cannot present as ready.
4. When gate state changes, `audit_trail` records the readiness transition and contributing gate states.
**Nodes touched:**
- `prepared_workspace`
- `workspace_readiness`
- `fact_freshness`
- `merge_field_contract`
- `brand_package`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Infrastructure & Operations.

### `fwd-17` — Hydration honors the public-facts deliverable
**Implementation (source):** Forward-deploy hydration stays inside a pre-connect public-facts pack and excludes connected-book or live-send claims.
**Start:** `Starting from engagement_template_version (existing)`
**Path:**
1. When a template version is selected for forward-deploy, `deliverable_scope` marks it as pre-connect public-facts only.
2. When `hydrate_job` binds the template, `deliverable_scope` excludes blocks that assert enrolled clients, connected books, or live sending.
3. When `prepared_workspace` renders, it shows public facts, brand, template preview, and next-step motions without claiming authority not yet granted.
4. When a scoped block is removed or allowed, `audit_trail` records the deliverable scope decision.
**Nodes touched:**
- `engagement_template_version`
- `deliverable_scope`
- `hydrate_job`
- `prepared_workspace`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Identity / Security / Compliance; Data Storage & Management.

### `fwd-18` — Opaque tokens open Prepared Workspace
**Implementation (source):** No-login access uses high-entropy opaque capability tokens bound to one Prepared Workspace instance.
**Start:** `Starting from prepared_workspace (existing)`
**Path:**
1. When a `prepared_workspace` instance is issued, `access_token` may be created for that single instance [opaque bearer secret, not a sequential workspace id].
2. When a no-login open request presents a valid token, `prepared_workspace` grants only the instance-bound view.
3. When a request presents only an id, slug, or invalid token, `prepared_workspace` denies no-login access.
4. When a token is issued or used, `audit_trail` records the event without storing the raw secret.
**Nodes touched:**
- `prepared_workspace`
- `access_token`
- `audit_trail`
**Facets swept:** Identity / Security / Compliance; Core Application & Runtime; Data Storage & Management.

### `fwd-19` — Token lifetime and purpose are mandatory
**Implementation (source):** No-login tokens carry purpose scope, expiry, rotation after redeem, and operator revoke state.
**Start:** `Starting from access_token (existing)`
**Path:**
1. When `access_token` is issued, `token_policy` binds purpose, TTL, redeem count, rotation behavior, and revoke state.
2. When a token is redeemed within purpose and TTL, `prepared_workspace` opens or a scoped `redeem_session` is created.
3. When a token is expired, revoked, or used outside purpose, `prepared_workspace` refuses access and requires a fresh issue path.
4. When expiry, redeem, rotate, or revoke occurs, `audit_trail` records the token id, purpose, and state transition.
**Nodes touched:**
- `access_token`
- `token_policy`
- `prepared_workspace`
- `redeem_session`
- `audit_trail`
**Facets swept:** Identity / Security / Compliance; Core Application & Runtime; Data Storage & Management.

### `fwd-20` — Token verifiers are hash-only at rest
**Implementation (source):** Raw capability secrets are shown only at issue time while stored token state keeps a cryptographic verifier and metadata.
**Start:** `Starting from access_token (existing)`
**Path:**
1. When `access_token` is issued, the raw secret is emitted once to the intended delivery channel and never written to persistent state.
2. When token state is stored, `access_token` keeps only the hash verifier plus instance, purpose, expiry, and redeem metadata.
3. When a no-login request arrives, `access_token` compares the presented secret to the verifier before `prepared_workspace` can open.
4. When token events are appended, `audit_trail` stores issue, redeem, expire, and revoke metadata without the raw secret.
**Nodes touched:**
- `access_token`
- `prepared_workspace`
- `audit_trail`
**Facets swept:** Identity / Security / Compliance; Data Storage & Management; Core Application & Runtime.

### `fwd-21` — Redeem flow removes secrets from navigation
**Implementation (source):** Delivered links use one-time exchange into a short session and strip token secrets from later URLs and referers.
**Start:** `Starting from access_token (existing)`
**Path:**
1. When a token link is prepared for SMS or email, `access_token` is wrapped as a one-time redeem URL [no reusable full-secret navigation].
2. When the link is opened, `access_token` is exchanged into `redeem_session` and the token is removed from the addressable workspace URL.
3. When `prepared_workspace` loads third-party or downstream links, `redeem_session` carries access without forwarding the capability secret.
4. When redeem succeeds or fails, `audit_trail` records the token id, session id, and delivery-safe transition.
**Nodes touched:**
- `access_token`
- `redeem_session`
- `prepared_workspace`
- `audit_trail`
**Facets swept:** Identity / Security / Compliance; Core Application & Runtime; External Systems; Infrastructure & Operations.

### `fwd-22` — Touchpoint tokens are distinct from workspace tokens
**Implementation (source):** Prepared Workspace access and later contact touchpoints use separate purpose-scoped tokens or scoped sessions.
**Start:** `Starting from access_token (existing)`
**Path:**
1. When `access_token` is issued for prepared-workspace-open, `token_policy` prevents that token from authorizing touchpoint continuation or book motions.
2. When a later contact touchpoint needs no-login continuation, a separate `access_token` purpose is issued with its own TTL and revoke state.
3. When `prepared_workspace` token redeem succeeds, it grants only workspace preview authority unless a new scoped token is present.
4. When tokens are filtered or reviewed, `audit_trail` separates events by purpose scope.
**Nodes touched:**
- `access_token`
- `token_policy`
- `prepared_workspace`
- `audit_trail`
**Facets swept:** Identity / Security / Compliance; Core Application & Runtime; Data Storage & Management.
