# 1. Product identity

## 1.1 One-line value

Give us your contacts; we engage them, keep their immigration picture current, and surface when eligibility changes — without manually rechecking every file.

## 1.2 What Tower is

Tower is a **proactive eligibility engine wrapped in engagement** for immigration consultancies, operated by **Om Coda as an agency product** across firms — not a self-serve tool each firm configures alone.

While a firm has contacts and hands-free operation is armed, Tower must continuously:

1. Keep engaging dormant and active contacts.
2. Keep immigration-relevant facts fresh via firm→client touchpoints.
3. Re-evaluate **service eligibility** as IRCC-shaped reference and client facts move.
4. Surface campaign-worthy people so consultants book meetings without rechecking every file.

**Core outcome:** detect service-eligible candidates and initiate the right campaign motion (launch / nudge / reactivation) whose success event is **meeting booked**.

**World sentence (compressed):** Tower acquires a stranger consultant (one-tap Meta Approach: name + website + channel inside a click budget, or an assisted door into the same app), activates by forward-deploying a no-login prepared campaign under their firm identity until they authorize database access and accept escrow, then runs the firm desk loop over the private book toward booked meetings — without inventing public-before-contact detection of end-client eligibility.

## 1.3 Buyer and market

- **Buyer:** Immigration consultancies / practices that hold or can obtain contact lists (past clients, leads, CRM exports, spreadsheets) and sell immigration services.
- **Primary acquired persona:** Consultant / firm operator at the desk.
- **Geography (V1 working assumption):** Canadian immigration pathways (Express Entry / CEC / FSW / FST / PNP, CRS draws, ECA, EE profile freshness, category draws). Other countries are not forbidden later; V1 truth and matrix are Canada-shaped.
- **Who holds the list:** The **firm**. End-client eligibility is private — computed from firm-held + engagement-collected facts against house-held / configured rules.

## 1.4 What Tower is not

- A reactive CRM (“what do I do when someone emails?”).
- A public finder / scrape-first acquisition of **end-clients**.
- A money transmitter holding immigrant settlement funds. End-clients pay Tower nothing.
- A sales “Database Opportunity Assessment” ceremony dressed as Audit.
- An Agent desk / Agent seat. Agent presentation is a capability, not a persona.
- A full end-client operator console in V1. Contacts receive firm-branded touchpoints (and, later in the snapshot, a no-login workspace). **UNRESOLVED:** how deep the contact desk should go (touchpoint-only vs authenticated portal) was a Seed silence; a contact workspace later appeared without a Seed rewrite.
- Self-serve onboarding as the growth bet. The stranger filling long forms is not the Tower bet.

## 1.5 Adjacent incumbents (insufficient)

| Class | Why not Tower |
|-------|----------------|
| Classic CRM | Reactive inbox / pipeline |
| Marketing automation | Blasts without immigration re-evaluation |
| Spreadsheet + memory | No always-on re-crunch, no sequence system |
| Sales HTML “opportunity assessment” | Marketing collateral, not in-app Audit |

## 1.6 Bets (from Seed; still the intended commercial posture)

**Product bet.** Firms will pay for always-on engagement + eligibility re-crunch over their book.

**Growth bet (ALG).** Consultancies convert into *running* clients if one tap in a Meta feed makes a prepared campaign workspace legible, cheap public seed inputs provision that workspace, and an agent earns the hard inputs (database authorization + escrow) before the campaign runs. Assisted / operator-led entry (OLG) remains a real second door into the **same** application.

**Contingent-cost bet.** Prefer buyer cost zero or held until outcome terms are met. At the activation payment moment the presented door is **escrow**, not prepaid credits and not a sales-call as a peer door. Ongoing SaaS packaging later **must not** replace escrow as a peer door at that moment. **UNRESOLVED:** escrow *release* trigger / outcome definition.

**Agent bet.** Agent presentation may ask, explain, and route. It must **not** scrape, instantiate templates, persist captures, fire sequences, evaluate rules, issue OTP, or move money. Those belong to Automations / Wiring.

**Vertical modularity bet.** The same product shape (always-on eligibility + engagement over a private book) should serve another vertical by swapping industry criteria packs, not by forking the graph.

## 1.7 Company shape (why an Operator desk exists)

Om Coda runs Tower across firms as an agency. Therefore evaluation rules, analysis, operational logic, data criteria, and reference-data upkeep belong to an **operator/house configuration-and-oversight layer** that must stay inspectable and changeable **without a code deploy** (open box). Firms inhabit the book and the meetings; they do **not** author the packs that run the product.

## 1.8 Facet order (immutable)

**Acquisition → Activation → Application → Evolution.**

| Facet | Finish line |
|-------|-------------|
| Acquisition | Name + website + one channel (phone or email) inside the click budget |
| Activation | Database authorization + escrow acceptance; campaign can **run** |
| Application | Detect → engage → collect → re-detect toward meeting booked |
| Evolution | Product change from running-firm feedback. Not a client lifecycle phase. |

Forward-deploy belongs to Activation, even when it looks like marketing. The click budget belongs to Acquisition only. Application must not be redesigned to make the growth bet cheaper.

## 1.9 Two sides of eligibility

1. **Law / public-reference change** — versioned IRCC-shaped tables the house maintains as data.
2. **Life change on the contact** — facts only the person or the firm file can know.

Storing the book and never reaching out serves only (1). (2) requires asking and telling — the engagement loop — which is why consent / PII posture is necessary.
