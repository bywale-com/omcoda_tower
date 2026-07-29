import type { SurfacePurposeEntry } from "./surfacePurpose";

/**
 * Hub surface purposes — Audits / Agents / Automations tooling.
 * Hub is operator territory parked in firm workspace historically: a consultant
 * configures trigger / rule / agent logic here, but the seat tag on editors and
 * nodes stays "operator" (soft tag, not a product split). List rows that just
 * open a tool are tagged "consultant" — that click is plainly firm-facing.
 */
export const SURFACE_PURPOSE_HUB: Record<string, SurfacePurposeEntry> = {
  // ---------------------------------------------------------------------
  // Sidebar / shells
  // ---------------------------------------------------------------------
  "hub-body": {
    holonId: "hub-body",
    purpose:
      "Exists as the single scroll where every open Hub tool — audits, agents, automations — surfaces as a row, so a consultant reaches firm configuration without leaving the Board shell.",
    context:
      "Hub Body stacks three sections in one sidebar list: [[audits-section|Audits Section]] for data-validity / sequence-ready checks on imports, [[agents-section|Agents Section]] for standing contact-sequencing agents, and [[automations-section|Automations Section]] for trigger-driven workflows. All three share the same header-plus-rows shape, but differ in what \"open\" leads to. Selecting any row swaps the detail pane into [[hub-tool-header|Hub Tool Header]] and [[hub-tool-body|Hub Tool Body]] rather than navigating away from the list.",
    seat: "shared",
  },
  "audits-section": {
    holonId: "audits-section",
    purpose:
      "Exists as the entry list for import audits — email valid, phone valid, dedupe, and related data-validity checks — so contacts can be cleared as sequence-ready before campaigns enroll them.",
    context:
      "Audits Section headers the audit list inside [[hub-body|Hub Body]]. When an import lands, each audit run answers operational questions only: can we reach this contact, and can we start a sequence on them? Checks (email/phone validity, channel match, dedupe, already-in-Tower, consent/silenced, name present) are meant to connect to external validation systems where needed. Rows ([[audit-row|Audit Row]]) open into [[hub-tool-header|Hub Tool Header]] / [[hub-tool-body|Hub Tool Body]]. Audits are finite scans that finish — not standing Agents or Automations, and not sales ROI ceremony.",
    seat: "shared",
  },
  "agents-section": {
    holonId: "agents-section",
    purpose:
      "Exists as the entry list for standing contact-sequencing agents, so a consultant can open, check, or resume an agent without digging through automation internals to find it.",
    context:
      "Agents Section headers the agent list inside [[hub-body|Hub Body]], each row carrying the agent's name and live status. Rows ([[agent-row|Agent Row]]) open into [[hub-tool-header|Hub Tool Header]] / [[hub-tool-body|Hub Tool Body]], which route to the full [[agent-editor|Agent Editor]]. An agent owns the outbound sequence itself — email and task steps — which an Automation can enroll contacts into but does not define.",
    seat: "shared",
  },
  "automations-section": {
    holonId: "automations-section",
    purpose:
      "Exists as the entry list for trigger-driven workflows, so a consultant can see which automations are active before opening one to edit or test.",
    context:
      "Automations Section headers the automation list inside [[hub-body|Hub Body]] and carries the control for starting a new workflow. Rows ([[automation-row|Automation Row]]) open into [[hub-tool-header|Hub Tool Header]] / [[hub-tool-body|Hub Tool Body]], which route to the [[automation-workflow-editor|Workflow Editor]]. An automation's job is deciding who is eligible and what happens next — it can call into an Agent's sequence as one of its actions, but the eligibility logic lives here.",
    seat: "shared",
  },
  "audit-row": {
    holonId: "audit-row",
    purpose:
      "Exists so a consultant can reopen a specific import audit by name and batch and see which contacts passed or failed data-validity / sequence-ready checks.",
    seat: "consultant",
  },
  "agent-row": {
    holonId: "agent-row",
    purpose:
      "Exists so a consultant can jump straight into a named agent's sequence and status without first browsing the full editor to find it.",
    seat: "consultant",
  },
  "automation-row": {
    holonId: "automation-row",
    purpose:
      "Exists so a consultant can jump straight into a named automation's workflow and run state without reopening the whole Hub list to locate it.",
    seat: "consultant",
  },
  "hub-tool-header": {
    holonId: "hub-tool-header",
    purpose:
      "Exists to anchor whichever Hub tool is open with a consistent name, icon, and section label, so switching between an audit, an agent, and an automation doesn't reorient the whole page each time.",
    context:
      "Hub Tool Header sits above [[hub-tool-body|Hub Tool Body]] whenever a row in [[hub-body|Hub Body]] is opened. It reads the tool kind straight from the tab id and shows the matching icon and section label — Audit, Agent, or Automation — before the actual editor takes over the body below.",
    seat: "shared",
  },
  "hub-tool-body": {
    holonId: "hub-tool-body",
    purpose:
      "Exists as the swap point where the header's tool kind resolves into its real editor, so audits, agents, and automations don't each need a separate top-level shell to be opened in.",
    context:
      "Hub Tool Body renders directly beneath [[hub-tool-header|Hub Tool Header]] and fills the remaining height. For an agent it becomes [[agent-editor|Agent Editor]]; for an automation it becomes [[automation-workflow-editor|Workflow Editor]]; for other tool kinds it currently falls back to a placeholder view.",
    seat: "shared",
  },

  // ---------------------------------------------------------------------
  // Agents
  // ---------------------------------------------------------------------
  "agent-header-actions": {
    holonId: "agent-header-actions",
    purpose:
      "Exists to hold agent-level controls — launch, linked automations — that act on the whole sequence, kept separate so they don't compete with the step-level controls in the toolbar below.",
    seat: "operator",
  },
  "agent-editor": {
    holonId: "agent-editor",
    purpose:
      "Exists as the composed view of one agent's outbound logic — steps, channel rules, escalation — so a consultant defines how Tower reaches contacts before any automation ever enrolls someone into it.",
    context:
      "Agent Editor is the main body once a row in [[agents-section|Agents Section]] is opened. [[agent-editor-tabs|Editor Tabs]] switch between the build surface and the agent's operational views — [[agent-contacts-tab|Contacts Tab]], [[agent-activity-tab|Activity Tab]], [[agent-report-tab|Report Tab]], [[agent-settings-tab|Settings Tab]]. The default tab holds [[agent-step-rail|Step Rail]] and [[agent-sequence-canvas|Sequence Canvas]] side by side, rendering the same step list as a compact navigator and a full node canvas. An Automation's action node can enroll contacts into this sequence, but the sequence's own logic is authored only here.",
    seat: "operator",
  },
  "agent-editor-tabs": {
    holonId: "agent-editor-tabs",
    purpose:
      "Exists so the agent's build surface and its operational surfaces (Contacts, Activity, Report, Settings) share one switcher instead of five panels each re-showing the agent's identity.",
    seat: "operator",
  },
  "agent-editor-tab": {
    holonId: "agent-editor-tab",
    purpose:
      "Exists as the default tab showing the actual step sequence, so opening an agent lands on what it does rather than on a settings or reporting view.",
    seat: "operator",
  },
  "agent-contacts-tab": {
    holonId: "agent-contacts-tab",
    purpose:
      "Exists so enrollment and suppression for this agent has its own view, kept separate from the step sequence that defines what happens once a contact is in.",
    seat: "operator",
  },
  "agent-activity-tab": {
    holonId: "agent-activity-tab",
    purpose:
      "Exists to surface live runs, delivery events, and escalations for this agent, so a consultant can check what's actually happening without re-reading the step definitions to infer it.",
    seat: "operator",
  },
  "agent-report-tab": {
    holonId: "agent-report-tab",
    purpose:
      "Exists to roll up reach, reply, and conversion across channels for this agent, so its overall effect is legible without hand-counting individual runs in Activity.",
    seat: "operator",
  },
  "agent-settings-tab": {
    holonId: "agent-settings-tab",
    purpose:
      "Exists to hold agent-wide constraints — channel rulesets, attempt limits, schedule windows — that apply across every step, so they don't have to be repeated redundantly on each one.",
    seat: "operator",
  },
  "agent-step-toolbar": {
    holonId: "agent-step-toolbar",
    purpose:
      "Exists to hold sequence-level controls — step count, rail toggle, save — above the canvas, so they stay reachable while scrolling through individual steps below.",
    seat: "operator",
  },
  "agent-empty-state": {
    holonId: "agent-empty-state",
    purpose:
      "Exists so a freshly created agent offers one obvious first action — add a step — instead of presenting a blank canvas with no way into building it.",
    seat: "operator",
  },
  "agent-step-rail": {
    holonId: "agent-step-rail",
    purpose:
      "Exists as a compact, collapsible list of every step so a consultant can jump to or reorder a step without scrolling the full canvas to find it.",
    seat: "operator",
  },
  "agent-sequence-canvas": {
    holonId: "agent-sequence-canvas",
    purpose:
      "Exists as the vertical, ordered build surface for an agent's steps, so sequencing — what happens, in what order, after what wait — is edited as a connected chain rather than as disconnected settings.",
    context:
      "Sequence Canvas renders inside [[agent-editor-tab|Editor Tab]] and lists steps top to bottom, joined by [[agent-step-condition|Step Condition]] timing nodes. Each step is either an [[agent-email-step-node|Email Step Node]] or an [[agent-task-step-node|Task Step Node]]; [[agent-add-step|Add Step Control]] sits between and after steps to extend the chain. [[agent-step-rail|Step Rail]] mirrors the same steps as a compact navigator alongside the canvas.",
    seat: "operator",
  },
  "agent-email-step-node": {
    holonId: "agent-email-step-node",
    purpose:
      "Exists so an email touchpoint's subject, body, and thread type are edited in place on the sequence, rather than in a form disconnected from where the step sits in the chain.",
    seat: "operator",
  },
  "agent-task-step-node": {
    holonId: "agent-task-step-node",
    purpose:
      "Exists so a consultant-facing task — priority, note, skip window — can sit in the same sequence as email steps, since not every touchpoint an agent drives is automated.",
    seat: "operator",
  },
  "agent-step-condition": {
    holonId: "agent-step-condition",
    purpose:
      "Exists between steps to show and edit the wait or timing rule that gates the next one, so pacing is visible on the chain instead of buried inside each step's own settings.",
    seat: "operator",
  },
  "agent-add-step": {
    holonId: "agent-add-step",
    purpose:
      "Exists so a new step can be inserted at a specific point in the sequence — not only appended at the end — without leaving the canvas to do it.",
    seat: "operator",
  },

  // ---------------------------------------------------------------------
  // Automations
  // ---------------------------------------------------------------------
  "automation-workflow-actions": {
    holonId: "automation-workflow-actions",
    purpose:
      "Exists to hold workflow-level controls — publish, rename, delete — that act on the whole automation, kept separate from the node-level actions that live inside the canvas.",
    seat: "operator",
  },
  "automation-workflow-editor": {
    holonId: "automation-workflow-editor",
    purpose:
      "Exists as the composed view of one automation's trigger-to-action chain, so a consultant builds and tests eligibility and enrollment logic on a single canvas instead of across scattered config screens.",
    context:
      "Workflow Editor is the main body once a row in [[automations-section|Automations Section]] is opened. [[automation-editor-tabs|Editor Tabs]] switch between the build surface and its operational views — [[automation-runs-tab|Runs Tab]], [[automation-settings-tab|Settings Tab]], [[automation-enrollment-tab|Enrollment Tab]]. The default Workflow tab holds [[automation-workflow-canvas|Workflow Canvas]] and [[automation-build-palette|Build Palette]] side by side, so dropping in a new block and wiring it into the chain happen without switching views. A consultant configures trigger, rules, and actions here — including enrolling contacts into an Agent's sequence — but the seat stays operator because this is Hub build tooling, not a client-facing surface.",
    seat: "operator",
  },
  "automation-editor-tabs": {
    holonId: "automation-editor-tabs",
    purpose:
      "Exists so the workflow build surface and its Runs, Settings, and Enrollment views share one switcher instead of duplicating the workflow's name and status across four separate panels.",
    seat: "operator",
  },
  "automation-workflow-tab": {
    holonId: "automation-workflow-tab",
    purpose:
      "Exists as the default tab holding the actual node graph, so opening an automation lands on what it does rather than on its run history or settings.",
    seat: "operator",
  },
  "automation-runs-tab": {
    holonId: "automation-runs-tab",
    purpose:
      "Exists to list past and active manual runs of this workflow, so a consultant can check whether a test run actually produced the expected outcome without re-triggering it.",
    seat: "operator",
  },
  "automation-settings-tab": {
    holonId: "automation-settings-tab",
    purpose:
      "Exists to hold workflow metadata — name, target entity, publish state — separate from the trigger/rule/action graph, so renaming or publishing doesn't require touching the canvas.",
    seat: "operator",
  },
  "automation-enrollment-tab": {
    holonId: "automation-enrollment-tab",
    purpose:
      "Exists to state, in one legible place, who enters this workflow when the trigger fires, so enrollment criteria isn't only inferable by reverse-engineering the trigger node's configuration.",
    seat: "operator",
  },
  "automation-workflow-canvas": {
    holonId: "automation-workflow-canvas",
    purpose:
      "Exists as the node graph itself — trigger, rules, branches, actions, exit — so an automation's decision path is inspectable and editable as a flow rather than as a list of disconnected settings.",
    context:
      "Workflow Canvas renders inside [[automation-workflow-tab|Workflow Tab]] alongside [[automation-build-palette|Build Palette]]. It starts from an [[automation-trigger-node|Trigger Node]] and chains through [[automation-constant-node|Constant Node]], [[automation-rule-node|Rule Node]], and [[automation-branch-node|Branch Node]] logic to an [[automation-action-node|Action Node]] or [[automation-exit-node|Exit Node]]. [[automation-edge-insert|Edge Insert Control]] lets a new step be inserted mid-path without detaching whatever is already downstream.",
    seat: "operator",
  },
  "automation-trigger-node": {
    holonId: "automation-trigger-node",
    purpose:
      "Exists as the Automations entry that decides which contacts enter a run (event, schedule, or manual) so the workflow has a scoped enrollment.",
    seat: "operator",
  },
  "automation-constant-node": {
    holonId: "automation-constant-node",
    purpose:
      "Exists so a reusable, editable value — an industry threshold, a fixed list — can feed downstream nodes without that value being hardcoded into every rule that happens to need it.",
    seat: "operator",
  },
  "automation-rule-node": {
    holonId: "automation-rule-node",
    purpose:
      "Exists so eligibility is evaluated against a shared rule pack — immigration service eligibility, for instance — rather than the same eligibility logic being reimplemented per automation.",
    seat: "operator",
  },
  "automation-branch-node": {
    holonId: "automation-branch-node",
    purpose:
      "Exists so the chain can split — on a condition, an operation, or a delay — so one automation routes different contacts down different paths instead of needing a separate workflow per case.",
    seat: "operator",
  },
  "automation-action-node": {
    holonId: "automation-action-node",
    purpose:
      "Exists as the point where a decision becomes an effect — enroll into an agent sequence, manage a list, assign a task, notify a consultant — so evaluating eligibility and acting on it stay separate, composable steps.",
    seat: "operator",
  },
  "automation-exit-node": {
    holonId: "automation-exit-node",
    purpose:
      "Exists to give a path an explicit end, so a branch that shouldn't continue further terminates cleanly instead of dead-ending into an unconfigured node.",
    seat: "operator",
  },
  "automation-edge-insert": {
    holonId: "automation-edge-insert",
    purpose:
      "Exists so the next Automations step can be inserted on an existing path without leaving the canvas.",
    seat: "operator",
  },
  "automation-build-palette": {
    holonId: "automation-build-palette",
    purpose:
      "Exists as the source of new blocks — triggers, rules, actions — so extending a workflow means dragging in a known block rather than hand-assembling a node from scratch.",
    context:
      "Build Palette sits beside [[automation-workflow-canvas|Workflow Canvas]] inside [[automation-workflow-tab|Workflow Tab]], grouped by module (conditions, operations, actions) with an industry-specific constants shortcut. Non-trigger blocks stay disabled until the workflow has a trigger, since nothing downstream is reachable without one. Added blocks land unconnected until wired to a node or dropped onto a path via [[automation-edge-insert|Edge Insert Control]].",
    seat: "operator",
  },
  "automation-run-row": {
    holonId: "automation-run-row",
    purpose:
      "Exists so one manual run's outcome — which nodes fired, what they returned — is scannable as a single row rather than requiring the whole graph to be re-inspected node by node.",
    seat: "operator",
  },
};
