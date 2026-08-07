# Where the fake app breaks — the sending-identity wall

**Status:** Status + doctrine + PM reconciliation (framing on Pass A / hand-back — does not retag inventory counts)  
**Parent:** [`00-INDEX.md`](./00-INDEX.md) · [`HUMAN-ONLY.md`](./HUMAN-ONLY.md)  
**Anchors:** SME C1 `deliv-04` / `deliv-19` / `deliv-20` · CASL `casl-09` · Pass A human-only cluster · Activation automation intent

---

## 1. The design intent (hold this throughout)

We are building so the system is **as in-app as possible** — it connects to things and needs only the
**right inputs** from the firm, never "go do a project in an external tool." This matters double because
**activation is automated** — a human isn't shepherding each firm through setup, so anything that *requires*
an external human act is a wall the automated flow hits and stops at. The goal is to shrink those walls to
**inputs**, not tasks.

---

## 2. What genuinely cannot be modeled (the irreducible residue)

Of 67 external touchpoints in Pass A: **47 modelable · 15 human-only · 5 defer.** The 15 human-only are the
only things a stand-in cannot fake. They split three ways:

- **Human-by-provisioning (8 in the sending/ads cluster; 10 total incl. money)** — real-world setup acts, one-time per firm:
  SPF · DKIM · DMARC · return-path DNS · PTR/rDNS · Postmaster/FBL enrollment · Canadian SMS number (not US TCR) · Meta Business verification
  *(plus payment identity outside this wall).*
- **Human-by-design (3 named in the wall framing; 5 total in Pass A)** — meant to stay human, not a gap:
  consultant halt/refusal (licensed decision) · counsel authoring CASL/silence policy · firm admin CRM OAuth grant
  *(plus counsel MT/MSB and ad-export auth in the full table).*
- **Minor edges (rest)** — reply-route forwarding, the refuse side of halt (store itself is modelable).

