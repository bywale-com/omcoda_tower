/** This run’s writes — the next node’s input. Not an events table. */
export type RunWrite = {
  table: string;
  id: string;
  contact_id?: string | null;
};

export function writesFromPayload(payload: Record<string, unknown> | undefined): RunWrite[] {
  const raw = payload?.writes;
  if (Array.isArray(raw)) {
    return raw
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const rec = row as Record<string, unknown>;
        const table = typeof rec.table === "string" ? rec.table : "";
        const id = typeof rec.id === "string" ? rec.id : "";
        if (!table || !id) return null;
        const contact_id =
          typeof rec.contact_id === "string"
            ? rec.contact_id
            : typeof rec.contactId === "string"
              ? rec.contactId
              : null;
        return { table, id, contact_id };
      })
      .filter((row): row is RunWrite => Boolean(row));
  }
  const batchId =
    typeof payload?.import_batch_id === "string"
      ? payload.import_batch_id
      : typeof payload?.importBatchId === "string"
        ? payload.importBatchId
        : "";
  const contactIds = Array.isArray(payload?.contact_ids)
    ? payload.contact_ids.map(String)
    : Array.isArray(payload?.contactIds)
      ? (payload.contactIds as unknown[]).map(String)
      : [];
  const out: RunWrite[] = [];
  if (batchId) out.push({ table: "import_batch", id: batchId });
  for (const id of contactIds) out.push({ table: "contact_records", id, contact_id: id });
  return out;
}
