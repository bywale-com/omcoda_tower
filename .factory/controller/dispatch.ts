/**
 * Durable dispatch adapter.
 *
 * The state machine decides. This module loads a ledger, commits a transition
 * only when the state revision still matches, and records a wake only after
 * the label actuator reports success.
 *
 * `FileStore` locks a directory on one machine. That lock does not exist on
 * another GitHub Actions runner. Live compare-and-swap is `GitHubContentsStore`
 * in `contents.ts`: the Contents API blob sha, 409 on a stale write.
 *
 * `githubLabelActuator` can spawn `gh pr edit`. It does not spawn unless the
 * controller is active, labels are armed, the wake token is set, a spending
 * limit is confirmed, and the Cursor automations are confirmed saved. None of
 * those are set in this tree. A disabled call does not start a process.
 */
import { spawn } from "node:child_process";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { applyWorkerSignal, openExecution, type Assignment, type WorkerExecution } from "./execution.ts";
import {
  acknowledgeDispatch,
  applyEvent,
  decide,
  freshItem,
  type DispatchRecord,
  type FactoryEvent,
  type WakeEffect,
  type WorkItem,
  type World,
} from "./machine.ts";

export interface FactoryLedger {
  stateRevision: number;
  authorizedDispatches: number | null;
  usedDispatches: number;
  scope: ScopeState;
  initiatives: Record<string, InitiativeRecord>;
  packets: Record<string, WorkItem>;
  executions?: Record<string, WorkerExecution>;
  assignments?: Record<string, Assignment>;
}

export interface ScopeState {
  id: string | null;
  status: "inactive" | "active" | "suspended" | "complete";
  modules: string[];
  founderDecision: string | null;
  blockReason: string | null;
}

export type InitiativeQueue = "discovered" | "eligible" | "active" | "blocked" | "completed";

export interface InitiativeRecord {
  id: string;
  module: string;
  capability: string;
  entry: string;
  obligation: string;
  priority: number;
  dependsOn: string[];
  inheritedSpecifications: string[];
  investigation: "discovered" | "investigating" | "specifying" | "closed";
  queue: InitiativeQueue;
  coverageComplete: boolean | null;
  outstanding: string[];
  session: "idle" | "running" | "continuation_due" | "founder_decision";
  revision: string;
  dispatch: DispatchRecord | null;
  blockedReason: string | null;
  packetIds: string[];
  updatedAt: string | null;
  /** Last architect checkpoint. A checkpoint does not end the execution. */
  checkpointAt?: string | null;
  /** The worker reported that another follow-up would not fit. */
  contextSaturated?: boolean;
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

export function emptyScope(): ScopeState {
  return { id: null, status: "inactive", modules: [], founderDecision: null, blockReason: null };
}

/** Test ledger. Scope is active so packet-wake tests are not refused. The committed ledger is inactive. */
export function emptyLedger(authorizedDispatches: number | null = null): FactoryLedger {
  return {
    stateRevision: 0,
    authorizedDispatches,
    usedDispatches: 0,
    scope: { id: "test", status: "active", modules: ["test"], founderDecision: null, blockReason: null },
    initiatives: {},
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

/**
 * Single-machine ledger. The lock directory is not shared by separate GitHub Actions runners.
 * Do not use this class as the live dispatch store.
 */
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
    scopeStatus: ledger.scope?.status,
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
    let drafted: FactoryLedger = {
      ...ledger,
      packets: { ...ledger.packets, [packetId]: applied.item },
    };
    if (event.type === "acknowledge_start") {
      drafted = applyWorkerSignal(drafted, packetId, { type: "acknowledge_start", workerId: event.workerId, now: world.now });
    } else if (event.type === "acquire_lease" && event.role !== "architect") {
      drafted = applyWorkerSignal(drafted, packetId, {
        type: "running",
        workerId: event.workerId,
        now: world.now,
        leaseUntil: applied.item.lease?.until ?? null,
      });
    } else if (event.type === "refuse_execution") {
      drafted = applyWorkerSignal(drafted, packetId, { type: "refuse_execution", workerId: event.workerId, now: world.now });
    } else if (event.type === "sign_change") {
      drafted = applyWorkerSignal(drafted, packetId, { type: "signed", now: world.now });
    } else if (event.type === "commit_candidate") {
      drafted = applyWorkerSignal(drafted, packetId, { type: "candidate", now: world.now });
    } else if (event.type === "interrupt_analysis") {
      drafted = applyWorkerSignal(drafted, packetId, { type: "interrupted", now: world.now });
    }
    const stored = drafted.packets[packetId] ?? applied.item;
    return {
      write: {
        ...drafted,
        stateRevision: ledger.stateRevision + 1,
      },
      result: { ...applied, item: stored },
    };
  });
}

