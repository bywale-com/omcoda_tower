# Automations — app-facing form (entered from Agents)

**Seat:** Product Manager.  
**Why this file:** law and excerpts for Automations. Entered from the Agents outskirts — not a disconnected menu pick.  
**Join:** Agents flagship [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** (do not overwrite) · Agents face [`AGENTS-FACE.md`](./AGENTS-FACE.md) · UI blueprint [`AGENTS-UI-BLUEPRINT.md`](./AGENTS-UI-BLUEPRINT.md) · enter Automations **20:24 UTC** · Hub as **advanced plant for those modules** (not the app) **20:44 UTC** · from-scratch images [`AUTOMATIONS-UI-BLUEPRINT.md`](./AUTOMATIONS-UI-BLUEPRINT.md) **20:54 UTC** · SA package **22:17 UTC** · loops **23:07** · global/local **23:16** · objectives are events; failure → tag **23:35** · list scored **23:38** · enroll + assign **00:02** (C8 · A14) · blank canvas / chain **01:17**.  
**Status:** 23:07 list scored 23:38; **2** and **6** answered **00:02**. Automations is a **blank canvas** — you can chain (01:17). **Law 33 (00:40):** after a node you have a handle to what that module wrote. Live is not that yet. Left: send, book-in door, queryable lineage. Product face = CT Ant. Hub is not the app. Do not plant.

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

> What events actually trigger an automation … Form completion is an event. On form completion.

> How there is no quote-unquote settings. It's less about what is quote-unquote settings — about what is **global** versus what is **local**. … One very clear reason why there should be something like that inside of automations. It matches everything.

> On all kinds of form submissions … anytime there's a form submission … whoever submitted that form, run this evaluation on them. But it's also a local … on this specific form submission, every time this specific form is submitted, run this evaluation.

> That already gives you … ideas of wherever else it applies. … It expands our thinking of what events look like. What counts as an event.

> Don't look at hub. … Hub is like the most advanced version for those modules. … If you're just mentioning hub because you just thought like that's the app. That's not the app.

> There's no need for a return. The return itself is an event. … All objectives are themselves events. … The write-back itself is the event. The event itself happening is the write-back because it can be detected across the app in the database. It's not lost.

> The only thing … is there a clear tracking between what created the objective — whether it was agent or hand created — the path … all the way till its completion … the completion event … track the time it took. … That's querying. … Queryable at the minimum.

> If a campaign fails, for every person that failed this campaign, we want you to create a record … even as simple as a tag. … Failure of a campaign has to be an event … so it can be referenced in the automations module. Global and local applies even there. Then action. … One of the first potential actions … in the app.

> Subscription campaign with that bell … subscribed or not subscribed is literally just a tag … a tag that we've created in automations so that if people don't opt-in, if they opt out or they unsubscribe, which is also an event, it creates that tag … assigns that tag. … Subscription campaign fails, it ascribes that tag.

> I don't know if [A13 is] related to the image … it's very different.

> Don't forget the node that sits after the rule output … was a condition node that says hey if this … it's already like calling from the previous results.

> We've mapped out a pretty concrete terrain in automations … pretty enclosed in a real way … images, ideas, refinements, revisions … strong thinking … we've defined the rules. Constants obviously exist in rules. The rules have their own conditioning.

> I have enough to go ahead and create that package for the automations for the systems analysts … spec everything out … logs, not transcripts … selecting a lineup of chosen images … if a specific image is a revision of a prior image … add that prior … the revision is the one that's canonical … why we evolved it … spec of these images down to detail … every system that is required … tables, workers … some external systems … we want this UI to look the exact way it is so that when we build it it works exactly how we want it to work.

> just to keep it simple, you create an agent and then you can assign, you can assign it. So there's no creating agents inside of directly from the automations module. So it only leaves assigning to an existing sequence or creating or creating from a template.

> when a firm is provisioned, right? … when you create a firm, there are things inside of the firm that they need to do … the automations can be so underbuilt, but imagine this workflow. … when a firm is provisioned, just created … the action can be run and audit on the contacts … from the output of that action, you can also notice if X conditions are met … Then another action … we have a condition node. And another action is agents … even the automations is a blank canvas like that. … you can chain multiple campaigns. I'm realizing that you can also chain multiple events in a way like this.

> we can always improve our model, evolve it to be able to like create directly from automations, but just to keep it simple

> [global vs local] that's also dependent on the contacts that are enrolled as well. … that same thing lives inside of automations, as well. … it's just an event, it's not something that starts right now.

---

## Law of the face (short)

1. **Agents (creation place) is left complete enough.** Operator authors **campaigns** there. Automations is the **brain / operations**. Do not grow Agents to invent forms.
2. **Automations shape (definite middle):** **On this event** (schedule or trigger) → **perform this operation** (the middle does not change; it is definite) → **on this kind of result do X / on that kind do Y**. Results are **binary** (or the binaries we have defined). More **DAG-like** than Agents’ sequence canvas.
3. **Exit points** sit at the **end of that operation**, per instance that ran.
4. **Re-engagement is not an objective.** It is a **campaign** (the name of a campaign). Already Agents law: opt-in / re-engagement / reactivation are **sequence templates**. An automation does not “trigger a re-engagement objective.”
5. **What an automation typically originates** is a **data request** objective — fill this form with these questions — **not** “click this button.” Maybe other objective types. Click-this still lives on **Agents** (launch window). Automations would not trigger it.
6. **The form is created in Automations.** Agents is not about creating forms or creating what is needed. Agents is about **sending people to accomplish the goal**. How Automations works the form has nothing to do with Agents.
7. **Recursive join:** a **data request is already an event of origin for Agents**. Data request = a form, handled by Automations. The Automations **end node** (start / select an agent) **mirrors** the Agents **beginning** (declare the objective).
8. **Same end node (leaning embedded):** assign an agent **or** instantiate from a template, **and** declare the objective right there. If that objective is a data request, **create the form in that same node**. Form-as-its-own-graph-node vs embedded-with-calling-the-agent is **not locked** — founder leans **embedded**. **00:02:** you do **not** author a new agent in this module (law 31).
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
25. **Required data as a class is a listing, not a flag — and it is not stood up.** The data being requested is **more than one** item. A catalog of collectible fields exists in code (`COLLECTIBLE_FIELDS`) and is **unused**. Rule-node output today is headline / pass / pathway & gap **result ids** / services / nudge & reactivation **signals** — not a list of requested fields. No UI lists that request. No form authoring **references** those ids. Contact forms that look like a list are painted demos. Until the listing is on rule output, a form cannot bind to it. Do not invent the rest of the catalog; do not mint tables.
26. **Two grains of condition. Do not collapse them.** Inside the rule: field · operator · constant (or named code). After the rule, on the DAG: a **condition / If node** that **calls from the previous result** (rule Output) and forks actions. Hub already has that If node. A10 / A13 are **diagrams of the lattice idea**, not a screenshot of that node, and not a screen to build. Founder 22:17: A13 is a different kind of picture.
27. **An event has a global grain and a local grain. That is not “Settings.”** Form completion **is** an event that can trigger an automation. **Global:** on all form submissions of that kind — whoever submitted, run this evaluation. **Local:** on **this** form — every time this specific form is submitted, run this evaluation. The same divide is why Automations needs a global/local place (it matches Agents’ global → sequence → campaign, without copying a Settings modal). This expands **what counts as an event**. Do not invent the rest of the event catalog this stamp. Do not call it Settings.
28. **No special return.** The return **is** an event. **All objectives are events.** The write-back **is** the event; the event happening **is** the write-back. It is detected across the app / in the database. It is not lost. Loop 1 (23:07) is settled this way — not a separate return wire.
29. **Lineage is queryable at the minimum.** What created the objective (agent-created or hand-created). The path that agent took from that creation to completion. The completion event. Time it took. Map it correctly. That is querying, not a new module. If it is not queryable, the loop is not real.
30. **Campaign failure is an event.** Global and local apply (all campaign failures vs **this** campaign). Then an **in-app action**: create a record — even as simple as **ascribe a tag**. Named example: the subscription bell (subscribed / not) **is a tag** created in Automations. Opt-out / unsubscribe is also an event; it assigns that tag. Campaign fails → ascribes that tag. This is one of the first in-app actions named. Do not invent the rest of the action catalog.
31. **Automations does not create agents.** Create the agent in **Agents**, then **assign**. On the Agents action there are two choices: **assign to an existing sequence**, or **create from a template**. No third choice: author a new agent here. Can evolve later — not now. Plate **A14**. A8 stays prior for select-agent = whole sequence. A12 stays the form. The sequence pick (Opt-in / Re-engagement / Reactivation) is a **radio**. There is **nothing further** — no chevron, no extra configuration. Add-contact scope is the same two as C8 (**Every firm** default, or **Select from**) and also lives on **events**. **A19** is Automations Contacts — same look. **Select from** opens the list (**C8b**). **A18** is Global vs Local on the **event**. Global/local of the event is also **dependent on which contacts are enrolled**. Automations still does **not** start a mission right now — that is Agents (C8).
32. **Automations is a blank canvas, the same way an agent is.** Smallest workflow is still trigger · rule · action. The canvas can **chain**: event → action → condition on that output → another action. Teaching walk: **firm created / provisioned** → **audit the contacts** → **if X** (condition node, previous result) → **agents**. Provisioning a firm is not only creating the firm — things inside still have to happen; that is why this module exists. The If node already named (law 26) can read an **action’s** output, not only a rule’s. Completion of a step is also an event (law 28), so the same chain can be one canvas or two automations listening. Do not collapse those. Do not put this chain on the Agents canvas.
33. **When a node finishes, you have what that module produced.** The action sends the work to the **real** module (Audit does Audit). The writes live there, as if you had run it on that desk. The next step has a **handle** to **those** writes — person or artifact, you pick — not a boolean “done,” not a guess at the latest run, not an automation-only copy. You pick by pointing the If at a **field of the previous result** (a person field splits people; a run field is the artifact). A pipe on the wire is one way to see the handle. Then-this that reads this node’s output is the same product. Pipe vs then-this is not the religion. Live walk is **not** this yet. Hub `lastOutput` → `lastInput` is the smell, not the live path. Audit’s actual fields: [`PRIMITIVES.md`](./PRIMITIVES.md).

---

## What you are authoring (the package)

An **automation** is not an agent sequence. Sketch (20:24 DAG still stands; Hub **Rules** are the interior of the operation to look at):

```
BLANK CANVAS  (same idea as a blank sequence — you can chain)

EVENT  (schedule | trigger)
  e.g. firm created / provisioned
  → ACTION     (in the application — e.g. audit the contacts)
       OUTPUT  (previous result)
  → CONDITION / If   (calls from that output; if X)
  → ACTION     (agents — assign existing or from a template)
                 selecting an agent = the whole sequence

Smallest still legal: trigger · rule · action
The rule can sit in the chain wherever the operation is.
If reads the previous result — rule or action.
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
- Not treating **Hub as the app**. Product face = CT Ant. Hub is the **advanced plant** for Automations/Rules — look at it for that grain, not as if it were the product.
- Not treating **CT Ant** Automations as the source plant for Rules. Hub is that plant. Ant is the translation.
- Not throwing away Hub’s node kinds (rule / constant / condition). Rules with toggles **are** the end-goal grain to look at.
- Not locking form-as-node vs embedded — lean is embedded; still named open.
- Not a full catalog of operations or exit points. “Add them to …” was not finished. Name the silence.
- Not minting tables. SA extract after this face is specified enough — same discipline as Agents.
- Not a UI blueprint of the whole DAG. Smallest workflow first: [`AUTOMATIONS-UI-BLUEPRINT.md`](./AUTOMATIONS-UI-BLUEPRINT.md). Mock = generate the image. Do not plant `AntAutomationWorkbench` this pass.
- Not generating or refining A9/A10 until asked. 21:36 answered the listing question first. A11–A13 mock the listing (Output rows, form bind, lattice **diagram**). A13 is not a screen. Do not plant the editor.
- Not collapsing inside-the-rule conditions with the If node after the previous result.
- Not treating Automations as a one-shot (trigger · rule · action only). That is the smallest. The canvas can chain (law 32).
- Not inventing an Automations **Settings** modal. Global vs local is the divide (law 27). Not filling an event catalog.
- Not **creating agents** inside Automations. Assign existing, or from a template (law 31 / A14).
- Not circling **pipe vs this-then-that**. The product is the handle after the node (law 33). Live is not that yet. Do not treat Hub preview as the live path.

---

## Open (tinkering — do not fill)

1. Full list of **operations** Automations performs (data request is one; engagement was spoken as a maybe).
2. Full list of **exit points** besides start/select agent.
3. Form creation: **own graph node** vs **embedded** in the start-agent node (lean: embedded).
4. When an automation starts a campaign: **settled 00:02 / law 31.** Assign to an **existing** sequence, or **create from a template**. Do not create the agent in Automations.
5. Word “event” — **settled 23:35 / law 28:** all objectives are events. C2b and Automations triggers are the same grain. Do not split them again.
6. Catalog of **in-system actions** besides enroll-agent. **Shape list (22:43):** [`PRIMITIVES.md`](./PRIMITIVES.md). Named: ascribe a tag · run an audit · who this applies to · make a form · **provision a firm**. Not “write any table.” Not webhook-as-an-action.
7. Seed §5.6 vs Hub-as-built vs the 20:24 definite-middle shape — **do not silently kill any of them**. Hub Rules are what to look at. Alignment is later.
9. Remaining output classes besides **required data** (law 23). Do not invent a full catalog this stamp. Hub-today vs lattice is A9 / A10.
10. **Listing of requested data on rule output + form bind** (law 25). Named 21:36 as not stood up in code. Mocked as A11–A12 (chrome) and A13 (diagram). Do not fill the listing in the product this stamp. Do not mint tables.
11. **Ant plate of the If node** — **drawn 01:20:** A15 (chain) · A16 (open). Hub still has the plant. A13 is still not this screen.
12. **Event catalog + global vs local** (law 27). **Drawn 18:53: A18.** **Shape list (22:43):** [`PRIMITIVES.md`](./PRIMITIVES.md). Form submitted (this form) · campaign failed · opt-out · firm created · audit finished · contact file imported · objective met. Not “any row changed.”
13. **Queryable lineage** (law 29). Agent-created vs hand-created objective → path → completion → time. Minimum: queryable. Do not mint a table from this sentence.
14. **Handle after the node** (law 33). Live walk does not hand the next node the module’s output. Do not treat editor preview as that. SA: do not circle pipe vs then-this — both are fine if the handle is real. Packet: [`SYSTEMS-AUTOMATIONS-NODE-OUTPUT.md`](./SYSTEMS-AUTOMATIONS-NODE-OUTPUT.md).
