# Tower load-bearing architecture — UI and code dossier

## Purpose

This document names the architectural choices that make Tower the product it is, then traces each choice through:

1. **What it is** — the standard product or software-architecture name for the choice.
2. **UI pass** — the most direct place to observe its effect on `/prototype-ant`.
3. **Code pass** — the files, components, state, ports, server handlers, and tables that produce that behavior.
4. **Current gaps** — where the intended architecture and the current implementation do not yet agree.

This is not an atom-by-atom source-code reference. It follows each behavior far enough to answer:

> What steps make this work in the code?

### Status language

- **Implemented** means the real-wire path reaches the server and durable tables.
- **Partial** means part of the behavior is real, but a client seed, stand-in, placeholder, or missing runtime reader remains.
- **Specified** means the product law is clear, but the implementation is not complete.

### Primary product path

Unless a section says otherwise, the UI path begins at:

```text
/prototype-ant
→ Operator
→ Configuration libraries
```

`VITE_WIRE_REAL` defaults to `true`. The real path therefore expects the Hono wire service on port `3001` and Postgres to be available. Setting `VITE_WIRE_REAL=false` selects in-browser stand-ins. A stand-in can demonstrate shape; it is not evidence that the durable machine executed.

---

# 1. Product surface separation

## What it is

**Standard name:** separate application surfaces with separate entry points.

Tower currently has four surfaces:

| Surface | Route | Purpose |
|---|---|---|
| Product face | `/prototype-ant` | Consultant, Operator, and Contact application |
| Hub | `/hub` | Older implementation and interaction reference |
| Register | `/register` | Product theory and click-through source plant |
| System Map | `/system-map` | Machine and table modeling |

The load-bearing choice is that these surfaces share a repository but do not share one undifferentiated UI shell.

Most importantly, the Ant product face has its own HTML document, JavaScript entry point, React root, component tree, and CSS boundary.

## UI pass

### Entering Tower

Observed route behavior:

```text
/
→ /prototype-ant
→ Ant product face
```

The Ant header identifies the surface with:

- `Tower`
- `Prototype · Ant Design` in the auth-disabled modeling environment
- Consultant / Operator / Contact desk switcher for an administrator
- Light/dark control
- Hub link
- Source plant link

The main region renders one of three desks:

```text
Consultant desk
Operator desk
Contact desk
```

The links on the right leave the product face:

- **Hub** navigates to `/hub`.
- **Source plant** navigates to `/register`.

They are ordinary document links, not product-desk tabs.

### Hub

`/hub` has different chrome, styling, navigation, provider state, and interaction patterns. It still contains some deeper older implementations, particularly client Activity inspection and older Agents and Automations tooling.

The rule is not that Hub contains nothing useful. The rule is that missing Hub depth is translated into Ant. Hub does not become the production face again.

### Register

`/register` is the Source plant. It contains theory, product passes, and embedded click-through views.

Current defect: Register presently reaches `RegisterErrorBoundary` with:

```text
useViewAs must be used within ViewAsProvider
```

The route is correct. The embedded Ant host is missing a provider required by `ConsultantAntScene`.

### Unknown routes

The main router sends unknown paths to `/prototype-ant`. That makes Ant the default application face.

## Code pass

### Step 1: Vite declares two documents

`vite.config.ts` declares a multi-page build:

```ts
build: {
  rollupOptions: {
    input: {
      main: path.resolve(__dirname, "index.html"),
      "prototype-ant": path.resolve(__dirname, "prototype-ant.html"),
    },
  },
},
```

`input` tells Vite/Rollup to build two independent HTML entry graphs.

```text
index.html
prototype-ant.html
```

This is stronger than two React routes. Each document can load a different TypeScript entry file and therefore a different dependency and CSS graph.

### Step 2: Vite maps Ant paths to the Ant document

The custom `prototype-ant-mpa` plugin rewrites these requests internally:

```text
/prototype-ant
/prototype-ant/*
/c/*
```

to:

```text
/prototype-ant.html
```

The browser keeps the clean route. The server selects the Ant document behind it. The same middleware exists for Vite development and preview.

`/c/*` is included so a tokenized Contact link cannot accidentally load Hub.

### Step 3: each document loads a different TypeScript entry

`index.html`:

```html
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
```

`prototype-ant.html`:

```html
<div id="root"></div>
<script type="module" src="/src/main-prototype-ant.tsx"></script>
```

Both create a `root` DOM element. They load different React programs into it.

### Step 4: `main.tsx` starts Hub/Register routing

`src/main.tsx`:

```tsx
createRoot(document.getElementById("root")!).render(<AppRouter />);
```

It also imports the main and marketing CSS files. `AppRouter` handles `/hub`, `/register`, `/system-map`, access links, and redirects.

The `!` after `getElementById("root")` is a TypeScript non-null assertion. It tells TypeScript that the HTML document is guaranteed to contain that element.

### Step 5: `AppRouter` assigns the main-document routes

`src/app/Router.tsx` maps:

```text
/register       → RegisterPage
/system-map     → SystemMapPage
/hub            → HubApp
/hub/*          → HubApp
/activity       → HubApp
/activity/*     → HubApp
/               → /prototype-ant
anything else   → /prototype-ant
```

`/activity` remains on Hub because the equivalent Ant Activity surface is not complete.

`<Navigate replace>` changes location without leaving an extra redirect entry in browser history.

### Step 6: Hub mounts its own provider tree

`HubApp` renders `src/app/App.tsx`, with `AuthGate` when authentication is enabled.

`App.tsx` mounts providers including:

```text
TouchpointFocusProvider
TaskProvider
DocsHighlightProvider
HolonDetailProvider
AuditProvider
AutomationProvider
AppShell
```

Those contexts and the Hub shell belong to the main document. They are not wrapped around the Ant product.

### Step 7: `main-prototype-ant.tsx` starts the Ant product

The Ant entry is:

```tsx
createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <PrototypeAntApp />
  </AuthProvider>,
);
```

It does not import `AppRouter`, Hub `App`, or the Hub CSS files.

The entry file explicitly warns that it must not be imported from `main.tsx`; that protects the source-plant and product CSS graphs from being merged accidentally.

### Step 8: `PrototypeAntApp` builds the Ant environment

The component:

1. Loads the saved light/dark mode with `useState`.
2. Builds Ant theme tokens with `useMemo`.
3. Checks whether the URL is `/c/<token>`.
4. Renders either the tokenized Contact workspace or the normal desk shell.

`useMemo(..., [mode])` means the theme configuration is recalculated only when `mode` changes.

### Step 9: Contact deep links take an early branch

`contactTokenFromPath()` matches:

```text
/c/<token>
```

When a token exists, `PrototypeAntApp` returns:

```tsx
<ConfigProvider>
  <App>
    <ContactWorkspace token={seatToken} />
  </App>
</ConfigProvider>
```

The Contact does not receive the Consultant/Operator switcher, Hub link, or Source plant link.

### Step 10: normal Ant entry supplies product contexts

The standard product tree is:

```text
ConfigProvider
→ Ant App
→ ViewAsProvider
→ AntShell
```

- `ConfigProvider` supplies Ant theme tokens.
- Ant `App` supplies message, notification, and modal context.
- `ViewAsProvider` supplies current firm, consultant, and contact selection.
- `AntShell` renders the product header and desk.

### Step 11: admin status controls desk availability

`ViewAsProvider` calculates:

```ts
const isAdmin =
  isAuthDisabled() || isPlatformAdminEmail(user?.email);
```

In the modeling environment, auth-disabled mode exposes the complete switcher. In a normal firm session, the user is fixed to their session firm and sees the Consultant desk.

For an administrator, `ViewAsProvider` loads consultants and contact workspaces through `wirePorts.machineApi`, then updates the active firm when selection changes.

### Step 12: `AntShell` selects one desk

Desk state is constrained by a TypeScript union:

```ts
type AntDesk = "consultant" | "operator" | "contact";
```

Hub and Register are not valid desk values.

The render decision is:

```text
session loading                  → Loading
authentication required         → Login
operator + administrator        → OperatorAntScene
contact + administrator + row   → ContactAntScene
contact without selected row    → honest empty state
anything else                   → ConsultantAntScene
```

A React effect moves a non-admin back to Consultant if the desk state is ever different.

### Step 13: internal desk changes and surface changes use different mechanisms

Desk switch:

```tsx
setDesk("operator")
```

Surface navigation:

```html
<a href="/hub">Hub</a>
<a href="/register">Source plant</a>
```

The first changes React state inside Ant. The second leaves Ant and requests another surface.

## What enables the separation

Five mechanisms work together:

1. Separate HTML documents.
2. Separate TypeScript entry files.
3. Separate React roots.
4. Separate dependency and CSS graphs.
5. Explicit links between surfaces rather than tabs inside the product.

## Current gaps

1. Register’s embedded Ant host mounts `ConsultantAntScene` without `ViewAsProvider`.
2. Hub still contains UI depth not yet translated to Ant.
3. Unknown main-document routes redirect to Ant instead of showing a not-found screen.
4. Product desks are mainly React state, so desk/module position is not generally deep-linkable.

---
# 2. Multi-sided application architecture

## What it is

**Standard name:** a role-based, multi-sided application over one ledger.

Tower presents the same operating system through three questions:

| Desk | Question |
|---|---|
| Operator | What should the house configure, publish, bind, and govern? |
| Consultant | What is happening in this firm’s book, and where must I act? |
| Contact | What am I being asked to provide, consent to, or book? |

