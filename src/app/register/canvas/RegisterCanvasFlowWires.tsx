import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  useStore,
  ViewportPortal,
  type Position,
} from "@xyflow/react";
import type { Tokens } from "../../components/tokens";
import { CONSULTANT_WEB_APP_NODE } from "../systems/registry";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import { getRegisterFlowCanvasFocus } from "../flows/flowFocus";
import type { RegisterFlowCanvasWire } from "../flows/types";
import { wireScreenAnchors } from "./flowWireAnchors";
import { RegisterFlowWireMetaCard } from "./RegisterFlowWireMetaCard";
import { RegisterFlowWireStepBadge } from "./RegisterFlowWireStepBadge";

const BADGE_LIFT_PX = 26;
/** Minimum center-to-center spacing between badges in the same group. */
const BADGE_SLOT_PX = 34;
const BADGE_GROUP_GAP_PX = 10;
/** Minimum vertical separation between badge groups at the same wire midpoint. */
const MIN_GROUP_Y_SEP_PX = 30;

type WireGeometry = {
  wire: RegisterFlowCanvasWire;
  path: string;
  labelX: number;
  labelY: number;
};

type WireBadgeGroup = {
  key: string;
  labelX: number;
  labelY: number;
  side: "above" | "below";
  items: { wireId: string; order: { step: number; suffix?: string } }[];
};

type PositionedBadgeGroup = WireBadgeGroup & {
  badgeX: number;
  badgeY: number;
};

function wireEndpointKey(wire: RegisterFlowCanvasWire): string | null {
  const source =
    wire.sourceHolonId ?? wire.sourceSystemNodeId ?? wire.sourceTableNodeId;
  const target =
    wire.targetHolonId ?? wire.targetSystemNodeId ?? wire.targetTableNodeId;
  if (!source || !target) return null;
  return `${source}→${target}`;
}

function badgeSideForWire(wire: RegisterFlowCanvasWire): "above" | "below" {
  if (wire.sourceHolonId) return "above";
  if (
    wire.targetSystemNodeId === CONSULTANT_WEB_APP_NODE.id &&
    wire.sourceSystemNodeId != null
  ) {
    return "below";
  }
  return "above";
}

function buildWireBadgeGroups(geometries: WireGeometry[]): WireBadgeGroup[] {
  const map = new Map<string, WireBadgeGroup>();

  for (const { wire, labelX, labelY } of geometries) {
    if (!wire.flowOrder) continue;
    const endpoints = wireEndpointKey(wire);
    if (!endpoints) continue;

    const side = badgeSideForWire(wire);
    const groupKey = `${endpoints}|${Math.round(labelX)}|${Math.round(labelY)}|${side}`;
    const existing = map.get(groupKey);
    const item = { wireId: wire.id, order: wire.flowOrder };

    if (existing) {
      existing.items.push(item);
      continue;
    }

    map.set(groupKey, { key: groupKey, labelX, labelY, side, items: [item] });
  }

  return [...map.values()].map((group) => ({
    ...group,
    items: [...group.items].sort((a, b) => {
      if (a.order.step !== b.order.step) return a.order.step - b.order.step;
      return (a.order.suffix ?? "").localeCompare(b.order.suffix ?? "");
    }),
  }));
}

function layoutBadgeGroups(groups: WireBadgeGroup[]): PositionedBadgeGroup[] {
  const positioned = groups.map((group) => ({
    ...group,
    badgeX: group.labelX,
    badgeY: group.labelY + (group.side === "above" ? -BADGE_LIFT_PX : BADGE_LIFT_PX),
  }));

  positioned.sort((a, b) => a.badgeY - b.badgeY || a.badgeX - b.badgeX);

  for (let i = 1; i < positioned.length; i++) {
    for (let j = 0; j < i; j++) {
      const current = positioned[i];
      const other = positioned[j];
      const dx = current.badgeX - other.badgeX;
      const dy = current.badgeY - other.badgeY;

      if (Math.abs(dx) > BADGE_SLOT_PX * 1.5) continue;

      const minDy = MIN_GROUP_Y_SEP_PX + (current.items.length + other.items.length) * 2;
      if (Math.abs(dy) < minDy) {
        const push = (minDy - Math.abs(dy)) / 2 + 2;
        if (current.badgeY >= other.badgeY) {
          current.badgeY += push;
          if (current.badgeY <= other.badgeY) current.badgeY = other.badgeY + minDy;
        } else {
          current.badgeY -= push;
          if (current.badgeY >= other.badgeY) current.badgeY = other.badgeY - minDy;
        }
      }
    }
  }

  return positioned;
}

