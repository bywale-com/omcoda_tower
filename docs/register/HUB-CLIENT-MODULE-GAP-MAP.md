# Hub → Register CT — Clients module gap map

**Date:** 2026-08-11  
**Scope:** Board click → client workspace → Client Data tabs → Activity (JourneyTab) → engagement-node replay.  
**Counterparts:** Ant = `prototype-ant/consultant/*`; Plant = `prototype/ConsultantClientWorkspace.tsx` (+ shared Hub embeds).

**Status legend**

| Status | Meaning |
|--------|---------|
| **TRANSLATED** | Present; Ant/Plant re-skin or intentional chrome; behavior roughly equivalent |
| **PARTIAL** | Structure/data present; depth, interaction, or leaves incomplete vs Hub |
| **OBFUSCATED** | Same intent diluted into Tags/Descriptions/tooltips so Hub behavior is not recoverable |
| **MISSING** | No counterpart |
| **HUB-GAP** | Hub itself lacks this leaf (call out; not a CT regression) |

**Critical asymmetry (founder example)**

| | Plant | Ant |
|--|-------|-----|
| Engagement record | Embeds Hub `ClientDataContent` → `JourneyTab` → `EngagementNodePanel` → channel replay | Ant `Tree` + `ActivityTimeline` gantt; markers/bars have `title=` tooltips only |
| Node click → replay | **EXISTS** (via Hub) | **MISSING** |

---

## 0. Entry path — Board → client

| Hub path | Hub `file:symbol` | Ant | Plant | Status Ant / Plant | Why it matters |
|----------|-------------------|-----|-------|--------------------|----------------|
| Board list → client click opens workspace tab | `BoardPanel.tsx:ClientRow` → `App.tsx:handleClientClick` → `Workspace.tsx` → `ClientView` | `BoardModule.tsx` Table `onClick` → `onClientSelect` → split `ClientWorkspace` | `ConsultantPrototypeScene.tsx` `BoardPanel.onClientClick` → `ConsultantClientWorkspace` | TRANSLATED / TRANSLATED | Same product move: select client, open client module |
| Phase icon + PhaseTooltip “View in Activity” deep-link | `BoardPanel.tsx:ClientRowIcon` → `PhaseTooltip.tsx` → `App.tsx:handleViewInActivity` → `ClientDataPage` + `setFocusTouchpointId` | No PhaseTooltip; `activityKick` only flips Engagement tab | Plant reuses Hub `BoardPanel` + `PhaseTooltip`; `onViewInActivity` only bumps `activityKick` (opens Engagement, **does not** focus touchpoint id) | MISSING / PARTIAL | Hub jumps to Activity node; Ant has no briefing tooltip; Plant opens Activity but loses node focus |
| Board phase filters (all / silent / in-motion / meeting-ready / halted) | `BoardPanel.tsx` `phaseFilter` + Segmented chips | `BoardModule` Segmented filters | Same Hub `BoardPanel` | TRANSLATED / TRANSLATED | Board triage |
| Board search | `BoardPanel` search input | `BoardModule` `Input.Search` | Hub `BoardPanel` | TRANSLATED / TRANSLATED | — |
| Row menu: Halt / Resume outreach | `BoardPanel.tsx:ClientRow` `showHalt` | Workspace chrome Halt; board halt book bar | Hub + Register halt chrome | PARTIAL / TRANSLATED | Ant halt lives mainly in workspace header, not row menu parity |
| Book-scope HaltOutreachBar | `HaltOutreachBar.tsx:HaltOutreachBar` | `BoardModule` book halt controls | Hub bar when `showHalt` | TRANSLATED / TRANSLATED | Firm-book refusal |
| Today meetings strip | `BoardPanel` today strip | `BoardModule` today meetings | Hub strip | TRANSLATED / TRANSLATED | Meeting-ready bridge |
| Contacts module alternate entry to same workspace | Hub contacts / board both → client tabs | `ContactsModule.tsx` → same `ClientWorkspace` | Contacts → same `ConsultantClientWorkspace` | TRANSLATED / TRANSLATED | Second door into Clients module |

