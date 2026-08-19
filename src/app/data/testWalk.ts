/**
 * Canvas Test walk. Fills Input/Output from the event contract, then-this, no persist.
 * Only Trigger Output is sourced. Later nodes are a function of that handle.
 */
import type { Edge, Node } from "@xyflow/react";
import { getModuleSpec } from "./automationGet";
import type { MappedChip, WorkflowNodeData } from "./automationWorkflows";
import { type EventTestHandle, type EventTestWrite } from "./eventTestContract";

export type { MappedChip };

function uniqueIds(ids: Array<string | null | undefined>): string[] {
  return [...new Set(ids.map((id) => String(id ?? "")).filter(Boolean))];
}

function payloadOf(writes: EventTestWrite[], extra?: Record<string, unknown>): Record<string, unknown> {
  return { writes, ...extra };
}

function contactsFrom(writes: EventTestWrite[]): EventTestWrite[] {
  return writes.filter((row) => row.table === "contact_records");
}

function fieldOf(row: EventTestWrite, field: string): unknown {
  if (!field) return undefined;
  const parts = field.split(".");
  let cur: unknown = row;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

function matches(val: unknown, op: string, expected: unknown): boolean {
  if (op === "exists") return val != null && val !== "";
  const eq = val === expected || String(val) === String(expected);
  if (op === "neq" || op === "not_equals") return !eq;
  return eq;
}

function reachability(email: unknown, phone: unknown): {
  verdict: "reachable" | "partial" | "unreachable";
  ready: boolean;
  rationale: string;
} {
  const hasEmail = Boolean(email);
  const hasPhone = Boolean(phone);
  if (hasEmail && hasPhone) return { verdict: "reachable", ready: true, rationale: "reachable" };
  if (!hasEmail && !hasPhone) {
    return { verdict: "unreachable", ready: false, rationale: "missing email and phone" };
  }
  return {
    verdict: "partial",
    ready: true,
    rationale: hasEmail ? "missing phone" : "missing email",
  };
}

function chipsFor(data: WorkflowNodeData, slot: string): MappedChip[] {
  const mapped = data.mappedSlots;
  if (!mapped || typeof mapped !== "object") return [];
  const rows = mapped[slot];
  return Array.isArray(rows) ? rows : [];
}

function filterByChips(writes: EventTestWrite[], data: WorkflowNodeData): EventTestWrite[] {
  const firmChips = chipsFor(data, "firm");
  const contactChips = chipsFor(data, "contact");
  let next = writes;
  if (firmChips.length) {
    const firmIds = uniqueIds(
      firmChips.flatMap((chip) => {
        if (chip.id) return [chip.id];
        return writes
          .filter((row) => !chip.table || row.table === chip.table)
          .map((row) => {
            const val = chip.field ? fieldOf(row, chip.field) : row.firm_id ?? row.id;
            return typeof val === "string" ? val : null;
          });
      }),
    );
    if (firmIds.length) {
      next = next.filter((row) => {
        const fid = String(row.firm_id ?? row.id ?? "");
        return firmIds.includes(fid);
      });
    }
  } else if (data.getSelect === "select" && data.getClass1) {
    next = next.filter((row) => String(row.firm_id ?? "") === data.getClass1 || row.id === data.getClass1);
  }
  if (contactChips.length) {
    const ids = uniqueIds(
      contactChips.flatMap((chip) => {
        if (chip.id) return [chip.id];
        return writes
          .filter((row) => !chip.table || row.table === chip.table)
          .map((row) => {
            const val = chip.field ? fieldOf(row, chip.field) : row.contact_id ?? row.id;
            return typeof val === "string" ? val : null;
          });
      }),
    );
    if (ids.length) {
      next = next.filter((row) => ids.includes(String(row.contact_id ?? row.id)));
    }
  } else if (data.getSelect === "select" && data.getClass2?.length) {
    next = next.filter((row) => (data.getClass2 ?? []).includes(String(row.contact_id ?? row.id)));
  }
  return next;
}

function projectGet(data: WorkflowNodeData, input: EventTestWrite[]): EventTestWrite[] {
  const spec = getModuleSpec(data.getModule);
  if (spec.silent) return [];
  const table = spec.writeTable;
  const fromHandle = input.filter((row) => row.table === table);
  const source = fromHandle.length ? fromHandle : input;
  return filterByChips(source.filter((row) => row.table === table || !fromHandle.length), data);
}

function projectAudit(input: EventTestWrite[]): { writes: EventTestWrite[]; summary: { contacts: number; ready: number } } {
  const contacts = contactsFrom(input);
  const importIds = uniqueIds(input.filter((row) => row.table === "import_batch").map((row) => row.id));
  const runId = "arun-test-uncommitted";
  const writes: EventTestWrite[] = [
    {
      table: "audit_runs",
      id: runId,
      firm_id: contacts[0]?.firm_id ?? input[0]?.firm_id ?? null,
      firm: contacts[0]?.firm ?? input[0]?.firm ?? null,
      status: "complete",
      import_ids: importIds,
      summary: { contacts: contacts.length, ready: 0 },
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
    },
  ];
  let ready = 0;
  for (const contact of contacts) {
    writes.push({ ...contact, table: "contact_records", id: contact.id, contact_id: contact.id });
    const v = reachability(contact.email, contact.phone);
    if (v.ready) ready += 1;
    writes.push({
      table: "reachability_verdicts",
      id: contact.id,
      contact_id: contact.id,
      firm_id: contact.firm_id ?? null,
      firm: contact.firm ?? null,
      name: contact.name ?? null,
      verdict: v.verdict,
      details: { auditRunId: runId, rationale: v.rationale },
    });
    writes.push({
      table: "sequence_ready",
      id: contact.id,
      contact_id: contact.id,
      firm_id: contact.firm_id ?? null,
      firm: contact.firm ?? null,
      name: contact.name ?? null,
      ready: v.ready,
    });
  }
  writes[0] = { ...writes[0], summary: { contacts: contacts.length, ready } };
  return { writes, summary: { contacts: contacts.length, ready } };
}

function projectAscribe(data: WorkflowNodeData, input: EventTestWrite[]): EventTestWrite[] {
  const tag = String(data.tag ?? data.actionSummary ?? data.label ?? "tagged");
  const pickTable = String(data.pickTable ?? "").trim();
  const people = pickTable
    ? input.filter((row) => row.table === pickTable)
    : contactsFrom(input);
  const ids = uniqueIds(people.map((row) => String(row.contact_id ?? (row.table === "contact_records" ? row.id : ""))));
  return ids.map((contactId, index) => {
    const src = people.find((row) => String(row.contact_id ?? row.id) === contactId);
    const note =
      data.notesFromVerdict === true
        ? input.find((row) => row.table === "reachability_verdicts" && String(row.contact_id ?? row.id) === contactId)
        : null;
    const details = note?.details;
    const rationale =
      details && typeof details === "object" && typeof (details as { rationale?: unknown }).rationale === "string"
        ? (details as { rationale: string }).rationale
        : null;
    return {
      table: "contact_tag",
      id: `tag-test-${index + 1}`,
      contact_id: contactId,
      firm_id: src?.firm_id ?? null,
      firm: src?.firm ?? null,
      name: src?.name ?? null,
      tag,
      notes: rationale,
    };
  });
}

function projectNode(
  node: Node<WorkflowNodeData>,
  input: EventTestWrite[],
): { writes: EventTestWrite[]; extra?: Record<string, unknown> } {
  const type = node.type ?? "action";
  const data = node.data;
  if (type === "get") {
    return { writes: projectGet(data, input), extra: { module: data.getModule ?? "contacts" } };
  }
  if (type === "rule") {
    return {
      writes: [],
      extra: {
        pass: true,
        headline: "Pass",
        honest: "lattice not evaluated in Test",
      },
    };
  }
  if (type === "branch") {
    const pickTable = String(data.pickTable ?? "").trim();
    const pickField = String(data.pickField ?? "").trim();
    if (!pickTable || !pickField) {
      return { writes: input, extra: { pass: true } };
    }
    const picked = input.filter((row) => row.table === pickTable);
    const thenRows: EventTestWrite[] = [];
    const elseRows: EventTestWrite[] = [];
    for (const row of picked.length ? picked : input) {
      if (matches(fieldOf(row, pickField), String(data.pickOp ?? "eq"), data.pickValue)) thenRows.push(row);
      else elseRows.push(row);
    }
    return {
      writes: thenRows.length ? thenRows : input,
      extra: {
        pass: thenRows.length > 0,
        branches: {
          true: payloadOf(thenRows.length ? thenRows : input),
          false: payloadOf(elseRows),
        },
      },
    };
  }
  if (type === "action") {
    const actionType = String(data.actionType ?? "call_agent");
    if (actionType === "run_audit") {
      const result = projectAudit(input);
      return { writes: result.writes, extra: { ok: true, actionType, summary: result.summary } };
    }
    if (actionType === "ascribe_tag") {
      return { writes: projectAscribe(data, input), extra: { ok: true, actionType, tag: data.tag ?? null } };
    }
    if (actionType === "call_agent" || actionType === "enroll_sequence") {
      return {
        writes: [],
        extra: { ok: true, actionType: "call_agent", enrolled: false, silent: true },
      };
    }
    return { writes: input, extra: { ok: true, actionType } };
  }
  if (type === "exit" || type === "constant") {
    return { writes: input };
  }
  return { writes: input };
}

function topoFromTrigger(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
): string[] {
  const start = nodes.find((node) => node.type === "trigger");
  if (!start) return [];
  const bySource = new Map<string, string[]>();
  for (const edge of edges) {
    const list = bySource.get(edge.source) ?? [];
    list.push(edge.target);
    bySource.set(edge.source, list);
  }
  const order: string[] = [];
  const seen = new Set<string>();
  const queue = [start.id];
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    order.push(id);
    for (const next of bySource.get(id) ?? []) queue.push(next);
  }
  return order;
}

