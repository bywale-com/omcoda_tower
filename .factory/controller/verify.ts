/**
 * Which candidate SHAs still need a proof run.
 * A run already open, already green, or already failed for that SHA is not started again.
 * The proof is the packet script `scripts/verify-<rest>.ts`.
 */

export interface ShaCandidate {
  packetId: string;
  sha: string;
}

export interface ObservedJob {
  name: string;
  status: string;
  conclusion: string | null;
  runId: string;
}

export interface VerifyStart {
  sha: string;
  proofs: string[];
}

export interface VerifyRecord {
  packetId: string;
  sha: string;
  runId: string;
  checkName: string;
}

export interface VerifyPlan {
  start: VerifyStart[];
  record: VerifyRecord[];
}

export function proofScript(packetId: string): string | null {
  const match = /^pkt-\d{3}-([a-z0-9-]+)$/.exec(packetId);
  if (!match) return null;
  return `scripts/verify-${match[1]}.ts`;
}

export function checkName(script: string): string {
  return script.slice("scripts/".length, -".ts".length);
}

export function verifyJobName(sha: string): string {
  return sha;
}

export function planVerifications(candidates: readonly ShaCandidate[], jobs: readonly ObservedJob[]): VerifyPlan {
  const bySha = new Map<string, ShaCandidate[]>();
  const ordered = [...candidates].sort((a, b) => a.packetId.localeCompare(b.packetId));
  for (const candidate of ordered) {
    if (!/^[0-9a-f]{40}$/.test(candidate.sha)) continue;
    const script = proofScript(candidate.packetId);
    if (!script) continue;
    const list = bySha.get(candidate.sha) ?? [];
    list.push(candidate);
    bySha.set(candidate.sha, list);
  }
  const start: VerifyStart[] = [];
  const record: VerifyRecord[] = [];
  const shas = [...bySha.keys()].sort();
  for (const sha of shas) {
    const packets = bySha.get(sha) ?? [];
    const matched = jobs.filter((job) => job.name === verifyJobName(sha) || job.name.includes(sha));
    const open = matched.some((job) => job.status !== "completed");
    if (open) continue;
    const succeeded = matched.find((job) => job.status === "completed" && job.conclusion === "success");
    if (succeeded) {
      for (const packet of packets) {
        const script = proofScript(packet.packetId);
        if (!script) continue;
        record.push({ packetId: packet.packetId, sha, runId: succeeded.runId, checkName: checkName(script) });
      }
      continue;
    }
    if (matched.some((job) => job.status === "completed")) continue;
    const proofs = [...new Set(packets.map((packet) => proofScript(packet.packetId)).filter((script): script is string => Boolean(script)))];
    start.push({ sha, proofs });
  }
  return { start, record };
}