---

## 1. Client workspace shell

| Hub path | Hub `file:symbol` | Ant | Plant | Status Ant / Plant | Why it matters |
|----------|-------------------|-----|-------|--------------------|----------------|
| Client workspace root | `ClientView.tsx:ClientView` | `ClientWorkspace.tsx:ClientWorkspace` | `ConsultantClientWorkspace.tsx:ConsultantClientWorkspace` | PARTIAL / PARTIAL | Ant is a Register chrome shell, not Hub `ClientView`. Plant wraps Hub + Register chrome |
| Sticky Register inhabit chips (Phase, Runtime, Pack, Silence, Reachability, Last touch/reply, Licensee) | Not in Hub product shell (Register-only densify) | `ClientWorkspace` Tag row | `ConsultantClientWorkspace` chip row | TRANSLATED / TRANSLATED | Register densify — not a Hub gap |
| Halt banner + Lift halt | Register / board halt | `Alert` + Lift | Halt banner + Lift | TRANSLATED / TRANSLATED | — |
| Workspace tabs: Brief vs Engagement | Hub: single page = Brief + bottom DataPanel (Information / History / Activity). No top Brief\|Engagement toggle | Ant Tabs `brief` \| `engagement` | Plant tabs `brief` \| `engagement` | OBFUSCATED / OBFUSCATED | Hub keeps Brief + Client Data stacked; CT splits Brief vs Engagement record |
| Accepted terms control | Register | Button | Button | TRANSLATED / TRANSLATED | License chrome |

---

## 2. Client header + Brief

| Hub path | Hub `file:symbol` | Ant | Plant | Status Ant / Plant | Why it matters |
|----------|-------------------|-----|-------|--------------------|----------------|
| Client Header (name + Created / Pathway / Status / Expiry) | `ClientPageHeader.tsx:ClientPageHeader` | Title = `meta.name` only; fields folded into Descriptions | **EXISTS** via embedded `ClientView` → `ClientPageHeader` | OBFUSCATED / TRANSLATED | Identity strip; Ant loses property-row layout |
| Client Brief narrative (Overview, Pathway, Engagement history, Tower observation) | `ClientView.tsx:ClientNarrative` (+ `BriefSection` / `Para` / `Callout` / `Hl`) | `getClientPhaseSnapshot` → Hint + Descriptions + optional nudge form snippet | **EXISTS** via `ClientView` | MISSING (narrative) / TRANSLATED | Consultant story of the file; Ant replaces prose with phase snapshot table |
| Live nudge briefing block inside brief | Inside narrative / meta (`meta.nudge.briefing`) | Shown if `meta.nudge.briefing` | Via Hub + meta | PARTIAL / TRANSLATED | Ant shows Q/A Tag only |

---

## 3. Client Data panel (Information / History / Activity)

| Hub path | Hub `file:symbol` | Ant | Plant | Status Ant / Plant | Why it matters |
|----------|-------------------|-----|-------|--------------------|----------------|
| Resizable bottom Client Data panel | `DataPanel.tsx:DataPanel` (height drag, collapse via `PanelContext`) | No bottom panel; Engagement is a full tab | Brief tab embeds full `ClientView` (includes `DataPanel`); Engagement tab embeds `ClientDataContent` full-page | MISSING / PARTIAL | Hub’s stacked Brief+Data composition; Plant duplicates Data surfaces across tabs |
| Client Data header + tab chips | `DataPanel.tsx:ClientDataContent` + `clientDataHolons.ts:PANEL_CHIPS` (`Information` / `History` / `Activity`) | No Information/History tabs under client workspace | Brief: all three via Hub; Engagement: forced `defaultTab="logs"` | MISSING / PARTIAL | Three-tab Client Data model absent in Ant |
| Open Client Data in new tab / Activity full page | `DataPanel` ExternalLink → `Workspace` `ClientDataPage` | None | `onOpenPanel` optional | MISSING / PARTIAL | Full-page Activity workspace |
| Full-page Activity document | `ClientDataPage.tsx:ClientDataPage` → `ClientDataContent` `fullPage` `defaultTab="logs"` | Engagement tab is the stand-in (not Hub Activity) | Engagement tab ≈ this | MISSING / TRANSLATED | Dedicated Activity document |