These are not separate products and should not own separate copies of the records.

## UI pass

### Consultant

Open `/prototype-ant`. Consultant is the safe default.

The Consultant sider contains:

- Board
- Contacts
- Meetings
- Prepared Workspace
- Login

The Consultant can inspect the book, open a contact, read activity, view meetings, and halt outreach. Configuration libraries are absent.

### Operator

An administrator selects **Operator** in the header. The entire body changes to `OperatorAntScene`.

The Operator sees house-global, per-tenancy, and support modules. This desk authors and governs the system rather than working one contact’s case.

### Contact

There are two Contact entries:

1. **Public seat:** `/c/<token>` opens `ContactWorkspace` without the administrative header.
2. **Admin modeling:** Contact ▾ selects a known contact and opens `ContactAntScene`.

Both operate against contact-seat APIs. The token path is the real external question; the header path is an internal way to inspect that face.

### Same-row effect

A useful direct test is:

```text
Contact submits facts or books a meeting
→ durable row is written
→ Consultant reloads Board or Meetings
→ Consultant sees that result
```

There is no “contact copy” and “consultant copy” to synchronize.

## Code pass

### Step 1: one shell holds the desk state

`PrototypeAntApp.tsx` defines:

```ts
type AntDesk = "consultant" | "operator" | "contact";
const [desk, setDesk] = useState<AntDesk>("consultant");
```

The union limits the valid values. `useState` holds the currently visible desk.

### Step 2: `ViewAsProvider` provides shared scope

`viewAsContext.tsx` creates `ViewAsContext` and exports:

```text
ViewAsProvider
useViewAs
```

The provider owns:

- Whether the current user is an administrator
- Available consultants
- Selected firm
- Available contact workspaces
- Selected contact
- Loading state

When the selected firm changes, an effect calls:

```ts
setActiveFirmId(selectedFirmId);
```

That active firm is later attached to real wire requests.

### Step 3: non-admin and admin scoping diverge deliberately

For a non-admin:

```text
session user.firmId
→ selected firm
→ active firm
→ Consultant only
```

For an admin:

```text
machineApi.listConsultants()
→ consultant dropdown
→ selected firm
→ machineApi.listContactRecords()
→ contact dropdown
```

This is “view as this tenant,” not a new tenant data store.

### Step 4: `AntShell` conditionally mounts the scene

The render branch selects:

```text
OperatorAntScene
ContactAntScene
ConsultantAntScene
```

Only one scene is mounted in the body at a time. Switching desks unmounts the old scene and mounts the new one.

### Step 5: each scene asks the ledger a different question

`ConsultantAntScene` mounts modules such as `BoardModule`, `ContactsModule`, and `MeetingsModule`.

For example, Board effects call:

```text
wirePorts.machineApi.listContactRecords()
wirePorts.machineApi.listMeetings()
```

The Operator scene mounts modules including `ConfigurationLibrariesModule`, `ReferenceDataModule`, and `FirmOperationsBindModule`.

The public Contact path constructs a seat API from a token:

```text
ContactWorkspace
→ seatApi({ token })
→ machineApi.loadContactSeat(token)
→ contact-seat server routes
```

### Step 6: the real wire carries session and firm scope

`wireFetch()` sends:

```ts
fetch(`/wire${path}`, {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
});
```

`credentials: "include"` sends the session cookie.

Real machine calls can also send `x-firm-id` from `getActiveFirmId()`. On the server, `requireSessionFirm()` accepts the session firm, or an administrator’s allowed claimed firm.

### Step 7: rows, not desk state, join the faces

The desks converge on durable tables including:

```text
contact_records
consent_records
halt_records
fact_writebacks
meeting_booked
enrollment
engagement_records
```

The desk selection is UI state. The business state is in the ledger.

## What enables the architecture

1. A shared authenticated firm scope.
2. Separate scene components for each role.
3. One machine API contract.
4. Durable records shared across those scenes.
5. A tokenized Contact entry that narrows the shell without creating another ledger.

## Current gaps

1. Desk and module selection are mostly local React state; refresh does not preserve the exact desk position.
2. Auth-disabled mode exposes the full modeling switcher and is not a production tenancy model.
3. The repository still has two firm-id grains: UUID auth firms and TEXT CT/machine `firm_id`.
4. Contact ▾ in the header is an admin preview, not the public Contact access model.
5. Stand-in mode creates an in-memory version of the ledger for demos.

---

# 3. Control-plane and tenant-plane separation

## What it is

**Standard name:** control plane versus tenant operating plane.

The **control plane** defines what Tower can do:

- Reference versions
- Evaluation packs
- Automation workflows
- Engagement templates
- Defaults
- Published versions

The **tenant plane** applies that configuration to one firm:

- Firm bindings
- Firm posture
- Contacts
- Enrollments
- Attempts
- Meetings
- Firm-specific overrides

The Operator authors house configuration. A firm is a scope where published configuration runs.

## UI pass

### House-global modules

Operator’s sider contains a group labeled **House-global**:

- Acquisition & ads
- Activation & forward-deploy
- Reference data
- Configuration libraries
- Sending infrastructure
- Oversight
- Audit trail
- Register & evolution
- Founder & agency controls

The direct control-plane surface is **Configuration libraries**, with:

```text
Evaluation packs
Automation workflows
Engagement templates
```

### Per-tenancy modules

The next sider group is **Per-tenancy**:

- Provision
- Commercial
- Firm operations bind
- Book readiness
- Firm health
- Activation state

The direct join is **Firm operations bind**. It selects published house packs and applies them to a selected firm.

### Consultant boundary

Switch to Consultant. There is no Configuration libraries module. The Consultant sees outputs of the bound system and refusal controls, not the authoring environment.

## Code pass

### Step 1: module groups are separate typed catalogs

`surfaceCatalog.ts` exports:

```text
OPERATOR_HOUSE_MODULES
OPERATOR_TENANCY_MODULES
OPERATOR_SUPPORT_MODULES
```

`OperatorAntScene.tsx` derives `ModuleId` from those readonly arrays and builds separate Ant `Menu` groups.

`as const` tells TypeScript to preserve exact string values rather than widening every item to the general `string` type.

### Step 2: Configuration libraries owns authoring workbenches

`ConfigurationLibrariesModule.tsx` selects among:

```text
Evaluation pack editor
Workflow canvas
Agent / sequence editor
```

It mounts:

- `AntAutomationWorkbench`
- `AntAgentWorkbench`
- Evaluation-rule controls

The house author edits a graph, template, or evaluation configuration here.

### Step 3: authoring persists control-plane records

Automation example:

```text
AntAutomationWorkbench
→ machineApi.createWorkflow(...)
→ POST /wire/machine/workflows
→ handleWorkflowCreate / upsert
→ workflow.graph JSONB
→ workflow_trigger materialization
→ optional rule_pack rows
```

Agent example:

```text
AntAgentWorkbench
→ saveSequenceHousing(...)
→ campaigns, objectives, channels
→ upsertBinding(...)
```

Evaluation example:

```text
ConfigurationLibrariesModule
→ listEligibilityPathways / listMotionPrecedence
→ edit rows
→ corresponding machineApi upsert
```

### Step 4: publication and binding are distinct operations

`packCatalogStore` models draft and published pack versions.

`FirmOperationsBindModule` takes selected published pack identifiers and, on activation, calls operations such as:

```text
activateWorkflow(automationPackId)
upsertBinding(engagementTemplate)
putEvaluationPin(firm-scoped pin)
setCampaignState("running")
```

The binding step does not author the workflow. It points a firm at authored material and changes that firm’s operating posture.

### Step 5: firm scope is attached before tenant operations

When an operator selects a firm, the client calls:

```ts
setActiveFirmId(firmId);
```

Real machine requests include that firm claim. `requireSessionFirm()` checks it against the authenticated session and administrator status.

This is the security boundary behind the visible “view as firm” behavior.

### Step 6: tenant tables hold application, not authorship

Representative tenant records:

```text
contact_records
firm_sequence_binding
campaign_states
enrollment
active_attempts
meeting_booked
halt_records
consent_records
```

Representative control-plane records:

```text
workflow
workflow_trigger
sequence_template
campaign
campaign_objective
campaign_channel
rule_*
reference_versions
constants_packs
```

Some records include a nullable `firm_id` so a house default and a firm-specific row can coexist.

## What enables the separation

1. Separate Operator navigation groups.
2. Separate authoring and binding modules.
3. Published pack identifiers.
4. Firm-scoped wire requests.
5. Tables that distinguish defaults, authored definitions, bindings, and tenant runtime state.

## Current gaps

1. `packCatalogStore` begins from a TypeScript seed and lives as a client singleton rather than a fully table-backed catalog.
2. `FirmOperationsBindModule` keeps substantial binding/posture state in React.
3. Default pack IDs such as evaluation, workflow, and agent selections are still hard-coded in client helpers.
4. Auth UUID firms and CT TEXT firm identifiers remain two grains.
5. Meta, escrow, warmup, and some other house capabilities remain stand-ins.

---

# 4. Configuration-driven architecture

## What it is

**Standard name:** configuration-driven or metadata-driven architecture.

Tower stores variable operating behavior as data:

- Workflow graphs
- Trigger subscriptions
- Rules and constants
- Sequences
- Campaign order
- Objectives
- Channel order and content
- Attempt criteria
- Reference versions
- Firm bindings and overrides