function badgeAnchorForWire(
  groups: PositionedBadgeGroup[],
  wireId: string,
): { x: number; y: number } | null {
  for (const group of groups) {
    const index = group.items.findIndex((item) => item.wireId === wireId);
    if (index === -1) continue;

    const offsetX = (index - (group.items.length - 1) / 2) * BADGE_SLOT_PX;
    return {
      x: group.badgeX + offsetX,
      y: group.badgeY,
    };
  }
  return null;
}

type RegisterCanvasFlowWiresProps = {
  t: Tokens;
};

function geometriesEqual(a: WireGeometry[], b: WireGeometry[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (item, index) =>
      item.wire.id === b[index]?.wire.id &&
      item.path === b[index]?.path &&
      item.labelX === b[index]?.labelX &&
      item.labelY === b[index]?.labelY,
  );
}

function buildWireGeometries(
  wires: RegisterFlowCanvasWire[],
  screenToFlowPosition: (point: { x: number; y: number }) => { x: number; y: number },
): WireGeometry[] {
  const next: WireGeometry[] = [];

  for (const wire of wires) {
    const anchors = wireScreenAnchors(wire);
    if (!anchors) continue;

    const source = screenToFlowPosition(anchors.source);
    const target = screenToFlowPosition(anchors.target);

    const [path, labelX, labelY] = getSmoothStepPath({
      sourceX: source.x,
      sourceY: source.y,
      targetX: target.x,
      targetY: target.y,
      sourcePosition: "right" as Position,
      targetPosition: "left" as Position,
      borderRadius: 0,
    });

    next.push({ wire, path, labelX, labelY });
  }

  return next;
}

