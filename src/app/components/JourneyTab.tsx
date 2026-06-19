import { useState, useRef, useCallback, useEffect, useMemo, type CSSProperties, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronDown, ChevronRight, Check, Circle, Mail, MessageSquare,
  Globe, Users, CheckSquare, Zap, Plus, X, Phone, Sparkles,
  ZoomIn, ZoomOut, Eye, Reply, MousePointerClick, Send, FileText, PenLine, Link2,
} from "lucide-react";
import type { Tokens } from "./tokens";
import { HolonBoundary } from "./docs/HolonBoundary";
import { RegisterContentChildHolonsFromConfig } from "./docs/RegisterContentChildHolons";
import { docsTargetHighlight, useIsDocsTarget } from "./docs/docsHighlight";
import {
  ENGAGEMENT_ATTEMPT_ROW_HOLON,
  ENGAGEMENT_CHANNEL_ROW_HOLON,
  ENGAGEMENT_ESCALATION_ROW_HOLON,
  ENGAGEMENT_EVENT_ROW_HOLON,
  ENGAGEMENT_FORM_VISIT_ROW_HOLON,
  ENGAGEMENT_LIST_ROW_HOLONS_LIST,
  ENGAGEMENT_SEQUENCE_ROW_HOLON,
  engagementRowInViewFromKinds,
} from "./docs/engagementListHolons";
import {
  ENGAGEMENT_ATTEMPT_BAND_HOLON,
  ENGAGEMENT_ESCALATION_BAND_HOLON,
  ENGAGEMENT_EVENT_MARKER_HOLON,
  ENGAGEMENT_SEGMENT_BAR_HOLON,
  ENGAGEMENT_SEQUENCE_BAR_HOLON,
  ENGAGEMENT_TIMELINE_CHILD_HOLONS_LIST,
} from "./docs/engagementTimelineHolons";
import {
  ENGAGEMENT_LIST_HOLON,
  ENGAGEMENT_TIMELINE_HOLON,
} from "./docs/clientDataHolons";
import {
  DEFAULT_JOURNEY_LIST_WIDTH,
  MIN_JOURNEY_LIST_WIDTH,
  MAX_JOURNEY_LIST_WIDTH,
  JOURNEY_DAY_WIDTH,
  MIN_JOURNEY_DAY_WIDTH,
  MAX_JOURNEY_DAY_WIDTH,
  JOURNEY_HALF_HOUR_SLOTS,
  JOURNEY_TIMELINE_DAYS,
} from "../constants/layout";
import { EngagementNodePanel } from "./inspector/EngagementNodePanel";
import { getNodeInspectorPayload, isInspectableChannel } from "./inspector/emailInspectorData";
import { TaskTouchpointPanel } from "./touchpoints/TaskTouchpointPanel";
import { findTouchpointById, isTouchpointClickable, toTaskTouchpointData } from "./touchpoints/touchpointUtils";
import { useTouchpointFocus } from "../context/TouchpointFocusContext";
import { useTasks } from "../context/TaskContext";
import {
  ChannelMiniGanttBar,
  EventTimelineMarker,
  NudgeGanttBar,
  HoverGanttBand,
} from "./NudgeGantt";
import { getClientJourney } from "../data/journeyByClient";
import {
  ATTEMPT_BAR_COLORS,
  formatNudgeTime,
  type NudgeAttemptRow,
  type NudgeFormVisitRow,
  type NudgeEscalation,
  type NudgeTreeNode,
  type ThoughtStep,
  collectDefaultOpenIds,
  findTreePathToId,
} from "../data/sarahNudgeTimeline";
import {
  HISTORICAL_TEAL,
  buildFormOwnerBarMap,
  buildSequenceGanttExtentMap,
  ganttWithTreeExtent,
  type JourneyGanttData,
  type JourneyGroup,
  type JourneySectionStyle,
  journeyTreeContainsId,
} from "../data/journeyTree";

type TouchStatus = "done" | "scheduled" | "conditional" | "ghost" | "active" | "historical" | "reactive";
type Channel = "email" | "sms" | "call" | "visit" | "meeting" | "task" | "system" | "form";

type CriterionCheck = { label: string; met: boolean };

type EngagementSignalKey = "sent" | "opened" | "started" | "clicked" | "replied" | "submitted";
type EngagementSignalState = "met" | "unmet" | "inactive";

type EngagementSignals = {
  show: EngagementSignalKey[];
  sent?: EngagementSignalState;
  opened?: EngagementSignalState;
  openedCount?: number;
  started?: EngagementSignalState;
  clicked?: EngagementSignalState;
  replied?: EngagementSignalState;
  submitted?: EngagementSignalState;
};

type Touchpoint = {
  id: string;
  label: string;
  channel: Channel;
  status: TouchStatus;
  dateLabel?: string;
  startDay: number;
  spanDays: number;
  tags?: string[];
  successCriteria?: { goal: string; checks: CriterionCheck[]; failLabel?: string };
  outcome?: string;
  taskNote?: string;
  taskAssignee?: string;
  reasoning?: string;
  addedLive?: boolean;
  addedAt?: string;
  defaultOpen?: boolean;
  children?: Touchpoint[];
  engagementSignals?: EngagementSignals;
  barSegment?: { startDay: number; endDay: number; colorIndex: number };
  channelPhase?: "idle" | "active" | "complete";
};

type NudgeGroup = JourneyGroup;

function resolveSequenceId(nodeId: string, aliases: Record<string, string>): string {
  return aliases[nodeId] ?? nodeId;
}

const ORIGIN = new Date(2026, 4, 26); // May 26 2026
const TODAY = new Date(2026, 5, 13);  // Jun 13 2026
const TIMELINE_DAYS = JOURNEY_TIMELINE_DAYS;

const WEEKS = [
  { label: "May 26", day: 0 },
  { label: "Jun 2", day: 7 },
  { label: "Jun 9", day: 14 },
  { label: "Jun 16", day: 21 },
  { label: "Jun 23", day: 28 },
  { label: "Jun 30", day: 35 },
  { label: "Jul 7", day: 42 },
  { label: "Jul 14", day: 49 },
];

function touchpointTreeContains(touchpoints: Touchpoint[], id: string): boolean {
  for (const tp of touchpoints) {
    if (tp.id === id) return true;
    if (tp.children?.length && touchpointTreeContains(tp.children, id)) return true;
  }
  return false;
}

function journeyGroupContainsId(group: JourneyGroup, id: string): boolean {
  if (group.id === id) return true;
  if (group.tree?.length && journeyTreeContainsId(group.tree, id)) return true;
  return touchpointTreeContains(group.touchpoints as Touchpoint[], id);
}

function findOpenIdsForActivityNode(
  nodeId: string,
  sequences: NudgeGroup[],
  aliases: Record<string, string>,
): string[] {
  const resolved = resolveSequenceId(nodeId, aliases);
  for (const seq of sequences) {
    if (seq.id === resolved) return [seq.id];
    if (journeyGroupContainsId(seq, resolved)) {
      const ids = [seq.id];
      if (seq.tree?.length) {
        const path = findTreePathToId(seq.tree, resolved);
        if (path) {
          for (const seg of path) {
            if (!ids.includes(seg)) ids.push(seg);
          }
        }
      }
      return ids;
    }
  }
  for (const seq of sequences) {
    if (journeyGroupContainsId(seq, nodeId)) {
      const ids = [seq.id];
      if (seq.tree?.length) {
        const path = findTreePathToId(seq.tree, nodeId);
        if (path) {
          for (const seg of path) {
            if (!ids.includes(seg)) ids.push(seg);
          }
        }
      }
      return ids;
    }
    if (touchpointTreeContains(seq.touchpoints as Touchpoint[], nodeId)) {
      return [seq.id];
    }
  }
  return [];
}

function initialOpenIdsFor(sequences: NudgeGroup[]): Set<string> {
  const ids = new Set<string>();
  for (const seq of sequences) {
    if (seq.defaultOpen) ids.add(seq.id);
    if (seq.tree?.length) collectDefaultOpenIds(seq.tree, ids);
  }
  return ids;
}

const channelIcon: Record<Channel, LucideIcon> = {
  email: Mail,
  sms: MessageSquare,
  call: Phone,
  visit: Globe,
  meeting: Users,
  task: CheckSquare,
  system: Zap,
  form: FileText,
};

function daysSinceOrigin(d: Date) {
  return (d.getTime() - ORIGIN.getTime()) / 86400000;
}

const TODAY_DAY = daysSinceOrigin(TODAY);

type Row =
  | { kind: "nudgeGroup"; group: NudgeGroup; open: boolean }
  | { kind: "nudgeAttempt"; attempt: NudgeAttemptRow; open: boolean; depth: number; nudgeGroupId: string }
  | { kind: "nudgeFormVisit"; visit: NudgeFormVisitRow; open: boolean; depth: number; nudgeGroupId: string }
  | { kind: "nudgeChannel"; tp: Touchpoint; open: boolean; depth: number; nudgeGroupId: string; barColorIndex: number; hasChildren: boolean; sectionStyle: JourneySectionStyle }
  | { kind: "journeyStandalone"; tp: Touchpoint; open: boolean; depth: number; nudgeGroupId: string; hasChildren: boolean; sectionStyle: JourneySectionStyle }
  | { kind: "journeyTaskEscalation"; tp: Touchpoint; depth: number; nudgeGroupId: string; sectionStyle: JourneySectionStyle }
  | { kind: "nudgeEscalation"; id: string; escalation: NudgeEscalation; open: boolean; depth: number; nudgeGroupId: string }
  | { kind: "nudgeEvent"; tp: Touchpoint; depth: number; nudgeGroupId: string; sectionStyle: JourneySectionStyle }
  | { kind: "thought"; text: string }
  | { kind: "task"; tp: Touchpoint; depth: number; inNudgeGroup?: boolean; nudgeGroupId?: string }
  | { kind: "collapsed"; text: string };

function collectTreeTouchpoints(nodes: NudgeTreeNode[]): Touchpoint[] {
  const out: Touchpoint[] = [];
  for (const node of nodes) {
    if (node.kind === "channel" || node.kind === "standalone") {
      out.push(node.touchpoint as Touchpoint);
      out.push(...node.events as Touchpoint[]);
      out.push(...collectTreeTouchpoints(node.nested));
    } else if (node.kind === "attempt") {
      out.push(...collectTreeTouchpoints(node.nested));
    } else if (node.kind === "event") {
      out.push(node.touchpoint as Touchpoint);
    } else if (node.kind === "taskEscalation") {
      out.push(node.touchpoint as Touchpoint);
    }
  }
  return out;
}

function flattenJourneyTree(
  nodes: NudgeTreeNode[],
  depth: number,
  nudgeGroupId: string,
  openIds: Set<string>,
  sectionStyle: JourneySectionStyle,
): Row[] {
  const rows: Row[] = [];
  for (const node of nodes) {
    if (node.kind === "escalation") {
      rows.push({
        kind: "nudgeEscalation",
        id: node.id,
        escalation: node.escalation,
        open: openIds.has(node.id),
        depth,
        nudgeGroupId,
      });
      continue;
    }
    if (node.kind === "taskEscalation") {
      rows.push({
        kind: "journeyTaskEscalation",
        tp: node.touchpoint as Touchpoint,
        depth,
        nudgeGroupId,
        sectionStyle,
      });
      continue;
    }
    if (node.kind === "event") {
      rows.push({ kind: "nudgeEvent", tp: node.touchpoint as Touchpoint, depth, nudgeGroupId, sectionStyle });
      continue;
    }
    if (node.kind === "standalone") {
      const tp = node.touchpoint as Touchpoint;
      const hasChildren = node.events.length > 0 || node.nested.length > 0;
      const nodeOpen = openIds.has(tp.id);
      rows.push({
        kind: "journeyStandalone",
        tp,
        open: nodeOpen,
        depth,
        nudgeGroupId,
        hasChildren,
        sectionStyle,
      });
      if (nodeOpen && hasChildren) {
        for (const ev of node.events) {
          rows.push({ kind: "nudgeEvent", tp: ev as Touchpoint, depth: depth + 1, nudgeGroupId, sectionStyle });
        }
        rows.push(...flattenJourneyTree(node.nested, depth + 1, nudgeGroupId, openIds, sectionStyle));
      }
      continue;
    }
    if (node.kind === "attempt") {
      const attemptOpen = openIds.has(node.attempt.id);
      rows.push({
        kind: "nudgeAttempt",
        attempt: node.attempt,
        open: attemptOpen,
        depth,
        nudgeGroupId,
      });
      if (attemptOpen) {
        rows.push(...flattenJourneyTree(node.nested, depth + 1, nudgeGroupId, openIds, sectionStyle));
      }
      continue;
    }
    if (node.kind === "formVisit") {
      const visitOpen = openIds.has(node.visit.id);
      rows.push({
        kind: "nudgeFormVisit",
        visit: node.visit,
        open: visitOpen,
        depth,
        nudgeGroupId,
      });
      if (visitOpen) {
        rows.push(...flattenJourneyTree(node.nested, depth + 1, nudgeGroupId, openIds, sectionStyle));
      }
      continue;
    }
    const tp = node.touchpoint as Touchpoint;
    const hasChildren = node.events.length > 0 || node.nested.length > 0;
    const channelOpen = openIds.has(tp.id);
    rows.push({
      kind: "nudgeChannel",
      tp,
      open: channelOpen,
      depth,
      nudgeGroupId,
      barColorIndex: tp.barSegment?.colorIndex ?? 0,
      hasChildren,
      sectionStyle,
    });
    if (channelOpen && hasChildren) {
      for (const ev of node.events) {
        rows.push({ kind: "nudgeEvent", tp: ev as Touchpoint, depth: depth + 1, nudgeGroupId, sectionStyle });
      }
      rows.push(...flattenJourneyTree(node.nested, depth + 1, nudgeGroupId, openIds, sectionStyle));
    }
  }
  return rows;
}

