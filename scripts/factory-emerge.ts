/**
 * Opens one pull request to main for each verified release, and mails the founder.
 * It does not merge. A merged release is recorded from the merge SHA that GitHub returns.
 *
 * Without --apply this process prints the ready releases and exits.
 * --apply writes the ledger and opens the pull request. Mail is sent only when
 * EMERGE_EMAIL, RESEND_API_KEY, and RESEND_FROM_EMAIL are set. A missing mail
 * secret does not skip the pull request and does not fail the run.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GitHubContentsStore, githubContentsRemote } from "../.factory/controller/contents.ts";
import { commitLedgerEvent } from "../.factory/controller/queue.ts";
import { readyReleases } from "../.factory/controller/conclusion.ts";
import type { FactoryLedger } from "../.factory/controller/dispatch.ts";
import type { WorkItem } from "../.factory/controller/machine.ts";

const apply = process.argv.includes("--apply");

function git(args: string[], cwd?: string): string {
  return execFileSync("git", args, { encoding: "utf8", cwd }).trim();
}

function fail(reason: string): never {
  console.error(reason);
  process.exit(1);
}

const remoteUrl = git(["remote", "get-url", "origin"]);
const slug = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
if (!slug) fail("ledger_branch_unset");
const owner = slug[1];
const repo = slug[2];
const branch = process.env.FACTORY_LEDGER_BRANCH?.trim() || git(["rev-parse", "--abbrev-ref", "HEAD"]);
if (!branch || branch === "HEAD") fail("ledger_branch_unset");

const store = new GitHubContentsStore(
  githubContentsRemote({
    owner,
    repo,
    path: ".factory/state/ledger.json",
    branch,
    env: process.env,
    credential: process.env.WAKE_GITHUB_TOKEN ? "wake" : "ambient",
  }),
);

const ledger = await store.read();
const opened = Object.keys(ledger.releases ?? {});
const ready = readyReleases(Object.values(ledger.packets), opened);

if (!apply) {
  console.log(JSON.stringify({ status: ledger.scope.status, ready, opened }));
  process.exit(0);
}

const world = {
  activation: "active" as const,
  now: new Date().toISOString(),
  engineeringBusy: false,
  budgetUsd: null,
  authorizedDispatches: ledger.authorizedDispatches,
  usedDispatches: ledger.usedDispatches,
  scopeStatus: ledger.scope.status,
};

await concludeMerged(ledger);

if (ledger.scope.status !== "active") {
  console.log(ledger.scope.status === "suspended" ? "suspended" : ledger.scope.status);
  process.exit(0);
}

const current = await store.read();
const stillReady = readyReleases(Object.values(current.packets), Object.keys(current.releases ?? {}));
for (const release of stillReady) {
  const openedPr = await openRelease(current, release);
  const wrote = await commitLedgerEvent(
    store,
    {
      type: "record_release",
      id: release.id,
      packetIds: release.packetIds,
      prNumber: openedPr.number,
      prUrl: openedPr.url,
      openedAt: new Date().toISOString(),
    },
    world,
  );
  if (!wrote.ok) fail(wrote.reason);
  await sendLetter(release, current, openedPr.url);
  console.log(`emerged ${release.id} ${openedPr.url}`);
}
if (!stillReady.length) console.log("no_release");

async function concludeMerged(source: FactoryLedger): Promise<void> {
  for (const release of Object.values(source.releases ?? {})) {
    if (release.mergeSha || !release.prNumber) continue;
    const view = gh(["pr", "view", String(release.prNumber), "--repo", `${owner}/${repo}`, "--json", "state,mergeCommit"]);
    const body = JSON.parse(view) as { state?: string; mergeCommit?: { oid?: string } };
    if (body.state !== "MERGED") continue;
    const mergeSha = body.mergeCommit?.oid ?? "";
    if (!/^[0-9a-f]{40}$/i.test(mergeSha)) fail("integration_evidence_missing");
    const wrote = await commitLedgerEvent(
      store,
      {
        type: "conclude_release",
        id: release.id,
        mergeSha,
        reconciliationId: `pr-${release.prNumber}-${mergeSha}`,
      },
      world,
    );
    if (!wrote.ok) fail(wrote.reason);
    console.log(`concluded ${release.id} ${mergeSha}`);
  }
}

async function openRelease(
  source: FactoryLedger,
  release: { id: string; packetIds: string[] },
): Promise<{ number: number; url: string }> {
  const packets = release.packetIds.map((id) => source.packets[id]).filter((packet): packet is WorkItem => Boolean(packet));
  const paths = releasePaths(packets);
  if (!paths.length) fail("release_empty");
  git(["fetch", "origin", "main"]);
  const directory = mkdtempSync(join(tmpdir(), "tower-release-"));
  try {
    git(["worktree", "add", "--detach", directory, "origin/main"]);
    for (const path of paths) {
      git(["checkout", path.sha, "--", path.path], directory);
    }
    git(["add", "--", ...paths.map((path) => path.path)], directory);
    const status = git(["status", "--porcelain"], directory);
    if (!status) fail("release_empty");
    const author = git(["log", "-1", "--format=%an%n%ae"]);
    const [name, email] = author.split("\n");
    if (!name || !email) fail("git_identity_missing");
    git(["-c", `user.name=${name}`, "-c", `user.email=${email}`, "commit", "-m", `Release ${release.id}`], directory);
    const head = `release/${release.id}`;
    gitPush([`HEAD:refs/heads/${head}`], directory);
    const url = gh([
      "pr",
      "create",
      "--repo",
      `${owner}/${repo}`,
      "--base",
      "main",
      "--head",
      head,
      "--title",
      `Release ${packets.map((packet) => packet.id).join(", ")}`,
      "--body",
      letterBody(release, source, ""),
    ]);
    const numberLine = gh(["pr", "view", url, "--repo", `${owner}/${repo}`, "--json", "number", "--jq", ".number"]);
    return { number: Number(numberLine), url };
  } finally {
    git(["worktree", "remove", "--force", directory]);
    rmSync(directory, { recursive: true, force: true });
  }
}

function releasePaths(packets: WorkItem[]): Array<{ path: string; sha: string }> {
  const chosen = new Map<string, { sha: string; when: number }>();
  for (const packet of packets) {
    const sha = packet.verifiedSha;
    if (!sha) continue;
    ensureRevision(sha);
    let names = "";
    try {
      names = git(["diff-tree", "--no-commit-id", "--name-only", "-r", `${sha}^`, sha]);
    } catch {
      fail("sha_missing");
    }
    let when = 0;
    try {
      when = Number(git(["log", "-1", "--format=%ct", sha]));
    } catch {
      fail("sha_missing");
    }
    for (const path of names.split("\n").map((line) => line.trim()).filter(Boolean)) {
      if (path === ".factory/state/ledger.json" || path.startsWith(".factory/") || path.startsWith("docs/factory/")) continue;
      const current = chosen.get(path);
      if (!current || when >= current.when) chosen.set(path, { sha, when });
    }
  }
  return [...chosen.entries()].map(([path, picked]) => ({ path, sha: picked.sha }));
}

/** A dispatch checkout is shallow. The verified commit and its parent must be present before the diff. */
function ensureRevision(sha: string): void {
  const present = (rev: string): boolean => {
    try {
      git(["rev-parse", "--verify", "--quiet", rev]);
      return true;
    } catch {
      return false;
    }
  };
  if (present(`${sha}^{commit}`) && present(`${sha}^`)) return;
  try {
    git(["fetch", "--depth=2", "origin", sha]);
  } catch {
    fail("sha_missing");
  }
  if (!present(`${sha}^{commit}`) || !present(`${sha}^`)) fail("sha_missing");
}

