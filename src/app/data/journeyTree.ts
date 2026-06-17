/** Shared journey tree types — Opt-in, Nudges, Reactivation use the same structure */

export type JourneyChannel = "email" | "sms" | "call" | "visit" | "meeting" | "task" | "system" | "form";

export type JourneySectionStyle = "active" | "historical" | "armed";

export const ATTEMPT_BAR_COLORS = ["#0d9488", "#d97706", "#ea580c"] as const;
export const HISTORICAL_TEAL = "#5eaea3";

export type JourneyMarkerKind =
  | "text_sent"
  | "text_delivered"
  | "text_opened"
  | "email_sent"
  | "email_delivered"
  | "email_opened"
  | "email_clicked"
  | "form_opened"
  | "form_submitted"
  | "escalation";

export type JourneyMarker = {
  id: string;
  kind: JourneyMarkerKind;
  label: string;
  atDay: number;
};

export type ThoughtStep = {
  id: string;
  durationSec: number;
  label: string;
  rationale: string;
};

export type JourneyEscalation = {
  waitStartDay: number;
  waitEndDay: number;
  rule: string;
  scheduledLabel: string;
  thoughtChain: ThoughtStep[];
};

export type ChannelBarSegment = {
  startDay: number;
  endDay: number;
  colorIndex: number;
  variant?: JourneySectionStyle | "default";
};

export type JourneyGanttData = {
  groupId: string;
  startDay: number;
  endDay: number;
  sectionStyle?: JourneySectionStyle;
  attemptBands: { id: string; colorIndex: number; startDay: number; endDay: number }[];
  markers: JourneyMarker[];
  escalations: JourneyEscalation[];
  channelBars: {
    text: ChannelBarSegment[];
    email: ChannelBarSegment[];
    form: ChannelBarSegment[];
  };
};

export type JourneyTouchpoint = {
  id: string;
  label: string;
  channel: JourneyChannel;
  status: "done" | "scheduled" | "conditional" | "ghost" | "active" | "historical" | "reactive";
  startDay: number;
  spanDays: number;
  defaultOpen?: boolean;
  dateLabel?: string;
  tags?: string[];
  taskAssignee?: string;
  engagementSignals?: {
    show: ("sent" | "opened" | "started" | "clicked" | "replied" | "submitted")[];
    sent?: "met" | "unmet" | "inactive";
    opened?: "met" | "unmet" | "inactive";
    started?: "met" | "unmet" | "inactive";
    clicked?: "met" | "unmet" | "inactive";
    replied?: "met" | "unmet" | "inactive";
    submitted?: "met" | "unmet" | "inactive";
  };
  barSegment?: ChannelBarSegment;
  channelPhase?: "idle" | "active" | "complete";
};

export type JourneyAttemptRow = {
  id: string;
  label: string;
  attemptNum: number;
  colorIndex: number;
  defaultOpen?: boolean;
  startDay: number;
  endDay: number;
};

/** How the user entered the form session (always owned under Form in the tree). */
export type FormVisitOrigin = "funnel" | "prior_email";

export type FormVisitSignalState = "met" | "unmet" | "inactive";

/** Per-visit engagement: opened → started → submitted (or abandoned). */
export type JourneyFormVisitSignals = {
  opened: FormVisitSignalState;
  started: FormVisitSignalState;
  submitted: FormVisitSignalState;
};

export type JourneyFormVisitRow = {
  id: string;
  label: string;
  visitNum: number;
  origin: FormVisitOrigin;
  /** Email touchpoint that carried the form link (funnel = active send; prior_email = any earlier email). */
  sourceEmailId?: string;
  sourceEmailLabel?: string;
  signals: JourneyFormVisitSignals;
  startDay: number;
  endDay: number;
  defaultOpen?: boolean;
};

export type JourneyTreeNode =
  | {
      kind: "channel";
      touchpoint: JourneyTouchpoint;
      events: JourneyTouchpoint[];
      nested: JourneyTreeNode[];
    }
  | {
      kind: "standalone";
      touchpoint: JourneyTouchpoint;
      events: JourneyTouchpoint[];
      nested: JourneyTreeNode[];
    }
  | {
      kind: "attempt";
      attempt: JourneyAttemptRow;
      nested: JourneyTreeNode[];
    }
  | { kind: "formVisit"; visit: JourneyFormVisitRow; nested: JourneyTreeNode[] }
  | { kind: "escalation"; id: string; escalation: JourneyEscalation }
  | { kind: "taskEscalation"; id: string; touchpoint: JourneyTouchpoint }
  | { kind: "event"; touchpoint: JourneyTouchpoint };

