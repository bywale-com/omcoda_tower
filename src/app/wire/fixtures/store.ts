/**
 * Explicit fixture plane — never auto-green human / founder acts.
 */
import {
  FIXTURE_CATALOG,
  POOL_DNS_FIXTURES,
  type FixtureId,
  type FixtureKind,
  type FixtureMeta,
} from "./catalog";

export type FixtureRecord = {
  id: FixtureId;
  present: boolean;
  /** Who marked it when present. */
  markedBy?: "platform-ops" | "firm" | "founder" | "consultant" | "counsel" | "ct-operator";
  markedAt?: string;
  firmId?: string;
  note?: string;
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

export function subscribeFixtures(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Global fixtures (house) + per-firm overlays. */
const globalState = new Map<FixtureId, FixtureRecord>();
const firmState = new Map<string, Map<FixtureId, FixtureRecord>>();

function emptyRecord(id: FixtureId): FixtureRecord {
  return { id, present: false };
}

function getFirmMap(firmId: string): Map<FixtureId, FixtureRecord> {
  let m = firmState.get(firmId);
  if (!m) {
    m = new Map();
    firmState.set(firmId, m);
  }
  return m;
}

export function getFixture(id: FixtureId, firmId?: string): FixtureRecord {
  if (firmId) {
    const local = getFirmMap(firmId).get(id);
    if (local) return local;
  }
  return globalState.get(id) ?? emptyRecord(id);
}

export function isFixturePresent(id: FixtureId, firmId?: string): boolean {
  return getFixture(id, firmId).present;
}

export type MarkFixtureInput = {
  id: FixtureId;
  present: boolean;
  markedBy: NonNullable<FixtureRecord["markedBy"]>;
  firmId?: string;
  note?: string;
};

/**
 * Mark a fixture. Refuses to invent composite `sending_identity_ready` — that is derived.
 * Caller must be an explicit CT/operator/founder action (fixture honesty).
 */
export function markFixture(input: MarkFixtureInput): FixtureRecord {
  if (input.id === "sending_identity_ready") {
    throw new Error("sending_identity_ready is derived — mark DNS member fixtures instead");
  }
  const record: FixtureRecord = {
    id: input.id,
    present: input.present,
    markedBy: input.present ? input.markedBy : undefined,
    markedAt: input.present ? new Date().toISOString() : undefined,
    firmId: input.firmId,
    note: input.note,
  };
  if (input.firmId) {
    getFirmMap(input.firmId).set(input.id, record);
  } else {
    globalState.set(input.id, record);
  }
  notify();
  return record;
}

export function listFixtures(firmId?: string): FixtureRecord[] {
  const ids = Object.keys(FIXTURE_CATALOG) as FixtureId[];
  return ids.map((id) => getFixture(id, firmId));
}

export function fixtureMeta(id: FixtureId): FixtureMeta {
  return FIXTURE_CATALOG[id];
}

/** Composite readiness for pool path — fail closed until all pool DNS fixtures present. */
export function isSendingIdentityReady(firmId: string): boolean {
  return POOL_DNS_FIXTURES.every((id) => isFixturePresent(id, firmId) || isFixturePresent(id));
}

export function sendingIdentityChipState(firmId: string): {
  ready: boolean;
  chips: Array<{ id: FixtureId; label: string; present: boolean; kind: FixtureKind }>;
} {
  const chips = POOL_DNS_FIXTURES.map((id) => {
    const meta = FIXTURE_CATALOG[id];
    const present = isFixturePresent(id, firmId) || isFixturePresent(id);
    return { id, label: meta.label, present, kind: meta.kind };
  });
  return { ready: chips.every((c) => c.present), chips };
}

/** CT demo helper: platform-ops marks pool DNS for a firm (still explicit — not silent). */
export function markPoolDnsProvisioned(
  firmId: string,
  markedBy: "platform-ops" | "ct-operator" = "platform-ops",
): void {
  for (const id of POOL_DNS_FIXTURES) {
    markFixture({ id, present: true, markedBy, firmId, note: "pool-path platform publish" });
  }
}

export function clearAllFixtures(): void {
  globalState.clear();
  firmState.clear();
  notify();
}