function flattenTouchpoints(
  touchpoints: Touchpoint[],
  depth = 0,
  inNudgeGroup = false,
  nudgeGroupId?: string,
): Row[] {
  const rows: Row[] = [];
  for (const tp of touchpoints) {
    rows.push({ kind: "task", tp, depth, inNudgeGroup, nudgeGroupId });
    if (tp.children?.length) {
      rows.push(...flattenTouchpoints(tp.children, depth + 1, inNudgeGroup, nudgeGroupId));
    }
  }
  return rows;
}

function touchpointTimeExtents(touchpoints: Touchpoint[]): { startDay: number; spanDays: number } | null {
  let minStart = Infinity;
  let maxEnd = -Infinity;

  const walk = (tps: Touchpoint[]) => {
    for (const tp of tps) {
      minStart = Math.min(minStart, tp.startDay);
      maxEnd = Math.max(maxEnd, tp.startDay + tp.spanDays);
      if (tp.children?.length) walk(tp.children);
    }
  };

  walk(touchpoints);
  if (minStart === Infinity) return null;
  return { startDay: minStart, spanDays: maxEnd - minStart };
}

function nudgeGroupTimelineTouchpoint(
  group: NudgeGroup,
  ganttByGroup: Record<string, JourneyGanttData>,
): Touchpoint | null {
  const gantt = ganttByGroup[group.id];
  if (gantt) {
    return {
      id: group.id,
      label: group.label,
      channel: "email",
      status: group.status === "active" ? "active" : "done",
      startDay: gantt.startDay,
      spanDays: gantt.endDay - gantt.startDay,
    };
  }
  const extent = touchpointTimeExtents(group.touchpoints);
  if (!extent) return null;
  return {
    id: group.id,
    label: group.label,
    channel: "email",
    status: group.status === "active" ? "active" : "done",
    startDay: extent.startDay,
    spanDays: extent.spanDays,
  };
}

function buildRows(openIds: Set<string>, sequences: NudgeGroup[]): Row[] {
  const rows: Row[] = [];
  for (const seq of sequences) {
    const open = openIds.has(seq.id);
    rows.push({ kind: "nudgeGroup", group: seq, open });
    if (open && seq.tree?.length) {
      rows.push(...flattenJourneyTree(
        seq.tree,
        2,
        seq.id,
        openIds,
        seq.sectionStyle ?? "active",
      ));
    }
  }
  return rows;
}

function timelineChannelBarVisible(
  row: Extract<Row, { kind: "nudgeChannel" } | { kind: "journeyStandalone" }>,
  formOwnerBarById: Map<string, { startDay: number; endDay: number }>,
): boolean {
  if (row.kind === "nudgeChannel" && row.tp.channel === "form" && formOwnerBarById.has(row.tp.id)) {
    return true;
  }
  return !!row.tp.barSegment;
}

const ROW_H = 36;
/** Tighter row pitch inside nudge groups — icons/text stay full size */
const NUDGE_STEP_ROW_H = 26;
const NUDGE_STEP_PAD_BOTTOM = 0;
const ROW_META_H = 22;
const ROW_TASK_NOTE_H = 34;
const REASONING_LINE_H = 17;
const THOUGHT_H = 32;
const COLLAPSED_H = 28;

function reasoningHeight(text: string): number {
  const lines = Math.max(1, Math.ceil(text.length / 72));
  return 6 + lines * REASONING_LINE_H;
}

function taskBlockHeight(tp: Touchpoint, reasoningOpen: boolean, compact = false): number {
  const base = compact ? NUDGE_STEP_ROW_H : ROW_H;
  let h = base;
  // CriteriaLine temporarily hidden — only outcome meta row reserves height
  if (tp.outcome && !tp.successCriteria) h += ROW_META_H;
  if (tp.taskNote) h += ROW_TASK_NOTE_H;
  if (reasoningOpen && tp.reasoning) h += reasoningHeight(tp.reasoning);
  return h;
}

const NUDGE_GROUP_H = 28;
const NUDGE_ATTEMPT_H = 26;
const NUDGE_CHANNEL_H = 26;
const NUDGE_EVENT_H = 22;
const NUDGE_ESCALATION_H = 26;
const NUDGE_ESCALATION_THOUGHT_H = 20;
const NUDGE_ESCALATION_RATIONALE_H = 34;

function escalationRowHeight(escalation: NudgeEscalation, open: boolean, revealedThoughts: Set<string>): number {
  if (!open) return NUDGE_ESCALATION_H;
  let h = NUDGE_ESCALATION_H + 4;
  for (const step of escalation.thoughtChain) {
    h += NUDGE_ESCALATION_THOUGHT_H;
    if (revealedThoughts.has(step.id)) h += NUDGE_ESCALATION_RATIONALE_H;
  }
  return h;
}

type TimeRange = { startDay: number; endDay: number };

function journeyRowShellStyle(h: number): CSSProperties {
  return {
    height: h,
    minHeight: h,
    maxHeight: h,
    boxSizing: "border-box",
    flexShrink: 0,
    overflow: "hidden",
    position: "relative",
  };
}

function timelineRowShellStyle(h: number): CSSProperties {
  return {
    position: "absolute",
    left: 0,
    width: "100%",
    height: h,
    boxSizing: "border-box",
  };
}

function getRowActivityId(row: Row): string | null {
  switch (row.kind) {
    case "nudgeGroup": return row.group.id;
    case "nudgeAttempt": return row.attempt.id;
    case "nudgeFormVisit": return row.visit.id;
    case "nudgeChannel":
    case "journeyStandalone":
    case "journeyTaskEscalation":
    case "nudgeEvent":
    case "task":
      return row.tp.id;
    case "nudgeEscalation": return row.id;
    default: return null;
  }
}

function getRowTimeRange(
  row: Row,
  ganttByGroup: Record<string, JourneyGanttData>,
  formOwnerBarById?: Map<string, { startDay: number; endDay: number }>,
  sequenceGanttExtentById?: Map<string, { startDay: number; endDay: number }>,
): TimeRange | null {
  switch (row.kind) {
    case "nudgeGroup": {
      const derived = sequenceGanttExtentById?.get(row.group.id);
      if (derived) return derived;
      const gantt = ganttByGroup[row.group.id];
      if (!gantt) return null;
      return { startDay: gantt.startDay, endDay: gantt.endDay };
    }
    case "nudgeAttempt":
      return { startDay: row.attempt.startDay, endDay: row.attempt.endDay };
    case "nudgeFormVisit":
      return { startDay: row.visit.startDay, endDay: row.visit.endDay };
    case "nudgeChannel":
    case "journeyStandalone":
    case "journeyTaskEscalation":
    case "nudgeEvent":
    case "task": {
      if (
        row.kind === "nudgeChannel" &&
        row.tp.channel === "form" &&
        formOwnerBarById?.has(row.tp.id)
      ) {
        const seg = formOwnerBarById.get(row.tp.id)!;
        return { startDay: seg.startDay, endDay: seg.endDay };
      }
      if (row.tp.barSegment) {
        return { startDay: row.tp.barSegment.startDay, endDay: row.tp.barSegment.endDay };
      }
      if (row.tp.startDay != null) {
        return { startDay: row.tp.startDay, endDay: row.tp.startDay + row.tp.spanDays };
      }
      return null;
    }
    case "nudgeEscalation":
      return { startDay: row.escalation.waitStartDay, endDay: row.escalation.waitEndDay };
    default:
      return null;
  }
}

/** Left edge of the bar/marker in timeline pixels. */
function getRowTimeStartPx(
  row: Row,
  ganttByGroup: Record<string, JourneyGanttData>,
  dayW: number,
  formOwnerBarById?: Map<string, { startDay: number; endDay: number }>,
  sequenceGanttExtentById?: Map<string, { startDay: number; endDay: number }>,
): number | null {
  switch (row.kind) {
    case "nudgeEvent":
      return row.tp.startDay * dayW;
    case "nudgeEscalation":
      return row.escalation.waitStartDay * dayW;
    default: {
      const range = getRowTimeRange(row, ganttByGroup, formOwnerBarById, sequenceGanttExtentById);
      if (!range) return null;
      return range.startDay * dayW;
    }
  }
}

function findRowLayout(
  rows: Row[],
  nodeId: string,
  expandedReasoning: Set<string>,
  revealedThoughts: Set<string>,
): { y: number; h: number; row: Row } | null {
  let y = 0;
  for (const row of rows) {
    const h = rowHeight(row, expandedReasoning, revealedThoughts);
    const rowId = getRowActivityId(row);
    if (rowId === nodeId) return { y, h, row };
    y += h;
  }
  return null;
}

function leftRowKey(row: Row, index: number): string {
  switch (row.kind) {
    case "nudgeGroup": return `ng-${row.group.id}`;
    case "nudgeAttempt": return `na-${row.attempt.id}`;
    case "nudgeFormVisit": return `fv-${row.visit.id}`;
    case "nudgeChannel": return `nc-${row.tp.id}`;
    case "journeyStandalone": return `js-${row.tp.id}`;
    case "journeyTaskEscalation": return `jt-${row.tp.id}`;
    case "nudgeEscalation": return `ne-${row.id}`;
    case "nudgeEvent": return `nev-${row.tp.id}`;
    case "task": return `task-${row.tp.id}`;
    case "thought": return `thought-${index}`;
    case "collapsed": return `collapsed-${index}`;
    default: return `row-${index}`;
  }
}

function rowHeight(row: Row, expandedReasoning: Set<string>, revealedThoughts: Set<string>): number {
  if (row.kind === "nudgeGroup") return NUDGE_GROUP_H;
  if (row.kind === "nudgeAttempt") return NUDGE_ATTEMPT_H;
  if (row.kind === "nudgeFormVisit") return NUDGE_ATTEMPT_H;
  if (row.kind === "journeyStandalone") return NUDGE_CHANNEL_H;
  if (row.kind === "journeyTaskEscalation") return NUDGE_CHANNEL_H;
  if (row.kind === "nudgeChannel") return NUDGE_CHANNEL_H;
  if (row.kind === "nudgeEvent") return NUDGE_EVENT_H;
  if (row.kind === "nudgeEscalation") return escalationRowHeight(row.escalation, row.open, revealedThoughts);
  if (row.kind === "thought") return THOUGHT_H;
  if (row.kind === "collapsed") return COLLAPSED_H;
  if (row.kind === "task") {
    return taskBlockHeight(row.tp, expandedReasoning.has(row.tp.id), row.inNudgeGroup);
  }
  return ROW_H;
}

function barStyle(
  status: TouchStatus,
  t: Tokens,
  addedLive?: boolean,
  linkedTaskStatus?: "open" | "done",
): CSSProperties {
  const base: CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    height: 24,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    padding: "0 10px",
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    boxSizing: "border-box",
  };
  if (linkedTaskStatus === "open") {
    return {
      ...base,
      background: `${t.red}18`,
      color: t.red,
      border: `1px solid ${t.red}44`,
      borderLeft: `3px solid ${t.red}`,
    };
  }
  if (linkedTaskStatus === "done") {
    return {
      ...base,
      background: `${t.success}18`,
      color: t.success,
      border: `1px solid ${t.success}44`,
      borderLeft: `3px solid ${t.success}`,
    };
  }
  if (addedLive) {
    return {
      ...base,
      background: t.amberBg,
      color: t.amber,
      border: `1px solid ${t.amber}55`,
      borderLeft: `3px solid ${t.amber}`,
      opacity: status === "done" ? 0.85 : 1,
    };
  }
  switch (status) {
    case "done":
      return { ...base, background: t.accent, color: "#fff", border: `1px solid ${t.accent}` };
    case "historical":
      return { ...base, background: t.textMuted, color: "#fff", border: `1px solid ${t.textMuted}` };
    case "scheduled":
      return { ...base, background: t.accentBg, color: t.accent, border: `1px solid ${t.accent}55` };
    case "conditional":
      return { ...base, background: t.amberBg, color: t.amber, border: `1px dashed ${t.amber}` };
    case "ghost":
      return { ...base, background: t.bgPrimary, color: t.textDim, border: `1px dashed ${t.border}` };
    case "reactive":
      return {
        ...base,
        background: t.amber,
        color: "#fff",
        border: `1px solid ${t.amber}`,
        borderLeft: `3px solid ${t.amber}`,
      };
    case "active":
      return { ...base, background: t.accent, color: "#fff", border: `2px solid #fff` };
    default:
      return base;
  }
}