export type JourneyGroup = {
  id: string;
  label: string;
  defaultOpen: boolean;
  badgeLetter?: string;
  status?: "active" | "complete" | "armed";
  sectionStyle?: JourneySectionStyle;
  tree?: JourneyTreeNode[];
  touchpoints: JourneyTouchpoint[];
};

function treeNodeId(node: JourneyTreeNode): string | null {
  if (node.kind === "channel" || node.kind === "standalone") return node.touchpoint.id;
  if (node.kind === "attempt") return node.attempt.id;
  if (node.kind === "formVisit") return node.visit.id;
  if (node.kind === "escalation" || node.kind === "taskEscalation") return node.id;
  if (node.kind === "event") return node.touchpoint.id;
  return null;
}

export function journeyTreeContainsId(nodes: JourneyTreeNode[], id: string): boolean {
  for (const node of nodes) {
    if (treeNodeId(node) === id) return true;
    if (node.kind === "channel" || node.kind === "standalone") {
      if (node.events.some((e) => e.id === id)) return true;
      if (journeyTreeContainsId(node.nested, id)) return true;
    }
    if (node.kind === "attempt" && journeyTreeContainsId(node.nested, id)) return true;
    if (node.kind === "formVisit" && node.visit.id === id) return true;
    if (node.kind === "formVisit" && journeyTreeContainsId(node.nested, id)) return true;
  }
  return false;
}

export function collectDefaultOpenIds(nodes: JourneyTreeNode[], ids: Set<string>): void {
  for (const node of nodes) {
    if (node.kind === "channel" || node.kind === "standalone") {
      if (node.touchpoint.defaultOpen) ids.add(node.touchpoint.id);
      collectDefaultOpenIds(node.nested, ids);
    } else if (node.kind === "attempt") {
      if (node.attempt.defaultOpen) ids.add(node.attempt.id);
      collectDefaultOpenIds(node.nested, ids);
    }
  }
}

export function findTreePathToId(
  nodes: JourneyTreeNode[],
  targetId: string,
  ancestors: string[] = [],
): string[] | null {
  for (const node of nodes) {
    const id = treeNodeId(node);
    if (!id) continue;
    const path = [...ancestors, id];
    if (id === targetId) return path;
    if (node.kind === "channel" || node.kind === "standalone") {
      for (const ev of node.events) {
        if (ev.id === targetId) return [...path, ev.id];
      }
      const found = findTreePathToId(node.nested, targetId, path);
      if (found) return found;
    }
    if (node.kind === "attempt") {
      const found = findTreePathToId(node.nested, targetId, path);
      if (found) return found;
    }
    if (node.kind === "formVisit" && node.visit.id === targetId) return path;
    if (node.kind === "formVisit") {
      const found = findTreePathToId(node.nested, targetId, path);
      if (found) return found;
    }
  }
  return null;
}

export type JourneyTimeExtent = { startDay: number; endDay: number };

function collectTimeDaysFromNode(node: JourneyTreeNode, days: number[]): void {
  switch (node.kind) {
    case "channel":
    case "standalone": {
      const tp = node.touchpoint;
      days.push(tp.startDay, tp.startDay + tp.spanDays);
      if (tp.barSegment) {
        days.push(tp.barSegment.startDay, tp.barSegment.endDay);
      }
      for (const ev of node.events) {
        days.push(ev.startDay, ev.startDay + ev.spanDays);
      }
      for (const child of node.nested) collectTimeDaysFromNode(child, days);
      break;
    }
    case "attempt":
      days.push(node.attempt.startDay, node.attempt.endDay);
      for (const child of node.nested) collectTimeDaysFromNode(child, days);
      break;
    case "formVisit":
      days.push(node.visit.startDay, node.visit.endDay);
      for (const child of node.nested) collectTimeDaysFromNode(child, days);
      break;
    case "escalation":
      days.push(node.escalation.waitStartDay, node.escalation.waitEndDay);
      break;
    case "taskEscalation":
    case "event":
      days.push(node.touchpoint.startDay, node.touchpoint.startDay + node.touchpoint.spanDays);
      break;
  }
}