**5 defer** = CRM continuous-sync / vertical-OAuth-pull / write-back / Gmail-throttle-plane — already chosen
out of V1 (KU #7). Not walls, just future.

Canonical fixtures / `humanKind`: [`HUMAN-ONLY.md`](./HUMAN-ONLY.md).

---

## 3. Where the app actually breaks (the whole point)

Everything before "send for real" or "advertise for real" runs fully in the fake app — import, detection,
eligibility, sequencing, consent capture, meeting-booking, escrow logic, the operator console, the runtime.
The app breaks at **two doors**, and both are "a real identity must exist first":

- **Break 1 — actually sending** (email/SMS leaves for a real inbox). Most of the provisioning acts live here.
- **Break 2 — actually advertising** (Meta go-live) — needs Meta Business verification. **Deferred** — not V1.

So after deferring Meta, there is **one critical wall: sending.**

---

## 4. The runtime is NOT a wall — it fakes cleanly

The runtime (the engine that reads a reply, decides the next attempt, fires the next channel, honors stop,
escalates) is **`modelable`**. A full fake runtime runs the entire loop against stand-in seams:

- **send-out** → stand-in sink
- **reply-in** → faked inbound
- **reputation feed** → synthetic samples

The engine's *logic* is entirely in-app. Its **only real dependency is the send identity** — one real doorway.
Swap the stand-in send for a provisioned send and the same runtime is live, no rewrite. This is the proof of
the "connects to things, needs only inputs" model: the engine is complete in-app; provisioning is the input.

---

## 5. How far the sending wall collapses in-app (firm-zone path)

If activation assumes the firm must authenticate **their own** From domain, provider APIs (Resend-class) absorb most of the cluster:

- **App generates programmatically** — create the sending domain via API; the exact SPF/DKIM/DMARC + return-path
  records come back from the API. The app *produces* them, doesn't send anyone to a tool.
- **App verifies + monitors** — polls DNS, flips readiness chips green, watches DNSBL/reputation — all automated,
  no human judgment.
- **Provider owns IP + warmup** — managed dedicated IP with auto warm-up/autoscale → PTR/rDNS and warmup stop
  being anyone's task.
- **Postmaster/reputation** returns as ingested data, not a place someone visits (after enrollment fixture).

**What's left on that path: one firm input** — the generated DNS records must land on the **firm's domain.**
A human pastes them, *or the firm delegates DNS access and the app/operator does it for them.* For DNS-averse
firms there is a weaker fallback: **verified sender identity via click-a-link** (no DNS edit) — acceptable for
lower volume, not ideal for reactivation-grade deliverability.

**Net (firm-zone path):** the critical wall collapses from "many human acts" to **"one input: DNS records on the firm's domain
(paste, delegate, or click-fallback)."** Everything around it is in-app and automated — which fits automated
activation: the flow runs, hits "need DNS," collects the one input or delegated grant, verifies itself, continues.

This is the **upgrade / custom-domain** path in C1 (`custom-domain-attach`). It is **not** the only path — see §7.

---

## 6. What needs to be done (the sending wall)

- **App work (build now, modelable):** readiness surface per firm (per-record chips); API-driven
  generate → verify → monitor flow; fail-closed send gate (`send_gate_decision`); the human-provided **fixture**
  so stand-ins can't fake "provisioned" (see fixture honesty in [`../STANDIN-WIRING.md`](../STANDIN-WIRING.md)).
- **The one input (custom-domain path):** firm pastes DNS records, or delegates DNS access, or (fallback) click-to-verify.
- **Pool path (default — §7):** Om Coda publishes auth on house-managed zones — **no firm DNS act**.
- **Provider config:** managed dedicated IP + auto-warmup so IP/PTR/warmup are off the human's plate.
- **Meta ads:** deferred (incl. the `ads-09`/`ads-18` Special-Ad-Category counsel question).

---

## 7. PM reconciliation — what happened to sending under *our* domain?

### Verdict

**The idea already landed in C1 as the default.** It holds. Automated activation should treat **house-managed per-firm branded subdomains** as the zero-firm-DNS path; **firm-zone / custom-domain attach** is the upgrade for firms that want apex/custom brand alignment — not the unlock for first live send.

### Where it lives (doctrine, already filed)

| Item | Doctrine | Meaning for the wall |
|---|---|---|
| `deliv-04` | Allocate each firm a dedicated branded sending subdomain from a **house-managed pool**; optional later **custom-domain attach** | Day-one From identity lives on infrastructure Om Coda controls. Firm DNS paste is **not** required to arm send. |
| `deliv-19` | From = local-part + domain on that authenticated branded subdomain; **display name = firm**; **no shared** `noreply@omcoda…` CEM From | "Our domain" ≠ one platform shared From. It is **per-firm subdomain on our pool**, firm-faced. |
| `deliv-20` | Return-Path / custom MAIL FROM is **already platform-controlled** | Bounce plane was never a firm DNS project. |
| `casl-09` | Firm is person **on whose behalf**; Om Coda = send-platform disclosure only; mailing/contact coords ≥60 days | Domain ownership of the pool does **not** make Om Coda the brand face. CASL is satisfied by firm identification in the CEM, not by the firm owning the DNS zone. |

Roster surface: Capability `00-ROSTER.md` — "Sending-domain pool + per-firm branded subdomains" (house-global Sending infrastructure).

### Answers to the open questions

**Deliverability / authenticity.**  
Sending firm-branded mail from a **dedicated house subdomain** (aligned SPF/DKIM/DMARC on that subdomain, warmed and reputation-isolated per `deliv-04`/`deliv-05`) is the designed V1 path. Inbox placement for reactivation does **not** require the firm’s apex domain on day one; it requires authenticated, warmed, isolated identity + list hygiene. Firm apex/custom attach improves brand familiarity at the protocol layer and is the upgrade when the firm wants it — trade: one DNS input (or delegated grant). Shared platform From is rejected (`deliv-19`) because it breaks both brand and DMARC alignment strategy.

**CASL / identity.**  
Does not change the CEM posture if CEMs keep firm as on-whose-behalf (`casl-09`) with required coords and firm display name on the From identity (`deliv-19`). Om Coda remains infrastructure. Pool subdomain ≠ Om Coda displacing the firm as brand face — as long as we never offer a shared platform From for firm CEMs.

**Trade-off / tiered model.**  
Exactly what C1 already specified:

| Tier | Identity | Firm external act | When |
|---|---|---|---|
| **Default — instant activation** | Per-firm subdomain on house-managed pool | **Zero DNS** (platform publishes auth on our zone) | Automated activation; first live send |
| **Upgrade — full firm-domain alignment** | Custom-domain attach (firm zone) | One input: paste / delegate DNS (or click-fallback) | Firms that want firm-domain From |
| **Rejected** | Shared `noreply@omcoda…` From for firm CEMs | — | Never for firm-branded CEM |

### Effect on the wall (collapse further)

Relative to §5’s firm-zone framing:

| Path | Remaining firm wall for email send identity |
|---|---|
| **Pool (default)** | **Zero firm DNS.** Auth fixtures are satisfied by **platform ops** on the house zone (still real publishes — not inventable by a stand-in without a fixture — but not a firm paste). Composite `sending_identity_ready` still fail-closed until those publishes + warmup posture exist. |
| **Custom-domain (upgrade)** | One firm input: DNS records on the firm’s domain (as in §5). |
| **Still human / later (either path)** | SMS **Canadian number** (if SMS armed — not US TCR; see [`06-SMS-CANADA-GATE.md`](./06-SMS-CANADA-GATE.md)); Postmaster/FBL; Meta Business (**deferred**). Halt/counsel/OAuth remain by-design elsewhere. |

**Automated-activation ideal:** default-then-upgrade → last email-DNS wall for the firm goes from "one input" to **"zero"** on the pool path. That is the intended landing of the earlier our-domain idea — and it holds.

### Framing note for Pass A / fixtures (does not retag counts)

Pass A rows `ext-dns-spf` / `dkim` / `dmarc` / `return-path` remain `human-only` / `by-provisioning` because **someone** must publish real DNS. On the **pool path**, that someone is **Om Coda platform ops** (or the ESP-managed zone we control), not the firm. On the **custom-domain path**, that someone is the firm (or their DNS delegate). Fixtures stay mandatory either way — stand-ins must not auto-green auth. See runbook dual-path note in [`HUMAN-ONLY.md`](./HUMAN-ONLY.md).

---

## 8. Build implications (short)

1. **Sending infrastructure** allocates pool subdomain per firm; Activation ready-to-send reads pool-path fixtures first.  
2. **Custom-domain attach** is an optional later control on the same module — not a V1 activation blocker.  
3. Stand-ins: pool-path fixtures may be marked by **operator/platform** provisioning in test; never by silent auto-pass.  
4. Meta remain deferred; Canadian SMS number (+ CASL consent) remains a separate arming wall when SMS is in scope — not TCR.