function barLabel(tp: Touchpoint): string {
  const short = tp.label.includes("·") ? tp.label.split("·").pop()!.trim() : tp.label;
  if (tp.tags?.length) return `${tp.tags[0]} ${short}`;
  return short;
}

function TimelineBar({
  tp,
  t,
  dayW,
  rowH,
  selected,
  onSelect,
  linkedTaskStatus,
  isGroupSummary = false,
}: {
  tp: Touchpoint;
  t: Tokens;
  dayW: number;
  rowH: number;
  selected: boolean;
  onSelect: (id: string) => void;
  linkedTaskStatus?: "open" | "done";
  isGroupSummary?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const left = tp.startDay * dayW;
  const width = Math.max(tp.spanDays * dayW, 28);
  const clickable = !isGroupSummary && isTouchpointClickable(tp.id);
  const barStyles = barStyle(tp.status, t, linkedTaskStatus ? undefined : tp.addedLive, linkedTaskStatus);
  const label = isGroupSummary ? tp.label : barLabel(tp);
  const barH = rowH;

  const summaryStyle: CSSProperties = isGroupSummary
    ? {
        background: t.accentBg,
        color: t.accent,
        border: `1px solid ${t.accent}55`,
        opacity: 0.92,
      }
    : {};

  return (
    <button
      type="button"
      title={!hovered ? (isGroupSummary ? `${tp.label} · full nudge duration` : tp.addedLive ? `${tp.label} — added by Tower at ${tp.addedAt}` : tp.label) : undefined}
      disabled={!clickable}
      onClick={() => clickable && onSelect(tp.id)}
      onMouseEnter={(e) => {
        setHovered(true);
        if (clickable) (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.08)";
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        (e.currentTarget as HTMLButtonElement).style.filter = "none";
      }}
      style={{
        ...barStyles,
        ...summaryStyle,
        left,
        width: hovered ? Math.max(width, Math.min(label.length * 6.5 + 24, 240)) : width,
        height: barH,
        top: 0,
        transform: "none",
        border: summaryStyle.border ?? barStyles.border ?? "none",
        cursor: clickable ? "pointer" : "default",
        zIndex: hovered || selected ? 12 : 1,
        boxShadow: selected ? `0 0 0 2px ${t.textPrimary}` : hovered ? `0 2px 8px ${t.border}` : undefined,
        transition: "width 120ms ease, box-shadow 120ms ease",
        overflow: "hidden",
      }}
    >
      {hovered && (
        <>
          {tp.addedLive && !linkedTaskStatus && !isGroupSummary && <Plus size={10} style={{ flexShrink: 0, marginRight: 4 }} />}
          {label}
        </>
      )}
    </button>
  );
}

function StatusIcon({
  status,
  t,
  linkedTaskStatus,
  size = 16,
}: {
  status: TouchStatus;
  t: Tokens;
  linkedTaskStatus?: "open" | "done";
  size?: number;
}) {
  if (linkedTaskStatus) {
    const color = linkedTaskStatus === "open" ? t.red : t.success;
    return (
      <div style={{
        width: size, height: size, borderRadius: 4,
        background: linkedTaskStatus === "done" ? `${t.success}22` : "transparent",
        border: `1px solid ${color}66`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {linkedTaskStatus === "done"
          ? <Check size={10} color={color} strokeWidth={3} />
          : <CheckSquare size={9} color={color} strokeWidth={1.75} />}
      </div>
    );
  }
  if (status === "reactive") {
    return (
      <div style={{
        width: size, height: size, borderRadius: 4,
        background: t.amberBg, border: `1px solid ${t.amber}55`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Plus size={9} color={t.amber} strokeWidth={2.5} />
      </div>
    );
  }
  if (status === "done" || status === "historical") {
    return (
      <div style={{
        width: size, height: size, borderRadius: 4,
        background: t.accent, opacity: status === "historical" ? 0.5 : 1,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Check size={10} color="#fff" strokeWidth={3} />
      </div>
    );
  }
  if (status === "scheduled") {
    return <Circle size={14} color={t.accent} strokeWidth={2} style={{ flexShrink: 0 }} />;
  }
  if (status === "conditional") {
    return <Circle size={14} color={t.amber} strokeWidth={2} strokeDasharray="3 2" style={{ flexShrink: 0 }} />;
  }
  return <Circle size={14} color={t.textDim} strokeWidth={1.5} style={{ flexShrink: 0, opacity: 0.5 }} />;
}

function StepBadge({
  letter,
  bg,
  color,
}: {
  letter: string;
  bg: string;
  color: string;
}) {
  return (
    <div style={{
      width: 18,
      height: 18,
      borderRadius: 4,
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      fontSize: 10,
      fontWeight: 700,
      color,
      lineHeight: 1,
      userSelect: "none",
    }}>
      {letter}
    </div>
  );
}

function NudgeGroupStatus({
  status,
  t,
}: {
  status: "active" | "complete" | "armed";
  t: Tokens;
}) {
  if (status === "complete") {
    return (
      <div style={{
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: t.success,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <Check size={10} color="#fff" strokeWidth={3} />
      </div>
    );
  }
  if (status === "armed") {
    return (
      <Circle size={14} color={t.textDim} strokeWidth={1.5} strokeDasharray="3 2" style={{ flexShrink: 0, opacity: 0.6 }} />
    );
  }
  return (
    <span style={{
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: t.amber,
      flexShrink: 0,
      animation: "towerPulse 1.6s ease-in-out infinite",
    }} />
  );
}

function NudgeGroupHeader({
  group,
  open,
  onToggle,
  t,
}: {
  group: NudgeGroup;
  open: boolean;
  onToggle: () => void;
  t: Tokens;
}) {
  const [hovered, setHovered] = useState(false);
  const letter = group.badgeLetter ?? "N";
  const status = group.status ?? "active";
  const sectionStyle = group.sectionStyle ?? "active";
  const badgeBg = sectionStyle === "historical" ? HISTORICAL_TEAL : sectionStyle === "armed" ? t.amberBg : t.accent;
  const badgeColor = sectionStyle === "historical" ? "#fff" : sectionStyle === "armed" ? t.amber : "#fff";
  const isActive = status === "active";
  const isHighlighted = useIsDocsTarget(ENGAGEMENT_SEQUENCE_ROW_HOLON.id);

  return (
    <button
      type="button"
      id={`activity-node-${group.id}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        width: "100%",
        height: NUDGE_GROUP_H,
        padding: "0 8px 0 4px",
        background: hovered ? t.hoverBg : "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        boxSizing: "border-box",
        borderRadius: 4,
        ...docsTargetHighlight(isHighlighted, t.accent),
      }}
    >
      <span style={{ display: "flex", alignItems: "center", flexShrink: 0, width: 14 }}>
        {open
          ? <ChevronDown size={12} color={t.textMuted} strokeWidth={2} />
          : <ChevronRight size={12} color={t.textMuted} strokeWidth={2} />}
      </span>
      <StepBadge letter={letter} bg={badgeBg} color={badgeColor} />
      <span style={{
        flex: 1,
        minWidth: 0,
        fontSize: 12,
        fontWeight: 500,
        color: isActive ? t.accent : sectionStyle === "historical" ? t.textMuted : t.textPrimary,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        textDecoration: sectionStyle === "historical" ? "line-through" : undefined,
        opacity: sectionStyle === "historical" ? 0.85 : 1,
      }}>
        {group.label}
      </span>
      <NudgeGroupStatus status={status} t={t} />
    </button>
  );
}

function nudgePadLeft(depth: number): number {
  return depth > 0 ? 22 + (depth - 1) * 16 : 0;
}

function NudgeAttemptHeader({
  attempt,
  open,
  onToggle,
  depth,
  t,
}: {
  attempt: NudgeAttemptRow;
  open: boolean;
  onToggle: () => void;
  depth: number;
  t: Tokens;
}) {
  const [hovered, setHovered] = useState(false);
  const color = ATTEMPT_BAR_COLORS[attempt.colorIndex % ATTEMPT_BAR_COLORS.length];
  const isHighlighted = useIsDocsTarget(ENGAGEMENT_ATTEMPT_ROW_HOLON.id);

  return (
    <button
      type="button"
      id={`activity-node-${attempt.id}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        width: "100%",
        height: NUDGE_ATTEMPT_H,
        padding: `0 8px 0 ${nudgePadLeft(depth)}px`,
        background: hovered ? t.hoverBg : "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        boxSizing: "border-box",
        borderRadius: 4,
        position: "relative",
        ...docsTargetHighlight(isHighlighted, t.accent),
      }}
    >
      <div style={{
        position: "absolute",
        left: nudgePadLeft(depth) - 10,
        top: 0,
        bottom: 0,
        width: 1,
        background: t.borderLight,
      }} />
      <span style={{ display: "flex", alignItems: "center", flexShrink: 0, width: 14 }}>
        {open
          ? <ChevronDown size={12} color={t.textMuted} strokeWidth={2} />
          : <ChevronRight size={12} color={t.textMuted} strokeWidth={2} />}
      </span>
      <span style={{
        width: 8,
        height: 8,
        borderRadius: 2,
        background: color,
        flexShrink: 0,
      }} />
      <span style={{
        flex: 1,
        minWidth: 0,
        fontSize: 12,
        fontWeight: 500,
        color: t.textPrimary,
      }}>
        {attempt.label}
      </span>
    </button>
  );
}

function FormVisitSignalIcons({
  signals,
  t,
}: {
  signals: NudgeFormVisitRow["signals"];
  t: Tokens;
}) {
  const size = 18;
  const icons = {
    opened: Eye,
    started: PenLine,
    submitted: Check,
  } as const;
  const keys = ["opened", "started", "submitted"] as const;

  const circleStyle = (state: "met" | "unmet" | "inactive"): CSSProperties => {
    if (state === "met") return { background: t.success, color: "#fff" };
    return {
      background: t.tagNeutralBg,
      color: t.textDim,
      border: `1px solid ${t.borderLight}`,
    };
  };

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0, marginRight: 4 }}>
      {keys.map((key) => {
        const Icon = icons[key];
        const state = signals[key];
        return (
          <span
            key={key}
            title={key}
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              ...circleStyle(state),
            }}
          >
            <Icon size={10} strokeWidth={2.25} color="currentColor" />
          </span>
        );
      })}
    </span>
  );
}

function FormVisitTreeRow({
  visit,
  open,
  onToggle,
  depth,
  onInspect,
  selected,
  t,
}: {
  visit: NudgeFormVisitRow;
  open: boolean;
  onToggle: () => void;
  depth: number;
  onInspect?: () => void;
  selected?: boolean;
  t: Tokens;
}) {
  const [hovered, setHovered] = useState(false);
  const padLeft = nudgePadLeft(depth);
  const showChain = visit.origin === "prior_email";
  const isHighlighted = useIsDocsTarget(ENGAGEMENT_FORM_VISIT_ROW_HOLON.id);

  return (
    <div
      id={`activity-node-${visit.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        width: "100%",
        height: NUDGE_ATTEMPT_H,
        padding: `0 8px 0 ${padLeft}px`,
        background: selected ? `${t.accent}14` : hovered ? t.hoverBg : "transparent",
        boxSizing: "border-box",
        borderRadius: 4,
        position: "relative",
        ...docsTargetHighlight(isHighlighted, t.accent),
      }}
    >
      <div style={{
        position: "absolute",
        left: padLeft - 10,
        top: 0,
        bottom: 0,
        width: 1,
        background: t.borderLight,
      }} />
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        style={{
          width: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: "pointer",
        }}
        title={open ? "Collapse" : "Expand"}
      >
        {open
          ? <ChevronDown size={12} color={t.textMuted} strokeWidth={2} />
          : <ChevronRight size={12} color={t.textMuted} strokeWidth={2} />}
      </button>
      <button
        type="button"
        onClick={onInspect}
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: onInspect ? "pointer" : "default",
          textAlign: "left",
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: 2, background: t.accent, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: t.textPrimary, whiteSpace: "nowrap" }}>
          Form visit
        </span>
        {showChain && (
          <span
            title={visit.sourceEmailLabel ?? "Prior email"}
            style={{ display: "inline-flex", alignItems: "center", color: t.textDim, flexShrink: 0, lineHeight: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Link2 size={12} strokeWidth={2} />
          </span>
        )}
      </button>
      {open && <FormVisitSignalIcons signals={visit.signals} t={t} />}
    </div>
  );
}

const NUDGE_CHANNEL_ICON_SIZE = 20;

type NudgeChannelIconPhase = "idle" | "motion" | "complete";

function nudgeChannelGoalKey(channel: Channel): EngagementSignalKey {
  if (channel === "sms") return "opened";
  if (channel === "email") return "clicked";
  if (channel === "form") return "submitted";
  return "submitted";
}

function nudgeChannelIconPhase(
  channel: Channel,
  signals?: EngagementSignals,
  channelPhase?: Touchpoint["channelPhase"],
): NudgeChannelIconPhase {
  if (channelPhase === "complete") return "complete";
  if (channelPhase === "active") return "motion";
  if (channelPhase === "idle") return "idle";
  if (!signals) return "idle";
  const goal = nudgeChannelGoalKey(channel);
  if (signals[goal] === "met") return "complete";
  if (signals.show.some((key) => signals[key] === "met")) return "motion";
  return "idle";
}

function NudgeChannelIcon({
  channel,
  signals,
  channelPhase,
  sectionStyle = "active",
  t,
  size = NUDGE_CHANNEL_ICON_SIZE,
}: {
  channel: Channel;
  signals?: EngagementSignals;
  channelPhase?: Touchpoint["channelPhase"];
  sectionStyle?: JourneySectionStyle;
  t: Tokens;
  size?: number;
}) {
  const Icon = channelIcon[channel];
  const phase = nudgeChannelIconPhase(channel, signals, channelPhase);
  const iconSize = Math.max(size - 9, 10);
  const ghost = sectionStyle === "armed" && phase !== "complete";

  if (ghost) {
    return (
      <Circle size={size - 4} color={t.textDim} strokeWidth={1.5} strokeDasharray="3 2" style={{ flexShrink: 0, opacity: 0.55 }} />
    );
  }

  const completeColor = sectionStyle === "historical" ? HISTORICAL_TEAL : t.success;

  const palette: Record<NudgeChannelIconPhase, { background: string; color: string; border: string; opacity: number }> = {
    complete: {
      background: completeColor,
      color: "#fff",
      border: `1px solid ${completeColor}`,
      opacity: sectionStyle === "historical" ? 0.75 : 1,
    },
    motion: {
      background: t.accent,
      color: "#fff",
      border: `1px solid ${t.accent}`,
      opacity: 1,
    },
    idle: {
      background: "transparent",
      color: t.textDim,
      border: `1px solid ${t.borderLight}`,
      opacity: 0.5,
    },
  };

  const p = palette[phase];

  return (
    <span
      title={phase === "complete" ? "Step complete" : phase === "motion" ? "In progress" : "Not started"}
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        background: p.background,
        color: p.color,
        border: p.border,
        opacity: p.opacity,
        transition: "background 0.15s, opacity 0.15s",
      }}
    >
      <Icon size={iconSize} strokeWidth={2} color="currentColor" />
    </span>
  );
}

function NudgeChannelHeader({
  tp,
  open,
  onToggle,
  onInspect,
  depth,
  hasChildren,
  sectionStyle = "active",
  selected = false,
  t,
}: {
  tp: Touchpoint;
  open: boolean;
  onToggle: () => void;
  onInspect?: () => void;
  depth: number;
  hasChildren: boolean;
  sectionStyle?: JourneySectionStyle;
  selected?: boolean;
  t: Tokens;
}) {
  const [hovered, setHovered] = useState(false);
  const padLeft = nudgePadLeft(depth);
  const historical = sectionStyle === "historical" || tp.status === "historical";
  const complete = nudgeChannelIconPhase(tp.channel, tp.engagementSignals, tp.channelPhase) === "complete";
  const inspectable = isInspectableChannel(tp.channel) && !!onInspect;
  const isHighlighted = useIsDocsTarget(ENGAGEMENT_CHANNEL_ROW_HOLON.id);

  return (
    <div
      id={`activity-node-${tp.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        height: NUDGE_CHANNEL_H,
        padding: `0 8px 0 ${padLeft}px`,
        background: selected ? t.activeRowBg : hovered ? t.hoverBg : "transparent",
        boxSizing: "border-box",
        borderRadius: 4,
        position: "relative",
        ...docsTargetHighlight(isHighlighted, t.accent),
      }}
    >
      <div style={{
        position: "absolute",
        left: padLeft - 10,
        top: 0,
        bottom: 0,
        width: 1,
        background: t.borderLight,
      }} />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (hasChildren) onToggle();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 14,
          flexShrink: 0,
          background: "transparent",
          border: "none",
          cursor: hasChildren ? "pointer" : "default",
          padding: 0,
        }}
        aria-label={hasChildren ? (open ? "Collapse" : "Expand") : undefined}
      >
        {hasChildren
          ? (open
            ? <ChevronDown size={12} color={t.textMuted} strokeWidth={2} />
            : <ChevronRight size={12} color={t.textMuted} strokeWidth={2} />)
          : <span style={{ width: 12 }} />}
      </button>
      <button
        type="button"
        onClick={() => {
          if (inspectable) onInspect?.();
          else if (hasChildren) onToggle();
        }}
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: inspectable || hasChildren ? "pointer" : "default",
          textAlign: "left",
        }}
      >
        <NudgeChannelIcon channel={tp.channel} signals={tp.engagementSignals} channelPhase={tp.channelPhase} sectionStyle={sectionStyle} t={t} />
        <span style={{
          flex: 1,
          minWidth: 0,
          fontSize: 12,
          fontWeight: 500,
          color: complete ? t.textPrimary : t.textMuted,
          textDecoration: historical ? "line-through" : undefined,
          opacity: historical ? 0.75 : 1,
        }}>
          {tp.label}
        </span>
        {tp.engagementSignals && (
          <EngagementSignalIcons signals={tp.engagementSignals} t={t} />
        )}
      </button>
    </div>
  );
}