### 3a. Information tab

| Hub path | Hub `file:symbol` | Ant | Plant | Status Ant / Plant | Why it matters |
|----------|-------------------|-----|-------|--------------------|----------------|
| Profile table (Name, Pathway, Status, CRS, Work permit, Days in system, profile kv) | `DataPanel.tsx:InformationTab` → `ProfileTable` | Folded into Brief Descriptions (phase snapshot only — not full profile table) | Via Hub `DataPanel` on Brief | MISSING / TRANSLATED | Structured client facts |

### 3b. History tab (CRS)

| Hub path | Hub `file:symbol` | Ant | Plant | Status Ant / Plant | Why it matters |
|----------|-------------------|-----|-------|--------------------|----------------|
| CRS History scrubber | `DataPanel.tsx:CrsHistoryTab` + `CRS_SCRUBBER_HOLON` | None | Via Hub | MISSING / TRANSLATED | Time-travel CRS |
| CRS Stats (score, threshold, permit days, days in system) | `CRS_STATS_HOLON` block | None | Via Hub | MISSING / TRANSLATED | Snapshot metrics |
| CRS Chart (crs vs draw threshold + scrub reference) | `CRS_CHART_HOLON` Recharts `LineChart` | None | Via Hub | MISSING / TRANSLATED | Visual eligibility history |
| Standalone History section export | `DataPanel.tsx:ClientHistorySection` | None | Unused in Plant workspace path | MISSING / N/A | Alternate layout of CRS History |

### 3c. Activity tab (= JourneyTab)

| Hub path | Hub `file:symbol` | Ant | Plant | Status Ant / Plant | Why it matters |
|----------|-------------------|-----|-------|--------------------|----------------|
| Engagement chart dual-pane (list + timeline) | `JourneyTab.tsx:JourneyTab` | `ClientWorkspace` Splitter: Ant `Tree` + `ActivityTimeline` | **EXISTS** via `ClientDataContent` → `JourneyTab` | PARTIAL / TRANSLATED | Core chronology UX |
| Shared journey seed data | `data/journeyByClient.ts:getClientJourney` | Same seeds | Same (via Hub) | TRANSLATED / TRANSLATED | Data parity; interaction parity is the gap |
| Left engagement list / tree | `JourneyTab` list + holons `ENGAGEMENT_LIST_HOLON` | Ant `Tree` via `engagementTreeData` | Hub list | PARTIAL / TRANSLATED | Ant tree selects keys only — no inspect |
| Sequence / attempt / channel / formVisit / escalation / event / taskEscalation rows | `JourneyTab` `Row` union + flatteners | Tree nodes for those kinds (labels + Tags) | Hub rows | PARTIAL / TRANSLATED | Structure visible in Ant; no Hub row affordances |
| Engagement signal icons (sent/opened/clicked/…) | `JourneyTab.tsx:EngagementSignalIcons` | Absent (status Tag only) | Hub | MISSING / TRANSLATED | Channel outcome at a glance |
| Form visit signal icons + FormVisit tree rows | `FormVisitSignalIcons`, `FormVisitTreeRow` | Form visit Tag in tree | Hub | PARTIAL / TRANSLATED | Visit-level engagement |
| Channel phase icons / motion | `NudgeChannelIcon` | Color Tags | Hub | OBFUSCATED / TRANSLATED | Channel state animation |
| Reasoning toggle / ThoughtStrip / Criteria / Outcome lines | `ReasoningToggle`, `ThoughtStrip`, `CriteriaLine`, `OutcomeLine`, `NudgeEventRow` | None | Hub | MISSING / TRANSLATED | In-list agent reasoning |
| Escalation wait + thought chain reveal | `NudgeEscalationRow`, `ThoughtStepLine` | Tree leaf “Escalation wait” Tag only | Hub | OBFUSCATED / TRANSLATED | Wait-window semantics |
| List↔timeline sync scroll, resize splitter | JourneyTab scroll sync + list width drag | Splitter resize; no row-height sync to inspector | Hub | PARTIAL / TRANSLATED | Coordination |
| Timeline zoom tiers (week/day/hour/halfHour), pinch, ctrl-wheel, Today | `ZoomButton`, `timelineZoomLabel`, wheel/pinch handlers, Today | Zoom in/out only (day width clamp) | Hub | PARTIAL / TRANSLATED | Time resolution for forensics |
| Timeline bars, attempt bands, channel segments, markers | Hub gantt rendering in JourneyTab | `ActivityTimeline` sequence bars + attempt bands + channel bars + markers (`title` tooltips) | Hub | PARTIAL / TRANSLATED | Ant shows chronology; **no click → inspector** |
| Timeline legend (Historical / Active / Armed / Waiting / Attempts) | JourneyTab footer legend | Header Tags (“day axis”, “sequence bars”, …) | Hub | OBFUSCATED / TRANSLATED | Legend semantics diluted |
| Focus touchpoint from board / tasks | `useTouchpointFocus` + `scrollToActivityNode` | `activityKick` opens tab only | `activityKick` opens Engagement only | MISSING / PARTIAL | Deep-link into node |
| Export chronology button | — (Hub has no export) | `Export chronology` Button (non-functional chrome) | None | N/A (Ant chrome) / — | Cosmetic Ant affordance |

