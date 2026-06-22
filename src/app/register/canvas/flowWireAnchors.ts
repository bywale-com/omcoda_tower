type Point = { x: number; y: number };

export function holonCanvasAnchor(holonId: string, edge: "start" | "end"): Point | null {
  const el = document.querySelector(`[data-register-holon="${holonId}"]`);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    x: edge === "start" ? rect.right : rect.left,
    y: rect.top + rect.height / 2,
  };
}

export function systemCanvasAnchor(systemId: string, edge: "start" | "end"): Point | null {
  const el = document.querySelector(`[data-register-system="${systemId}"]`);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    x: edge === "start" ? rect.right : rect.left,
    y: rect.top + rect.height / 2,
  };
}

export function tableCanvasAnchor(tableId: string, edge: "start" | "end"): Point | null {
  const el = document.querySelector(`[data-register-table="${tableId}"]`);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    x: edge === "start" ? rect.right : rect.left,
    y: rect.top + rect.height / 2,
  };
}

export function wireScreenAnchors(wire: {
  sourceHolonId?: string;
  sourceSystemNodeId?: string;
  sourceTableNodeId?: string;
  targetHolonId?: string;
  targetSystemNodeId?: string;
  targetTableNodeId?: string;
}): { source: Point; target: Point } | null {
  let source: Point | null = null;
  let target: Point | null = null;

  if (wire.sourceHolonId) source = holonCanvasAnchor(wire.sourceHolonId, "start");
  else if (wire.sourceSystemNodeId) source = systemCanvasAnchor(wire.sourceSystemNodeId, "start");
  else if (wire.sourceTableNodeId) source = tableCanvasAnchor(wire.sourceTableNodeId, "start");

  if (wire.targetHolonId) target = holonCanvasAnchor(wire.targetHolonId, "end");
  else if (wire.targetSystemNodeId) target = systemCanvasAnchor(wire.targetSystemNodeId, "end");
  else if (wire.targetTableNodeId) target = tableCanvasAnchor(wire.targetTableNodeId, "end");

  if (!source || !target) return null;
  return { source, target };
}
