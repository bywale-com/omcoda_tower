import type { MachineTable, TableRelation } from "../data/tableTypes";
import { MACHINE_TABLES, TABLE_RELATIONS } from "../data/tables";
import {
  FIRM_SEQUENCE_BINDINGS,
  SEQUENCE_TEMPLATES,
  resolveFirmSequence,
  type ResolvedSequenceInstance,
} from "../data/templates";

export type SimStep = {
  /** State-table id (or node-linked state). */
  tableId: string;
  nodeId: string;
  viaRelationId?: string;
  depth: number;
  /** Which rule rows fired (content from tables, not engine). */
  appliedRuleRowIds?: string[];
  note?: string;
};

function nodeIdForTable(tableId: string, tables: MachineTable[]): string {
  const t = tables.find((x) => x.id === tableId);
  return t?.nodeId ?? tableId.replace(/^state\./, "");
}

function stateTableForNode(nodeId: string, tables: MachineTable[]): string | undefined {
  return tables.find((t) => t.kind === "state" && t.nodeId === nodeId)?.id;
}

/**
 * Dumb runtime: fire a trigger on a state-table, walk table relations,
 * apply enabled rule-table rows. Holds NO thresholds/orders/conditions of its own —
 * those live in the tables argument.
 */
export function simulateCascadeFromTables(
  originNodeId: string,
  tables: MachineTable[],
  relations: TableRelation[] = TABLE_RELATIONS,
): SimStep[] {
  const originTableId = stateTableForNode(originNodeId, tables);
  if (!originTableId) {
    return [{ tableId: `state.${originNodeId}`, nodeId: originNodeId, depth: 0, note: "no state table" }];
  }

  const steps: SimStep[] = [];
  const seen = new Set<string>();
  const queue: { tableId: string; viaRelationId?: string; depth: number }[] = [
    { tableId: originTableId, depth: 0 },
  ];

  while (queue.length) {
    const cur = queue.shift()!;
    if (seen.has(cur.tableId)) continue;
    seen.add(cur.tableId);

    const nodeId = nodeIdForNodeTable(cur.tableId, tables);
    const applied = applyRulesWritingTo(cur.tableId, tables);

    steps.push({
      tableId: cur.tableId,
      nodeId,
      viaRelationId: cur.viaRelationId,
      depth: cur.depth,
      appliedRuleRowIds: applied,
    });

    // Walk outbound relations from this table (and from rule tables that write here)
    const outbound = relations.filter((r) => r.fromTableId === cur.tableId);
    for (const rel of outbound) {
      // If relation targets a rule table, apply enabled rows then continue to what they write
      const target = tables.find((t) => t.id === rel.toTableId);
      if (!target) continue;

      if (target.kind === "rule") {
        const enabled = (target.ruleRows ?? [])
          .filter((row) => row.enabled)
          .sort((a, b) => a.ord - b.ord);
        // Precedence: if mp-5 (single motion) disabled, still walk; if mp-1 disabled, skip reactivation write path annotation
        for (const row of enabled) {
          if (row.writesStateTableId && !seen.has(row.writesStateTableId)) {
            queue.push({
              tableId: row.writesStateTableId,
              viaRelationId: rel.id,
              depth: cur.depth + 1,
            });
          }
        }
        if (!seen.has(target.id)) {
          seen.add(target.id);
          steps.push({
            tableId: target.id,
            nodeId: target.nodeId,
            viaRelationId: rel.id,
            depth: cur.depth + 1,
            appliedRuleRowIds: enabled.map((r) => r.id),
            note: "rule table consulted",
          });
        }
        continue;
      }

      if (target.kind === "sequence") {
        if (!seen.has(target.id)) {
          seen.add(target.id);
          const order = (target.sequence ?? []).map((s) => s.token).join("→");
          steps.push({
            tableId: target.id,
            nodeId: target.nodeId,
            viaRelationId: rel.id,
            depth: cur.depth + 1,
            note: `sequence read: [${order}]`,
          });
        }
        continue;
      }

      // state → state triggers/writes
      if (!seen.has(rel.toTableId)) {
        queue.push({ tableId: rel.toTableId, viaRelationId: rel.id, depth: cur.depth + 1 });
      }
    }
  }

  return steps;
}