export async function dispatchWake(opts: {
  store: StateStore;
  actuator: LabelActuator;
  packetId: string;
  packetIds?: string[];
  basis?: string | null;
  prHead: string;
  activation: World["activation"];
  now: string;
  engineeringBusy: boolean;
  budgetUsd: number | null;
}): Promise<DispatchResult> {
  return opts.store.transact(async (ledger) => {
    const ids = opts.packetIds?.length ? opts.packetIds : [opts.packetId];
    const item = ledger.packets[ids[0]];
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
    for (const id of ids) {
      const member = ledger.packets[id];
      if (!member) {
        return { write: null, result: { ok: false, reason: "unknown_packet", effect: "none", item } };
      }
      const memberDecision = decide(member, worldFrom(ledger, opts));
      if (memberDecision.effect !== decision.effect) {
        return { write: null, result: { ok: false, reason: "assignment_mismatch", effect: "none", item } };
      }
    }
    const added = await opts.actuator.add({
      label: decision.label,
      packetId: ids.join(","),
      revision: item.revision,
      prHead: opts.prHead,
    });
    if (!added.ok) {
      return { write: null, result: { ok: false, reason: added.reason, effect: decision.effect, item } };
    }
    const role = decision.effect === "wake_sa" ? "analyst" : "engineer";
    const opened = openExecution({
      stateRevision: ledger.stateRevision,
      role,
      effect: decision.effect,
      packetIds: ids,
      revisions: Object.fromEntries(ids.map((id) => [id, ledger.packets[id].revision])),
      label: decision.label,
      prHead: opts.prHead,
      now: opts.now,
      continuation: "fresh",
    });
    const packets = { ...ledger.packets };
    let acknowledged = item;
    for (const id of ids) {
      const stamped = acknowledgeDispatch(ledger.packets[id], decision.effect, { prHead: opts.prHead, issuedAt: opts.now });
      if (stamped.dispatch) {
        stamped.dispatch.executionId = opened.execution.id;
        stamped.dispatch.assignmentId = opened.assignment.id;
      }
      packets[id] = stamped;
      if (id === ids[0]) acknowledged = stamped;
    }
    opened.assignment.basis = opts.basis ?? null;
    opened.assignment.initiativeId = item.initiativeId;
    return {
      write: {
        ...ledger,
        stateRevision: ledger.stateRevision + 1,
        usedDispatches: ledger.usedDispatches + 1,
        packets,
        executions: { ...(ledger.executions ?? {}), [opened.execution.id]: opened.execution },
        assignments: { ...(ledger.assignments ?? {}), [opened.assignment.id]: opened.assignment },
      },
      result: { ok: true, reason: "dispatched", effect: decision.effect, item: acknowledged },
    };
  });
}

/** Arguments `gh` receives when the actuator reads the pull request labels. */
export function labelViewArgs(pr: number): string[] {
  return ["pr", "view", String(pr), "--json", "labels", "--jq", ".labels[].name"];
}

/** Arguments `gh` receives when a wake label must leave before it can be added again. */
export function labelRemoveArgs(pr: number, label: string): string[] {
  return ["pr", "edit", String(pr), "--remove-label", label];
}

/** Arguments `gh` receives when the actuator adds the wake label. */
export function labelEditArgs(pr: number, label: string): string[] {
  return ["pr", "edit", String(pr), "--add-label", label];
}

/** One label name per line, as `gh pr view --jq '.labels[].name'` prints them. */
export function parseLabelNames(stdout: string): string[] {
  return stdout.split("\n").map((line) => line.trim()).filter(Boolean);
}

export interface GhResult {
  status: number;
  stdout: string;
  stderr: string;
}

