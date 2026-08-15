# Automations — app-facing form (entered from Agents)

**Seat:** Product Manager.  
**Why this file:** law and excerpts for Automations. Entered from the Agents outskirts — not a disconnected menu pick.  
**Join:** Agents flagship [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** (do not overwrite) · Agents face [`AGENTS-FACE.md`](./AGENTS-FACE.md) · UI blueprint [`AGENTS-UI-BLUEPRINT.md`](./AGENTS-UI-BLUEPRINT.md) · this log stamp **20:24 UTC**.  
**Status:** Agents as a **creation place** (campaigns) is complete enough to leave. Automations is the next module. This file is the start of the Automations face — not a UI blueprint yet, not Story.

Hub Automations (`/hub`, `AntAutomationWorkbench`) is **not** this description. Do not treat the existing Trigger → If → Rules → Actions plant as the flag.

---

## Founder excerpts (do not paraphrase away)

> I think agents as its own module like as its own place that things can get created. I feel like it maybe it's probably complete.

> The current shape redefines the agents that place as a place where you set those agents like see campaigns. Create those campaigns feels great.

> Automations is more like the brain where you do operations.

> A variable operation can trigger an agent usually a re-engagement. … Re-engagement itself is not an objective. It's a campaign. It's the name of a campaign. … The objective is more than likely a data request. It can sure trigger a data request objective and maybe other types of objectives.

> Does an automation create a campaign — trigger the creation of a campaign — which can make perfect sense because it could mean that we've already templated a campaign that it triggers.

> When we say we create an objective — click this button, fill this form. A trigger wouldn't trigger a click this. It would trigger a fill this form. Essentially a data request is kind of a form. Fill this form with these specific questions.

> Where is that form created? Is it created in the Automations place or in the Agents? … We have to figure that out for sure. … It would clearly create that form. Agents is not about creating forms. It's not about creating what is needed. It's about sending agents people to accomplish the goal. So we have a data request — it creates the form in Automations. How Automations works on the form has nothing to do with Agents. … We'll actually use this as the bridge to start working on the Automations module.

> The thing about what the Automations module is: perform on this event, which can be a schedule or a trigger. Perform this operation. Nothing in that middle changes. It's always gonna be like, it's definite. Then, on this kind of results do X and on this other kind of result, do Y. There's only one of two kinds of results — or the amount of binaries that we've defined — but it's very binary. It's the more DAG-like operation.

> Those are exit points. The end of that operation, each instance that it's run.

> The data request is already an event of origin for the Agents module. That's the beauty. It's so recursive. What is the data request? It's a form. Here's where that form is: it's handled by Automations.

> Whether the form creation itself is a node inside of the graph, or the creation of a form is also embedded with the calling of an agent — we have to determine that. I think it would be embedded because the endpoints, where you say this was the action of an agent, it mirrors perfectly the beginning points of the Agents module, where you're defining the objective that the agents are running on. Uncanny resemblance.

> In that end node you would literally be starting an agent — or you can select an agent that already exists. The only difference is that you're creating the objective right there. As a data request, so you create the form right there. In the same node you're starting that agent and declaring the objective. Because the objective is a data request, you also create the form.

> Depending on the objective, that determines the agent you can select. … It's about agents and campaigns. An agent is just sequences, same thing. If you select an agent, there's no selecting campaigns, because campaigns live inside of sequences. If you select the agent you are selecting the entire campaign. Which is why campaigns can be templated as well. However that objective is used inside that campaign determines that. Your choice of campaigns is also determined by the objective. That can be limited. It can be enforced in that way.

---

## Law of the face (short)

1. **Agents (creation place) is left complete enough.** Operator authors **campaigns** there. Automations is the **brain / operations**. Do not grow Agents to invent forms.
2. **Automations shape (definite middle):** **On this event** (schedule or trigger) → **perform this operation** (the middle does not change; it is definite) → **on this kind of result do X / on that kind do Y**. Results are **binary** (or the binaries we have defined). More **DAG-like** than Agents’ sequence canvas.
3. **Exit points** sit at the **end of that operation**, per instance that ran.
4. **Re-engagement is not an objective.** It is a **campaign** (the name of a campaign). Already Agents law: opt-in / re-engagement / reactivation are **sequence templates**. An automation does not “trigger a re-engagement objective.”
5. **What an automation typically originates** is a **data request** objective — fill this form with these questions — **not** “click this button.” Maybe other objective types. Click-this still lives on **Agents** (launch window). Automations would not trigger it.
6. **The form is created in Automations.** Agents is not about creating forms or creating what is needed. Agents is about **sending people to accomplish the goal**. How Automations works the form has nothing to do with Agents.
7. **Recursive join:** a **data request is already an event of origin for Agents**. Data request = a form, handled by Automations. The Automations **end node** (start / select an agent) **mirrors** the Agents **beginning** (declare the objective).
8. **Same end node (leaning embedded):** start an agent **or** select an existing agent, **and** declare the objective right there. If that objective is a data request, **create the form in that same node**. Form-as-its-own-graph-node vs embedded-with-calling-the-agent is **not locked** — founder leans **embedded**.
9. **Select an agent = the whole sequence.** Campaigns live **inside** sequences. No separate campaign picker on that node. Campaigns can be templated. **Which agents you may select is limited by the objective** — can be enforced.
10. **Automation may trigger creation of a campaign** when a **templated** campaign already exists for that objective. That is enroll / instantiate, not Agents growing a form builder.

---

## What you are authoring (the package)

An **automation** is not an agent sequence. Sketch (not a blueprint; not Hub node types as law):

```
EVENT  (schedule | trigger)
  → OPERATION   (definite; nothing in the middle changes)
       → result A  → do X     ← exit points (binary / defined binaries)
       → result B  → do Y
            one exit: START / SELECT an AGENT
                 same node: declare the OBJECTIVE
                 if data request: CREATE THE FORM here
                 selecting an agent = the whole sequence
                 (campaigns inside; choice limited by the objective)
```

Agents still owns: campaigns, sequencing, channel/attempt/content, sending people to the goal.  
Automations owns: the event, the operation, the binary exits, the form (data request), handing into an agent.

---

## What this is not

- Not overwriting 15:43. Not restoring 14:58. Not putting Automations **triggers** on the Agents canvas.
- Not treating “re-engagement” as an objective. Not treating opt-in / reactivation that way either.
- Not moving form creation into Agents. Not making Agents a form builder.
- Not declaring the existing Hub Automations graph the face.
- Not locking form-as-node vs embedded — lean is embedded; still named open.
- Not a full catalog of operations or exit points. “Add them to …” was not finished. Name the silence.
- Not minting tables. SA extract after this face is specified enough — same discipline as Agents.
- Not a UI blueprint yet. Mock = generate the image when we get there; do not plant a second Automations editor.

---

## Open (tinkering — do not fill)

1. Full list of **operations** Automations performs (data request is one; engagement was spoken as a maybe).
2. Full list of **exit points** besides start/select agent.
3. Form creation: **own graph node** vs **embedded** in the start-agent node (lean: embedded).
4. Whether “create a campaign” is instantiate-from-template vs enroll-into-existing sequence.
5. Word “event” on Agents C2b vs Automations’ event-of-origin (schedule / trigger) — do not collapse them without asking.
6. Existing Seed §5.6 node families (Trigger / Constants / If / Operations / Rules / Actions) vs this definite-middle + binary-exit shape — **do not silently kill Seed**. This file is Phase Two face starting; alignment is later.
