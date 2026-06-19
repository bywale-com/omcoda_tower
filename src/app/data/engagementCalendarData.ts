import type { JourneyChannel, JourneyTreeNode, ChannelBarSegment } from "./journeyTree";
import { getClientJourney } from "./journeyByClient";
import {
  getNodeInspectorPayload,
  isInspectableChannel,
} from "../components/inspector/emailInspectorData";

/** Matches JourneyTab timeline origin (May 26 2026). */
export const JOURNEY_ORIGIN = new Date(2026, 4, 26);
export const JOURNEY_TODAY = new Date(2026, 5, 13);

export type CalendarEngagementNode = {
  id: string;
  sequenceId: string;
  label: string;
  channel: JourneyChannel;
  startDay: number;
  date: Date;
  colorIndex: number;
  variant: ChannelBarSegment["variant"] | "default";
  kind: "channel" | "formVisit";
};

export function dayIndexToDate(dayIndex: number): Date {
  const d = new Date(JOURNEY_ORIGIN);
  d.setDate(d.getDate() + Math.floor(dayIndex));
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function resolveChannelColorIndex(
  colorIndex: number | undefined,
  attemptColorIndex: number | null,
): number {
  if (colorIndex !== undefined) return colorIndex;
  if (attemptColorIndex !== null) return attemptColorIndex;
  return 0;
}

function walkTreeForCalendarNodes(
  nodes: JourneyTreeNode[],
  sequenceId: string,
  attemptColorIndex: number | null,
  out: CalendarEngagementNode[],
): void {
  for (const node of nodes) {
    if (node.kind === "attempt") {
      walkTreeForCalendarNodes(node.nested, sequenceId, node.attempt.colorIndex, out);
      continue;
    }

    if (node.kind === "channel" || node.kind === "standalone") {
      const tp = node.touchpoint;
      if (
        isInspectableChannel(tp.channel) &&
        getNodeInspectorPayload(tp.id, sequenceId)
      ) {
        out.push({
          id: tp.id,
          sequenceId,
          label: tp.label,
          channel: tp.channel,
          startDay: tp.startDay,
          date: dayIndexToDate(tp.startDay),
          colorIndex: resolveChannelColorIndex(tp.barSegment?.colorIndex, attemptColorIndex),
          variant: tp.barSegment?.variant ?? "default",
          kind: "channel",
        });
      }
      walkTreeForCalendarNodes(node.nested, sequenceId, attemptColorIndex, out);
      continue;
    }

    if (node.kind === "formVisit") {
      const visit = node.visit;
      if (getNodeInspectorPayload(visit.id, sequenceId)) {
        const colorIndex =
          visit.origin === "prior_email" ? 1 : resolveChannelColorIndex(undefined, attemptColorIndex);
        out.push({
          id: visit.id,
          sequenceId,
          label: visit.label,
          channel: "form",
          startDay: visit.startDay,
          date: dayIndexToDate(visit.startDay),
          colorIndex,
          variant: "default",
          kind: "formVisit",
        });
      }
      walkTreeForCalendarNodes(node.nested, sequenceId, attemptColorIndex, out);
    }
  }
}

export function collectCalendarEngagementNodes(clientId: string): CalendarEngagementNode[] {
  const { sequences } = getClientJourney(clientId);
  const nodes: CalendarEngagementNode[] = [];

  for (const seq of sequences) {
    if (!seq.tree?.length) continue;
    walkTreeForCalendarNodes(seq.tree, seq.id, null, nodes);
  }

  return nodes.sort((a, b) => a.startDay - b.startDay);
}

export function nodesForMonth(
  nodes: CalendarEngagementNode[],
  year: number,
  month: number,
): Map<number, CalendarEngagementNode[]> {
  const byDay = new Map<number, CalendarEngagementNode[]>();

  for (const node of nodes) {
    const d = node.date;
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;
    const day = d.getDate();
    const bucket = byDay.get(day) ?? [];
    bucket.push(node);
    byDay.set(day, bucket);
  }

  for (const [, bucket] of byDay) {
    bucket.sort((a, b) => a.startDay - b.startDay);
  }

  return byDay;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export const PLACEHOLDER_TASK_METRICS = [
  { label: "Complete", value: 12, color: "#22c55e" },
  { label: "Submitted for review", value: 8, color: "#3b82f6" },
  { label: "Needs improvements", value: 6, color: "#f97316" },
  { label: "Not Started", value: 19, color: "#9ca3af" },
] as const;
