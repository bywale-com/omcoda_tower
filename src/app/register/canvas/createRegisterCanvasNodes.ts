import type { Node } from "@xyflow/react";
import type { Tokens } from "../../components/tokens";
import { REGISTER_SYSTEM_NODES } from "../systems/registry";
import type { RegisterSystemPosition } from "../systems/registerSystemLayout";
import { REGISTER_TABLES } from "../tables/registry";
import type { RegisterTablePosition } from "../tables/registerTableLayout";
import type { RegisterSystemNodeData } from "./RegisterSystemNode";
import type { RegisterTableNodeData } from "./RegisterTableNode";
import { createRegisterViewNodes } from "./registerViewNodes";
import type { RegisterViewFrameNodeData } from "./RegisterViewFrameNode";
import type { RegisterViewPosition } from "./registerViewLayout";

export const REGISTER_SYSTEM_NODE_TYPE = "registerSystemNode";
export const REGISTER_TABLE_NODE_TYPE = "registerTableNode";

export function createRegisterSystemNodes(
  t: Tokens,
  savedPositions: Record<string, RegisterSystemPosition> = {},
): Node<RegisterSystemNodeData>[] {
  return REGISTER_SYSTEM_NODES.map((system) => ({
    id: `system-${system.id}`,
    type: REGISTER_SYSTEM_NODE_TYPE,
    position: savedPositions[system.id] ?? system.defaultPosition,
    dragHandle: ".register-system-drag-handle",
    draggable: true,
    selectable: true,
    data: {
      systemId: system.id,
      label: system.label,
      path: system.path,
      kind: system.kind,
      vendor: system.vendor,
      t,
    },
  }));
}

export function createRegisterTableNodes(
  t: Tokens,
  savedPositions: Record<string, RegisterTablePosition> = {},
): Node<RegisterTableNodeData>[] {
  return REGISTER_TABLES.map((table) => ({
    id: `table-${table.id}`,
    type: REGISTER_TABLE_NODE_TYPE,
    position: savedPositions[table.id] ?? table.defaultPosition,
    dragHandle: ".register-table-drag-handle",
    draggable: true,
    selectable: true,
    data: {
      tableId: table.id,
      name: table.name,
      domain: table.domain,
      fields: table.fields,
      t,
    },
  }));
}

export function createRegisterCanvasNodes(
  t: Tokens,
  viewPositions: Record<string, RegisterViewPosition> = {},
  systemPositions: Record<string, RegisterSystemPosition> = {},
  tablePositions: Record<string, RegisterTablePosition> = {},
): Node<RegisterViewFrameNodeData | RegisterSystemNodeData | RegisterTableNodeData>[] {
  return [
    ...createRegisterViewNodes(t, viewPositions),
    ...createRegisterSystemNodes(t, systemPositions),
    ...createRegisterTableNodes(t, tablePositions),
  ];
}