function nodeIdForNodeTable(tableId: string, tables: MachineTable[]): string {
  return nodeIdForTable(tableId, tables);
}

function applyRulesWritingTo(stateTableId: string, tables: MachineTable[]): string[] {
  const ids: string[] = [];
  for (const t of tables) {
    if (t.kind !== "rule" || !t.ruleRows) continue;
    for (const row of t.ruleRows) {
      if (row.enabled && row.writesStateTableId === stateTableId) ids.push(row.id);
    }
  }
  return ids;
}

/** Lit node ids from cascade steps (for canvas highlight). */
export function litNodesFromSteps(steps: SimStep[]): Set<string> {
  return new Set(steps.map((s) => s.nodeId));
}

/**
 * Build attempt interior ladder from seq.channel_ownership_order + rule.attempt_criteria —
 * content-free: order and thresholds come from tables.
 */
export function buildAttemptLadderFromTables(tables: MachineTable[]) {
  const seq = tables.find((t) => t.id === "seq.channel_ownership_order");
  const rules = tables.find((t) => t.id === "rule.attempt_criteria");
  const channels = seq?.sequence ?? [];
  const rows = (rules?.ruleRows ?? []).filter((r) => r.enabled).sort((a, b) => a.ord - b.ord);

  const nodes = channels.map((c) => ({
    id: `ch-${c.token}`,
    label: `${c.label} owns`,
    token: c.token,
  }));

  const edges: { id: string; source: string; target: string; label: string }[] = [];
  for (let i = 0; i < channels.length - 1; i++) {
    const from = channels[i];
    const to = channels[i + 1];
    const thresholdRow = rows.find(
      (r) => r.when?.includes(`channel=${from.token}`) || r.id.includes(from.token),
    );
    const thr = thresholdRow?.threshold;
    const unit = thresholdRow?.thresholdUnit ?? "";
    edges.push({
      id: `ladder-${from.token}-${to.token}`,
      source: `ch-${from.token}`,
      target: `ch-${to.token}`,
      label: thresholdRow
        ? `criteria (${thr} ${unit}) → forward`
        : "forward",
    });
  }
  // form → head when form criteria says return_to_sequence_head
  const formRow = rows.find((r) => r.setValue === "return_to_sequence_head");
  if (formRow && channels.length) {
    const last = channels[channels.length - 1];
    const head = channels[0];
    edges.push({
      id: `ladder-${last.token}-head`,
      source: `ch-${last.token}`,
      target: `ch-${head.token}`,
      label: `not submitted (${formRow.threshold} ${formRow.thresholdUnit}) → head`,
    });
  }

  return { nodes, edges, channelOrder: channels.map((c) => c.token) };
}

export const FACLESS_FIRE_PRESETS: { id: string; label: string; originNodeId: string }[] = [
  { id: "fire-reference", label: "Fire reference_version move ★★", originNodeId: "reference_version" },
  { id: "fire-writeback", label: "Fire fact_writeback", originNodeId: "fact_writeback" },
  { id: "fire-criteria", label: "Fire active_attempt criteria window", originNodeId: "active_attempt" },
  { id: "fire-inbound", label: "Fire inbound_override", originNodeId: "inbound_override" },
  { id: "fire-missing", label: "Fire missing_fact_signal", originNodeId: "missing_fact_signal" },
];

/**
 * Resolve a firm's sequence instance from binding + template (v3).
 * Runtime stays dumb — no content of its own.
 */
export function resolveSequenceForFirm(
  firmId: string,
  sequenceClass: Parameters<typeof resolveFirmSequence>[1],
  templates = SEQUENCE_TEMPLATES,
  bindings = FIRM_SEQUENCE_BINDINGS,
): ResolvedSequenceInstance | null {
  return resolveFirmSequence(firmId, sequenceClass, templates, bindings);
}

export { MACHINE_TABLES, TABLE_RELATIONS, SEQUENCE_TEMPLATES, FIRM_SEQUENCE_BINDINGS };