function JourneyStandaloneRow({
  tp,
  open,
  onToggle,
  depth,
  hasChildren,
  sectionStyle = "active",
  t,
}: {
  tp: Touchpoint;
  open: boolean;
  onToggle: () => void;
  depth: number;
  hasChildren: boolean;
  sectionStyle?: JourneySectionStyle;
  t: Tokens;
}) {
  const [hovered, setHovered] = useState(false);
  const padLeft = nudgePadLeft(depth);
  const historical = sectionStyle === "historical" || tp.status === "historical";
  const Icon = channelIcon[tp.channel];

  return (
    <button
      type="button"
      id={`activity-node-${tp.id}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (hasChildren) onToggle();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        height: NUDGE_CHANNEL_H,
        padding: `0 8px 0 ${padLeft}px`,
        background: hovered ? t.hoverBg : "transparent",
        border: "none",
        cursor: hasChildren ? "pointer" : "default",
        textAlign: "left",
        boxSizing: "border-box",
        borderRadius: 4,
        position: "relative",
      }}
    >
      <div style={{
        position: "absolute",
        left: padLeft - 10,
        top: 0,
        bottom: 0,
        width: 1,
        background: t.borderLight,
      }} />
      <span style={{ display: "flex", alignItems: "center", flexShrink: 0, width: 14 }}>
        {hasChildren
          ? (open
            ? <ChevronDown size={12} color={t.textMuted} strokeWidth={2} />
            : <ChevronRight size={12} color={t.textMuted} strokeWidth={2} />)
          : <span style={{ width: 12 }} />}
      </span>
      {historical ? (
        <span style={{
          width: NUDGE_CHANNEL_ICON_SIZE,
          height: NUDGE_CHANNEL_ICON_SIZE,
          borderRadius: 6,
          background: HISTORICAL_TEAL,
          opacity: 0.75,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={11} color="#fff" strokeWidth={2} />
        </span>
      ) : (
        <Icon size={12} color={t.textDim} strokeWidth={1.75} style={{ flexShrink: 0, opacity: 0.55 }} />
      )}
      <span style={{
        flex: 1,
        minWidth: 0,
        fontSize: 12,
        fontWeight: 500,
        color: t.textMuted,
        textDecoration: historical ? "line-through" : undefined,
        opacity: historical ? 0.75 : 0.85,
      }}>
        {tp.label}
      </span>
    </button>
  );
}

function JourneyTaskEscalationRow({
  tp,
  depth,
  sectionStyle = "armed",
  t,
}: {
  tp: Touchpoint;
  depth: number;
  sectionStyle?: JourneySectionStyle;
  t: Tokens;
}) {
  const padLeft = nudgePadLeft(depth);
  const ghost = sectionStyle === "armed" || tp.status === "ghost";

  return (
    <div
      id={`activity-node-${tp.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: NUDGE_CHANNEL_H,
        padding: `0 8px 0 ${padLeft}px`,
        position: "relative",
        boxSizing: "border-box",
        opacity: ghost ? 0.7 : 1,
      }}
    >
      <div style={{
        position: "absolute",
        left: padLeft - 10,
        top: 0,
        bottom: 0,
        width: 1,
        background: t.borderLight,
      }} />
      <span style={{ width: 14, flexShrink: 0 }} />
      {ghost
        ? <Circle size={14} color={t.textDim} strokeWidth={1.5} strokeDasharray="3 2" style={{ flexShrink: 0 }} />
        : <CheckSquare size={14} color={t.amber} strokeWidth={1.75} style={{ flexShrink: 0 }} />}
      <span style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 500, color: ghost ? t.textDim : t.textPrimary }}>
        {tp.label}
      </span>
      {tp.taskAssignee && (
        <span style={{ fontSize: 10, color: t.textDim, flexShrink: 0 }}>{tp.taskAssignee}</span>
      )}
    </div>
  );
}

