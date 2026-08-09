import type { MapNode } from "../data/types";

const GROUP_ORDER: Record<MapNode["layoutGroup"], number> = {
  spine: 0,
  ring: 1,
  close: 2,
  support: 3,
};

/** Deterministic layout from layoutGroup — no hand-placed frames. */
export function layoutPositions(nodes: MapNode[]): Record<string, { x: number; y: number }> {
  const byGroup: Record<string, MapNode[]> = {
    spine: [],
    ring: [],
    close: [],
    support: [],
  };
  for (const n of nodes) byGroup[n.layoutGroup].push(n);

  const pos: Record<string, { x: number; y: number }> = {};
  const colWidth = 280;
  const rowHeight = 110;

  // Spine left column
  byGroup.spine.forEach((n, i) => {
    pos[n.id] = { x: 40, y: 40 + i * rowHeight };
  });

  // Ring as arc / grid center
  const ring = byGroup.ring;
  const cx = 820;
  const cy = 420;
  const radius = 320;
  ring.forEach((n, i) => {
    const angle = (Math.PI * 2 * i) / Math.max(ring.length, 1) - Math.PI / 2;
    pos[n.id] = {
      x: cx + Math.cos(angle) * radius - 90,
      y: cy + Math.sin(angle) * radius - 36,
    };
  });

  // Close below ring
  byGroup.close.forEach((n, i) => {
    pos[n.id] = { x: 640 + i * colWidth, y: 920 };
  });

  // Support right column
  byGroup.support.forEach((n, i) => {
    pos[n.id] = { x: 1280, y: 40 + i * 72 };
  });

  // Fallback
  nodes.forEach((n, i) => {
    if (!pos[n.id]) {
      pos[n.id] = { x: 40 + (GROUP_ORDER[n.layoutGroup] % 4) * colWidth, y: 40 + i * 40 };
    }
  });

  return pos;
}

export function layoutSubMap(
  count: number,
): { x: number; y: number }[] {
  return Array.from({ length: count }, (_, i) => ({
    x: 40 + (i % 3) * 220,
    y: 40 + Math.floor(i / 3) * 100,
  }));
}
