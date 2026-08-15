# Automations — app-facing form (entered from Agents)

**Seat:** Product Manager.  
**Why this file:** law and excerpts for Automations. Entered from the Agents outskirts — not a disconnected menu pick.  
**Join:** Agents flagship [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** (do not overwrite) · Agents face [`AGENTS-FACE.md`](./AGENTS-FACE.md) · UI blueprint [`AGENTS-UI-BLUEPRINT.md`](./AGENTS-UI-BLUEPRINT.md) · enter Automations **20:24 UTC** · Hub-as-source **20:44 UTC** · from-scratch images [`AUTOMATIONS-UI-BLUEPRINT.md`](./AUTOMATIONS-UI-BLUEPRINT.md) **20:54 UTC**.  
**Status:** Agents as a **creation place** (campaigns) is complete enough to leave. Automations is the next module. **Work from Hub Automations** (`/hub`) — that plant is the complete one. CT Ant Automations is a translation of Hub (same kind, poorer quality) and **this entire Rule part does not exist in Ant**. Image mocks are **from scratch**. Look at **Rules** first.

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

> Automations to me is the most under-rated, under-built module. And it's like supposed to be more than that.

> The way that I built the automations module, specifically how the nodes are and look… module in Hub was more complete. Everything that exists in the current app automations module was born from that automations module. Everything that exists in the current app is actually to be a poor rendition of that. … poor rendition of the actual quality, but it's like a great kind of translation.

> Rules. If you look at how a rule — one of those rules that we have, and I think it's the immigration one — because the one I'm talking about is the one that has toggles. If you open the rule, you can literally see toggles to toggle something on and off. That is the idea.

> What a rule is, what a constant is, what a condition is, how rules are like composite of conditions and constants, and how within a rule, you can turn on and turn off. If you just look at rules, you will see the end goal. Because now we can create rules. The more you want, the more rules you can create. And you can see that why they are modular across industries.

> It's very easy to mess up the automations module because it actually touches more of the app. There's something coming in from somewhere, from outreach, from existing data, and maybe other sources. And then we perform an operation on it. And the actions that are possible are not just limited to outreach. There's outcomes that change stuff inside the system as well. That's why the automations module is such an easy to miss module.

> I like that there's code to build it. However, I don't want to be limited to code. Where it's possible — great. Even with the blocks themselves, even with the code itself, it's still like blocks. There are two options: where there's a custom, where you have to use code, just like with JSON. But then there's also the option if you wanted to use like some kind of GUI. I feel like the logic and even the operations themselves are simple enough where it's not all code. If it really isn't, I need you to say so. Where it can be like that, let's do it.

> This entire part of the module doesn't even exist in the Ant translation. That's a problem. With the mocks that are going to be generating in terms of images — we're building from scratch. Let's call it what it is.

> A rule allows us to create the smallest kind of workflow in an automation. It's just a trigger, a rule, and an action. It can be as simple as that. Smallest looking workflow. Then we can still say, what makes up this thing completely? Less pieces to think about. Then we can go about building those pieces separately.

> Even inside the ones that we've prepared in those outcomes inside of the rules — the ones that can be represented, perhaps only the constant itself, or maybe even no constant. There's no constant that can be referenced and it has to just be completely code. But it's still not hard-coded because we still created it inside of our rules module. It can exist as something that you've created and it will probably live as JSON or JavaScript or Python. You'd still be able to go through that code and it would still count on or off. You would just name it. I want to see a side-by-side of something that's GUI plus something that was created as code.

> You might be referencing a constant. Some things are not constants — especially as we start going from industry to industry. That's fair. We should try to always define a constant when they're possible.

> I'm not yet satisfied because we've started with trigger. I want to see inside of trigger and I also want to see inside of the action. I want to see what it looks like to select a node, add a node, and then select action as a node. There are at least two kinds of different actions: actions that are inside of the application itself based on an operation, but also actions that are agents. Then selecting when you selected agents as the action — selecting that objective, creating that objective. If you're creating the objective, you're probably creating the form.

> This operation — we're implying that it creates both a re-engagement event and a reactivation event, or that it can create both a re-engagement and/or reactivation signal. Can we separate them? No, why would we need to separate them? If it can create one or the other, or both at the same time, which I think is also possible somewhere in our docs — that's why we can have different actions. We actually need to define what the output of a rule is. We haven't a super clear, congruent, complete idea of the output of a rule. Whatever it outputs has to be what we're able to use to create a form. Maybe it also enriches many other things. We are not even super clear on what it creates.

> The output classes are excellent. They all need to exist because each one offers us a lattice in which we can run something as simple as even a condition that then creates forks of actions. If there's a re-engagement signal, if only re-engagement signal, and if there's anything other than that — three different kinds of actions on the same data.

> There's actually at least one class missing. Our system is a real system — it doesn't need any AI to determine what data is required. It's deterministic. When it needs data, that's a re-engagement signal — and that should be a class. When we need a form, we know everything that must exist in the form because of that required data. We can create forms from that data — as many questions as needed. It would not be smart to lock ourselves into a locked objective given a specific signal. We can create the objective anyway.

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
11. **Hub is the complete Automations module.** Current-app / CT Ant Automations was **born from Hub**. It is a **translation** (same kind) and a **poor rendition of quality**. Work from Hub nodes. Do not “fix” Ant independently as if it were the source.
12. **Look at Rules to see the end goal.** Plate: Hub → Automations → **New firm → opt-in launch** → Rule **Immigration · Service eligibility**. Open it: **toggles** on outcome families (Pathway detection, Gaps, Profile & operations, Category draws, Draw competitiveness). Under the hood: conditions against constants. A **rule is a composite of conditions and constants**. Rules are **creatable**. Modular **across industries**.
13. **Easy to miss because it touches more of the app.** Something comes in (outreach, existing data, other sources) → perform an operation → **actions are not only outreach**. Outcomes also **change stuff inside the system**.
14. **Not limited to code.** PM verdict: the authored logic **is simple enough for a GUI**. A condition is field · operator · constant. A rule is togglable families of those. Under-the-hood evaluator stays code. **Two options:** **GUI** (default where possible) · **Custom** (code / JSON when the GUI isn’t enough).
15. **Smallest workflow = trigger · rule · action.** A rule lets us create the smallest looking automation. Then name the pieces and build them separately.
16. **This Rule part does not exist in the Ant translation.** Image mocks are **from scratch** in Ant chrome. Mock = generate the image. See [`AUTOMATIONS-UI-BLUEPRINT.md`](./AUTOMATIONS-UI-BLUEPRINT.md).
17. **Inside a rule, outcomes can be GUI or named code.** Where a constant can be referenced, GUI (prefer always defining a constant when possible). Where no constant can be referenced — especially across industries — it is **named code** (JavaScript or Python), **created in the rules module**, not hard-coded. It still **toggles on or off**. You name it. Side-by-side with GUI outcomes. (Whole-rule Custom/JSON remains the escape hatch for the entire rule.)
18. **Look inside trigger and inside action.** Add a node, select Action as a node. Not satisfied with canvas-only.
19. **At least two kinds of actions:** (a) **in the application** — change something inside the system from the operation; (b) **agents** — send people to a goal.
20. **Agents as the action:** select an agent, or create / select the objective. Creating the objective probably **creates the form** (already Automations-owns-the-form).
21. **A rule can emit re-engagement and/or reactivation as signals — one, the other, or both at once.** Do not split the rule to separate them. That is why we can have **different actions**. Engine 2 already: every detection is a signal; outreach is one motion (reactivation first; nudge only if not; secondary attaches as agenda).
22. **Rule output classes are a lattice.** They all need to exist. Each class is something you can put a simple **condition** on, and that **forks actions** — including three kinds of actions on the **same data** (example: if re-engagement signal · if **only** re-engagement signal · if **anything other than that**).
23. **At least one class is missing: required data.** When the system knows data is required, that is a re-engagement signal **and** it must be an output class. Forms are built from that set — the questions **are** the required fields. Do **not** lock an objective type to a given signal; you can still create the objective.
24. **This loop is deterministic.** Seed already: collectible field class (self-reportable / document-dependent / employer-directed); every missing-data detection is a signal; nudge consolidates outstanding self-reportable needs into **one** form. No AI to decide what data is required. If that ever stops being true, say so.

---

## What you are authoring (the package)

An **automation** is not an agent sequence. Sketch (20:24 DAG still stands; Hub **Rules** are the interior of the operation to look at):

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

**Inside the operation, look at Rules** (Hub plate — Immigration · Service eligibility):

```
RULE  (creatable; industry-modular)
  = composite of CONDITIONS + CONSTANTS
  operator toggles outcome families on/off
  input  ← outreach / existing data / other sources
  output → analysis + actions
             actions ≠ only outreach
             also outcomes that change stuff inside the system
```

Agents still owns: campaigns, sequencing, channel/attempt/content, sending people to the goal.  
Automations owns: the event, the operation (rules / constants / conditions as Hub built them), the binary exits, the form (data request), handing into an agent, **and in-system outcomes**.

---

## What this is not

- Not overwriting 15:43. Not restoring 14:58. Not putting Automations **triggers** on the Agents canvas.
- Not treating “re-engagement” as an objective. Not treating opt-in / reactivation that way either.
- Not moving form creation into Agents. Not making Agents a form builder.
- Not treating **CT Ant** Automations as the source. Hub is. Ant is the translation.
- Not throwing away Hub’s node kinds (rule / constant / condition). Rules with toggles **are** the end-goal grain to look at.
- Not locking form-as-node vs embedded — lean is embedded; still named open.
- Not a full catalog of operations or exit points. “Add them to …” was not finished. Name the silence.
- Not minting tables. SA extract after this face is specified enough — same discipline as Agents.
- Not a UI blueprint of the whole DAG. Smallest workflow first: [`AUTOMATIONS-UI-BLUEPRINT.md`](./AUTOMATIONS-UI-BLUEPRINT.md). Mock = generate the image. Do not plant `AntAutomationWorkbench` this pass.

---

## Open (tinkering — do not fill)

1. Full list of **operations** Automations performs (data request is one; engagement was spoken as a maybe).
2. Full list of **exit points** besides start/select agent.
3. Form creation: **own graph node** vs **embedded** in the start-agent node (lean: embedded).
4. Whether “create a campaign” is instantiate-from-template vs enroll-into-existing sequence.
5. Word “event” on Agents C2b vs Automations’ event-of-origin (schedule / trigger) — do not collapse them without asking.
6. Catalog of **in-system outcomes** besides enroll-agent (lists, tasks, notify, and whatever else Hub already names). Do not invent a new catalog this stamp.
7. Seed §5.6 vs Hub-as-built vs the 20:24 definite-middle shape — **do not silently kill any of them**. Hub Rules are what to look at. Alignment is later.
9. Remaining output classes besides **required data** (law 23). Do not invent a full catalog this stamp. Hub-today vs lattice is A9 / A10.
