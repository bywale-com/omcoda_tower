import type { EdgeTypes } from "@xyflow/react";
import { RegisterFlowWireEdge } from "./RegisterFlowWireEdge";

export const registerFlowEdgeTypes: EdgeTypes = {
  registerFlowWire: RegisterFlowWireEdge,
};

export const REGISTER_FLOW_WIRE_EDGE_TYPE = "registerFlowWire";
