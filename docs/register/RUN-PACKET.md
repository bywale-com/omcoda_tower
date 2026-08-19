# Run packet — execute now vs arm the event

**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**. One pocket.  
**When:** Locked 2026-08-19 12:04. Founder using the desk: canvas **Test** is not a run.  
**Plates:** none this stamp. Canvas buttons revise **A30** (Save · **Run** · Launch). Test data sits **inside the trigger** — [`TEST-PACKET.md`](./TEST-PACKET.md).  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite. Face **law 39 · 43**. [`PRIMITIVES.md`](./PRIMITIVES.md).  
**Does not:** plant; recut 015 (the walk is the walk — this packet is **how you ignite it**); mint a run table; bolt a Test tab; collapse Run with Launch.

---

## Paste — engineer

```text
Read docs/register/RUN-PACKET.md ALL THE WAY THROUGH. Then TEST-PACKET.md and NODE-INTERIOR.md.

You are building Run on CT Ant Automations. Product face = /prototype-ant. Hub is not the app. Do not recut 015. Do not overwrite 15:43. Do not plant.

Three controls. Do not collapse them.

1. Inside every Trigger: provide the test data for that event (TEST-PACKET). That is what canvas Test was doing. Move it. Rename it to what it is. It does not run the canvas.

2. Canvas Run: given that data, execute the chain now. Do not wait for the event. The trigger’s data is the handle. Everything after uses it. This environment is the sandbox — Run writes. Breaks on a node that is not configured. n8n: also a run on the active node that runs up to that node. Same walk. Two grains.

3. Launch: from now on, when this event happens, do this. Arm. Launch is not a manual fire.

Live Launch today activates and then startManualRun. Split that. Manual fire is Run. Arming is Launch.

Read docs/register/PLATE-READ.md. Do not recut 015.
```

## Paste — Systems Analyst

```text
You are Tower’s Systems Analyst. Identity: docs/README.md § Systems Analyst. Log: docs/register/SYSTEMS-ANALYST-LOG.md. 15:43 stands. Run face is docs/register/RUN-PACKET.md plus law 39 and 43. Test data on the trigger is TEST-PACKET. Do not recut 015.

Do not mint tables. Short ascribe:

A. Ignition. Live startRun / workflowWalk already walks the graph. What payload does a manual fire send today ({ manual: true })? What would “use this trigger’s test data” already map to (event contract writes, last similar event, specimen)? Silent if silent.

B. Two grains of Run. Canvas run until break. Per-node run up to that node. Does the walk already stop on a misconfigured / silent action, or does it mark success and continue (in-app silent until wrap)? Name it. Do not invent a third runner.

C. Launch vs Run. activateWorkflow vs startRun. Live Launch does both. Split: Launch = arm (status active, event dispatch). Run = walk now with the trigger data. Do not make Launch fire a run.

Stamp SYSTEMS-ANALYST-LOG.
```

---

## Founder comments (preserve)

- Using the software: what is called **Test** is not testing. It is not simulating what is to come. It **populates the trigger** with test data.
- Presumption was: fill the trigger, because that is all you need to start, and you only store a trigger data set. That is easier. It is not a run of the workflow.
- Move that function **into the trigger nodes**. Any trigger you place. Rename it to what it does: **provide the test data per trigger**.
- Need a **Run** button. Talk about what Run is.
- **Launch** going forward: whenever this trigger occurs / this event happens, do this series of processes.
- **Run:** given this data — not skip the trigger, the data is part of it — everything after the trigger, go ahead and use this data.
- n8n: run is per **active node** (runs **up to** that node; breaks if that node is not configured). There is also the larger run: runs **until it breaks**. Consider those. Assume we want them.
- You would always be testing in a sandbox. This is a sandbox. Nothing stops a Run button.
- Specimen to think with: **on contact import → just tag.** No condition. What are the parameters inside the Tag node? Could not find them. Get a feel whether Action nodes are parametering correctly.

---

## Three controls. Do not collapse them.

| Control | Where | What it is |
|---------|--------|------------|
| **Test data** | **Inside the trigger** | Provide the writes that event would produce. Door 1 = pick a real instance. Door 2 = specimen of the real write-set. **Does not execute** Get / Rule / Action / If. Packet: [`TEST-PACKET.md`](./TEST-PACKET.md). |
| **Run** | Canvas, and on the **active node** | **Execute now** with that data. Do not wait for the event. Writes (sandbox = this app). Breaks when a node is not configured. Node grain: up to that node. Canvas grain: until it breaks. |
| **Launch** | Canvas | **Arm.** From now on, when this event happens, do this. Not a manual fire. |