Generic runtime code reads that data. Changing the data changes behavior without changing or redeploying the runtime.

## UI pass

### Automation configuration

Open **Configuration libraries → Automation workflows**.

The canvas allows the Operator to:

- Add nodes
- Configure trigger, Get, Rule, If, Switch, Action, Wait, and Exit
- Connect nodes
- Save the graph
- Run it with test data
- Launch it for future events

The visible graph is stored configuration.

### Evaluation configuration

Open **Evaluation packs**.

The Operator can:

- Pin a reference version
- Pin a ruleset
- Enable or disable modular rules
- Change precedence rows
- Publish a version

The intended result is a different evaluation without a code deployment.

### Engagement configuration

Open **Engagement templates**.

The Operator authors campaigns, objectives, channels, content, attempts, and overrides. Those are persisted as sequence and campaign records.

## Code pass

### Step 1: React holds an editable graph

`AntAutomationWorkbench.tsx` uses React Flow nodes and edges.

Each node has the approximate shape:

```ts
{
  id,
  type,
  position,
  data
}
```

`type` selects the visual and runtime node kind. `data` contains configuration such as trigger event, rule settings, action kind, comparison operands, or wait duration.

### Step 2: `AutomationProvider` owns workflow state

`AutomationContext.tsx` exposes operations such as:

```text
updateWorkflow
createWorkflow
activateWorkflow
startManualRun
refreshRuns
```

It initially loads local seed/persisted workflows, then calls `machineApi.listWorkflows()` and merges database rows into React state.

`Partial<...>` in an update signature means callers can send only the fields they are changing.

### Step 3: Save serializes the graph

`handleSave()` passes:

```ts
graph: { nodes, edges }
```

to `machineApi.createWorkflow()`.

The server performs an SQL upsert into `workflow`. Its `graph` column is JSONB, so the node and edge objects are persisted as structured JSON.

`ON CONFLICT ... DO UPDATE` means saving the same workflow ID updates its existing row.

### Step 4: the server materializes subscriptions

`materializeTriggersFromGraph()` reads trigger nodes and writes `workflow_trigger` rows containing:

- Workflow ID
- Node ID
- Trigger type
- Event name
- Global/local grain
- Local reference
- Firm/contact axes
- Enabled state

The graph is authoring data. `workflow_trigger` is the queryable subscription form used by dispatch.

### Step 5: the runtime reads the saved graph

`walkValidatedWorkflow()` does not receive the entire graph from the browser as executable authority. It loads:

```sql
SELECT graph FROM workflow ...
```

It then validates the graph and dispatches behavior by node type.

This is an interpreter: data says which operations exist and in what order; the walker supplies the general execution rules.

### Step 6: rule and sequence configuration use first-class rows

The broader configuration system includes:

```text
rule_pack
rule_attempt_criteria
rule_motion_precedence
constants_packs
sequence_template
campaign
campaign_objective
campaign_channel
seq_attempt_cycle
firm_sequence_binding
```

The UI edits those rows through typed machine API methods. Worker and cascade services read them when deciding what to do.

### Step 7: activation changes state, not code

Launching an Automation changes `workflow_state.status` and refreshes trigger rows.

Binding a sequence changes `firm_sequence_binding`.

Publishing reference data writes a versioned record.

No runtime source file is rewritten by these actions.

## What enables configuration-driven behavior

1. A graph stored as JSONB.
2. First-class rule, sequence, campaign, binding, and reference tables.
3. UI editors that write those records.
4. Generic walkers and workers that read them.
5. Activation and publication states separate from definition.

## Current gaps

1. Workflows are mirrored in `localStorage` and seeded TypeScript as well as Postgres.
2. Agent definitions and some template bindings remain TypeScript catalogs.
3. The stand-in machine contains a second, smaller workflow walker.
4. `RULE_LEFT_FIELD_MAP` and related knowledge remain hard-coded inside the server walker.
5. The server walker supports Tower’s validated shapes, not every arbitrary React Flow graph.
6. Some evaluation behavior is represented by rows while the actual re-evaluation path still contains stub logic.

---

# 5. Database-backed product UI

## What it is

**Standard name:** database-backed UI with one source of truth.

The product displays records returned by its data layer. React components do not own substitute contacts, meetings, verdicts, tags, or runs.

The operating rule is:

```text
table row
→ server query
→ typed wire response
→ React state
→ rendered module
```

Seeds populate tables for a useful development state. They do not populate components.

## UI pass

### Consultant Contacts and Board

Open Consultant → **Contacts** or **Board**.

The visible people should be the result of `listContactRecords()`. Reachability and sequence-ready indicators come from associated machine rows.

If the current firm has no rows, the correct result is an empty module. Adding a person’s name directly to the component would make the UI appear functional while bypassing the machine.

### Meetings

Open Consultant → **Meetings**.

Rows come from `meeting_booked`. A booking written by the Contact seat should appear here when the module queries again.

### Automation library

Open Operator → Configuration libraries → **Automation workflows**.

With the real wire active, workflow rows are hydrated from the `workflow` and `workflow_state` tables. Canvas Save writes the graph back.

### Real and stand-in observation

With:

```text
VITE_WIRE_REAL=true
```

the browser calls `/wire`.

With:

```text
VITE_WIRE_REAL=false
```

the same UI calls an in-browser port. The UI shape remains available, but the data is not durable Postgres evidence.

## Code pass

### Step 1: one flag selects the adapter family

`wireRealEnabled()` in `src/app/wire/http.ts` returns true unless the flag is explicitly false.

`registry.ts` then constructs `wirePorts`:

```ts
machineApi: useReal ? realMachineApi : standInMachineApi
```

The components depend on the port interface, not directly on `fetch` or a fixture array.

This is the adapter pattern: two implementations satisfy the same TypeScript contract.

### Step 2: a module requests records through the port

Consultant modules use effects similar to:

```text
component mounts
→ useEffect runs
→ wirePorts.machineApi.listContactRecords()
→ promise resolves
→ setContacts(rows)
→ React rerenders the table
```

`useEffect` is used because fetching is a side effect outside React’s pure render calculation.

### Step 3: the real adapter makes a typed HTTP request

`realMachineApi` calls `wireFetch<T>()`.

`wireFetch`:

1. Prefixes the path with `/wire`.
2. Includes the session cookie.
3. Sends JSON headers.
4. Throws on a non-2xx response.
5. Parses JSON as the requested TypeScript type.

The generic `<T>` is compile-time guidance. It does not validate the server response by itself.

### Step 4: Vite proxies `/wire` to the Hono service

`vite.config.ts` proxies:

```text
/wire
/api/wire
/auth
```

to `localhost:3001`.

The browser remains on port `5173`, while the development server forwards API traffic to the backend.

### Step 5: the server enforces firm scope and queries Postgres

Machine handlers call `requireSessionFirm()`, obtain the active firm, and issue parameterized SQL.

Parameters such as `$1` keep values separate from the SQL string and prevent the client from supplying raw SQL.

For contacts, the handler queries `contact_records` and may join or separately load rows such as:

```text
reachability_verdicts
sequence_ready
enrollment
meeting_booked
```

### Step 6: workflow UI hydrates from tables

`AutomationProvider` initially has a local workflow collection, then runs:

```text
machineApi.listWorkflows()
→ server reads workflow + workflow_state
→ provider merges returned rows by workflow ID
→ selected workbench receives the merged definition
```

The `Map` used during merge provides fast ID-based replacement.

### Step 7: mutations travel back through the same boundary

For example:

```text
Automation Save
→ machineApi.createWorkflow
→ server upsert
→ workflow row
```

and:

```text
Contact books
→ contact-seat route
→ meeting_booked row
→ Consultant Meetings query
```

The UI reads the results of writes rather than maintaining a separate hand-updated copy.

## What enables the database-backed UI

1. Typed port interfaces.
2. A real HTTP adapter.
3. Session- and firm-scoped server handlers.
4. Durable Postgres tables.
5. React effects that render returned rows.
6. Seed files at the data layer.

## Current gaps

1. Workflow definitions are mirrored in `localStorage` and TypeScript seeds.
2. Several Operator modules still contain demo arrays or client-side metadata.
3. Stand-in ports keep an in-memory book when real wire is disabled.
4. A failed workflow hydration is swallowed so the local seed remains visible; this can conceal a missing backend.
5. Auth UUID firm IDs and CT TEXT firm IDs can cause an apparently empty module when they do not align.

---

# 6. Table-driven interpreter runtime

## What it is

**Standard name:** a table-driven interpreter.

Tower stores workflow instructions as graph data and executes them with a generic walker.

The walker knows how to execute node *kinds*. The saved graph says which node instances exist, how they are configured, and how they connect.

This is not a general-purpose programming-language virtual machine. It is a domain interpreter for validated Tower workflow shapes.

## UI pass

Open an Automation workflow. The palette exposes:

- Trigger
- Get
- Rule
- If
- Switch
- Action
- Wait
- Exit

Each configured node stores parameters the interpreter understands.

Examples:

| UI node | Saved configuration | Runtime effect |
|---|---|---|
| Trigger | event, grain, local axes | Establishes the initial write-set |
| Get | module, filters, selection | Queries domain tables and returns row handles |
| Rule | ruleset and outcome options | Evaluates configured domain rules |
| If | operands and comparison | Chooses true/false path |
| Switch | ordered cases and fallback | Chooses a named output path |
| Action | action type and mapped inputs | Calls a supported Tower operation |
| Wait | duration or approval | Parks the run |
| Exit | terminal state | Ends the path |

