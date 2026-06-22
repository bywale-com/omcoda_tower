import { REGISTER_HOLON_META_MAP } from "../../components/docs/registerMeta/registry";
import { getRegisterFlow, getRegisterFlowStep } from "./index";
import type { RegisterFlowCanvasWire } from "./types";

/** Holon ids on the view canvas that this flow step focuses — one node at a time. */
export function getFlowStepFocusHolonIds(stepId: string): string[] {
  const step = getRegisterFlowStep(stepId);
  if (!step) return [];
  return step.nodes
    .map((node) => node.holonId)
    .filter((id): id is string => id != null);
}

export function getFlowStepFocusSystemNodeIds(stepId: string): string[] {
  const step = getRegisterFlowStep(stepId);
  if (!step) return [];
  const fromNodes = step.nodes
    .map((node) => node.systemNodeId)
    .filter((id): id is string => id != null);
  const fromWires =
    step.canvasWires
      ?.flatMap((wire) => [wire.sourceSystemNodeId, wire.targetSystemNodeId])
      .filter((id): id is string => id != null) ?? [];
  return [...new Set([...fromNodes, ...fromWires])];
}

export function getFlowStepFocusTableNodeIds(stepId: string): string[] {
  const step = getRegisterFlowStep(stepId);
  if (!step) return [];
  const fromWires =
    step.canvasWires
      ?.flatMap((wire) => [wire.sourceTableNodeId, wire.targetTableNodeId])
      .filter((id): id is string => id != null) ?? [];
  return [...new Set(fromWires)];
}

const EMPTY_CANVAS_WIRES: RegisterFlowCanvasWire[] = [];

export function getFlowStepCanvasWires(stepId: string) {
  const step = getRegisterFlowStep(stepId);
  return step?.canvasWires ?? EMPTY_CANVAS_WIRES;
}

export function getFlowFocusHolonIds(flowId: string): string[] {
  const flow = getRegisterFlow(flowId);
  if (!flow) return [];
  return [
    ...new Set(flow.steps.flatMap((step) => getFlowStepFocusHolonIds(step.id))),
  ];
}

export function getFlowFocusSystemNodeIds(flowId: string): string[] {
  const flow = getRegisterFlow(flowId);
  if (!flow) return [];
  return [
    ...new Set(flow.steps.flatMap((step) => getFlowStepFocusSystemNodeIds(step.id))),
  ];
}

export function getFlowFocusTableNodeIds(flowId: string): string[] {
  const flow = getRegisterFlow(flowId);
  if (!flow) return [];
  return [
    ...new Set(flow.steps.flatMap((step) => getFlowStepFocusTableNodeIds(step.id))),
  ];
}

export function getFlowCanvasWires(flowId: string): RegisterFlowCanvasWire[] {
  const flow = getRegisterFlow(flowId);
  if (!flow) return EMPTY_CANVAS_WIRES;
  return flow.steps.flatMap((step) => step.canvasWires ?? []);
}

export type RegisterFlowCanvasFocus = {
  holonIds: string[];
  systemIds: string[];
  tableIds: string[];
  wires: RegisterFlowCanvasWire[];
};

export function getRegisterFlowCanvasFocus(
  activeFlowStepId: string | null,
  activeFlowId: string | null,
): RegisterFlowCanvasFocus {
  if (activeFlowStepId) {
    return {
      holonIds: getFlowStepFocusHolonIds(activeFlowStepId),
      systemIds: getFlowStepFocusSystemNodeIds(activeFlowStepId),
      tableIds: getFlowStepFocusTableNodeIds(activeFlowStepId),
      wires: getFlowStepCanvasWires(activeFlowStepId),
    };
  }
  if (activeFlowId) {
    return {
      holonIds: getFlowFocusHolonIds(activeFlowId),
      systemIds: getFlowFocusSystemNodeIds(activeFlowId),
      tableIds: getFlowFocusTableNodeIds(activeFlowId),
      wires: getFlowCanvasWires(activeFlowId),
    };
  }
  return {
    holonIds: [],
    systemIds: [],
    tableIds: [],
    wires: EMPTY_CANVAS_WIRES,
  };
}

export function viewHasFlowStepFocus(viewId: string, focusHolonIds: string[]): boolean {
  if (focusHolonIds.length === 0) return true;
  return focusHolonIds.some((holonId) => REGISTER_HOLON_META_MAP.get(holonId)?.views.includes(viewId));
}

export function isHolonInFlowStepFocus(holonId: string, focusHolonIds: string[]): boolean {
  return focusHolonIds.includes(holonId);
}

/** True when this holon is focused or wraps a focused holon (avoid dimming through opacity). */
export function holonContainsFlowStepFocus(holonId: string, focusHolonIds: string[]): boolean {
  if (isHolonInFlowStepFocus(holonId, focusHolonIds)) return true;

  for (const focusHolonId of focusHolonIds) {
    let current = REGISTER_HOLON_META_MAP.get(focusHolonId);
    while (current?.parentId) {
      if (current.parentId === holonId) return true;
      current = REGISTER_HOLON_META_MAP.get(current.parentId);
    }
  }

  return false;
}