/** Min/max day index from all nested tree content (events, attempts, visits, channels, escalations). */
export function journeyNestedTimeExtent(
  node: Extract<JourneyTreeNode, { kind: "channel" | "standalone" }>,
): JourneyTimeExtent | null {
  const days: number[] = [];
  for (const ev of node.events) {
    days.push(ev.startDay, ev.startDay + ev.spanDays);
  }
  for (const child of node.nested) collectTimeDaysFromNode(child, days);
  if (!days.length) return null;
  return { startDay: Math.min(...days), endDay: Math.max(...days) };
}

/** Top-level Form owner row (attempts / visits nested beneath it). */
export function isFormOwnershipChannel(
  node: Extract<JourneyTreeNode, { kind: "channel" }>,
): boolean {
  if (node.touchpoint.channel !== "form") return false;
  return node.nested.some(
    (n) => n.kind === "attempt" || n.kind === "formVisit" || n.kind === "escalation",
  );
}

/**
 * Timeline bar for Form ownership: anchor start from link-click (barSegment.startDay),
 * end from the latest timestamp anywhere in the nested tree (task chart source of truth).
 */
export function journeyChannelOwnerBarSegment(
  node: Extract<JourneyTreeNode, { kind: "channel" }>,
): ChannelBarSegment | null {
  const base = node.touchpoint.barSegment;
  if (!base) return null;
  if (!isFormOwnershipChannel(node)) return base;

  const nested = journeyNestedTimeExtent(node);
  if (!nested) return base;

  return {
    ...base,
    startDay: Math.min(base.startDay, nested.startDay),
    endDay: nested.endDay,
  };
}

export function findChannelTreeNode(
  nodes: JourneyTreeNode[],
  touchpointId: string,
): Extract<JourneyTreeNode, { kind: "channel" }> | null {
  for (const node of nodes) {
    if (node.kind === "channel") {
      if (node.touchpoint.id === touchpointId) return node;
      const found = findChannelTreeNode(node.nested, touchpointId);
      if (found) return found;
    } else if (node.kind === "standalone") {
      const found = findChannelTreeNode(node.nested, touchpointId);
      if (found) return found;
    } else if (node.kind === "attempt" || node.kind === "formVisit") {
      const found = findChannelTreeNode(node.nested, touchpointId);
      if (found) return found;
    }
  }
  return null;
}

export function buildFormOwnerBarMap(sequences: JourneyGroup[]): Map<string, ChannelBarSegment> {
  const map = new Map<string, ChannelBarSegment>();

  const walk = (nodes: JourneyTreeNode[]) => {
    for (const node of nodes) {
      if (node.kind === "channel" && isFormOwnershipChannel(node)) {
        const seg = journeyChannelOwnerBarSegment(node);
        if (seg) map.set(node.touchpoint.id, seg);
      }
      if (node.kind === "channel" || node.kind === "standalone") {
        walk(node.nested);
      } else if (node.kind === "attempt" || node.kind === "formVisit") {
        walk(node.nested);
      }
    }
  };

  for (const seq of sequences) {
    if (seq.tree?.length) walk(seq.tree);
  }
  return map;
}

/** Min/max day index across an entire sequence tree (task chart source of truth). */
export function journeyTreeTimeExtent(nodes: JourneyTreeNode[]): JourneyTimeExtent | null {
  const days: number[] = [];
  for (const node of nodes) collectTimeDaysFromNode(node, days);
  if (!days.length) return null;
  return { startDay: Math.min(...days), endDay: Math.max(...days) };
}

export function buildSequenceGanttExtentMap(
  sequences: JourneyGroup[],
): Map<string, JourneyTimeExtent> {
  const map = new Map<string, JourneyTimeExtent>();
  for (const seq of sequences) {
    if (!seq.tree?.length) continue;
    const extent = journeyTreeTimeExtent(seq.tree);
    if (extent) map.set(seq.id, extent);
  }
  return map;
}

export function ganttWithTreeExtent(
  gantt: JourneyGanttData,
  extent: JourneyTimeExtent | undefined,
): JourneyGanttData {
  if (!extent) return gantt;
  return { ...gantt, startDay: extent.startDay, endDay: extent.endDay };
}
