/**
 * Durable dispatch adapter.
 *
 * The state machine decides. This module loads a ledger, takes an exclusive
 * lock, commits a transition only when the state revision still matches, and
 * records a wake only after the label actuator reports success.
 *
 * The GitHub process is not spawned. `githubLabelActuator` refuses even when
 * the environment looks armed, so this build cannot add a label or start a
 * Cursor agent. Tests pass a scripted actuator.
 */
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import {
  acknowledgeDispatch,
  applyEvent,
  decide,
  freshItem,
  type FactoryEvent,
  type WakeEffect,
  type WorkItem,
  type World,
} from "./machine.ts";

export interface FactoryLedger {
  stateRevision: number;
  authorizedDispatches: number | null;
  usedDispatches: number;
  packets: Record<string, WorkItem>;
}

export interface LabelRequest {
  label: string;
  packetId: string;
  revision: string;
  prHead: string;
}

export interface LabelActuator {
  add(input: LabelRequest): Promise<{ ok: boolean; reason: string }>;
}

export interface StateStore {
  read(): Promise<FactoryLedger>;
  /**
   * Write `next` only when the stored revision is still `expected`.
   * `next.stateRevision` must be `expected + 1`.
   */
  compareAndSwap(expected: number, next: FactoryLedger): Promise<boolean>;
  transact<T>(
    fn: (ledger: FactoryLedger) => Promise<{ write: FactoryLedger | null; result: T }>,
  ): Promise<T>;
}

export function emptyLedger(authorizedDispatches: number | null = null): FactoryLedger {
  return {
    stateRevision: 0,
    authorizedDispatches,
    usedDispatches: 0,
    packets: {
      "pkt-001-click-attribution": freshItem("pkt-001-click-attribution", "exec-identity"),
    },
  };
}

export class MemoryStore implements StateStore {
  private ledger: FactoryLedger;
  private tail: Promise<void> = Promise.resolve();

  constructor(initial: FactoryLedger) {
    this.ledger = structuredClone(initial);
  }

  async read(): Promise<FactoryLedger> {
    return structuredClone(this.ledger);
  }

  async compareAndSwap(expected: number, next: FactoryLedger): Promise<boolean> {
    if (this.ledger.stateRevision !== expected) return false;
    if (next.stateRevision !== expected + 1) return false;
    this.ledger = structuredClone(next);
    return true;
  }

  transact<T>(
    fn: (ledger: FactoryLedger) => Promise<{ write: FactoryLedger | null; result: T }>,
  ): Promise<T> {
    const run = this.tail.then(async () => {
      const snapshot = structuredClone(this.ledger);
      const outcome = await fn(snapshot);
      if (!outcome.write) return outcome.result;
      const wrote = await this.compareAndSwap(snapshot.stateRevision, outcome.write);
      if (!wrote) throw new Error("stale_commit");
      return outcome.result;
    });
    this.tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }
}

async function withLock<T>(lockDir: string, fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      await mkdir(lockDir);
      try {
        return await fn();
      } finally {
        await rm(lockDir, { recursive: true });
      }
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "EEXIST") throw error;
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
  }
  throw new Error("lock_timeout");
}

export class FileStore implements StateStore {
  constructor(private readonly file: string) {}

  async read(): Promise<FactoryLedger> {
    return JSON.parse(await readFile(this.file, "utf8")) as FactoryLedger;
  }

