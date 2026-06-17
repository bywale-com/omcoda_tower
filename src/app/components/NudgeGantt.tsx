import type { CSSProperties } from "react";
import { useState } from "react";
import type { Tokens } from "./tokens";
import {
  ATTEMPT_BAR_COLORS,
  HISTORICAL_TEAL,
  type ChannelBarSegment,
  type JourneyGanttData,
  type JourneyMarker,
  type JourneySectionStyle,
} from "../data/journeyTree";

const PARENT_BAR_H = 10;

function barColor(colorIndex: number, variant?: ChannelBarSegment["variant"]): string {
  if (variant === "historical") return HISTORICAL_TEAL;
  if (variant === "armed") return ATTEMPT_BAR_COLORS[colorIndex % ATTEMPT_BAR_COLORS.length];
  return ATTEMPT_BAR_COLORS[colorIndex % ATTEMPT_BAR_COLORS.length];
}

function groupBarStyle(sectionStyle: JourneySectionStyle | undefined, t: Tokens): CSSProperties {
  if (sectionStyle === "historical") {
    return {
      border: `1px solid ${HISTORICAL_TEAL}`,
      background: HISTORICAL_TEAL,
      opacity: 0.55,
    };
  }
  if (sectionStyle === "armed") {
    return {
      border: `1px dashed ${t.border}`,
      background: "transparent",
    };
  }
  return {
    border: `1px solid ${t.accent}`,
    background: t.accent,
  };
}

export function NudgeGanttBar({
  data,
  dayW,
  t,
  rowH,
}: {
  data: JourneyGanttData;
  dayW: number;
  t: Tokens;
  rowH?: number;
}) {
  const left = data.startDay * dayW;
  const width = Math.max((data.endDay - data.startDay) * dayW, 40);
  const toX = (day: number) => (day - data.startDay) * dayW;
  const barH = rowH ? Math.max(rowH - 6, PARENT_BAR_H) : PARENT_BAR_H;
  const sectionStyle = data.sectionStyle ?? "active";

  const allTicks: { id: string; atDay: number; kind: JourneyMarker["kind"]; label: string }[] = [
    ...data.markers,
    ...data.escalations.map((e, i) => ({
      id: `esc-${i}`,
      atDay: e.waitEndDay,
      kind: "escalation" as const,
      label: `${e.rule} → ${e.scheduledLabel}`,
    })),
  ].sort((a, b) => a.atDay - b.atDay);

  return (
    <div
      title={`${data.markers.length} criteria events · ${data.escalations.length} escalations`}
      style={{
        position: "absolute",
        left,
        width,
        top: 0,
        height: rowH ?? PARENT_BAR_H + 8,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "100%",
          borderRadius: 3,
          boxSizing: "border-box",
          ...groupBarStyle(sectionStyle, t),
        }}
      />

      {sectionStyle !== "armed" && allTicks.map((tick) => (
        <div
          key={tick.id}
          title={tick.label}
          style={{
            position: "absolute",
            left: toX(tick.atDay) - 1,
            top: rowH ? "50%" : 3,
            transform: rowH ? "translateY(-50%)" : undefined,
            borderRadius: 1,
            width: 2,
            height: rowH ? barH : PARENT_BAR_H + 4,
            background: tick.kind === "escalation" ? t.amber : "#fff",
            opacity: sectionStyle === "historical" ? 0.7 : 1,
          }}
        />
      ))}
    </div>
  );
}

export function HoverGanttBand({
  left,
  width,
  rowH,
  color,
  label,
  variant = "default",
  selected,
  onClick,
  t,
}: {
  left: number;
  width: number;
  rowH: number;
  color: string;
  label?: string;
  variant?: ChannelBarSegment["variant"] | "attempt";
  selected?: boolean;
  onClick?: () => void;
  t: Tokens;
}) {
  const [hovered, setHovered] = useState(false);
  const armed = variant === "armed";
  const historical = variant === "historical";
  const attemptBand = variant === "attempt";
  const showLabel = hovered && !!label;

  return (
    <button
      type="button"
      title={!hovered ? label : undefined}
      disabled={!onClick}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        left,
        width: showLabel ? Math.max(width, Math.min(label.length * 6.5 + 20, 220)) : width,
        top: 0,
        height: rowH,
        background: armed ? "transparent" : attemptBand ? `${color}30` : color,
        border: armed ? `1px dashed ${color}` : `1px solid ${color}`,
        borderRadius: 3,
        boxSizing: "border-box",
        opacity: historical ? 0.55 : armed ? 0.85 : 1,
        zIndex: hovered || selected ? 12 : 2,
        transition: "width 120ms ease, box-shadow 120ms ease",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        padding: showLabel ? "0 8px" : 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        boxShadow: selected
          ? `0 0 0 2px ${t.textPrimary}`
          : hovered
            ? `0 2px 8px ${t.border}`
            : undefined,
        pointerEvents: "auto",
      }}
    >
      {showLabel && (
        <span style={{
          fontSize: 10,
          fontWeight: 500,
          color: armed || historical || attemptBand ? color : "#fff",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {label}
        </span>
      )}
    </button>
  );
}