When Run completes, node status and outputs are painted back onto the graph.

## Code pass

### Step 1: the graph is persisted as interpreter input

`workflow.graph` is JSONB containing:

```text
nodes[]
edges[]
```

Each edge contains source, target, and possibly `sourceHandle` for a branch.

### Step 2: Run creates a durable execution row

`handleWorkflowRunStart()`:

1. Resolves the session firm.
2. Inserts a `workflow_run` with status `running`.
3. Calls `walkValidatedWorkflow()`.
4. Stores resulting node status, counts, waiting state, or failure.
5. Returns the run result to the browser.

The durable run is separate from the durable workflow definition.

### Step 3: the walker loads the graph

`walkValidatedWorkflow()` queries the workflow row and extracts nodes and edges.

It validates the graph before execution. A free-form picture that does not satisfy the supported pipeline shape is rejected.

### Step 4: the walker initializes execution context

`WalkContext` contains:

```text
firmId
workflowId
runId
triggerPayload
constants
contactIds
previousWrites
chainWrites
branchTaken
lastOutput
```

This object is the current execution memory.

### Step 5: the interpreter dispatches by node type

The walker visits a node and branches on its type.

Representative behavior:

```text
get      → executeGet()
rule     → execute rule writes and output lattice
branch   → evaluate If comparison
switch   → evaluate ordered cases
action   → call named domain action
wait     → write occupancy and return waiting
exit     → finish
```

If `configured === false`, the walker marks failure and does not pretend the node is executable.

### Step 6: Get translates UI configuration into SQL

`executeGet()` reads values such as `getModule` and selection parameters.

For Contacts, it queries `contact_records`, then returns handles:

```ts
{ table: "contact_records", id, contact_id: id }
```

It may also attach reachability and sequence-ready writes.

The result is not the full row copied through every node. It is a typed reference to the persisted row.

### Step 7: If and Switch use branch handles

React Flow edges can carry `sourceHandle`.

For If:

```text
true edge
false edge
```

For Switch:

```text
path id edge
fallback edge
```

The interpreter evaluates stored operands and follows the edge attached to the matching handle.

### Step 8: Wait parks and resumes

A duration Wait writes run waiting information, including a resume time. The worker’s tick path finds due waits and resumes execution.

An approval Wait uses occupancy state until an allowed actor continues it.

### Step 9: node status returns to the UI

The server result contains per-node status. `paintRunOntoNodes()` merges that into React Flow data:

```text
runStatus
lastInput
lastOutput
writes
rule output classes
```

React rerenders the node badges and panes.

## What enables the interpreter

1. A durable graph.
2. A finite node-kind vocabulary.
3. Typed configuration stored in each node’s `data`.
4. A server execution context.
5. Node-kind dispatch functions.
6. Branch handles on edges.
7. Durable run and wait state.

## Current gaps

1. The interpreter supports validated Tower shapes, not arbitrary graph topology.
2. The stand-in walker supports a much smaller node subset.
3. Client Get preview and server Get execution do not return identical depth.
4. The Reference Get module currently returns no writes on the real walker.
5. Some named-code rule behavior described by product documents is not implemented in the walker.
6. Legacy sequence-cell execution remains alongside campaign execution in the runtime.

---

# 7. Domain-specific event-driven workflow orchestration

## What it is

**Standard name:** a domain-specific event-driven workflow engine.

Automations listens for named Tower events and invokes named Tower operations.

It is intentionally not:

- An arbitrary SQL editor
- A generic webhook relay
- A general scripting platform
- A second implementation of every module

The workflow coordinates real module operations.

## UI pass

### Configure the event

Open a Trigger node.

The Operator selects:

- Event, schedule, manual, webhook, or constant kind
- A named event where applicable
- Global or Local grain
- Local reference or contact scope where applicable

Examples of named events include contact import, audit completion, eligibility change, fact write-back, meeting booked, and objective met.

### Configure the operation

Add Action.

The action picker separates:

- Agents actions
- In-application actions

Examples include:

- Call an agent sequence
- Run an audit
- Ascribe a tag
- Manage lists
- Assign a task
- Notify a consultant

The Operator cannot type an arbitrary table name and value.

### Test versus arm

**Provide test data** gives the trigger a specimen or live write-set.

**Run** executes one instance immediately.

**Launch** arms the event subscription.

## Code pass

### Step 1: Save materializes event subscriptions

`materializeTriggersFromGraph()` scans trigger nodes and upserts `workflow_trigger`.

The row contains enough information for dispatch to answer:

```text
Is this workflow active?
Does it listen for this event?
Is it Global or Local?
Does this firm/contact/reference match?
```

### Step 2: domain code emits events after real work

Event emitters live in the modules that perform writes.

Examples:

```text
contact import handler     → contact_import
audit action               → audit.completed
fact write-back            → fact_writebacks
eligibility cascade        → eligibility.changed
meeting booking            → meeting_booked
campaign completion        → objective_met
consent silence            → consent_records.opt_out
```

The event is emitted after or alongside the domain write, not as a painted UI event.

### Step 3: dispatch selects eligible subscriptions

`dispatchEventToWorkflows()` joins:

```text
workflow_trigger
workflow_state
workflow
```

It requires an active workflow and matching event name.

`localAxesMatch()` applies Local restrictions such as firm, contact IDs, or a local reference.

### Step 4: dispatch applies workflow audience

The workflow can have:

```text
audience_scope = every_firm
```

or selected contact IDs.

The dispatcher intersects event contacts with configured audience where required.

### Step 5: each match becomes a run

For every matching active workflow:

```text
insert workflow_run
→ call walkValidatedWorkflow
→ return workflow/run/enrollment counts
```

One event can fan out to multiple workflows without those workflows being coupled to each other.

### Step 6: the Action node calls domain services

The walker normalizes `actionType` against a named catalog.

Representative execution:

```text
call_agent      → enrollAndActuate
run_audit       → executeAuditRun
ascribe_tag     → insert contact_tag
manage_lists    → engagement write
assign_task     → engagement write
notify_consultant → engagement write
```

The graph decides *which* supported action to invoke. The module/service still owns the operation.

### Step 7: time events use the worker

`worker.ts` runs the tick path. The tick:

- Dispatches due schedule triggers
- Resumes due Wait nodes
- Advances attempts and campaigns

Event-driven does not mean “only HTTP webhooks.” Time is another ignition source.

## What enables event-driven orchestration

1. Named event vocabulary.
2. Materialized trigger rows.
3. Active/inactive workflow state.
4. Global and Local matching axes.
5. Domain handlers that emit after writes.
6. A dispatcher that creates independent workflow runs.
7. Named action adapters into real modules.

## Current gaps

1. Stand-in event firing does not use real trigger tables or the full walker.
2. Schedule behavior depends on the worker actually running.
3. Some in-application affordances currently continue with no fulfillment writes.
4. Audit completion avoids some double dispatch through configuration-sensitive logic.
5. Manual triggers do not use event dispatch; they start through the explicit Run API.
6. The complete event and action catalogs are intentionally bounded and not universal.

---

# 8. Run-scoped dataflow and lineage

## What it is

**Standard name:** run-scoped typed outputs and data lineage.

Every completed node exposes references to the records written by that node in that run.

The next node uses those references. It does not search for “the latest matching record.”

The basic handle is:

```ts
type RunWrite = {
  table: string;
  id: string;
  contact_id?: string | null;
};
```

## UI pass

### Provide test data

Open a table-change Trigger and click **Provide test data**.

The trigger receives:

- Event name
- Contract version
- Write-set table names
- Concrete write handles
- Door 1 or Door 2 source

Door 1 means a matching live write was found. Door 2 means specimen writes were used.

### Output pane

Open a node’s Output pane after configuration or Run.

Writes are grouped by table. A downstream node can select or map them.

### Input mapping

Open a downstream Action, If, or Switch.

Mapped chips identify:

- Source node
- Table
- Record or field selection
- Destination slot

The visible chip is the UI form of the data handle.

### Run feedback

After Run, each node receives `lastInput`, `lastOutput`, and run status derived from server node status.

## Code pass

### Step 1: the trigger seeds the initial write-set

`writesFromPayload()` reads:

```text
payload.writes
```

and validates that each entry has string `table` and `id` values.

It can also derive legacy contact/import handles from older payload fields.

### Step 2: `WalkContext` separates immediate and historical output

The walker holds:

```ts
previousWrites: RunWrite[];
chainWrites: Record<string, RunWrite[]>;
```

- `previousWrites` is the last completed node’s output.
- `chainWrites[nodeId]` stores each completed node’s output for this run.

### Step 3: every producing node calls `commitWrites`

The central operation is:

```ts
function commitWrites(ctx, nodeId, writes) {
  ctx.chainWrites[nodeId] = writes;
  ctx.previousWrites = writes;
}
```

That one update makes the node’s writes the default input for the next node while retaining addressability by source node.

### Step 4: mapped inputs resolve against run history

`mappedWrites()` reads mapping configuration.

If a chip includes `fromNodeId`, it selects:

```text
ctx.chainWrites[fromNodeId]
```

Otherwise it uses:

```text
ctx.previousWrites
```

It then filters by table and record identity.

### Step 5: If and Switch load fields through handles