  async compareAndSwap(expected: number, next: FactoryLedger): Promise<boolean> {
    const current = await this.read();
    if (current.stateRevision !== expected) return false;
    if (next.stateRevision !== expected + 1) return false;
    await mkdir(dirname(this.file), { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    await writeFile(tmp, `${JSON.stringify(next, null, 2)}\n`);
    await rename(tmp, this.file);
    return true;
  }

  async transact<T>(
    fn: (ledger: FactoryLedger) => Promise<{ write: FactoryLedger | null; result: T }>,
  ): Promise<T> {
    return withLock(`${this.file}.lock`, async () => {
      const current = await this.read();
      const outcome = await fn(structuredClone(current));
      if (!outcome.write) return outcome.result;
      const wrote = await this.compareAndSwap(current.stateRevision, outcome.write);
      if (!wrote) throw new Error("stale_commit");
      return outcome.result;
    });
  }
}

export interface DispatchResult {
  ok: boolean;
  reason: string;
  effect: WakeEffect;
  item: WorkItem;
}

function worldFrom(ledger: FactoryLedger, opts: {
  activation: World["activation"];
  now: string;
  engineeringBusy: boolean;
  budgetUsd: number | null;
}): World {
  return {
    activation: opts.activation,
    now: opts.now,
    engineeringBusy: opts.engineeringBusy,
    budgetUsd: opts.budgetUsd,
    authorizedDispatches: ledger.authorizedDispatches,
    usedDispatches: ledger.usedDispatches,
  };
}

export async function commitEvent(
  store: StateStore,
  packetId: string,
  event: FactoryEvent,
  world: World,
): Promise<{ ok: boolean; reason: string; item: WorkItem }> {
  return store.transact(async (ledger) => {
    const item = ledger.packets[packetId];
    if (!item) {
      return { write: null, result: { ok: false, reason: "unknown_packet", item: freshItem(packetId) } };
    }
    const applied = applyEvent(item, event, world);
    if (!applied.ok) return { write: null, result: applied };
    return {
      write: {
        ...ledger,
        stateRevision: ledger.stateRevision + 1,
        packets: { ...ledger.packets, [packetId]: applied.item },
      },
      result: applied,
    };
  });
}

export async function dispatchWake(opts: {
  store: StateStore;
  actuator: LabelActuator;
  packetId: string;
  prHead: string;
  activation: World["activation"];
  now: string;
  engineeringBusy: boolean;
  budgetUsd: number | null;
}): Promise<DispatchResult> {
  return opts.store.transact(async (ledger) => {
    const item = ledger.packets[opts.packetId];
    if (!item) {
      return {
        write: null,
        result: { ok: false, reason: "unknown_packet", effect: "none", item: freshItem(opts.packetId) },
      };
    }
    const decision = decide(item, worldFrom(ledger, opts));
    if (decision.effect === "none" || !decision.label) {
      return { write: null, result: { ok: false, reason: decision.reason, effect: "none", item } };
    }
    const added = await opts.actuator.add({
      label: decision.label,
      packetId: item.id,
      revision: item.revision,
      prHead: opts.prHead,
    });
    if (!added.ok) {
      return { write: null, result: { ok: false, reason: added.reason, effect: decision.effect, item } };
    }
    const acknowledged = acknowledgeDispatch(item, decision.effect, { prHead: opts.prHead });
    return {
      write: {
        ...ledger,
        stateRevision: ledger.stateRevision + 1,
        usedDispatches: ledger.usedDispatches + 1,
        packets: { ...ledger.packets, [opts.packetId]: acknowledged },
      },
      result: { ok: true, reason: "dispatched", effect: decision.effect, item: acknowledged },
    };
  });
}

/** Arguments a future armed actuator would pass to `gh`. This build never spawns it. */
export function labelEditArgs(pr: number, label: string): string[] {
  return ["pr", "edit", String(pr), "--add-label", label];
}

export function githubLabelActuator(env: NodeJS.ProcessEnv = process.env): LabelActuator {
  return {
    async add() {
      if (env.FACTORY_CONTROLLER !== "active" || env.FACTORY_LABELS !== "armed" || !env.WAKE_GITHUB_TOKEN) {
        return { ok: false, reason: "actuator_disabled" };
      }
      return { ok: false, reason: "actuator_not_connected" };
    },
  };
}

export function scriptedActuator(
  results: Array<{ ok: boolean; reason: string }>,
  calls: string[],
): LabelActuator {
  return {
    async add(input) {
      calls.push(`${input.label}@${input.packetId}@${input.revision}@${input.prHead}`);
      return results.shift() ?? { ok: false, reason: "no_script" };
    },
  };
}