function letterBody(
  release: { id: string; packetIds: string[] },
  source: FactoryLedger,
  prUrl: string,
): string {
  const lines = [`${release.id} is verified and ready for review.`, ""];
  if (prUrl) lines.push(prUrl, "");
  for (const id of release.packetIds) {
    const packet = source.packets[id];
    if (!packet) continue;
    lines.push(`${packet.id}`);
    lines.push(`verified ${packet.verifiedSha ?? ""}`);
    for (const check of packet.execution?.checks ?? []) {
      if (check.outcome === "pass" && check.runId) lines.push(`check ${check.name} ${check.runId}`);
    }
    lines.push(`spec docs/factory/initiatives/${packet.initiativeId}/systems/SCP-${packet.id}.md`);
    lines.push("");
  }
  lines.push("Merging this pull request into main concludes the release.");
  return lines.join("\n");
}

async function sendLetter(
  release: { id: string; packetIds: string[] },
  source: FactoryLedger,
  prUrl: string,
): Promise<void> {
  const to = process.env.EMERGE_EMAIL?.trim() ?? "";
  const key = process.env.RESEND_API_KEY?.trim() ?? "";
  const sender = process.env.RESEND_FROM_EMAIL?.trim() ?? "";
  if (!to || !key || !sender) {
    console.log("mail_unconfigured");
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: sender,
      to: [to],
      subject: `${release.id} emerged — review this release`,
      text: letterBody(release, source, prUrl),
    }),
  });
  if (!response.ok) console.log(`mail_failed ${response.status}`);
}

function gitPush(refspecs: string[], cwd: string): void {
  const token = process.env.WAKE_GITHUB_TOKEN;
  if (token) {
    // actions/checkout stores its own Authorization header. Replace it with the wake token.
    // A one-shot env header was not used for this push, and a second header is rejected.
    try {
      execFileSync("git", ["config", "--unset-all", "http.https://github.com/.extraheader"], { cwd, encoding: "utf8" });
    } catch {
      // The header is absent outside Actions.
    }
    const basic = Buffer.from(`x-access-token:${token}`).toString("base64");
    try {
      execFileSync(
        "git",
        ["config", "--local", "http.https://github.com/.extraheader", `AUTHORIZATION: basic ${basic}`],
        { cwd, encoding: "utf8" },
      );
    } catch {
      fail("release_push_auth");
    }
  }
  try {
    execFileSync("git", ["push", "origin", ...refspecs], { cwd, encoding: "utf8" });
  } catch {
    fail("release_push_failed");
  }
}

function gh(args: string[]): string {
  return execFileSync("gh", args, {
    encoding: "utf8",
    env: process.env.WAKE_GITHUB_TOKEN
      ? { ...process.env, GH_TOKEN: process.env.WAKE_GITHUB_TOKEN, GITHUB_TOKEN: process.env.WAKE_GITHUB_TOKEN }
      : process.env,
  }).trim();
}