A comparison operand does not need the entire database row embedded in the graph.

The walker uses the handle to load the requested field from the referenced table and ID, then evaluates the stored operator and expected value.

### Step 6: real actions return real writes

Examples:

```text
run_audit
→ audit run and verdict writes
→ commitWrites

call_agent
→ enrollment write
→ commitWrites

ascribe_tag
→ contact_tag writes
→ commitWrites
```

The downstream node now points to that exact action instance.

### Step 7: event test contracts provide the same shape before a live run

Migration `017_event_test_contract.sql` provides:

```text
event_write_set
event_test_data
```

`handleEventTestContract()`:

1. Reads the expected write-set for the event.
2. Attempts Door 1 against live domain tables.
3. Falls back to Door 2 specimen rows.
4. Returns `RunWrite[]`.

### Step 8: the browser paints server lineage

`paintRunOntoNodes()` reads each node’s returned status and writes:

```text
lastOutput.writes
lastInput.writes
runStatus
rule result classes
```

into the React Flow node’s `data`.

That is presentation of server execution, not the authoritative lineage store.

## What enables run-scoped lineage

1. Stable table and record identifiers.
2. A small `RunWrite` reference type.
3. Immediate `previousWrites`.
4. Per-node `chainWrites`.
5. Persisted input mappings with source-node identity.
6. Domain actions that report the records they wrote.
7. Per-node status stored on the workflow run.

## Current gaps

1. `chainWrites` is execution memory; the client receives node statuses rather than the complete map.
2. There is no separate append-only `run_writes` table. Run lineage is represented in `workflow_run.node_status` plus domain tables.
3. UI default input resolution can favor the first incoming edge in a multi-parent situation.
4. Authored output previews can appear before live execution and must not be confused with runtime writes.
5. Stand-in branching and lineage are much thinner than the real walker.
6. Event test contracts exist both in SQL and a TypeScript fallback catalog.

---

# 9. Direct-manipulation workflow authoring

## What it is

**Standard name:** a node-based direct-manipulation editor.

The workflow diagram is the primary authoring interface. The Operator configures the executable object by manipulating the graph itself.

Three similarly named operations must remain distinct:

| Operation | Meaning |
|---|---|
| Click a node | Configure that node |
| Node menu → Switch | Change this Trigger, Action, or Wait kind |
| Palette → Switch | Add a many-path Switch branch node |

## UI pass

### Add a node

Open Automation workflows → Workflow.

The Build palette lists node kinds. Selecting one:

1. Creates a React Flow node.
2. Adds it to the graph.
3. Relayouts where required.
4. Opens its configuration interior.

### Configure a node

Click the body of a node.

The workbench opens the appropriate interior:

- Trigger selection and test data
- Get parameters
- Rule outcomes
- If comparison
- Switch paths
- Action kind and inputs
- Wait parameters

The node’s badge changes from `needs setup` to `configured` when its required data is present.

### Insert into the graph

The Operator can:

- Add after a node
- Insert on an edge
- Add on an If true/false handle
- Add on a Switch case
- Duplicate a node
- Delete a node

These operations update nodes and edges, not a separate hidden workflow form.

### Use the two Switch meanings

On a Trigger, Action, or Wait, open `⋯ → Switch`.

- Trigger opens the trigger-kind picker.
- Action opens the action-kind picker.
- Wait changes approval/duration shape.

To create a many-path branch, use the **Switch** item in the Build palette. Its node interior manages case paths and fallback.

## Code pass

### Step 1: React Flow owns nodes and edges

`AntAutomationWorkbench.tsx` uses:

```text
useNodesState
useEdgesState
```

These hooks return:

- Current array
- State setter
- Change handler compatible with React Flow

Dragging a node produces a node change, which updates its position in React state.

### Step 2: custom node types render Tower-specific cards

`nodeTypes` maps workflow type names to `AntWorkflowNode`.

The node receives React Flow props including:

```text
id
type
data
selected
```

`data` supplies label, configured state, Switch paths, wait shape, outputs, and other display information.

### Step 3: `onNodeClick` opens configuration

The canvas registers:

```tsx
onNodeClick={(event, node) => {
  const target = event.target as HTMLElement | null;
  if (target?.closest(".nodrag")) return;
  openNode(node);
}}
```

Controls marked `.nodrag` are excluded so clicking an input or menu does not also open or drag the node.

`openNode()` sets selected-node state and chooses the appropriate interior plate.

### Step 4: node interiors patch `data`

Configuration components call helpers such as `patchNodeData()`.

Conceptually:

```text
find node by id
→ copy node
→ copy node.data
→ apply changed fields
→ replace node in nodes array
```

React state is treated immutably: copies are created instead of mutating the existing object in place. This allows React to detect the change and rerender.

### Step 5: graph helpers perform structural edits

`automationWorkflows.ts` contains helpers including:

```text
createNodeFromBlock
appendNodeAfter
insertNodeOnEdge
relayoutWorkflowNodes
deleteWorkflowNode
```

Inserting on an edge:

1. Finds the old edge.
2. Removes it.
3. Adds source → new node.
4. Adds new node → old target.
5. Preserves relevant source-handle information.

### Step 6: Canvas operations use React context

`CanvasOpsContext` provides callbacks to each custom node:

```text
onDuplicate
onDelete
onAddAfter
onInsertOnEdge
onSwitch
```

This avoids passing every callback through every intermediate component.

### Step 7: menu Switch is type-restricted

`switchableKind()` returns true only for:

```text
trigger
action
wait
```

`onSwitch(id)` then branches:

```text
trigger → TriggerSelectModal
action  → Action kind plate
wait    → toggle duration/approval
```

It does not assign `type: "switch"`.

### Step 8: a Switch node uses path handles

A Switch node stores:

```text
paths[]
fallbackHandle
```

Each path has an ID used as a React Flow source handle. Edges from that handle identify which downstream path belongs to that case.

The server interpreter uses the same handle IDs when choosing an outgoing edge.

### Step 9: workbench state is persisted

An effect mirrors node/edge changes into `AutomationContext`.

Explicit Save serializes the current graph to Postgres. Run performs a quiet Save first so the server walker executes the graph currently visible to the Operator.

## What enables direct manipulation

1. One graph object shared by visual and persisted forms.
2. Custom node components.
3. Type-specific interiors.
4. Structural graph helper functions.
5. Source handles for branches.
6. Immediate configured-state feedback.
7. Server execution of the saved graph.

## Current gaps

1. Local React state, `localStorage`, and Postgres can temporarily contain different graph versions.
2. The server executes validated Tower shapes rather than all graphs the UI can visually draw.
3. The word “Switch” still names two different user operations.
4. Hub’s older editor still contains behavior that does not follow the Ant product lifecycle.
5. The stand-in walker cannot validate every node behavior the canvas can author.

---

# 10. Separate authoring, testing, and activation

## What it is

**Standard name:** workflow lifecycle management.

Definition, test execution, and production activation are separate states.

For Automations:

```text
Save   = persist definition
Run    = execute one instance now
Launch = arm future event execution
```

For Agents:

```text
Save         = persist sequence configuration
Launch agent = enroll and start a mission now
```

“Launch” is therefore contextual. Automation Launch arms. Agent Launch starts pursuit.

## UI pass

### Automation Save

Edit the graph and click **Save**.

Expected effect:

- Workflow graph is persisted.
- Trigger subscriptions are materialized.
- Status does not imply that a test run occurred.

### Provide test data and Run

Open the Trigger and click **Provide test data**.

Then click **Run**.

Expected effect:

1. The current graph is saved quietly.
2. A `workflow_run` begins with the trigger writes.
3. The server walks now.
4. Nodes receive run status and output.
5. The run can succeed, fail, or park at Wait.

Without trigger writes, Run stops with:

```text
Provide test data on the trigger first.
```

### Run to here

Open a node and click **Run to here**.

The same manual-run path receives `untilNodeId`. The walker stops after that node.

### Automation Launch

Click **Launch**.

Expected effect:

```text
Armed — this event will run the workflow
```

No immediate graph walk is implied.

### Agent Save and Launch

Open Engagement templates.

- **Save** writes campaigns, objectives, channels, rule overrides, and binding information.
- **Launch agent** creates an enrollment and begins pursuit.
- **Add contact** also enrolls explicitly selected contacts and starts now.

## Code pass

### Step 1: Automation Save calls the workflow upsert

`handleSave()` updates context and calls:

```text
wirePorts.machineApi.createWorkflow
```

The server upserts:

```text
workflow
workflow_state
workflow_trigger
rule_pack where applicable
```

### Step 2: Run requires a handle

`handleRun()` obtains:

```ts
const writes = writesFromHandle(triggerNode?.data.lastOutput);
```

If `writes.length` is zero, it returns before calling the server.

This requirement means a manual test starts from records, not from a generic Play button.

### Step 3: Run saves before walking

`handleRun()` calls:

```text
handleSave({ quiet: true })
```

before `startManualRun()`.

This avoids the common error where the visible graph differs from the graph loaded by the server.

### Step 4: manual Run has its own endpoint

`startManualRun()` posts:

```ts
{
  payload: { writes },
  untilNodeId
}
```

to the workflow-runs endpoint.

The server inserts `workflow_run`, calls `walkValidatedWorkflow()`, and returns node status.

### Step 5: Launch has a different endpoint

`handleLaunch()` also saves quietly, then calls:

