/**
 * Cross-runner ledger compare-and-swap.
 *
 * Two GitHub Actions runners do not share a filesystem. A lock directory
 * beside the ledger therefore cannot exclude them. The Contents API blob
 * `sha` can: the first PUT that still names that sha wins, and the second
 * receives 409. This module does not add labels and does not call Cursor.
 */
import type { FactoryLedger } from "./dispatch.ts";
import { spawnGh, type GhRun } from "./dispatch.ts";

export interface ContentsBlob {
  sha: string;
  ledger: FactoryLedger;
}

export interface ContentsRemote {
  get(): Promise<ContentsBlob | null>;
  /**
   * Write `ledger` only when the remote blob is still `expectedSha`.
   * `conflict` means another writer won. The remote is unchanged.
   */
  put(
    expectedSha: string,
    ledger: FactoryLedger,
  ): Promise<{ ok: true; sha: string } | { ok: false; reason: "conflict" }>;
}

/** In-memory stand-in for the Contents API. One object, many store clients. */
export class ContentsBlobRemote implements ContentsRemote {
  constructor(private blob: ContentsBlob) {}

  async get(): Promise<ContentsBlob> {
    return { sha: this.blob.sha, ledger: structuredClone(this.blob.ledger) };
  }

  async put(
    expectedSha: string,
    ledger: FactoryLedger,
  ): Promise<{ ok: true; sha: string } | { ok: false; reason: "conflict" }> {
    if (expectedSha !== this.blob.sha) return { ok: false, reason: "conflict" };
    const sha = `blob-${ledger.stateRevision}`;
    this.blob = { sha, ledger: structuredClone(ledger) };
    return { ok: true, sha };
  }
}

export class GitHubContentsStore {
  constructor(private readonly remote: ContentsRemote) {}

  async read(): Promise<FactoryLedger> {
    const current = await this.remote.get();
    if (!current) throw new Error("ledger_missing");
    return current.ledger;
  }

  async compareAndSwap(expected: number, next: FactoryLedger): Promise<boolean> {
    const current = await this.remote.get();
    if (!current) return false;
    if (current.ledger.stateRevision !== expected) return false;
    if (next.stateRevision !== expected + 1) return false;
    const wrote = await this.remote.put(current.sha, next);
    return wrote.ok;
  }

  async transact<T>(
    fn: (ledger: FactoryLedger) => Promise<{ write: FactoryLedger | null; result: T }>,
  ): Promise<T> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const current = await this.remote.get();
      if (!current) throw new Error("ledger_missing");
      const outcome = await fn(structuredClone(current.ledger));
      if (!outcome.write) return outcome.result;
      if (outcome.write.stateRevision !== current.ledger.stateRevision + 1) {
        throw new Error("revision_not_incremented");
      }
      const wrote = await this.remote.put(current.sha, outcome.write);
      if (wrote.ok) return outcome.result;
    }
    throw new Error("stale_commit");
  }
}

function childEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv | null {
  const token = env.WAKE_GITHUB_TOKEN;
  if (!token) return null;
  return { ...env, GH_TOKEN: token, GITHUB_TOKEN: token };
}

/**
 * Contents API client. GET returns the blob sha. PUT sends that sha back.
 * A stale sha is a conflict. Missing `WAKE_GITHUB_TOKEN` fails closed.
 */
export function githubContentsRemote(opts: {
  owner: string;
  repo: string;
  path: string;
  branch: string;
  env: NodeJS.ProcessEnv;
  runGh?: GhRun;
}): ContentsRemote {
  const runGh = opts.runGh ?? spawnGh;
  const apiPath = `repos/${opts.owner}/${opts.repo}/contents/${opts.path}`;
  return {
    async get() {
      const env = childEnv(opts.env);
      if (!env) return null;
      const result = await runGh(
        ["api", `${apiPath}?ref=${encodeURIComponent(opts.branch)}`],
        env,
      );
      if (result.status !== 0) return null;
      const body = JSON.parse(result.stdout) as { sha?: string; content?: string };
      if (!body.sha || !body.content) return null;
      const ledger = JSON.parse(Buffer.from(body.content, "base64").toString("utf8")) as FactoryLedger;
      return { sha: body.sha, ledger };
    },
    async put(expectedSha, ledger) {
      const env = childEnv(opts.env);
      if (!env) return { ok: false, reason: "conflict" };
      const payload = JSON.stringify({
        message: `factory ledger ${ledger.stateRevision}`,
        content: Buffer.from(`${JSON.stringify(ledger, null, 2)}\n`).toString("base64"),
        sha: expectedSha,
        branch: opts.branch,
      });
      const result = await runGh(["api", "--method", "PUT", apiPath, "--input", "-"], env, payload);
      if (result.status !== 0) return { ok: false, reason: "conflict" };
      let sha = `blob-${ledger.stateRevision}`;
      try {
        const body = JSON.parse(result.stdout) as { content?: { sha?: string } };
        if (body.content?.sha) sha = body.content.sha;
      } catch {
        // A 200 with an empty body still means the PUT landed.
      }
      return { ok: true, sha };
    },
  };
}