export function walkTestGraph(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
  handle: EventTestHandle,
): Node<WorkflowNodeData>[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const filled = new Map<string, EventTestWrite[]>();
  const extras = new Map<string, Record<string, unknown>>();
  const order = topoFromTrigger(nodes, edges);

  for (const id of order) {
    const node = byId.get(id);
    if (!node) continue;
    if (node.type === "trigger") {
      filled.set(id, handle.writes);
      extras.set(id, {
        door: handle.door,
        version: handle.version,
        eventName: handle.eventName,
        writeSet: handle.writeSet,
      });
      continue;
    }
    const incoming = edges.filter((edge) => edge.target === id);
    const inputWrites: EventTestWrite[] = [];
    for (const edge of incoming) {
      const src = filled.get(edge.source);
      if (src) inputWrites.push(...src);
    }
    const projected = projectNode(node, inputWrites);
    filled.set(id, projected.writes);
    extras.set(id, projected.extra ?? {});
  }

  return nodes.map((node) => {
    const writes = filled.get(node.id);
    if (!writes) return node;
    const extra = extras.get(node.id) ?? {};
    const incoming = edges.filter((edge) => edge.target === node.id);
    const inputWrites: EventTestWrite[] = [];
    for (const edge of incoming) {
      const src = filled.get(edge.source);
      if (src) inputWrites.push(...src);
    }
    return {
      ...node,
      data: {
        ...node.data,
        lastInput: incoming.length ? payloadOf(inputWrites) : null,
        lastOutput: payloadOf(writes, extra) as WorkflowNodeData["lastOutput"],
        runStatus: "success",
      },
    };
  });
}
