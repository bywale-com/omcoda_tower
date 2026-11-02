/**
 * Print the factory explanation for the current ledger.
 * Reads the live branch when FACTORY_LEDGER_BRANCH and WAKE_GITHUB_TOKEN are set.
 * Otherwise reads the ledger file in this checkout. Never writes.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GitHubContentsStore, githubContentsRemote } from "../.factory/controller/contents.ts";
import type { FactoryLedger } from "../.factory/controller/dispatch.ts";
import { explainFactory } from "../.factory/controller/explain.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function load(): Promise<FactoryLedger> {
  const branch = process.env.FACTORY_LEDGER_BRANCH?.trim();
  if (branch && process.env.WAKE_GITHUB_TOKEN) {
    const remoteUrl = execFileSync("git", ["remote", "get-url", "origin"], { encoding: "utf8", cwd: root }).trim();
    const slug = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
    if (!slug) throw new Error("ledger_branch_unset");
    const store = new GitHubContentsStore(
      githubContentsRemote({
        owner: slug[1],
        repo: slug[2],
        path: ".factory/state/ledger.json",
        branch,
        env: process.env,
        credential: "wake",
      }),
    );
    return store.read();
  }
  return JSON.parse(readFileSync(join(root, ".factory/state/ledger.json"), "utf8")) as FactoryLedger;
}

const ledger = await load();
console.log(JSON.stringify(explainFactory(ledger, new Date().toISOString()), null, 2));