function NudgeEscalationRow({
  id,
  escalation,
  open,
  onToggle,
  depth,
  t,
  revealedThoughts,
  onRevealThought,
}: {
  id: string;
  escalation: NudgeEscalation;
  open: boolean;
  onToggle: () => void;
  depth: number;
  t: Tokens;
  revealedThoughts: Set<string>;
  onRevealThought: (stepId: string) => void;
}) {
  const padLeft = nudgePadLeft(depth);
  const isHighlighted = useIsDocsTarget(ENGAGEMENT_ESCALATION_ROW_HOLON.id);

  return (
    <div
      id={`activity-node-${id}`}
      style={{
        height: "100%",
        padding: `0 8px 0 ${padLeft}px`,
        position: "relative",
        boxSizing: "border-box",
        overflow: "hidden",
        borderRadius: 4,
        ...docsTargetHighlight(isHighlighted, t.accent),
      }}
    >
      <div style={{
        position: "absolute",
        left: padLeft - 10,
        top: 0,
        bottom: 0,
        width: 1,
        background: t.borderLight,
      }} />
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          height: NUDGE_ESCALATION_H,
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", flexShrink: 0, width: 14 }}>
          {open
            ? <ChevronDown size={12} color={t.textMuted} strokeWidth={2} />
            : <ChevronRight size={12} color={t.textMuted} strokeWidth={2} />}
        </span>
        <Sparkles size={11} color={t.amber} strokeWidth={2} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 500, color: t.textPrimary }}>
          {escalation.scheduledLabel}
        </span>
        <span style={{ fontSize: 10, color: t.textDim, flexShrink: 0 }}>
          {formatNudgeTime(escalation.waitEndDay)}
        </span>
      </button>

      {open && (
        <div style={{ paddingLeft: 22, paddingBottom: 4 }}>
          {escalation.thoughtChain.map((step, i) => (
            <ThoughtStepLine
              key={step.id}
              step={step}
              t={t}
              dimmed={i > 0}
              revealed={revealedThoughts.has(step.id)}
              onReveal={() => onRevealThought(step.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ThoughtStepLine({
  step,
  t,
  dimmed,
  revealed,
  onReveal,
}: {
  step: ThoughtStep;
  t: Tokens;
  dimmed: boolean;
  revealed: boolean;
  onReveal: () => void;
}) {
  return (
    <div style={{ marginBottom: revealed ? 6 : 2 }}>
      <button
        type="button"
        onClick={onReveal}
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
          width: "100%",
          padding: "2px 0",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 10, color: t.textDim, flexShrink: 0 }}>
          Thought for {step.durationSec}s
        </span>
        <span style={{ fontSize: 10, color: t.textDim }}>|</span>
        <span style={{
          fontSize: 11,
          color: dimmed && !revealed ? t.textDim : t.textMuted,
          opacity: dimmed && !revealed ? 0.55 : 1,
        }}>
          {step.label}
        </span>
      </button>
      {revealed && (
        <p style={{
          margin: "4px 0 0",
          paddingLeft: 8,
          fontSize: 10,
          lineHeight: 1.45,
          color: t.textDim,
          borderLeft: `2px solid ${t.borderLight}`,
        }}>
          {step.rationale}
        </p>
      )}
    </div>
  );
}

function NudgeEventRow({
  tp,
  depth,
  sectionStyle = "active",
  t,
}: {
  tp: Touchpoint;
  depth: number;
  sectionStyle?: JourneySectionStyle;
  t: Tokens;
}) {
  const padLeft = nudgePadLeft(depth);
  const Icon = channelIcon[tp.channel];
  const historical = sectionStyle === "historical" || tp.status === "historical";
  const ghost = sectionStyle === "armed" || tp.status === "ghost";
  const isHighlighted = useIsDocsTarget(ENGAGEMENT_EVENT_ROW_HOLON.id);

  return (
    <div
      id={`activity-node-${tp.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: NUDGE_EVENT_H,
        padding: `0 8px 0 ${padLeft}px`,
        position: "relative",
        boxSizing: "border-box",
        opacity: ghost ? 0.65 : historical ? 0.75 : 1,
        borderRadius: 4,
        ...docsTargetHighlight(isHighlighted, t.accent),
      }}
    >
      <div style={{
        position: "absolute",
        left: padLeft - 10,
        top: 0,
        bottom: 0,
        width: 1,
        background: t.borderLight,
      }} />
      <span style={{ width: 14, flexShrink: 0 }} />
      <Icon size={10} color={ghost ? t.textDim : t.textDim} strokeWidth={1.75} style={{ flexShrink: 0 }} />
      <span style={{
        flex: 1,
        minWidth: 0,
        fontSize: 11,
        color: t.textDim,
        textDecoration: historical ? "line-through" : undefined,
      }}>
        {tp.label}
      </span>
      {tp.dateLabel && (
        <span style={{ fontSize: 10, color: t.textDim, flexShrink: 0 }}>{tp.dateLabel}</span>
      )}
    </div>
  );
}

function ReasoningToggle({
  open,
  onToggle,
  t,
}: {
  open: boolean;
  onToggle: () => void;
  t: Tokens;
}) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      aria-expanded={open}
      title={open ? "Hide reasoning" : "Show reasoning"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 16,
        height: 16,
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: t.textDim,
        flexShrink: 0,
      }}
    >
      {open
        ? <ChevronDown size={12} strokeWidth={2} />
        : <ChevronRight size={12} strokeWidth={2} />}
    </button>
  );
}

function CriteriaLine({
  criteria,
  reasoning,
  reasoningOpen,
  onToggleReasoning,
  t,
}: {
  criteria: NonNullable<Touchpoint["successCriteria"]>;
  reasoning?: string;
  reasoningOpen: boolean;
  onToggleReasoning: () => void;
  t: Tokens;
}) {
  const allMet = criteria.checks.every((c) => c.met);
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 5,
      flexWrap: "wrap",
      paddingLeft: 36,
      marginTop: 3,
      fontSize: 10,
      lineHeight: 1.4,
    }}>
      <span style={{ color: t.textDim }}>Success criteria:</span>
      {criteria.checks.map((c, i) => (
        <span key={c.label} style={{ display: "inline-flex", alignItems: "center", gap: 3, color: t.textMuted }}>
          {i > 0 && <span style={{ color: t.textDim, margin: "0 1px" }}>·</span>}
          <span>{c.label}</span>
          {c.met
            ? <Check size={8} color={t.textMuted} strokeWidth={3} />
            : <X size={8} color={t.textMuted} strokeWidth={3} />}
        </span>
      ))}
      <span style={{ color: t.textDim }}>· {criteria.goal}</span>
      {!allMet && (
        <span style={{ color: t.textMuted }}>— {criteria.failLabel ?? "criteria not met"}</span>
      )}
      {reasoning && (
        <ReasoningToggle open={reasoningOpen} onToggle={onToggleReasoning} t={t} />
      )}
    </div>
  );
}

function OutcomeLine({
  outcome,
  reasoning,
  reasoningOpen,
  onToggleReasoning,
  t,
}: {
  outcome: string;
  reasoning?: string;
  reasoningOpen: boolean;
  onToggleReasoning: () => void;
  t: Tokens;
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 5,
      paddingLeft: 36,
      marginTop: 3,
      fontSize: 10,
      lineHeight: 1.4,
    }}>
      <span style={{ color: t.textDim }}>Outcome:</span>
      <span style={{ color: t.textMuted }}>{outcome}</span>
      {reasoning && (
        <ReasoningToggle open={reasoningOpen} onToggle={onToggleReasoning} t={t} />
      )}
    </div>
  );
}

const ENGAGEMENT_SIGNAL_SIZE = 18;

function EngagementSignalIcons({
  signals,
  t,
}: {
  signals: EngagementSignals;
  t: Tokens;
}) {
  const icons: Record<EngagementSignalKey, typeof Mail> = {
    sent: Mail,
    opened: Eye,
    started: PenLine,
    clicked: MousePointerClick,
    replied: Reply,
    submitted: Check,
  };

  const stateFor = (key: EngagementSignalKey): EngagementSignalState => {
    const v = signals[key];
    return v ?? "inactive";
  };

  const circleStyle = (state: EngagementSignalState): CSSProperties => {
    if (state === "met") {
      return { background: t.success, color: "#fff" };
    }
    return {
      background: t.tagNeutralBg,
      color: t.textDim,
      border: `1px solid ${t.borderLight}`,
    };
  };

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
      {signals.show.map((key) => {
        const state = stateFor(key);
        const Icon = icons[key];
        const palette = circleStyle(state);
        return (
          <span
            key={key}
            title={key}
            style={{
              position: "relative",
              width: ENGAGEMENT_SIGNAL_SIZE,
              height: ENGAGEMENT_SIGNAL_SIZE,
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              ...palette,
            }}
          >
            <Icon size={10} strokeWidth={2.25} color="currentColor" />
            {key === "opened" && signals.openedCount != null && signals.openedCount > 0 && (
              <span style={{
                position: "absolute",
                top: -3,
                right: -4,
                minWidth: 12,
                height: 12,
                padding: "0 3px",
                borderRadius: 999,
                background: t.bgPrimary,
                border: `1px solid ${t.border}`,
                fontSize: 8,
                fontWeight: 700,
                lineHeight: "10px",
                color: t.textMuted,
                textAlign: "center",
              }}>
                {signals.openedCount}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

function TaskListCell({
  tp,
  depth,
  t,
  reasoningOpen,
  onToggleReasoning,
  selected,
  onSelect,
  linkedTaskStatus,
  inNudgeGroup = false,
}: {
  tp: Touchpoint;
  depth: number;
  t: Tokens;
  reasoningOpen: boolean;
  onToggleReasoning: () => void;
  selected: boolean;
  onSelect: (id: string) => void;
  linkedTaskStatus?: "open" | "done";
  inNudgeGroup?: boolean;
}) {
  const Icon = channelIcon[tp.channel];
  const done = tp.status === "done" || tp.status === "historical";
  const ghost = tp.status === "ghost";
  const clickable = isTouchpointClickable(tp.id);
  const padLeft = depth > 0 ? 22 + (depth - 1) * 16 : 0;
  const taskAccent = linkedTaskStatus === "open" ? t.red : linkedTaskStatus === "done" ? t.success : undefined;
  const showReasoningAlone = !!(tp.reasoning && !tp.outcome && !tp.taskNote);
  const rowH = inNudgeGroup ? NUDGE_STEP_ROW_H : ROW_H;
  const padBottom = inNudgeGroup ? NUDGE_STEP_PAD_BOTTOM : 4;

  return (
    <div
      id={`activity-node-${tp.id}`}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={() => clickable && onSelect(tp.id)}
      onKeyDown={(e) => {
        if (clickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(tp.id);
        }
      }}
      style={{
      minHeight: taskBlockHeight(tp, reasoningOpen, inNudgeGroup),
      paddingLeft: padLeft,
      paddingRight: 8,
      paddingBottom: padBottom,
      opacity: ghost ? 0.65 : 1,
      boxSizing: "border-box",
      position: "relative",
      cursor: clickable ? "pointer" : "default",
      background: selected ? t.activeRowBg : "transparent",
      borderRadius: 4,
      borderLeft: taskAccent ? `2px solid ${taskAccent}` : undefined,
      marginLeft: taskAccent ? 2 : 0,
    }}>
      {depth > 0 && (
        <div style={{
          position: "absolute",
          left: padLeft - 10,
          top: 0,
          bottom: 0,
          width: 1,
          background: t.borderLight,
        }} />
      )}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: rowH,
      }}>
        <StatusIcon status={tp.status} t={t} linkedTaskStatus={linkedTaskStatus} />
        <Icon size={12} color={ghost ? t.textDim : t.textMuted} strokeWidth={1.75} style={{ flexShrink: 0 }} />
        <span style={{
          fontSize: 12,
          color: done ? t.textMuted : t.textPrimary,
          textDecoration: done && !tp.successCriteria && !tp.taskNote ? "line-through" : "none",
          flex: 1,
          minWidth: 0,
        }}>
          {tp.label}
        </span>
        {tp.addedLive && (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            fontSize: 9,
            fontWeight: 600,
            padding: "2px 7px",
            borderRadius: 999,
            background: t.amberBg,
            color: t.amber,
            border: `1px solid ${t.amber}44`,
            flexShrink: 0,
          }}>
            <Plus size={8} strokeWidth={2.5} />
            Added {tp.addedAt}
          </span>
        )}
        {tp.engagementSignals ? (
          <EngagementSignalIcons signals={tp.engagementSignals} t={t} />
        ) : tp.dateLabel ? (
          <span style={{ fontSize: 10, color: t.textDim, flexShrink: 0 }}>{tp.dateLabel}</span>
        ) : null}
        {showReasoningAlone && (
          <ReasoningToggle open={reasoningOpen} onToggle={onToggleReasoning} t={t} />
        )}
      </div>

      {/* TEMP: CriteriaLine hidden — restore when success-criteria rows return
      {tp.successCriteria && (
        <CriteriaLine
          criteria={tp.successCriteria}
          reasoning={tp.reasoning}
          reasoningOpen={reasoningOpen}
          onToggleReasoning={onToggleReasoning}
          t={t}
        />
      )}
      */}

      {tp.outcome && !tp.successCriteria && (
        <OutcomeLine
          outcome={tp.outcome}
          reasoning={tp.reasoning}
          reasoningOpen={reasoningOpen}
          onToggleReasoning={onToggleReasoning}
          t={t}
        />
      )}

      {tp.taskNote && (
        <div style={{ paddingLeft: 36, marginTop: 4 }}>
          <div style={{ fontSize: 10, color: t.textMuted, lineHeight: 1.45 }}>
            &ldquo;{tp.taskNote}&rdquo;
          </div>
          {tp.taskAssignee && (
            <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>{tp.taskAssignee}</div>
          )}
          {tp.reasoning && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <ReasoningToggle open={reasoningOpen} onToggle={onToggleReasoning} t={t} />
            </div>
          )}
        </div>
      )}

      {reasoningOpen && tp.reasoning && (
        <div style={{
          paddingLeft: 36,
          paddingRight: 4,
          marginTop: 4,
          fontSize: 10,
          lineHeight: 1.5,
          color: t.textMuted,
          opacity: 0.6,
        }}>
          {tp.reasoning}
        </div>
      )}
    </div>
  );
}

function ThoughtStrip({ text, t }: { text: string; t: Tokens }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ height: open ? "auto" : THOUGHT_H, minHeight: THOUGHT_H, paddingLeft: 22, boxSizing: "border-box" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: "none", border: "none", cursor: "pointer", padding: "6px 0",
          fontSize: 11, color: t.accent,
        }}
      >
        <Sparkles size={11} />
        {open ? "Hide" : "Why this schedule"}
      </button>
      {open && (
        <p style={{
          margin: "0 0 8px", fontSize: 11, color: t.textMuted, lineHeight: 1.55,
          fontStyle: "italic",
        }}>
          {text}
        </p>
      )}
    </div>
  );
}

function formatDayLabel(dayIndex: number): string {
  const d = new Date(ORIGIN);
  d.setDate(d.getDate() + dayIndex);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTimeLabel(totalMinutes: number): string {
  const h24 = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const h12 = h24 % 12 || 12;
  const suffix = h24 < 12 ? "am" : "pm";
  if (m === 0) return `${h12}${suffix}`;
  return `${h12}:${m.toString().padStart(2, "0")}${suffix}`;
}

type TimelineZoomTier = "week" | "day" | "hour" | "halfHour";

function getTimelineZoomTier(dayW: number): TimelineZoomTier {
  if (dayW < 28) return "week";
  if (dayW < 96) return "day";
  if (dayW < 288) return "hour";
  return "halfHour";
}

function timelineHeaderHeight(dayW: number): number {
  const tier = getTimelineZoomTier(dayW);
  if (tier === "halfHour") return 30;
  if (tier === "hour") return 24;
  return 20;
}

function timelineZoomLabel(dayW: number): string {
  const tier = getTimelineZoomTier(dayW);
  if (tier === "halfHour") return "30m";
  if (tier === "hour") return "1h";
  if (tier === "day") return "Day";
  return "Week";
}

function TimelineGrid({ t, dayW }: { t: Tokens; dayW: number }) {
  const tier = getTimelineZoomTier(dayW);
  const lines: ReactNode[] = [];
  const labels: ReactNode[] = [];

  const vline = (key: string, left: number, color: string, opacity = 1) => (
    <div
      key={key}
      style={{
        position: "absolute",
        left,
        top: 0,
        bottom: 0,
        width: 1,
        background: color,
        opacity,
        pointerEvents: "none",
      }}
    />
  );

  if (tier === "week") {
    WEEKS.forEach((w) => {
      lines.push(vline(w.label, w.day * dayW, t.borderLight));
      labels.push(
        <span
          key={`${w.label}-lbl`}
          style={{
            position: "absolute",
            left: w.day * dayW + 4,
            top: 4,
            fontSize: 10,
            color: t.textDim,
            whiteSpace: "nowrap",
          }}
        >
          {w.label}
        </span>,
      );
    });
    return <>{lines}{labels}</>;
  }

  const dayBoundary = t.border;
  const hourLine = t.borderLight;
  const halfHourLine = `${t.borderLight}55`;

  for (let d = 0; d <= TIMELINE_DAYS; d++) {
    lines.push(vline(`day-${d}`, d * dayW, dayBoundary, 0.55));
  }

  const dayLabelStep = dayW >= 72 ? 1 : dayW >= 40 ? 2 : 3;
  for (let d = 0; d < TIMELINE_DAYS; d += dayLabelStep) {
    labels.push(
      <span
        key={`day-lbl-${d}`}
        style={{
          position: "absolute",
          left: d * dayW + 4,
          top: 4,
          fontSize: 10,
          color: t.textDim,
          whiteSpace: "nowrap",
        }}
      >
        {formatDayLabel(d)}
      </span>,
    );
  }

  if (tier === "day") {
    return <>{lines}{labels}</>;
  }

  const hourStep = tier === "hour"
    ? (dayW >= 192 ? 1 : dayW >= 144 ? 2 : 3)
    : (dayW >= 576 ? 1 : dayW >= 384 ? 2 : 3);
  const labelEveryHours = tier === "halfHour"
    ? (dayW >= 576 ? 1 : 2)
    : hourStep;
  const minLabelPx = 28;

  for (let d = 0; d < TIMELINE_DAYS; d++) {
    for (let h = 0; h < 24; h += 1) {
      const left = (d + h / 24) * dayW;
      if (h > 0) {
        lines.push(vline(`hour-${d}-${h}`, left, hourLine, 0.85));
      }
      if (h % labelEveryHours === 0) {
        const slotPx = (dayW / 24) * labelEveryHours;
        if (slotPx >= minLabelPx) {
          labels.push(
            <span
              key={`hour-lbl-${d}-${h}`}
              style={{
                position: "absolute",
                left: left + 2,
                top: tier === "halfHour" ? 16 : 14,
                fontSize: 9,
                color: t.textDim,
                whiteSpace: "nowrap",
              }}
            >
              {formatTimeLabel(h * 60)}
            </span>,
          );
        }
      }
    }
  }

  if (tier === "halfHour") {
    for (let d = 0; d < TIMELINE_DAYS; d++) {
      for (let s = 1; s < JOURNEY_HALF_HOUR_SLOTS; s += 2) {
        const left = (d + s / JOURNEY_HALF_HOUR_SLOTS) * dayW;
        lines.push(vline(`half-${d}-${s}`, left, halfHourLine, 1));
      }
    }
  }

  return <>{lines}{labels}</>;
}

function TimelineRowGrid({
  rows,
  t,
  timelineW,
  expandedReasoning,
  revealedThoughts,
}: {
  rows: Row[];
  t: Tokens;
  timelineW: number;
  expandedReasoning: Set<string>;
  revealedThoughts: Set<string>;
}) {
  let y = 0;
  const lines: ReactNode[] = [];
  for (let i = 0; i < rows.length; i++) {
    const h = rowHeight(rows[i], expandedReasoning, revealedThoughts);
    lines.push(
      <div
        key={`hrow-${i}`}
        style={{
          position: "absolute",
          top: y + h,
          left: 0,
          width: timelineW,
          height: 1,
          background: t.borderLight,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />,
    );
    y += h;
  }
  return <>{lines}</>;
}

function ZoomButton({
  title,
  onClick,
  t,
  children,
}: {
  title: string;
  onClick: () => void;
  t: Tokens;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width: 24,
        height: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${t.borderLight}`,
        borderRadius: 4,
        background: "transparent",
        cursor: "pointer",
        color: t.textMuted,
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

export function JourneyTab({ t, clientId = "sarah" }: { t: Tokens; clientId?: string }) {
  const journey = useMemo(() => getClientJourney(clientId), [clientId]);
  const { sequences, ganttByGroup, sequenceIdAliases } = journey;

  const [openIds, setOpenIds] = useState<Set<string>>(() => initialOpenIdsFor(sequences));
  const [listWidth, setListWidth] = useState(DEFAULT_JOURNEY_LIST_WIDTH);
  const [dayWidth, setDayWidth] = useState(JOURNEY_DAY_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState<Set<string>>(() => new Set());
  const [revealedThoughts, setRevealedThoughts] = useState<Set<string>>(() => new Set());
  const [selectedTouchpointId, setSelectedTouchpointId] = useState<string | null>(null);
  const [nodeInspector, setNodeInspector] = useState<{ touchpointId: string; sequenceId: string } | null>(null);
  const { focusTouchpointId, setFocusTouchpointId } = useTouchpointFocus();
  const { getTaskByTouchpointId, toggleTaskStatus } = useTasks();

  useEffect(() => {
    setOpenIds(initialOpenIdsFor(sequences));
    setNodeInspector(null);
    setSelectedTouchpointId(null);
    setFocusTouchpointId(null);
  }, [clientId, sequences, setFocusTouchpointId]);

  useEffect(() => {
    setSelectedTouchpointId(focusTouchpointId);
  }, [focusTouchpointId]);

  useEffect(() => {
    if (!focusTouchpointId) return;
    const parentIds = findOpenIdsForActivityNode(focusTouchpointId, sequences, sequenceIdAliases);
    if (parentIds.length > 0) {
      setOpenIds((prev) => new Set([...prev, ...parentIds]));
    }
  }, [focusTouchpointId, sequences, sequenceIdAliases]);

  const allTouchpoints = sequences.flatMap((seq) => {
    if (seq.tree?.length) return collectTreeTouchpoints(seq.tree);
    return seq.touchpoints as Touchpoint[];
  });

  const formOwnerBarById = useMemo(() => buildFormOwnerBarMap(sequences), [sequences]);
  const sequenceGanttExtentById = useMemo(() => buildSequenceGanttExtentMap(sequences), [sequences]);

  const selectedTaskNode = selectedTouchpointId
    ? findTouchpointById(allTouchpoints, selectedTouchpointId)
    : null;

  const handleSelectTouchpoint = (id: string) => {
    setSelectedTouchpointId((prev) => {
      const next = prev === id ? null : id;
      setFocusTouchpointId(next);
      return next;
    });
  };

  const openNodeInspector = (touchpointId: string, sequenceId: string) => {
    if (!getNodeInspectorPayload(touchpointId, sequenceId)) return;
    const parentIds = findOpenIdsForActivityNode(touchpointId, sequences, sequenceIdAliases);
    if (parentIds.length > 0) {
      setOpenIds((prev) => new Set([...prev, ...parentIds]));
    }
    setNodeInspector({ touchpointId, sequenceId });
    setSelectedTouchpointId(touchpointId);
    setFocusTouchpointId(touchpointId);
  };

  const closeNodeInspector = () => {
    setNodeInspector(null);
    setSelectedTouchpointId(null);
    setFocusTouchpointId(null);
  };

  const nodeInspectorPayload = nodeInspector
    ? getNodeInspectorPayload(nodeInspector.touchpointId, nodeInspector.sequenceId)
    : null;

  const toggleReasoning = (id: string) => {
    setExpandedReasoning((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);
  const pinchRef = useRef<{ dist: number; dayW: number; midX: number } | null>(null);
  const dayWidthRef = useRef(dayWidth);
  dayWidthRef.current = dayWidth;

  const timelineW = TIMELINE_DAYS * dayWidth;
  const todayX = TODAY_DAY * dayWidth;
  const zoomPct = Math.round((dayWidth / JOURNEY_DAY_WIDTH) * 100);
  const zoomTierLabel = timelineZoomLabel(dayWidth);
  const headerH = timelineHeaderHeight(dayWidth);

  const clampDayWidth = (w: number) =>
    Math.min(MAX_JOURNEY_DAY_WIDTH, Math.max(MIN_JOURNEY_DAY_WIDTH, w));

  const applyZoomAt = useCallback((clientX: number, nextDayW: number) => {
    const el = rightScrollRef.current;
    const header = headerScrollRef.current;
    if (!el) return;
    const clamped = clampDayWidth(nextDayW);
    const rect = el.getBoundingClientRect();
    const pointerX = clientX - rect.left;
    const focalDay = (el.scrollLeft + pointerX) / dayWidthRef.current;

    setDayWidth(clamped);

    requestAnimationFrame(() => {
      const nextScroll = focalDay * clamped - pointerX;
      el.scrollLeft = Math.max(0, nextScroll);
      if (header) header.scrollLeft = el.scrollLeft;
    });
  }, []);

  const zoomBy = useCallback((factor: number, clientX?: number) => {
    const el = rightScrollRef.current;
    const x = clientX ?? (el ? el.getBoundingClientRect().left + el.clientWidth / 2 : 0);
    applyZoomAt(x, dayWidthRef.current * factor);
  }, [applyZoomAt]);

  const scrollToToday = useCallback(() => {
    const el = rightScrollRef.current;
    const header = headerScrollRef.current;
    if (!el) return;
    const target = todayX - el.clientWidth / 2;
    el.scrollLeft = Math.max(0, target);
    if (header) header.scrollLeft = el.scrollLeft;
  }, [todayX]);

  useEffect(() => {
    const attachWheel = (el: HTMLDivElement) => {
      const onWheel = (e: WheelEvent) => {
        const zoomGesture = e.ctrlKey || e.metaKey;
        if (zoomGesture) {
          e.preventDefault();
          const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
          applyZoomAt(e.clientX, dayWidthRef.current * factor);
          return;
        }
        if (e.shiftKey && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          const body = rightScrollRef.current;
          if (!body) return;
          body.scrollLeft += e.deltaY;
          if (headerScrollRef.current) headerScrollRef.current.scrollLeft = body.scrollLeft;
        }
      };
      el.addEventListener("wheel", onWheel, { passive: false });
      return () => el.removeEventListener("wheel", onWheel);
    };

    const body = rightScrollRef.current;
    const header = headerScrollRef.current;
    const cleanups = [body, header].filter(Boolean).map((el) => attachWheel(el!));
    return () => cleanups.forEach((fn) => fn());
  }, [applyZoomAt]);

  const onTimelineTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0]!, e.touches[1]!];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      pinchRef.current = { dist, dayW: dayWidthRef.current, midX: (a.clientX + b.clientX) / 2 };
    }
  };

  const onTimelineTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const [a, b] = [e.touches[0]!, e.touches[1]!];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const scale = dist / pinchRef.current.dist;
      const midX = (a.clientX + b.clientX) / 2;
      applyZoomAt(midX, pinchRef.current.dayW * scale);
    }
  };

  const onTimelineTouchEnd = () => {
    pinchRef.current = null;
  };

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const syncScroll = useCallback((source: "left" | "right") => {
    if (syncing.current) return;
    const left = leftScrollRef.current;
    const right = rightScrollRef.current;
    const header = headerScrollRef.current;
    if (!left || !right) return;
    syncing.current = true;
    if (source === "left") right.scrollTop = left.scrollTop;
    else left.scrollTop = right.scrollTop;
    if (header && source === "right") header.scrollLeft = right.scrollLeft;
    syncing.current = false;
  }, []);

  const syncHeaderScroll = useCallback(() => {
    if (syncing.current) return;
    const right = rightScrollRef.current;
    const header = headerScrollRef.current;
    if (!right || !header) return;
    syncing.current = true;
    right.scrollLeft = header.scrollLeft;
    syncing.current = false;
  }, []);

  const onResizeMouseDown = (e: ReactMouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = listWidth;

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      setListWidth(Math.min(MAX_JOURNEY_LIST_WIDTH, Math.max(MIN_JOURNEY_LIST_WIDTH, startW + delta)));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      setIsResizing(false);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    setIsResizing(true);
  };

  const toggleRevealThought = (stepId: string) => {
    setRevealedThoughts((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  const rows = buildRows(openIds, sequences);
  const engagementRowInView = useMemo(
    () => engagementRowInViewFromKinds(rows.map((row) => row.kind)),
    [rows],
  );
  const engagementTimelineInView = useMemo(() => {
    let sequenceBar = false;
    let attemptBand = false;
    let segmentBar = false;
    let eventMarker = false;
    let escalationBand = false;

    for (const row of rows) {
      if (row.kind === "nudgeGroup" && ganttByGroup[row.group.id]) sequenceBar = true;
      if (row.kind === "nudgeAttempt") attemptBand = true;
      if (row.kind === "nudgeFormVisit") segmentBar = true;
      if (row.kind === "nudgeEvent") eventMarker = true;
      if (row.kind === "nudgeEscalation") escalationBand = true;
      if (row.kind === "journeyTaskEscalation" && row.tp.barSegment) escalationBand = true;
      if (
        (row.kind === "nudgeChannel" || row.kind === "journeyStandalone") &&
        timelineChannelBarVisible(row, formOwnerBarById)
      ) {
        segmentBar = true;
      }
    }

    return {
      [ENGAGEMENT_SEQUENCE_BAR_HOLON.id]: sequenceBar,
      [ENGAGEMENT_ATTEMPT_BAND_HOLON.id]: attemptBand,
      [ENGAGEMENT_SEGMENT_BAR_HOLON.id]: segmentBar,
      [ENGAGEMENT_EVENT_MARKER_HOLON.id]: eventMarker,
      [ENGAGEMENT_ESCALATION_BAND_HOLON.id]: escalationBand,
    };
  }, [rows, ganttByGroup, formOwnerBarById]);
  const isSequenceBarHighlighted = useIsDocsTarget(ENGAGEMENT_SEQUENCE_BAR_HOLON.id);
  const isAttemptBandHighlighted = useIsDocsTarget(ENGAGEMENT_ATTEMPT_BAND_HOLON.id);
  const isSegmentBarHighlighted = useIsDocsTarget(ENGAGEMENT_SEGMENT_BAR_HOLON.id);
  const isEventMarkerHighlighted = useIsDocsTarget(ENGAGEMENT_EVENT_MARKER_HOLON.id);
  const isEscalationBandHighlighted = useIsDocsTarget(ENGAGEMENT_ESCALATION_BAND_HOLON.id);
  const totalBodyH = rows.reduce((sum, r) => sum + rowHeight(r, expandedReasoning, revealedThoughts), 0);

  const scrollToActivityNode = useCallback((nodeId: string) => {
    const layout = findRowLayout(rows, nodeId, expandedReasoning, revealedThoughts);
    const right = rightScrollRef.current;
    const left = leftScrollRef.current;
    const header = headerScrollRef.current;

    if (layout && right && left) {
      const targetTop = Math.max(0, layout.y - right.clientHeight / 2 + layout.h / 2);
      syncing.current = true;
      right.scrollTop = targetTop;
      left.scrollTop = targetTop;
      syncing.current = false;
    } else {
      document.getElementById(`activity-node-${nodeId}`)?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }

    const startPx = layout
      ? getRowTimeStartPx(layout.row, ganttByGroup, dayWidthRef.current, formOwnerBarById, sequenceGanttExtentById)
      : null;
    if (startPx != null && right) {
      const targetLeft = Math.max(0, startPx - right.clientWidth * 0.2);
      syncing.current = true;
      right.scrollLeft = targetLeft;
      if (header) header.scrollLeft = targetLeft;
      syncing.current = false;
    }
  }, [rows, expandedReasoning, revealedThoughts, ganttByGroup, formOwnerBarById, sequenceGanttExtentById]);

  useEffect(() => {
    if (!focusTouchpointId) return;
    const scrollTimer = window.setTimeout(() => {
      scrollToActivityNode(focusTouchpointId);
    }, 100);
    return () => window.clearTimeout(scrollTimer);
  }, [focusTouchpointId, rows, scrollToActivityNode]);

  const activeFocusId = focusTouchpointId;
  const activeFocusLayout = activeFocusId
    ? findRowLayout(rows, activeFocusId, expandedReasoning, revealedThoughts)
    : null;
  const activeFocusStartPx = activeFocusLayout
    ? getRowTimeStartPx(activeFocusLayout.row, ganttByGroup, dayWidth, formOwnerBarById, sequenceGanttExtentById)
    : null;

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      minHeight: 0,
      userSelect: isResizing ? "none" : "auto",
      position: "relative",
    }}>
      {/* Column headers */}
      <div style={{
        flexShrink: 0,
        display: "flex",
        borderBottom: `1px solid ${t.border}`,
        margin: "0 28px",
      }}>
        <div style={{
          width: listWidth,
          flexShrink: 0,
          padding: "8px 4px",
          fontSize: 10,
          fontWeight: 600,
          color: t.textDim,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          Engagement chart
        </div>
        <div style={{ width: 1, flexShrink: 0, background: t.borderLight }} />
        <div style={{
          flex: 1,
          minWidth: 0,
          padding: "4px 0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, paddingRight: 4 }}>
            <ZoomButton title="Zoom out" onClick={() => zoomBy(1 / 1.15)} t={t}>
              <ZoomOut size={12} />
            </ZoomButton>
            <span style={{ fontSize: 10, color: t.textDim, minWidth: 52, textAlign: "center" }}>
              {zoomPct}% · {zoomTierLabel}
            </span>
            <ZoomButton title="Zoom in" onClick={() => zoomBy(1.15)} t={t}>
              <ZoomIn size={12} />
            </ZoomButton>
            <button
              type="button"
              onClick={scrollToToday}
              title="Scroll to today"
              style={{
                fontSize: 10,
                padding: "3px 8px",
                borderRadius: 4,
                border: `1px solid ${t.borderLight}`,
                background: "transparent",
                color: t.textMuted,
                cursor: "pointer",
              }}
            >
              Today
            </button>
          </div>
          <div
            ref={headerScrollRef}
            onScroll={syncHeaderScroll}
            style={{ overflowX: "auto", marginRight: 4, overflowY: "hidden" }}
          >
            <div style={{ position: "relative", width: timelineW, height: headerH }}>
              <TimelineGrid t={t} dayW={dayWidth} />
            </div>
          </div>
        </div>
      </div>

      {/* Split body */}
      <div style={{ flex: 1, display: "flex", minHeight: 0, margin: "0 28px" }}>
        {/* Left — touchpoint list */}
        <HolonBoundary
          id={ENGAGEMENT_LIST_HOLON.id}
          label={ENGAGEMENT_LIST_HOLON.label}
          icon={ENGAGEMENT_LIST_HOLON.icon}
          order={ENGAGEMENT_LIST_HOLON.order}
          t={t}
          style={{
            width: listWidth,
            flexShrink: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <RegisterContentChildHolonsFromConfig
            children={ENGAGEMENT_LIST_ROW_HOLONS_LIST}
            inView={false}
            inViewById={engagementRowInView}
            t={t}
          />
        <div
          ref={leftScrollRef}
          onScroll={() => syncScroll("left")}
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {rows.map((row, i) => {
            const h = rowHeight(row, expandedReasoning, revealedThoughts);
            const shell = (content: ReactNode) => (
              <div key={leftRowKey(row, i)} style={journeyRowShellStyle(h)}>
                {content}
              </div>
            );

            if (row.kind === "thought") {
              return shell(<ThoughtStrip text={row.text} t={t} />);
            }
            if (row.kind === "nudgeGroup") {
              return shell(
                <NudgeGroupHeader
                  group={row.group}
                  open={row.open}
                  onToggle={() => toggle(row.group.id)}
                  t={t}
                />,
              );
            }
            if (row.kind === "nudgeAttempt") {
              return shell(
                <NudgeAttemptHeader
                  attempt={row.attempt}
                  open={row.open}
                  onToggle={() => toggle(row.attempt.id)}
                  depth={row.depth}
                  t={t}
                />,
              );
            }
            if (row.kind === "nudgeFormVisit") {
              const visitInspectable = !!getNodeInspectorPayload(row.visit.id, row.nudgeGroupId);
              return shell(
                <FormVisitTreeRow
                  visit={row.visit}
                  open={row.open}
                  onToggle={() => toggle(row.visit.id)}
                  depth={row.depth}
                  selected={nodeInspector?.touchpointId === row.visit.id}
                  onInspect={
                    visitInspectable
                      ? () => openNodeInspector(row.visit.id, row.nudgeGroupId)
                      : undefined
                  }
                  t={t}
                />,
              );
            }
            if (row.kind === "nudgeChannel") {
              return shell(
                <NudgeChannelHeader
                  tp={row.tp}
                  open={row.open}
                  onToggle={() => toggle(row.tp.id)}
                  onInspect={
                    isInspectableChannel(row.tp.channel)
                      ? () => openNodeInspector(row.tp.id, row.nudgeGroupId)
                      : undefined
                  }
                  depth={row.depth}
                  hasChildren={row.hasChildren}
                  sectionStyle={row.sectionStyle}
                  selected={nodeInspector?.touchpointId === row.tp.id || selectedTouchpointId === row.tp.id}
                  t={t}
                />,
              );
            }
            if (row.kind === "journeyStandalone") {
              return shell(
                <JourneyStandaloneRow
                  tp={row.tp}
                  open={row.open}
                  onToggle={() => toggle(row.tp.id)}
                  depth={row.depth}
                  hasChildren={row.hasChildren}
                  sectionStyle={row.sectionStyle}
                  t={t}
                />,
              );
            }
            if (row.kind === "journeyTaskEscalation") {
              return shell(
                <JourneyTaskEscalationRow
                  tp={row.tp}
                  depth={row.depth}
                  sectionStyle={row.sectionStyle}
                  t={t}
                />,
              );
            }
            if (row.kind === "nudgeEscalation") {
              return shell(
                <NudgeEscalationRow
                  id={row.id}
                  escalation={row.escalation}
                  open={row.open}
                  onToggle={() => toggle(row.id)}
                  depth={row.depth}
                  t={t}
                  revealedThoughts={revealedThoughts}
                  onRevealThought={toggleRevealThought}
                />,
              );
            }
            if (row.kind === "nudgeEvent") {
              return shell(
                <NudgeEventRow
                  tp={row.tp}
                  depth={row.depth}
                  sectionStyle={row.sectionStyle}
                  t={t}
                />,
              );
            }
            if (row.kind === "collapsed") {
              return shell(
                <div style={{ fontSize: 11, color: t.textDim, paddingLeft: 22, height: "100%", display: "flex", alignItems: "center" }}>
                  {row.text}
                </div>,
              );
            }
            return shell(
              <TaskListCell
                tp={row.tp}
                depth={row.depth}
                t={t}
                reasoningOpen={expandedReasoning.has(row.tp.id)}
                onToggleReasoning={() => toggleReasoning(row.tp.id)}
                selected={selectedTouchpointId === row.tp.id}
                onSelect={handleSelectTouchpoint}
                linkedTaskStatus={getTaskByTouchpointId(row.tp.id)?.status}
                inNudgeGroup={row.inNudgeGroup}
              />,
            );
          })}
        </div>
        </HolonBoundary>

        {/* Resize handle */}
        <div
          onMouseDown={onResizeMouseDown}
          style={{
            width: 5,
            flexShrink: 0,
            cursor: "ew-resize",
            background: isResizing ? t.accent : "transparent",
            transition: isResizing ? "none" : "background 0.1s",
            margin: "0 1px",
          }}
          onMouseEnter={(e) => { if (!isResizing) (e.currentTarget as HTMLElement).style.background = `${t.accent}44`; }}
          onMouseLeave={(e) => { if (!isResizing) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        />

        {/* Right — timeline */}
        <HolonBoundary
          id={ENGAGEMENT_TIMELINE_HOLON.id}
          label={ENGAGEMENT_TIMELINE_HOLON.label}
          icon={ENGAGEMENT_TIMELINE_HOLON.icon}
          order={ENGAGEMENT_TIMELINE_HOLON.order}
          t={t}
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <RegisterContentChildHolonsFromConfig
            children={ENGAGEMENT_TIMELINE_CHILD_HOLONS_LIST}
            inView={false}
            inViewById={engagementTimelineInView}
            t={t}
          />
        <div
          ref={rightScrollRef}
          onScroll={() => syncScroll("right")}
          onTouchStart={onTimelineTouchStart}
          onTouchMove={onTimelineTouchMove}
          onTouchEnd={onTimelineTouchEnd}
          onTouchCancel={onTimelineTouchEnd}
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "auto",
            touchAction: "pan-x pan-y",
          }}
        >
          <div style={{ position: "relative", width: timelineW, minHeight: totalBodyH + 120 }}>
            <TimelineGrid t={t} dayW={dayWidth} />
            <TimelineRowGrid
              rows={rows}
              t={t}
              timelineW={timelineW}
              expandedReasoning={expandedReasoning}
              revealedThoughts={revealedThoughts}
            />

            {/* History band label */}
            <div style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 4.5 * dayWidth,
              height: "100%",
              background: `${t.textDim}08`,
              borderRight: `1px dashed ${t.borderLight}`,
              pointerEvents: "none",
              zIndex: 0,
            }}>
              <span style={{
                position: "sticky",
                top: 8,
                display: "block",
                padding: "0 6px",
                fontSize: 9,
                color: t.textDim,
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                letterSpacing: "0.06em",
              }}>
                Mar 2024
              </span>
            </div>

            {/* Dormant band label */}
            <div style={{
              position: "absolute",
              left: 44 * dayWidth,
              top: 0,
              width: 12 * dayWidth,
              height: "100%",
              background: `${t.amber}06`,
              borderLeft: `1px dashed ${t.amber}33`,
              pointerEvents: "none",
              zIndex: 0,
            }}>
              <span style={{
                position: "absolute",
                top: 8,
                left: 8,
                fontSize: 9,
                fontWeight: 600,
                color: t.amber,
                opacity: 0.7,
              }}>
                Reactivation template · on trigger
              </span>
            </div>

            {/* Row bars */}
            {(() => {
              let y = 0;
              return rows.map((row, i) => {
                const h = rowHeight(row, expandedReasoning, revealedThoughts);
                const el = (() => {
                  if (row.kind === "nudgeGroup") {
                    const gantt = ganttByGroup[row.group.id];
                    const ganttData = gantt
                      ? ganttWithTreeExtent(gantt, sequenceGanttExtentById.get(row.group.id))
                      : null;
                    return (
                      <div
                        key={`tg-${row.group.id}`}
                        style={{
                          ...timelineRowShellStyle(h),
                          top: y,
                          width: timelineW,
                        }}
                      >
                        {ganttData && (
                          <NudgeGanttBar
                            data={ganttData}
                            dayW={dayWidth}
                            t={t}
                            rowH={h}
                            docsHighlighted={isSequenceBarHighlighted}
                          />
                        )}
                      </div>
                    );
                  }
                  if (row.kind === "nudgeAttempt") {
                    const color = ATTEMPT_BAR_COLORS[row.attempt.colorIndex % ATTEMPT_BAR_COLORS.length];
                    const left = row.attempt.startDay * dayWidth;
                    const width = Math.max((row.attempt.endDay - row.attempt.startDay) * dayWidth, 4);
                    return (
                      <div
                        key={`ta-${row.attempt.id}`}
                        style={{
                          ...timelineRowShellStyle(h),
                          top: y,
                          width: timelineW,
                        }}
                      >
                        <HoverGanttBand
                          left={left}
                          width={width}
                          rowH={h}
                          color={color}
                          label={row.attempt.label}
                          variant="attempt"
                          docsHighlighted={isAttemptBandHighlighted}
                          t={t}
                        />
                      </div>
                    );
                  }
                  if (row.kind === "nudgeFormVisit") {
                    const visitInspectable = !!getNodeInspectorPayload(row.visit.id, row.nudgeGroupId);
                    return (
                      <div
                        key={`tfv-${row.visit.id}`}
                        role={visitInspectable ? "button" : undefined}
                        tabIndex={visitInspectable ? 0 : undefined}
                        onClick={
                          visitInspectable
                            ? () => openNodeInspector(row.visit.id, row.nudgeGroupId)
                            : undefined
                        }
                        onKeyDown={
                          visitInspectable
                            ? (e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  openNodeInspector(row.visit.id, row.nudgeGroupId);
                                }
                              }
                            : undefined
                        }
                        style={{
                          ...timelineRowShellStyle(h),
                          top: y,
                          width: timelineW,
                          cursor: visitInspectable ? "pointer" : undefined,
                        }}
                      >
                        <ChannelMiniGanttBar
                          segments={[{
                            startDay: row.visit.startDay,
                            endDay: row.visit.endDay,
                            colorIndex: row.visit.origin === "prior_email" ? 1 : 0,
                          }]}
                          labels={["Form visit"]}
                          dayW={dayWidth}
                          rowH={h}
                          interactive
                          docsHighlighted={isSegmentBarHighlighted}
                          onSegmentClick={visitInspectable ? () => openNodeInspector(row.visit.id, row.nudgeGroupId) : undefined}
                          selected={nodeInspector?.touchpointId === row.visit.id}
                          t={t}
                        />
                      </div>
                    );
                  }
                  if (row.kind === "nudgeChannel" || row.kind === "journeyStandalone") {
                    const segments =
                      row.kind === "nudgeChannel" &&
                      row.tp.channel === "form" &&
                      formOwnerBarById.has(row.tp.id)
                        ? [formOwnerBarById.get(row.tp.id)!]
                        : row.tp.barSegment
                          ? [row.tp.barSegment]
                          : [];
                    const emailBarClickable =
                      row.kind === "nudgeChannel" &&
                      isInspectableChannel(row.tp.channel) &&
                      !!getNodeInspectorPayload(row.tp.id, row.nudgeGroupId);
                    return (
                      <div
                        key={`tc-${row.tp.id}`}
                        role={emailBarClickable ? "button" : undefined}
                        tabIndex={emailBarClickable ? 0 : undefined}
                        onClick={
                          emailBarClickable
                            ? () => openNodeInspector(row.tp.id, row.nudgeGroupId)
                            : undefined
                        }
                        onKeyDown={
                          emailBarClickable
                            ? (e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  openNodeInspector(row.tp.id, row.nudgeGroupId);
                                }
                              }
                            : undefined
                        }
                        style={{
                          ...timelineRowShellStyle(h),
                          top: y,
                          width: timelineW,
                          cursor: emailBarClickable ? "pointer" : undefined,
                        }}
                      >
                        {segments.length > 0 && (
                          <ChannelMiniGanttBar
                            segments={segments}
                            labels={[row.tp.label]}
                            dayW={dayWidth}
                            rowH={h}
                            interactive
                            docsHighlighted={isSegmentBarHighlighted}
                            onSegmentClick={emailBarClickable ? () => openNodeInspector(row.tp.id, row.nudgeGroupId) : undefined}
                            selected={nodeInspector?.touchpointId === row.tp.id}
                            t={t}
                          />
                        )}
                      </div>
                    );
                  }
                  if (row.kind === "journeyTaskEscalation") {
                    const seg = row.tp.barSegment;
                    return (
                      <div
                        key={`tt-${row.tp.id}`}
                        style={{
                          ...timelineRowShellStyle(h),
                          top: y,
                          width: timelineW,
                        }}
                      >
                        {seg && (
                          <HoverGanttBand
                            left={seg.startDay * dayWidth}
                            width={Math.max((seg.endDay - seg.startDay) * dayWidth, 4)}
                            rowH={h}
                            color={t.textDim}
                            label={row.tp.label}
                            variant="armed"
                            docsHighlighted={isEscalationBandHighlighted}
                            t={t}
                          />
                        )}
                      </div>
                    );
                  }
                  if (row.kind === "nudgeEscalation") {
                    const left = row.escalation.waitStartDay * dayWidth;
                    const width = Math.max((row.escalation.waitEndDay - row.escalation.waitStartDay) * dayWidth, 4);
                    return (
                      <div
                        key={`te-${row.id}`}
                        style={{
                          ...timelineRowShellStyle(h),
                          top: y,
                          width: timelineW,
                        }}
                      >
                        <HoverGanttBand
                          left={left}
                          width={width}
                          rowH={h}
                          color={t.amber}
                          label={row.escalation.scheduledLabel}
                          variant="armed"
                          docsHighlighted={isEscalationBandHighlighted}
                          t={t}
                        />
                      </div>
                    );
                  }
                  if (row.kind === "nudgeEvent") {
                    return (
                      <div
                        key={`tev-${row.tp.id}`}
                        style={{
                          ...timelineRowShellStyle(h),
                          top: y,
                          width: timelineW,
                        }}
                      >
                        <EventTimelineMarker
                          atDay={row.tp.startDay}
                          dayW={dayWidth}
                          t={t}
                          rowH={h}
                          docsHighlighted={isEventMarkerHighlighted}
                          variant={row.sectionStyle === "historical" ? "historical" : row.sectionStyle === "armed" ? "armed" : "default"}
                        />
                      </div>
                    );
                  }
                  if (row.kind === "task") {
                    return (
                      <div
                        key={row.tp.id}
                        style={{
                          ...timelineRowShellStyle(h),
                          top: y,
                          width: timelineW,
                        }}
                      >
                        <TimelineBar
                          tp={row.tp}
                          t={t}
                          dayW={dayWidth}
                          rowH={h}
                          selected={selectedTouchpointId === row.tp.id}
                          onSelect={handleSelectTouchpoint}
                          linkedTaskStatus={getTaskByTouchpointId(row.tp.id)?.status}
                        />
                      </div>
                    );
                  }
                  return (
                    <div
                      key={`sp-${i}`}
                      style={{
                        ...timelineRowShellStyle(h),
                        top: y,
                        width: timelineW,
                      }}
                    />
                  );
                })();
                y += h;
                return el;
              });
            })()}

            {activeFocusLayout && activeFocusStartPx != null && (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: activeFocusLayout.y,
                    left: 0,
                    width: timelineW,
                    height: activeFocusLayout.h,
                    background: `${t.accent}12`,
                    pointerEvents: "none",
                    zIndex: 4,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: activeFocusStartPx,
                    top: 0,
                    height: totalBodyH,
                    width: 2,
                    background: t.accent,
                    zIndex: 6,
                    pointerEvents: "none",
                  }}
                />
              </>
            )}
          </div>
        </div>
        </HolonBoundary>
      </div>

      <div style={{
        flexShrink: 0,
        display: "flex",
        flexWrap: "wrap",
        gap: "10px 18px",
        margin: "0 28px",
        padding: "10px 0 14px",
        borderTop: `1px solid ${t.borderLight}`,
      }}>
        {[
          { label: "Historical", style: { background: HISTORICAL_TEAL, opacity: 0.55 } },
          { label: "Active sequence", style: { background: t.accent } },
          { label: "Armed template", style: { background: "transparent", border: `1px dashed ${t.border}` } },
          { label: "Waiting window", style: { background: `${t.amber}14`, border: `1px dashed ${t.amber}` } },
          { label: "Attempt 1", style: { background: ATTEMPT_BAR_COLORS[0] } },
          { label: "Attempt 2", style: { background: ATTEMPT_BAR_COLORS[1] } },
          { label: "Attempt 3", style: { background: ATTEMPT_BAR_COLORS[2] } },
        ].map(({ label, style }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 20, height: 10, borderRadius: 3, ...style }} />
            <span style={{ fontSize: 10, color: t.textDim }}>{label}</span>
          </div>
        ))}
      </div>

      {nodeInspectorPayload && nodeInspector && (
        <EngagementNodePanel
          data={nodeInspectorPayload}
          t={t}
          onClose={() => {
            closeNodeInspector();
          }}
          onNavigate={(touchpointId) => openNodeInspector(touchpointId, nodeInspector.sequenceId)}
        />
      )}

      {selectedTaskNode && isTouchpointClickable(selectedTaskNode.id) && !nodeInspectorPayload && (() => {
        const linkedTask = getTaskByTouchpointId(selectedTaskNode.id);
        if (!linkedTask) return null;
        return (
        <div style={{
          position: "absolute",
          top: 72,
          right: 28,
          zIndex: 30,
        }}>
          <TaskTouchpointPanel
            task={toTaskTouchpointData(selectedTaskNode, linkedTask)}
            t={t}
            onClose={() => {
              setSelectedTouchpointId(null);
              setFocusTouchpointId(null);
            }}
            onToggleComplete={() => toggleTaskStatus(linkedTask.id)}
          />
        </div>
        );
      })()}
    </div>
  );
}
