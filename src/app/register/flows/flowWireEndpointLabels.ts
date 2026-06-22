import { REGISTER_HOLON_META_MAP } from "../../components/docs/registerMeta/registry";
import { getRegisterSystemNode } from "../systems/registry";
import { getRegisterTable } from "../tables/registry";
import type { RegisterFlowCanvasWire } from "./types";

function resolveHolonLabel(holonId: string): string | undefined {
  return REGISTER_HOLON_META_MAP.get(holonId)?.label;
}

function resolveSystemLabel(systemNodeId: string): string | undefined {
  return getRegisterSystemNode(systemNodeId)?.label;
}

function resolveTableLabel(tableNodeId: string): string | undefined {
  return getRegisterTable(tableNodeId)?.name;
}

function resolveWireEndpoint(
  holonId?: string,
  systemNodeId?: string,
  tableNodeId?: string,
): string | undefined {
  if (holonId) return resolveHolonLabel(holonId);
  if (systemNodeId) return resolveSystemLabel(systemNodeId);
  if (tableNodeId) return resolveTableLabel(tableNodeId);
  return undefined;
}

export function getFlowWireEndpointLabels(
  wire: RegisterFlowCanvasWire,
): { source: string; target: string } | null {
  const source = resolveWireEndpoint(
    wire.sourceHolonId,
    wire.sourceSystemNodeId,
    wire.sourceTableNodeId,
  );
  const target = resolveWireEndpoint(
    wire.targetHolonId,
    wire.targetSystemNodeId,
    wire.targetTableNodeId,
  );

  if (!source || !target) return null;
  return { source, target };
}
