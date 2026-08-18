# Node interior — shared vs kind

**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**.  
**Why:** Founder 2026-08-18 18:58. We drew Input on **Get**. It is not a Get-only pane. If the build only puts that tree on Get, the other nodes are unfinished.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite.  
**Read:** [`PLATE-READ.md`](./PLATE-READ.md). Packets: [`GET-PACKET.md`](./GET-PACKET.md) · [`RULE-OUTCOMES-PACKET.md`](./RULE-OUTCOMES-PACKET.md) · [`RULE-OUTPUT-PACKET.md`](./RULE-OUTPUT-PACKET.md) · [`TRIGGER-SELECT-PACKET.md`](./TRIGGER-SELECT-PACKET.md) · [`NODE-PLACE-PACKET.md`](./NODE-PLACE-PACKET.md).

---

## Paste — engineer

```text
Read docs/register/NODE-INTERIOR.md before any Automations node interior.

Input (left tree: prior nodes in canvas order, outputs nested, Schema / Table / JSON, Search) is every node that has Input. Specimen is A23 left. Do not build that tree only on Get.

Output (top = this run’s writes, click, preview below) is every node that has Output. Specimen is A20. Get’s Output tab is this.

Parameters on A23 right (Module, Every firm / Select firm, Firm, Contact) are Get only. Do not put that cascade on Rule, Action, If, or Trigger.

Outcomes (stacked cards, per-outcome GUI | JS) are Rule only. Specimen is A21. Do not put Outcomes on Get.

Kind-specific middle is that kind’s packet. Shared panes are this file. Do not recut 015. Do not overwrite 15:43.
```

---

## Two shared panes. Two kind panes.

| Pane | Whose | Specimen | What it is |
|------|--------|----------|------------|
| **Input** | **Every** node that has Input | A23 **left** | Prior nodes in **this** chain, canvas order, that node’s outputs nested. Schema / Table / JSON. Search. Fit known write-sets. Do not freeze the pack-update example tree. |
| **Output** | **Every** node that has Output | **A20** | Top = every write **this run** made. Click one. Bottom = that write. |
| **Parameters** | **That kind** | A23 **right** is **Get** | Get: Module + every/select + class cascade (Firm → Contact on Contacts). Action: A7 / A14. Trigger select: **A26** (grain + Local cascade). If: A16. |
| **Outcomes** | **Rule** | **A21** | Stacked. Per-outcome GUI \| JS. On / off. Not a node-wide GUI/Custom tab. |

Get tabs: **Input | Output**. Parameters sit in the Input tab as the right column.  
Rule tabs: **Input | Outcomes | Output**.  
Do not copy Get’s three-level selector onto Rule. Do not copy Rule Outcomes onto Get.

---

## What the engineer would miss without this file

A23 is a Get plate. GET-PACKET says “you are building Get.” Literal: Input tree only on Get. Wrong.

The Input shape was named as **how inputs appear inside nodes** — as they chain, they stack. We used Get as the example because that is the plate we locked. Rule Input, Action Input, If Input are the **same left**. No extra PNG.

Trigger is the start of a chain: it may have **no** prior node. Empty Input is valid. Do not invent a fake ancestor. Do not put Firm / Contact dropdowns on the trigger.

Action / If interiors we already drew (A7, A14, A16) are **Parameters** (the middle). They still get **Input** (stack) and **Output** (A20) even though those plates did not open those tabs. Completes the module. No extra PNG.

**Click the node = configure.** Do not send click to Switch. Switch is **⋯** (A27). First pick / Switch opens the event picker (A26). Wire **+** is A28.

**Test** fills these panes with a simulated write-set (law 39). A mapped write is a **chip** in the box (law 40 · A29).

---

## Direct Input vs Get

On a **Rule** (and anywhere Input can pick who already exists): you can point at records that are already in the system (Automations Contacts / the book). That is Input using the same left + a kind-specific pick. **Get** is the node when the write **does not exist yet** and must be read from a module at a grain. Do not use Audit as a people-pump. Do not ship Get’s cascade as the Rule’s only Input.

---

## Do not

- Build Input only on Get.
- Build Output only on Rule.
- Build Get Parameters on every node.
- Build Outcomes on Get.
- Plant. Recut 015. Overwrite 15:43.