Canvas header becomes **Save · Run · Launch**. **A30** Test is prior. Do not keep a canvas Test.

n8n is the visual reference for the **two grains of Run**. It is still not the machine (law 42). After Run, the left **is** the table writes that walk just made.

---

## Law (plain)

**Test data is not a run.** Filling the trigger lets you map. It does not press Audit, Tag, Agents, or If.

**Run is the walk, now, on this data.** Same walk Launch will use when the event fires (015). Different ignition. Do not recut 015.

**Launch is the subscription.** The event, from now on.

Live **Launch workflow** today does **both** (activate + `startManualRun`). That is why it feels like a run and like an arm. Split it.

---

## Specimen: contact import → tag

Smallest canvas for this talk. Trigger = **contact import**. Next = **Action · tag**. No If.

**Trigger test data** = A24 write-set: `import_batch` + `contact_records`. Provide that on the trigger. Then Run can go.

**Tag parameters (the feel, from the live desk):**

You could not find them. That is the hole.

- New in-app Action list (**A33**) has **no Tag**. Law 41 / **A34**: the audit mark has **no desk button**, so it is not a picker row. Consultant tags are later. The house workflow still has leftover `ascribe_tag` nodes (Tag invalid / Tag valid) — a typed **Tag** string + **Notes from verdict** switch. **Who** is not a mapped box. The walker takes people from previous writes / `contactIds` implicitly.
- Actions that **are** on the list **do** parameter from the left when the button needs a record: Start Audit → **Book** mapped slot. Halt → **Firm** + **Contact** mapped. That is the correct shape (A31). Filename / some typed fields still do not take a chip. `params: none` is honest **—**.
- So: Tag is not parametering from the import. The people from `contact_records` never occupy a box. If this specimen is **ascribe** (a mark you choose), Parameters are **Contact** (chip from the left) + **which tag**. If this specimen is the **A34 audit mark**, Audit writes it — there is no Tag node, and contact import → tag with no audit has nothing to ascribe yet.

Do not pad Tag onto A33 to make the specimen. The hole is the feel.

---

## 1. Copy

- Canvas: **Save · Run · Launch**.
- Run executes now from the trigger’s data.
- Launch arms the event. Does not also Run.
- Per-node run: up to that node. Canvas run: until break.
- Trigger interior: the former Test (provide data).

## 2. Do not build

- Canvas **Test** (A30). Harbor chrome on A30.
- Launch that also `startManualRun`.
- A Test **tab**.
- Recutting 015 into a second walker.
- Inventing Tag on A33 so the specimen has a picker row.

## 3. Implied

- Run is available on a draft. You provided data on the trigger first. Honest block if the trigger has no data.
- Misconfigured node: stop. Do not mark silent in-app actions as success and keep walking as if they wrote (live does that until wrap — name it, do not freeze it as Run).
- After Run, open a node → Input / Output are the **writes** (law 42).

## 4. Completes

- Node-grain play control (n8n on the active node). No extra PNG this stamp.
- Pick-which-instance on the trigger when door 1 applies (already named in TEST-PACKET).

## 5. Out of scope this build

Desk chrome. Recut 015. Consultant multi-tag. Wiring every A33 row to persist (still silent until wrap).

---

## Live vs this packet

| Live today (main) | This packet |
|-------------------|-------------|
| Header **Test** → `getEventTestContract` + `walkTestGraph` (project, no persist) | That fill **moves into the trigger**. Not a canvas Test. |
| Header **Launch workflow** → activate + `startManualRun` (`payload: { manual: true }`) | **Run** = the manual fire, with trigger data. **Launch** = activate / listen only |
| Walker runs Audit + `ascribe_tag`. Other in-app = silent success | Run still that walk. Do not recut 015. Silent is not “configured.” |
| Tag not on A33. Legacy ascribe = typed string | Feel named above. Do not pad. |

---

## Cousin packets

| Packet | Take | Do not take |
|--------|------|-------------|
| **TEST-PACKET** | Provide data on the trigger. Two doors. No INSERT **there**. | Canvas Test. “Test fills the whole chain.” |
| **MAPPED-BOX / INPUT-LOOK** | After Run, chips **are** the writes. | Using Test-fill as if it had committed. |
| **IN-APP-ACTION** | Parameters = that button’s inputs. | Tag as a picker row. |

---

## Do not

- Keep a canvas Test because A30 drew it.
- Let Launch fire a run.
- Recut 015. Overwrite 15:43. Plant.