export function RegisterCanvasFlowWires({ t }: RegisterCanvasFlowWiresProps) {
  const { activeFlowStepId, activeFlowId } = useRegisterSelection();
  const { screenToFlowPosition } = useReactFlow();
  const translateX = useStore((state) => state.transform[0]);
  const translateY = useStore((state) => state.transform[1]);
  const zoom = useStore((state) => state.transform[2]);
  const nodeCount = useStore((state) => state.nodes.length);

  const [geometries, setGeometries] = useState<WireGeometry[]>([]);
  const [hoveredWireId, setHoveredWireId] = useState<string | null>(null);

  const canvasFocus = useMemo(
    () => getRegisterFlowCanvasFocus(activeFlowStepId, activeFlowId),
    [activeFlowStepId, activeFlowId],
  );

  const syncGeometries = useCallback(() => {
    if (!activeFlowStepId && !activeFlowId) {
      setGeometries((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    const next = buildWireGeometries(canvasFocus.wires, screenToFlowPosition);
    setGeometries((prev) => (geometriesEqual(prev, next) ? prev : next));
  }, [activeFlowStepId, activeFlowId, canvasFocus.wires, screenToFlowPosition]);

  useLayoutEffect(() => {
    syncGeometries();
  }, [syncGeometries, translateX, translateY, zoom, nodeCount]);

  useLayoutEffect(() => {
    setHoveredWireId(null);
  }, [activeFlowStepId, activeFlowId]);

  const badgeGroups = useMemo(
    () => layoutBadgeGroups(buildWireBadgeGroups(geometries)),
    [geometries],
  );

  const hoveredGeometry = useMemo(
    () => geometries.find(({ wire }) => wire.id === hoveredWireId) ?? null,
    [geometries, hoveredWireId],
  );

  const hoveredWire = hoveredGeometry?.wire ?? null;

  const hoveredBadgeAnchor = useMemo(
    () => (hoveredWireId ? badgeAnchorForWire(badgeGroups, hoveredWireId) : null),
    [badgeGroups, hoveredWireId],
  );

  const popoverAnchor = useMemo(() => {
    if (!hoveredWireId) return null;
    if (hoveredBadgeAnchor) {
      return { x: hoveredBadgeAnchor.x, y: hoveredBadgeAnchor.y, fromBadge: true };
    }
    if (hoveredGeometry) {
      return { x: hoveredGeometry.labelX, y: hoveredGeometry.labelY, fromBadge: false };
    }
    return null;
  }, [hoveredWireId, hoveredBadgeAnchor, hoveredGeometry]);

  if ((!activeFlowStepId && !activeFlowId) || geometries.length === 0) {
    return null;
  }

  return (
    <>
      <ViewportPortal>
        <svg
          style={{
            position: "absolute",
            inset: 0,
            overflow: "visible",
            pointerEvents: "auto",
            zIndex: 1000,
          }}
        >
          <defs>
            <marker
              id="register-flow-wire-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M 0 0 L 8 4 L 0 8 Z" fill={t.textPrimary} />
            </marker>
            <marker
              id="register-flow-wire-arrow-active"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M 0 0 L 8 4 L 0 8 Z" fill={t.accent} />
            </marker>
          </defs>
          {geometries.map(({ wire, path }) => {
            const isFocused = hoveredWireId === wire.id;
            return (
              <g key={wire.id}>
                <path
                  d={path}
                  fill="none"
                  stroke={isFocused ? t.accent : t.textPrimary}
                  strokeWidth={isFocused ? 2.5 : 1}
                  strokeDasharray={
                    isFocused ? undefined : wire.edgeStyle === "solid" ? undefined : "5 4"
                  }
                  markerEnd={
                    isFocused
                      ? "url(#register-flow-wire-arrow-active)"
                      : "url(#register-flow-wire-arrow)"
                  }
                  pointerEvents="none"
                />
                <path
                  d={path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={16}
                  strokeDasharray={isFocused ? undefined : wire.edgeStyle === "solid" ? undefined : "5 4"}
                  pointerEvents="stroke"
                  style={{ cursor: "default" }}
                  onMouseEnter={() => setHoveredWireId(wire.id)}
                  onMouseLeave={() => setHoveredWireId(null)}
                  onMouseDown={(event) => event.stopPropagation()}
                />
              </g>
            );
          })}
        </svg>
      </ViewportPortal>

      <EdgeLabelRenderer>
        {badgeGroups.map((group) => (
          <div
            key={group.key}
            className="nodrag nopan nowheel"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${group.badgeX}px, ${group.badgeY}px)`,
              display: "flex",
              alignItems: "center",
              gap: BADGE_GROUP_GAP_PX,
              zIndex: 1001,
            }}
          >
            {group.items.map((item) => (
              <div
                key={item.wireId}
                className="nodrag nopan nowheel"
                style={{
                  width: BADGE_SLOT_PX,
                  display: "flex",
                  justifyContent: "center",
                  cursor: "default",
                  pointerEvents: "all",
                }}
                onMouseEnter={() => setHoveredWireId(item.wireId)}
                onMouseLeave={() => setHoveredWireId(null)}
                onMouseDown={(event) => event.stopPropagation()}
              >
                <RegisterFlowWireStepBadge
                  order={item.order}
                  active={hoveredWireId === item.wireId}
                  accentColor={t.accent}
                />
              </div>
            ))}
          </div>
        ))}
        {hoveredWire && popoverAnchor ? (
          <div
            className="nodrag nopan nowheel"
            style={{
              position: "absolute",
              transform: `translate(-50%, 0) translate(${popoverAnchor.x}px, ${
                popoverAnchor.fromBadge ? popoverAnchor.y + 16 : popoverAnchor.y + 20
              }px)`,
              pointerEvents: "none",
              zIndex: 1002,
            }}
          >
            <RegisterFlowWireMetaCard wire={hoveredWire} t={t} />
          </div>
        ) : null}
      </EdgeLabelRenderer>
    </>
  );
}