---

## 4. Engagement node inspect → replay (critical leaf cluster)

**Hub gate:** `emailInspectorData.ts:isInspectableChannel` → `Set(["email","form","sms"])`.  
**Open path:** list/timeline click → `JourneyTab.openNodeInspector` → `getNodeInspectorPayload` → `EngagementNodePanel`.

| Hub path | Hub `file:symbol` | Ant | Plant | Status Ant / Plant | Why it matters |
|----------|-------------------|-----|-------|--------------------|----------------|
| **Node click opens side inspector** | `JourneyTab.tsx:openNodeInspector` + `EngagementNodePanel.tsx:EngagementNodePanel` | Tree `onSelect` / marker `title` only — **no panel** | **EXISTS** (Hub JourneyTab) | **MISSING** / **TRANSLATED** | Founder example — look-inside each touchpoint |
| Inspector shell (slide-in, Esc, prev/next nav, Overview \| Metadata tabs) | `EngagementNodePanel` | — | Hub | MISSING / TRANSLATED | Navigation across related nodes |
| Status + HorizontalMilestoneRail telemetry | `HorizontalMilestoneRail` | — | Hub | MISSING / TRANSLATED | Sent/delivered/opened chronology inside node |
| Decision + expandable thought chain | `DecisionRow` + `ThoughtStepLine` | — | Hub | MISSING / TRANSLATED | Why the node fired |
| Metadata tab (sequence, touchpoint, channel, status, form entry) | Overview/metadata tabs | — | Hub | MISSING / TRANSLATED | Forensic ids |

### 4a. Email channel replay

| Hub path | Hub `file:symbol` | Ant | Plant | Status Ant / Plant | Why it matters |
|----------|-------------------|-----|-------|--------------------|----------------|
| Email output preview (from/to/subject/body chrome) | `EmailOutputPreview.tsx:EmailOutputPreview` | — | Hub | MISSING / TRANSLATED | What was sent |
| Email threads / replies block | `EngagementNodePanel.tsx:ThreadsBlock` | — | Hub | MISSING / TRANSLATED | Conversation around the send |
| Payload data | `emailInspectorData.ts` email entries (`EmailNodeInspectorPayload`) | Journey tree shows “email” Tag | Hub | MISSING (replay) / TRANSLATED | Data exists in seeds; Ant never opens it |

### 4b. SMS / text channel replay

| Hub path | Hub `file:symbol` | Ant | Plant | Status Ant / Plant | Why it matters |
|----------|-------------------|-----|-------|--------------------|----------------|
| SMS thread panel | `ClientMessagePanel.tsx:ClientMessagePanel` (`channelFilter="sms"`) | — | Hub | MISSING / TRANSLATED | Text conversation replay |
| Thread data | `clientMessageData.ts:sarahMessageThread` / `marcusMessageThread` | Channel Tag only | Hub | MISSING (replay) / TRANSLATED | — |