export function ChannelMiniGanttBar({
  segments,
  dayW,
  rowH,
  labels,
  interactive,
  onSegmentClick,
  selected,
  t,
}: {
  segments: ChannelBarSegment[];
  dayW: number;
  rowH: number;
  labels?: string[];
  interactive?: boolean;
  onSegmentClick?: (index: number) => void;
  selected?: boolean;
  t?: Tokens;
}) {
  if (!segments.length) return null;

  if (interactive && t) {
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: rowH,
          pointerEvents: "none",
        }}
      >
        {segments.map((seg, i) => {
          const left = seg.startDay * dayW;
          const width = Math.max((seg.endDay - seg.startDay) * dayW, 4);
          const variant = seg.variant ?? "default";
          const color = barColor(seg.colorIndex, variant);
          return (
            <HoverGanttBand
              key={i}
              left={left}
              width={width}
              rowH={rowH}
              color={color}
              label={labels?.[i]}
              variant={variant}
              selected={selected}
              onClick={onSegmentClick ? () => onSegmentClick(i) : undefined}
              t={t}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: rowH,
        pointerEvents: "none",
      }}
    >
      {segments.map((seg, i) => {
        const left = seg.startDay * dayW;
        const width = Math.max((seg.endDay - seg.startDay) * dayW, 4);
        const variant = seg.variant ?? "default";
        const color = barColor(seg.colorIndex, variant);
        const armed = variant === "armed";

        return (
          <div
            key={i}
            title={`Band ${seg.colorIndex + 1}`}
            style={{
              position: "absolute",
              left,
              width,
              top: 0,
              height: "100%",
              background: armed ? "transparent" : color,
              border: armed ? `1px dashed ${color}` : `1px solid ${color}`,
              borderRadius: 3,
              boxSizing: "border-box",
              opacity: variant === "historical" ? 0.55 : armed ? 0.85 : 1,
            }}
          />
        );
      })}
    </div>
  );
}

/** Scheduled / waiting window — stays translucent */
export function WaitingDurationBar({
  waitStartDay,
  waitEndDay,
  dayW,
  rowH,
  t,
}: {
  waitStartDay: number;
  waitEndDay: number;
  dayW: number;
  rowH: number;
  t: Tokens;
}) {
  const left = waitStartDay * dayW;
  const width = Math.max((waitEndDay - waitStartDay) * dayW, 4);

  return (
    <div
      style={{
        position: "absolute",
        left,
        width,
        top: 0,
        height: rowH,
        background: `${t.amber}14`,
        border: `1px dashed ${t.amber}`,
        borderRadius: 3,
        boxSizing: "border-box",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 4px,
            ${t.amber}18 4px,
            ${t.amber}18 8px
          )`,
          borderRadius: 2,
        }}
      />
    </div>
  );
}

export function AttemptTimelineBand({
  startDay,
  endDay,
  colorIndex,
  dayW,
  rowH,
  variant = "default",
}: {
  startDay: number;
  endDay: number;
  colorIndex: number;
  dayW: number;
  rowH: number;
  variant?: ChannelBarSegment["variant"];
}) {
  const color = barColor(colorIndex, variant);
  const left = startDay * dayW;
  const width = Math.max((endDay - startDay) * dayW, 4);
  const armed = variant === "armed";

  return (
    <div
      style={{
        position: "absolute",
        left,
        width,
        top: 0,
        height: rowH,
        background: armed ? "transparent" : color,
        border: armed ? `1px dashed ${color}` : `1px solid ${color}`,
        borderRadius: 3,
        boxSizing: "border-box",
        pointerEvents: "none",
        opacity: variant === "historical" ? 0.55 : 1,
      }}
    />
  );
}

export function EventTimelineMarker({
  atDay,
  dayW,
  t,
  rowH,
  variant = "default",
}: {
  atDay: number;
  dayW: number;
  t: Tokens;
  rowH: number;
  variant?: ChannelBarSegment["variant"];
}) {
  const left = atDay * dayW;
  const width = Math.max(3, dayW / 48);
  const historical = variant === "historical";
  const armed = variant === "armed";

  return (
    <div
      style={{
        position: "absolute",
        left,
        top: 0,
        width,
        height: rowH,
        background: historical ? HISTORICAL_TEAL : armed ? "transparent" : t.textMuted,
        border: armed ? `1px dashed ${t.border}` : undefined,
        borderRadius: 2,
        pointerEvents: "none",
        opacity: historical ? 0.55 : armed ? 0.5 : 1,
      }}
    />
  );
}

export function GhostDurationBar({
  startDay,
  endDay,
  dayW,
  rowH,
  t,
}: {
  startDay: number;
  endDay: number;
  dayW: number;
  rowH: number;
  t: Tokens;
}) {
  const left = startDay * dayW;
  const width = Math.max((endDay - startDay) * dayW, 4);

  return (
    <div
      style={{
        position: "absolute",
        left,
        width,
        top: 0,
        height: rowH,
        background: "transparent",
        border: `1px dashed ${t.border}`,
        borderRadius: 3,
        boxSizing: "border-box",
        pointerEvents: "none",
        opacity: 0.75,
      }}
    />
  );
}