```text
machineApi.activateWorkflow(workflow.id)
```

The server:

1. Sets `workflow_state.status = active`.
2. Materializes trigger rows from the graph.
3. Returns activation state.

It does not call the manual-run handler.

### Step 6: live execution begins in event dispatch

After Launch:

```text
domain event occurs
→ dispatchEventToWorkflows
→ active matching trigger found
→ workflow_run inserted
→ walker starts
```

This is why Launch and Run cannot be the same function.

### Step 7: Agent Save writes a different model

`AntAgentWorkbench.handleSave()` performs operations such as:

```text
saveSequenceHousing
upsertBinding
saveAttemptCycle
saveSeqChannelRules
upsertAttemptCriteria
```

It persists a mission definition, not a when-then workflow graph.

### Step 8: Agent Launch creates enrollment

`handleLaunch()` resolves a sequence template/binding and calls:

```text
machineApi.createEnrollment
```

The server enters `enrollAndActuate()`, which creates pursuit state and may initiate the first channel under send policy.

There is no separate “arm the agent and wait for an event” state in this button.

## What enables lifecycle separation

1. Separate server endpoints.
2. Separate definition and run tables.
3. Active workflow state.
4. Materialized event subscriptions.
5. Manual trigger handles.
6. Enrollment as the start-now Agent primitive.

## Current gaps

1. Agent header Launch currently resolves the first available book contact rather than using the Add-contact selection.
2. Some Runs copy implies history appears only after Launch, although manual Run also writes run history.
3. Hub’s older launch handler can combine activation and execution.
4. Schedule activation is easy to confuse with manual Run unless the worker boundary is understood.
5. In stand-in mode, lifecycle states are simulated rather than proven through durable rows.

---

# 11. Hierarchical campaign orchestration

## What it is

**Standard name:** a hierarchical campaign orchestration model.

Agents is not a flat list of messages.

Its model is:

```text
Sequence
└── Campaign
    ├── one binary Objective
    ├── ordered Channels
    ├── Channel rules
    ├── Attempt rules
    └── Content and variations
```

Definitions:

- **Sequence:** the full mission container.
- **Campaign:** pursuit of one objective.
- **Objective:** one binary completion condition.
- **Channel:** the communication medium.
- **Attempt:** one cycle through the campaign’s channel method.

Two objectives require two campaigns.

## UI pass

### Open an engagement template

Configuration libraries → Engagement templates → select a sequence.

The workbench loads the sequence housing and renders campaign cards.

### Configure an objective

Each campaign begins with an objective.

The Operator can select a template objective or define a direct objective such as:

- Link clicked
- Form submitted
- Meeting booked

The objective is yes/no. It is not “make progress.”

### Open the campaign

Enable **Override this**.

The campaign expands to show:

- Attempt count
- Wait after failed attempt
- Channel sequence
- Channel rules
- Content controls

### Open a channel

The channel card represents the medium:

```text
Text
Email
Call
```

Content override lives inside the channel. Channel escalation rules attach to that medium.

Attempt rules do not become channel rules. Attempts are campaign cycles.

### Save and start

Save writes the hierarchy. Launch agent or Add contact creates enrollment against the complete sequence, not an individual campaign picker.

## Code pass

### Step 1: the database enforces sequence ownership

`sequence_template` is the parent definition.

`campaign` contains:

```text
sequence_id
name
ord
override_this
attempt_count
wait_after_last_failed_seconds
nth_exception
```

`ord` determines campaign order.

### Step 2: one campaign has one objective

`campaign_objective` has a unique constraint on `campaign_id`.

Its important fields are:

```text
kind
name
completion_table
source
```

Supported completion tables connect objectives to durable events:

```text
messaging_events
fact_writebacks
meeting_booked
```

The uniqueness constraint is the database expression of “one objective per campaign.”

### Step 3: channels are ordered children

`campaign_channel` contains:

```text
campaign_id
token
ord
override_content
content
```

The token identifies the medium. `ord` identifies its place in the campaign’s sequence.

`campaign_channel_variation` can provide attempt-specific content without inventing another channel.

### Step 4: React uses campaign drafts

The Agents editor does not mutate SQL rows directly.

It uses a UI shape such as `CampaignDraft`, then converts:

```text
housingToDrafts
draftsToHousing
```

This translation separates editing convenience from the wire/database contract.

### Step 5: Save persists the full housing

`saveSequenceHousing(templateId, campaigns)` sends campaigns with nested objective and channel configuration.

The server replaces or upserts the relevant housing rows in an order that respects foreign keys.

### Step 6: enrollment starts at the first campaign

`enrollAndActuate()` resolves the first campaign by order and writes:

```text
enrollment.sequence_id
enrollment.campaign_id
```

It opens an `active_attempts` row and resolves the initial owning channel.

### Step 7: the worker advances within a campaign

The time path reads rule and attempt rows to:

- Determine whether a channel criterion fired
- Hand ownership forward
- End or repeat an attempt
- Respect attempt limits and wait windows

Only one active attempt should own the current pursuit path.

### Step 8: completion advances between campaigns

`objectiveSatisfiedBy()` checks the objective’s completion table and local pursuit stamp.

`advanceEnrollmentCampaign()`:

1. Confirms the current objective is satisfied.
2. Finds the next campaign by `ord`.
3. Updates the enrollment’s campaign.
4. Writes objective-met engagement history.
5. Can dispatch `objective_met` for Automations.

If there is no next campaign, the sequence has reached its endpoint.

## What enables hierarchical orchestration

1. Separate sequence, campaign, objective, channel, and attempt tables.
2. Foreign keys expressing ownership.
3. `ord` columns expressing sequence.
4. A unique objective per campaign.
5. Enrollment carrying the current campaign.
6. Worker logic for attempts.
7. Completion logic for campaign advancement.

## Current gaps

1. Legacy `sequence_template.cells` still participates in runtime advancement, creating overlapping clocks.
2. Operator-authored “goal → another agent/workflow/end” is not fully housed as modular data.
3. Call can be authored as a channel, but no live call dispatcher fulfills it.
4. The Agents report surface remains thin.
5. Example names such as Launch window and Launch day can still look like fixed system types even though they are editable campaign examples.

---

# 12. Cascading defaults and overrides

## What it is

**Standard name:** hierarchical configuration inheritance.

Tower resolves broad defaults first, then applies more specific overrides.

For engagement rules:

```text
Global default
→ Sequence override
→ Campaign override
→ Channel override
```

For tenancy:

```text
House-published default
→ Firm binding
→ Firm-specific override
```

If a lower level does not override a value, it falls back to the level above.

## UI pass

### Global and sequence settings

Open Agents Settings or Sequence Settings.

The Operator can control override families such as:

- Attempt
- Channel
- Content
- Sequencing

These controls declare that a lower scope owns a value instead of inheriting it.

### Campaign override

On a campaign, enable **Override this**.

Campaign-specific attempt and channel controls become available.

### Channel override

Inside a campaign channel, enable the channel override and adjust:

- Timing threshold
- Escalation criteria
- Content
- Attempt-specific variation

The visible expansion is the UI expression of increased specificity.

### Firm binding

Firm operations bind selects the published engagement template for a firm. That establishes the tenant’s base sequence before more specific runtime resolution.

## Code pass

### Step 1: binding rows hold override declarations

`firm_sequence_binding` includes:

```text
is_default
override_attempt
override_channel
override_content
override_sequencing
```

These booleans record whether a scope intends to replace inherited behavior.

### Step 2: campaign rows hold campaign-specific values

`campaign` contains:

```text
override_this
attempt_count
wait_after_last_failed_seconds
nth_exception
```

`campaign_channel` contains:

```text
override_content
rules_override
within_seconds
content
```

The value and the override declaration are stored together at the applicable grain.

### Step 3: Save writes only enabled override families

`AntAgentWorkbench.handleSave()` conditionally calls:

```text
saveAttemptCycle
saveSeqChannelRules
upsertAttemptCriteria
```

depending on active override controls.

This avoids creating lower-level rows for values that should still inherit.

### Step 4: runtime resolution checks most-specific first

`resolveRulesForAttempt()` follows an effective order:

1. Campaign-channel rules when `rules_override` is active.
2. Sequence-scoped channel rules when the binding enables channel override.
3. Global channel rules.
4. Unscoped fallback criteria.

The first applicable level supplies the effective rule set.

### Step 5: attempt values resolve at their own grain

Campaign-specific attempt values can override sequence attempt-cycle rows.

Otherwise the runtime reads `seq_attempt_cycle`, including global and sequence-scoped rows.

The runtime does not place attempt values on each channel because that is the wrong grain.

### Step 6: channel order has its own sequence data

`seq_channel_ownership_order` holds the channel ladder. Firm-specific rows can take precedence over house-global rows.

Because order is stored as rows, changing the ladder does not require changing the worker’s source code.

### Step 7: content resolution is separate from timing resolution

Content selection can use campaign-channel content and attempt-specific variations.

Timing and escalation use rule rows. Keeping these separate prevents a copy override from unintentionally changing the attempt engine.

## What enables inheritance

1. Explicit scope columns and foreign keys.
2. Override booleans.
3. Nullable/global rows.
4. Most-specific-first resolver functions.
5. Separate tables for content, order, and criteria.
6. UI expansion that exposes only the selected lower grain.

## Current gaps