### 4c. Form channel replay

| Hub path | Hub `file:symbol` | Ant | Plant | Status Ant / Plant | Why it matters |
|----------|-------------------|-----|-------|--------------------|----------------|
| Core form output preview | `FormOutputPreview.tsx:FormOutputPreview` | — | Hub | MISSING / TRANSLATED | Submitted field values |
| Core form composite telemetry rail | `FormCoreTelemetryRail` | — | Hub | MISSING / TRANSLATED | Multi-visit aggregate |
| Form visits list + expand | `FormVisitsBlock` / capture rows | Tree “form visit N” nodes only | Hub | MISSING (replay) / TRANSLATED | Per-visit drill-down |
| Capture typing replay | `FormCaptureReplay.tsx:FormCaptureReplay` → `FormReplayViewer` | — | Hub | MISSING / TRANSLATED | Playback of typing into fields |
| Session form replay (session scope) | `EngagementNodePanel` → `FormReplayViewer` (`sessionReplay`) | — | Hub | MISSING / TRANSLATED | Session-scoped form forensic |
| Form visit node inspect from timeline/list | `FormVisitTreeRow` `onInspect` → same panel | Tree select only | Hub | MISSING / TRANSLATED | Visit leaf → replay |

### 4d. Call / other channels

| Hub path | Hub `file:symbol` | Ant | Plant | Status Ant / Plant | Why it matters |
|----------|-------------------|-----|-------|--------------------|----------------|
| Call channel on timeline/list | `JourneyTab` `Channel` includes `"call"`; icon `Phone` | Tag “Call” + color | Hub icons | TRANSLATED / TRANSLATED | Channel appears |
| **Call replay / call surface** | **None** — not in `INSPECTABLE_CHANNELS`; no Call* inspector | None | None | **HUB-GAP** / **HUB-GAP** | Hub itself has no call replay — CT cannot “miss” what Hub never shipped |
| Visit / meeting / system channels | Icons + bars; not inspectable | Tags | Hub | HUB-GAP (no replay) / HUB-GAP | Same: chronology only in Hub |

### 4e. Task touchpoint side panel (non-inspector)

| Hub path | Hub `file:symbol` | Ant | Plant | Status Ant / Plant | Why it matters |
|----------|-------------------|-----|-------|--------------------|----------------|
| Task detail panel (toggle complete) | `TaskTouchpointPanel.tsx:TaskTouchpointPanel`; gate `touchpointUtils.ts:isTouchpointClickable` (`n-001-task` only) | None | Hub | MISSING / TRANSLATED | Consultant task from engagement chart |

---

## 5. Inspector folder inventory (`src/app/components/inspector/`)

| Leaf | Symbol | Ant | Plant | Status Ant / Plant |
|------|--------|-----|-------|--------------------|
| EngagementNodePanel | `EngagementNodePanel` | MISSING | Via JourneyTab | MISSING / TRANSLATED |
| EmailOutputPreview | `EmailOutputPreview` | MISSING | Via panel | MISSING / TRANSLATED |
| ClientMessagePanel | `ClientMessagePanel` | MISSING | Via panel | MISSING / TRANSLATED |
| FormOutputPreview | `FormOutputPreview` | MISSING | Via panel | MISSING / TRANSLATED |
| FormReplayViewer / FormCaptureReplay | `FormReplayViewer`, `FormCaptureReplay` | MISSING | Via panel | MISSING / TRANSLATED |
| emailInspectorData payloads + gates | `getNodeInspectorPayload`, `isInspectableChannel` | Unused | Used | MISSING / TRANSLATED |
| clientMessageData threads | `clientMessageThread` et al. | Unused | Used | MISSING / TRANSLATED |

---

## 6. Plant vs Ant — summary matrix (Clients module only)