export type GhRun = (args: string[], env: NodeJS.ProcessEnv, stdin?: string) => Promise<GhResult>;

export function spawnGh(args: string[], env: NodeJS.ProcessEnv, stdin?: string): Promise<GhResult> {
  return new Promise((resolve, reject) => {
    const child = spawn("gh", args, { env, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (status) => resolve({ status: status ?? 1, stdout, stderr }));
    if (stdin !== undefined) child.stdin.end(stdin);
    else child.stdin.end();
  });
}

function actuatorArmed(env: NodeJS.ProcessEnv): boolean {
  return (
    env.FACTORY_CONTROLLER === "active" &&
    env.FACTORY_LABELS === "armed" &&
    Boolean(env.WAKE_GITHUB_TOKEN) &&
    env.FACTORY_SPEND_LIMIT_CONFIRMED === "yes" &&
    env.FACTORY_AUTOMATIONS_SAVED === "yes"
  );
}

function ghDetail(result: GhResult): string {
  const text = `${result.stderr}\n${result.stdout}`.replace(/ghp_\S+|github_pat_\S+|gho_\S+/g, "[redacted]");
  const line = text.split("\n").map((item) => item.trim()).filter(Boolean).at(-1) ?? "";
  return line.slice(0, 240);
}

function ghFailed(code: string, result: GhResult): { ok: false; reason: string } {
  const detail = ghDetail(result);
  return { ok: false, reason: detail ? `${code}: ${detail}` : code };
}

/**
 * Adds one wake label. Returns `actuator_disabled` without spawning `gh`
 * until spending confirmation and saved Cursor automations are both present,
 * along with the controller, the label arm, and `WAKE_GITHUB_TOKEN`.
 *
 * GitHub emits a labeled event when a label is newly added. Adding a label
 * that is already on the pull request succeeds and emits nothing, so a
 * Cursor automation set to Added does not start. This actuator removes that
 * label, confirms it is gone, and adds it again. The removal is not a wake.
 * The automation trigger has to be Added, so the removal does not start a
 * second worker. A dispatch may be recorded only after the add is confirmed.
 */
export function githubLabelActuator(opts: {
  env?: NodeJS.ProcessEnv;
  pr?: number;
  runGh?: GhRun;
} = {}): LabelActuator {
  const env = opts.env ?? process.env;
  const runGh = opts.runGh ?? spawnGh;
  return {
    async add(input) {
      if (!actuatorArmed(env)) return { ok: false, reason: "actuator_disabled" };
      const pr = opts.pr ?? Number(env.FACTORY_PR);
      if (!Number.isInteger(pr) || pr <= 0) return { ok: false, reason: "actuator_pr_unset" };
      const token = env.WAKE_GITHUB_TOKEN as string;
      const ghEnv = { ...env, GH_TOKEN: token, GITHUB_TOKEN: token };
      try {
        const listed = await runGh(labelViewArgs(pr), ghEnv);
        if (listed.status !== 0) return ghFailed("label_read_failed", listed);
        if (parseLabelNames(listed.stdout).includes(input.label)) {
          const removed = await runGh(labelRemoveArgs(pr, input.label), ghEnv);
          if (removed.status !== 0) return ghFailed("label_remove_failed", removed);
          const after = await runGh(labelViewArgs(pr), ghEnv);
          if (after.status !== 0) return ghFailed("label_read_failed", after);
          if (parseLabelNames(after.stdout).includes(input.label)) {
            return { ok: false, reason: "label_still_present" };
          }
        }
        const added = await runGh(labelEditArgs(pr, input.label), ghEnv);
        if (added.status !== 0) return ghFailed("label_add_failed", added);
        const confirmed = await runGh(labelViewArgs(pr), ghEnv);
        if (confirmed.status !== 0) return ghFailed("label_read_failed", confirmed);
        if (!parseLabelNames(confirmed.stdout).includes(input.label)) {
          return { ok: false, reason: "label_add_unconfirmed" };
        }
        return { ok: true, reason: "labeled" };
      } catch (error) {
        const message = error instanceof Error ? error.message : "spawn_failed";
        return { ok: false, reason: `label_add_failed: ${message}` };
      }
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
