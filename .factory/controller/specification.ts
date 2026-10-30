/**
 * Headings of a systems-change packet. The controller signs keys, not prose.
 * A heading with no body is still incomplete work for a person; the machine
 * only checks that each required key is present.
 */
import { REQUIRED_CHANGE_SECTIONS } from "./machine.ts";

const HEADINGS: Record<string, (typeof REQUIRED_CHANGE_SECTIONS)[number]> = {
  intent: "intent",
  "must / must-not": "must",
  must: "must",
  "stores and contracts": "stores",
  stores: "stores",
  runtime: "runtime",
  ports: "ports",
  verify: "verify",
  "out of scope": "out_of_scope",
  "impact manifest": "impact_manifest",
  "dependency reconciliation": "dependency_reconciliation",
};

export function sectionsFromSpecification(markdown: string): string[] {
  const found = new Set<string>();
  for (const line of markdown.split("\n")) {
    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const key = HEADINGS[match[1].trim().toLowerCase()];
    if (key) found.add(key);
  }
  return REQUIRED_CHANGE_SECTIONS.filter((section) => found.has(section));
}