1. `override_content` and `override_sequencing` on `firm_sequence_binding` are persisted without a clearly proven runtime reader.
2. Campaign-level and sequence-level attempt controls overlap and are difficult to inspect as one effective value.
3. The pack catalog and some global defaults still begin in TypeScript.
4. Firm operations bind activates packs but does not itself explain the effective inherited configuration.
5. Dual firm identifiers can cause a scoped override row not to match the active session grain.

---

# 13. Centralized fail-closed policy enforcement

## What it is

**Standard name:** a centralized policy-enforcement point with fail-closed behavior.

Sequence configuration answers:

```text
What does Tower want to send?
```

The send gate answers:

```text
May Tower send it now?
```

Every real send must pass the same consent, silence, and halt checks. Missing permission denies the send.

## UI pass

### Consultant halt

Open Consultant → Board or a client workspace → **Halt outreach**.

The Consultant chooses:

- This contact
- Firm book

and confirms a reason.

The visible effect is a halt state on the workspace. The important effect is a `halt_records` row read by send and enrollment paths.

### Founder kill-switch

Open Operator → **Founder & agency controls**.

The kill-switch can target selected firms or the fleet. Confirming commits firm-book halts.

This is the house-level form of the same policy record.

### Contact consent and opt-out

The Contact workspace presents consent and opt-out controls. Consent writes a basis used by the send gate.

The intended opt-out result is silence: later sends must be denied.

### Firm send-gate display

Operator → Firm operations bind exposes Send-gate chips and probe behavior.

The UI can show reasons such as:

- Consent
- Halt
- Sending identity
- Warmup
- Posture
- Quarantine
- Revoked OAuth

Not all of those visible reasons currently come from the real server enforcement path.

## Code pass

### Step 1: policy state is durable

`halt_records` stores:

```text
firm_id
contact_id
scope = contact | firm-book
reason
halted_at
lifted_at
```

An active halt has no `lifted_at`.

`consent_records` stores:

```text
contact_id
firm_id
basis = express | implied | none
silenced
status
source
```

These records are independent of a particular sequence or sender.

### Step 2: UI controls write through ports

Consultant and Founder controls call:

```text
wirePorts.haltStore.commit(...)
wirePorts.haltStore.lift(...)
```

With real wire enabled, the real halt adapter calls server store routes. The server inserts or lifts records and writes audit history where applicable.

### Step 3: new enrollment checks halt before pursuit begins

`enrollAndActuate()` calls:

```text
isHaltBlockingNew(firmId, contactId)
```

The SQL checks:

```text
active firm-book halt for this firm
OR
active contact halt for this contact
```

If blocked, the enrollment path stops rather than creating pursuit that cannot legally proceed.

### Step 4: all real send wrappers call the same gate

`dispatchSend.ts` is shared by:

- HTTP send probes
- Enrollment actuation
- Worker/cascade sends

`consentAndHaltGate()` checks in order:

1. Active firm-book halt.
2. Contact silence.
3. Consent basis, except for opt-in purpose.
4. Active contact halt.

The return type is a TypeScript discriminated union:

```ts
{ allow: true }
|
{ allow: false; deny: string; detail: string }
```

After checking `allow`, TypeScript knows which fields exist.

### Step 5: mode and cohort add another fail-closed layer

`shouldLiveSend(contactId)` evaluates environment send mode and test cohort.

The result separates:

- Live provider dispatch
- Dry-run success with reason
- Policy denial

Missing live-send configuration does not silently become unrestricted sending.

### Step 6: live dispatch writes evidence

`dispatchEmailLive()` or SMS equivalent:

1. Checks provider capability.
2. Calls the policy gate.
3. Resolves contact access link and sending identity.
4. Calls Resend or Twilio.
5. Writes `outbound_messages`.
6. Writes or later receives `messaging_events`.
7. Retains enrollment, campaign, objective, and attempt stamps.

Those stamps allow delivery and response events to connect back to the pursuit that caused them.

### Step 7: every caller receives a structured result

`DispatchResult` distinguishes:

```text
live accepted
dry-run accepted
denied
```

Callers do not infer permission from a missing exception.

## What enables centralized enforcement

1. Shared halt and consent tables.
2. One callable server dispatch layer.
3. Enrollment pre-check.
4. Send-time re-check.
5. Explicit live/dry-run mode.
6. Structured deny results.
7. Durable outbound records with pursuit stamps.

## Current gaps

1. The client `sendGate` port is always the stand-in implementation, even when real wire is active.
2. The visible gate checks include warmup, posture, identity, quarantine, and OAuth states that the real `dispatchSend.ts` gate does not fully enforce.
3. Contact workspace Opt out currently sets workspace opt-out state rather than clearly setting `consent_records.silenced=true`; this may not block CEM through the server gate.
4. Implied-consent expiry and channel-specific consent are not implemented in the central gate.
5. The stand-in machine can simulate sends without traversing `dispatchSend.ts`.
6. Firm-ID grain mismatch can cause a halt or consent row not to match the session firm.

---

# 14. Separation of presentation, orchestration, and fulfillment

## What it is

**Standard name:** separation of concerns across interaction, orchestration, and execution.

Tower separates three responsibilities:

| Layer | Responsibility |
|---|---|
| Presentation | Show state and collect an explicit user choice |
| Orchestration | Decide what operation runs next and with which records |
| Fulfillment | Perform the operation and write its durable result |

Agents present and pursue objectives. Automations coordinate operations. Domain modules and wire services fulfill them.

## UI pass

### Agents

Open Configuration libraries → Engagement templates.

The Operator defines:

- Campaigns
- Objectives
- Channel order
- Content
- Attempts
- Escalation

Launching an Agent enrolls people into pursuit.

The Agent does not itself evaluate eligibility, persist arbitrary facts, or issue authentication credentials.

### Automations

Open Automation workflows.

The Operator defines:

```text
When this event occurs
→ run this operation
→ inspect its writes
→ branch
→ run another named operation
```

Automations can call an Agent, but does not author a new Agent interior.

### Consultant and Contact

The Consultant sees operational results: contacts, phase signals, meetings, and live brief.

The Contact supplies consent, facts, uploads, or a meeting selection.

Those screens collect or present information. Server modules perform the corresponding writes and cascades.

## Code pass

### Step 1: presentation remains in React

Product components live under:

```text
src/app/register/prototype-ant/
```

Examples:

```text
AntAgentWorkbench
AntAutomationWorkbench
BoardModule
MeetingsModule
ContactWorkspace
```

These components own visual state, forms, modal state, and typed port calls.

They do not import Postgres or provider secrets.

### Step 2: ports define the boundary

React calls `wirePorts`.

Representative ports:

```text
machineApi
haltStore
consentSilence
auditTrail
espMailer
smsApi
```

The port interface says what the UI may ask for. The real adapter translates that request into HTTP.

### Step 3: orchestration runs in the workflow service

`workflowWalk.ts` owns:

- Graph execution
- Node ordering
- Write-set propagation
- Branch selection
- Named action invocation

`dispatchEventToWorkflows()` owns event fan-out.

This layer decides what should run next. It should not duplicate the implementation of Audit, engagement, or sending.

### Step 4: actions cross into domain fulfillment

Examples:

```text
run_audit
→ executeAuditRun()

call_agent
→ enrollAndActuate()

ascribe_tag
→ contact_tag write

send
→ dispatchEmail() / dispatchSms()

meeting
→ contact-seat meeting handler
```

The action node delegates to a function that owns that module’s real writes.

### Step 5: Agents and Automations have different start semantics

Agent:

```text
Launch agent
→ createEnrollment
→ enrollAndActuate
→ pursuit starts
```

Automation:

```text
Launch
→ activateWorkflow
→ wait for matching event
```

Automation bridge:

```text
event fires
→ workflow walks
→ call_agent action
→ enrollAndActuate
```

The same enrollment fulfillment can therefore be entered by hand-now or event-later without moving sequence authorship into Automations.

### Step 6: server fulfillment owns secrets and external effects

Provider clients and database pools live under `server/wire-service/`.

The browser never receives:

- Database credentials
- Resend API key
- Twilio secret
- Direct SQL capability

The backend uses those capabilities, writes the outcome, and returns a safe result.

### Step 7: fulfillment must return writes

An operation is complete when the domain module has produced durable records.

Those records become:

- UI query results
- Workflow write handles
- Event sources
- Audit evidence

A toast alone is not fulfillment.

## What enables the separation

1. React components without server secrets.
2. Typed port interfaces.
3. HTTP adapters.
4. Orchestration services.
5. Domain fulfillment functions.
6. Durable writes returned as handles.
7. Separate Agent and Automation authoring models.

## Current gaps

1. `VITE_WIRE_REAL=false` collapses presentation and simulated fulfillment into the browser.
2. Meta ads, escrow, enrichment, warmup, and some sending-infrastructure capabilities remain stand-ins.
3. Some in-app Automation actions are visible before their real fulfillment path is complete.
4. Hub still exposes authoring tools in the older firm shell, which is the wrong seat.
5. Send-gate presentation and real server enforcement are not yet one implementation.

---

# 15. Closed-loop operations

## What it is

**Standard name:** a closed-loop operational system.

Tower does not stop after sending outreach.

Its main loop is:

```text
Detect
→ Decide
→ Engage
→ Collect
→ Re-evaluate
→ Choose the next motion
→ Reach a durable objective
→ Make that result available to the next operation
```

The primary business endpoint is a durable `meeting_booked` record, not a conversational claim that a meeting was booked.

