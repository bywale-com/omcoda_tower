/**
 * Shared published-pack catalog for Configuration libraries ↔ Firm operations bind.
 * Module singleton with subscribe — Bind dropdowns see Publish version immediately.
 */
import { useEffect, useState } from "react";
import {
  type ConfigPack,
  type PackKind,
  nextVersionId,
  publishedPacks,
  seedConfigPacks,
} from "./operatorConfigLibraries";

type Listener = () => void;

let packs: ConfigPack[] = seedConfigPacks();
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

export function getPackCatalog(): ConfigPack[] {
  return packs;
}

export function setPackCatalog(next: ConfigPack[] | ((prev: ConfigPack[]) => ConfigPack[])) {
  packs = typeof next === "function" ? next(packs) : next;
  emit();
}

export function subscribePackCatalog(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function usePackCatalog(): [ConfigPack[], typeof setPackCatalog] {
  const [state, setState] = useState<ConfigPack[]>(() => getPackCatalog());
  useEffect(() => subscribePackCatalog(() => setState(getPackCatalog())), []);
  return [state, setPackCatalog];
}

export function listPublishedPacks(kind: PackKind): ConfigPack[] {
  return publishedPacks(kind, getPackCatalog());
}

export function publishPackInCatalog(packId: string, kind: PackKind, patch?: Partial<ConfigPack>) {
  setPackCatalog((prev) => {
    const versionId = nextVersionId(kind, prev);
    return prev.map((pack) =>
      pack.id === packId && pack.kind === kind
        ? { ...pack, ...patch, status: "Published", versionId }
        : pack,
    );
  });
}

export function ensurePackInCatalog(
  kind: PackKind,
  id: string,
  name: string,
  summary: string,
  extra?: Partial<ConfigPack>,
) {
  setPackCatalog((prev) => {
    if (prev.some((pack) => pack.id === id && pack.kind === kind)) {
      return prev.map((pack) =>
        pack.id === id && pack.kind === kind
          ? { ...pack, name, summary, ...extra }
          : pack,
      );
    }
    return [
      ...prev,
      {
        id,
        kind,
        name,
        versionId: null,
        status: "Draft",
        summary,
        ...extra,
      },
    ];
  });
}

/** Reset catalog (tests / hot reload demos). */
export function resetPackCatalog() {
  packs = seedConfigPacks();
  emit();
}