| Capability | Hub | Plant | Ant |
|------------|-----|-------|-----|
| Board → open client | Yes | Yes (Hub BoardPanel) | Yes (Ant Table) |
| Client header + brief narrative | Yes | Yes (embeds ClientView) | OBFUSCATED / MISSING narrative |
| Information / CRS History tabs | Yes | Yes (via ClientView DataPanel) | MISSING |
| Activity engagement chart | JourneyTab | JourneyTab embed | Tree + gantt PARTIAL |
| Zoom / Today / deep time tiers | Full | Full | Zoom only PARTIAL |
| Node click → EngagementNodePanel | Yes | Yes | **MISSING** |
| Email / SMS / Form replay | Yes | Yes | **MISSING** |
| Call replay | **HUB-GAP** | HUB-GAP | HUB-GAP |
| TaskTouchpointPanel | Yes (one id) | Yes | MISSING |
| View-in-Activity node focus | Yes | PARTIAL (tab only) | MISSING (tab kick only) |
| Register inhabit / halt chrome | N/A product | Yes | Yes |

---

## 7. Highest-priority Ant gaps (gap-focused)

1. **Engagement node inspect + channel replay** — entire `inspector/` tree unused; Ant chronology is tooltip/gantt only.  
2. **Client Data Information + CRS History** — Ant Client Brief is not a translation of Information/History.  
3. **Client Brief narrative + ClientPageHeader** — replaced by phase snapshot Descriptions.  
4. **JourneyTab interaction depth** — signals, reasoning, escalation thought reveal, form-visit inspect, focus/scroll-to-node.  
5. **Board PhaseTooltip → Activity node focus** — Ant has no equivalent; Plant only partially (opens tab).

Plant’s main Clients-module risk is **compositional obfuscation** (Brief vs Engagement split; Activity opened twice) and **lost deep-link focus**, not missing replay — because Plant still mounts Hub `JourneyTab`.

---

## 8. File index (absolute)

**Hub**

- `/workspace/src/app/components/BoardPanel.tsx`
- `/workspace/src/app/components/PhaseTooltip.tsx`
- `/workspace/src/app/components/HaltOutreachBar.tsx`
- `/workspace/src/app/components/ClientView.tsx`
- `/workspace/src/app/components/ClientPageHeader.tsx`
- `/workspace/src/app/components/DataPanel.tsx`
- `/workspace/src/app/components/ClientDataPage.tsx`
- `/workspace/src/app/components/JourneyTab.tsx`
- `/workspace/src/app/components/docs/clientDataHolons.ts`
- `/workspace/src/app/components/inspector/EngagementNodePanel.tsx`
- `/workspace/src/app/components/inspector/EmailOutputPreview.tsx`
- `/workspace/src/app/components/inspector/ClientMessagePanel.tsx`
- `/workspace/src/app/components/inspector/FormOutputPreview.tsx`
- `/workspace/src/app/components/inspector/FormCaptureReplay.tsx`
- `/workspace/src/app/components/inspector/emailInspectorData.ts`
- `/workspace/src/app/components/inspector/clientMessageData.ts`
- `/workspace/src/app/components/touchpoints/TaskTouchpointPanel.tsx`
- `/workspace/src/app/components/touchpoints/touchpointUtils.ts`
- `/workspace/src/app/components/Workspace.tsx`
- `/workspace/src/app/App.tsx`
- `/workspace/src/app/data/journeyByClient.ts`

**Ant**

- `/workspace/src/app/register/prototype-ant/consultant/BoardModule.tsx`
- `/workspace/src/app/register/prototype-ant/consultant/ClientWorkspace.tsx` (`ActivityTimeline`, `engagementTreeData`, `ClientWorkspace`)
- `/workspace/src/app/register/prototype-ant/consultant/ContactsModule.tsx`
- `/workspace/src/app/register/prototype-ant/consultant/ConsultantAntScene.tsx`
- `/workspace/src/app/register/prototype-ant/consultant/shared.ts`

**Plant**

- `/workspace/src/app/register/prototype/ConsultantClientWorkspace.tsx`
- `/workspace/src/app/register/prototype/ConsultantPrototypeScene.tsx`
