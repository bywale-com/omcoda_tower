import type { PrimaryStorePort } from "../ports";

const collections = new Map<string, Map<string, unknown>>();

function bag(collection: string): Map<string, unknown> {
  let m = collections.get(collection);
  if (!m) {
    m = new Map();
    collections.set(collection, m);
  }
  return m;
}

export const standInPrimaryStore: PrimaryStorePort = {
  tag: "stand-in",
  async get(collection, id) {
    return (bag(collection).get(id) as never) ?? null;
  },
  async put(collection, row) {
    bag(collection).set(row.id, row);
    return row;
  },
  async list(collection) {
    return [...bag(collection).values()] as never[];
  },
};

export function clearStandInPrimaryStore(): void {
  collections.clear();
}
