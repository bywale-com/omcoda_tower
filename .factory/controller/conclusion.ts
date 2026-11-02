/**
 * A release is the smallest dependency-closed set that is true on its own.
 * Every dependency is already accepted or inside the set, and every packet
 * still open in the set is `verified`. The controller does not merge it.
 */
import type { WorkItem } from "./machine.ts";

const SATISFIED = new Set(["accepted", "integrated", "reconciled", "integration_authorized"]);

export interface ReadyRelease {
  id: string;
  packetIds: string[];
}

/** Undirected components joined only by sibling basis `dependency`. */
export function dependencyComponents(packets: readonly WorkItem[]): string[][] {
  const ids = new Set(packets.map((packet) => packet.id));
  const adjacent = new Map<string, Set<string>>();
  for (const packet of packets) adjacent.set(packet.id, new Set());
  for (const packet of packets) {
    for (const link of packet.siblings ?? []) {
      if (link.basis !== "dependency" || !ids.has(link.id)) continue;
      adjacent.get(packet.id)?.add(link.id);
      adjacent.get(link.id)?.add(packet.id);
    }
  }
  const seen = new Set<string>();
  const components: string[][] = [];
  for (const packet of [...packets].sort((a, b) => a.id.localeCompare(b.id))) {
    if (seen.has(packet.id)) continue;
    const component: string[] = [];
    const queue = [packet.id];
    seen.add(packet.id);
    while (queue.length) {
      const id = queue.shift() as string;
      component.push(id);
      for (const neighbor of adjacent.get(id) ?? []) {
        if (seen.has(neighbor)) continue;
        seen.add(neighbor);
        queue.push(neighbor);
      }
    }
    components.push(component.sort());
  }
  return components;
}

/**
 * Releases that are verified and not yet recorded.
 * A packet still short of `verified` holds its whole dependency component.
 */
export function readyReleases(packets: readonly WorkItem[], openedIds: readonly string[] = []): ReadyRelease[] {
  const byId = new Map(packets.map((packet) => [packet.id, packet]));
  const opened = new Set(openedIds);
  const releases: ReadyRelease[] = [];
  for (const component of dependencyComponents(packets)) {
    const open = component.filter((id) => {
      const stage = byId.get(id)?.stage;
      return stage != null && !SATISFIED.has(stage);
    });
    if (!open.length) continue;
    if (!open.every((id) => byId.get(id)?.stage === "verified" && byId.get(id)?.verifiedSha)) continue;
    const packetIds = [...open].sort();
    const id = `rel-${packetIds.join("--")}`;
    if (opened.has(id)) continue;
    releases.push({ id, packetIds });
  }
  return releases;
}