## UI pass

### 1. Load and audit the book

Operator → **Book readiness**:

- Import contacts
- Start an Audit
- Inspect reachability and sequence-ready results

This establishes who can be acted on.

### 2. Bind and activate the operating system

Operator → **Firm operations bind**:

- Select evaluation, automation, and engagement packs
- Move the firm to Active

This connects house configuration to the firm.

### 3. Author event response

Configuration libraries → **Automation workflows**:

- Listen for import, fact write-back, eligibility change, meeting, or objective completion
- Run evaluation or audit
- Branch on the result
- Assign an Agent

### 4. Start pursuit

Configuration libraries → **Engagement templates**:

- Save the sequence
- Add contacts or Launch agent

An enrollment and active attempt represent the running mission.

### 5. Contact writes back

The Contact seat can:

- Give consent
- Provide facts
- Upload information
- Book a meeting
- Opt out

These are durable writes, not only UI acknowledgements.

### 6. Consultant receives the result

Consultant:

- Board shows the book and current signals
- Meetings queries booked rows
- Live brief hydrates current facts
- Halt outreach can stop further automated sending

The Consultant sees the output of the loop without authoring its internal machinery.

## Code pass

### Step 1: detection writes state

The machine schema includes:

```text
eligibility_evaluations
eligibility_results
signals
motion_decisions
missing_fact_signals
reachability_verdicts
sequence_ready
```

Audit and evaluation functions write these records.

### Step 2: detection can emit an event

`runContactEligibilityCascade()` writes evaluation, signal, and motion records, then dispatches:

```text
eligibility.changed
```

An active Automation listening for that event can decide the next action.

### Step 3: motion creates pursuit

A `call_agent` action or direct Agent launch calls `enrollAndActuate()`.

That function:

1. Checks halt policy.
2. Resolves the sequence/template.
3. Creates `enrollment`.
4. Selects the first campaign.
5. Creates `active_attempts`.
6. Resolves the owning channel.
7. May dispatch the first send.

### Step 4: the worker owns the time path

`worker.ts` calls the cascade tick.

The tick:

- Resumes due waits
- Dispatches schedules
- Checks campaign completion
- Advances channel ownership
- Advances or exhausts attempts
- Sends through centralized dispatch

The mission continues without the browser remaining open.

### Step 5: outbound messages retain pursuit identity

`outbound_messages` contains stamps such as:

```text
enrollment_id
campaign_id
campaign_objective_id
attempt_id
```

Provider events can therefore be associated with the exact campaign objective and attempt.

### Step 6: Contact fact write-back re-enters evaluation

The contact-seat facts handler:

1. Inserts `fact_writebacks`.
2. Includes campaign-objective identity when available.
3. Runs contact eligibility cascade.
4. Dispatches the fact-writeback event.
5. Calls completion handling.

This is the “collect → re-evaluate” part of the loop.

### Step 7: meeting booking writes the business outcome

The contact-seat meeting handler inserts `meeting_booked` with:

```text
firm_id
contact_id
booked_at
source
slot
consultant_name
enrollment_id
payload
```

It then:

- Emits related events
- Checks objective completion
- Closes or nullifies active pursuit where applicable

### Step 8: objective completion advances the sequence

`onCompletionWrite()` and `advanceEnrollmentCampaign()` compare the new write with the current campaign objective.

The match is Local: the write must carry the appropriate pursuit/objective identity.

On a match:

```text
write objective-met engagement record
→ move enrollment to next campaign, if one exists
→ emit objective_met
→ allow another Automation to hear it
```

This is the second door:

- Same-canvas continuation uses the write handle.
- Another workflow can listen for the completion event.

### Step 9: Consultant surfaces query the loop

`BoardModule` loads contacts and detection/motion information.

`MeetingsModule` loads `meeting_booked`.

The Live brief uses fact-writeback hydration and current machine information rather than relying only on a meeting-time snapshot.

### Step 10: the loop remains queryable

Because the stages write records, Tower can ask:

- What initiated this pursuit?
- Which campaign and attempt sent this message?
- What write satisfied the objective?
- How long did completion take?
- What facts changed?
- Which evaluation followed?

That queryability is the operational difference between a closed loop and an email sequence.

## What enables the closed loop

1. Durable detection and motion records.
2. Event dispatch after domain writes.
3. Enrollment and active-attempt state.
4. A worker for unattended time.
5. Pursuit stamps on outbound and completion records.
6. Contact write-back routes.
7. Objective completion against real tables.
8. Consultant queries over the resulting ledger.

## Current gaps

1. `runContactEligibilityCascade()` currently contains simplified evaluation logic, including an `anyPass = true` stub rather than complete bound-pack evaluation.
2. The Board’s primary phase chip does not fully express `motion_decisions`.
3. When no workflow handles some eligibility changes, a fallback enrollment path can run directly.
4. Live brief is based substantially on fact write-backs and does not yet contain the complete recomputed evaluation and agenda model.
5. Click completion depends on provider-message linkage and correct local objective stamps.
6. Contact opt-out and central consent silence are not fully aligned.
7. Stand-in mode simulates a separate browser-local version of the loop.

---

# Combined execution map

The fifteen choices meet in one operating path:

```text
Separate Ant product surface
→ role-specific desk
→ house authors configuration
→ firm binds published configuration
→ database-backed module reads rows
→ event ignites table-driven interpreter
→ nodes pass run-scoped write handles
→ direct-manipulation graph defines the walk
→ Save / Run / Launch control lifecycle
→ Agent hierarchy defines pursuit
→ inherited defaults resolve at the correct grain
→ centralized policy decides whether sending is allowed
→ domain modules fulfill and write
→ completion re-enters the closed loop
```

## Compact classification

Tower is:

- A **multi-surface product with an isolated production face**
- A **role-based, multi-sided application**
- A **control-plane / tenant-plane system**
- A **configuration-driven platform**
- A **database-backed UI**
- A **table-driven interpreter**
- A **domain-specific event-driven workflow engine**
- A **run-scoped dataflow system**
- A **direct-manipulation graph editor**
- A **managed workflow lifecycle**
- A **hierarchical campaign orchestrator**
- A **cascading configuration-inheritance system**
- A **centralized fail-closed policy system**
- A system with **presentation, orchestration, and fulfillment boundaries**
- A **closed-loop operational system**

## Primary source index

### Product face

- `vite.config.ts`
- `prototype-ant.html`
- `src/main-prototype-ant.tsx`
- `src/app/register/prototype-ant/PrototypeAntApp.tsx`
- `src/app/register/prototype-ant/viewAsContext.tsx`
- `src/app/register/prototype-ant/operator/OperatorAntScene.tsx`
- `src/app/register/prototype-ant/consultant/ConsultantAntScene.tsx`
- `src/app/register/prototype-ant/contact/ContactWorkspace.tsx`

### Authoring UI

- `src/app/register/prototype-ant/operator/ConfigurationLibrariesModule.tsx`
- `src/app/register/prototype-ant/operator/AntAutomationWorkbench.tsx`
- `src/app/register/prototype-ant/operator/AntAgentWorkbench.tsx`
- `src/app/register/prototype-ant/operator/AntAgentCanvas.tsx`
- `src/app/register/prototype-ant/operator/FirmOperationsBindModule.tsx`
- `src/app/context/AutomationContext.tsx`
- `src/app/data/automationWorkflows.ts`
- `src/app/data/agentDefinitions.ts`

### Wire and runtime

- `src/app/wire/registry.ts`
- `src/app/wire/http.ts`
- `src/app/wire/reals/machineApi.ts`
- `src/app/wire/standins/machineApi.ts`
- `server/wire-service/machine.ts`
- `server/wire-service/workflowWalk.ts`
- `server/wire-service/runWrites.ts`
- `server/wire-service/eventTest.ts`
- `server/wire-service/cascade.ts`
- `server/wire-service/worker.ts`
- `server/wire-service/campaignHousing.ts`
- `server/wire-service/auditRun.ts`
- `server/wire-service/contactSeat.ts`
- `server/wire-service/dispatchSend.ts`
- `server/wire-service/sendMode.ts`
- `server/wire-service/sessionFirm.ts`

### Durable schema

- `supabase/migrations/001_auth_tables.sql`
- `supabase/migrations/003_ct_wire_stores.sql`
- `supabase/migrations/004_machine_tables.sql`
- `supabase/migrations/006_workflow_trigger.sql`
- `supabase/migrations/007_meeting_booked.sql`
- `supabase/migrations/010_sequence_campaign_housing.sql`
- `supabase/migrations/012_grain_audience_one_timer.sql`
- `supabase/migrations/015_house_notes_handle.sql`
- `supabase/migrations/017_event_test_contract.sql`
- `supabase/migrations/018_collectible_fields.sql`
- `supabase/migrations/021_objective_local_axis.sql`

### Product and systems law

- `docs/register/DATA-IN-TABLES.md`
- `docs/register/PRIMITIVES.md`
- `docs/register/AGENTS-FACE.md`
- `docs/register/AUTOMATIONS-FACE.md`
- `docs/register/SYSTEMS-STORY.md`
- `docs/register/PHASE-TWO-LOG.md`
- `docs/register/THREE-SURFACE-MODEL.md`
- `docs/register/PLATE-CHROME-RULE.md`
- `docs/construction/TOWER-CONSTRUCTION-PROPOSAL.md`
- `docs/construction/curriculum/DESTINATION.md`

