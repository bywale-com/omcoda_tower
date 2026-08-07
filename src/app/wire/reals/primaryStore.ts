import type { PrimaryStorePort } from "../ports";
import { wireFetch } from "../http";

export const realPrimaryStore: PrimaryStorePort = {
  tag: "real",
  async get(collection, id) {
    const res = await wireFetch<{ row: unknown }>(
      `/store/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`,
    );
    return (res.row as never) ?? null;
  },
  async put(collection, row) {
    const res = await wireFetch<{ row: typeof row }>(
      `/store/${encodeURIComponent(collection)}/${encodeURIComponent(row.id)}`,
      { method: "PUT", body: JSON.stringify(row) },
    );
    return res.row;
  },
  async list(collection) {
    const res = await wireFetch<{ rows: unknown[] }>(
      `/store/${encodeURIComponent(collection)}`,
    );
    return res.rows as never[];
  },
};
