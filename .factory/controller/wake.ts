/**
 * A worker may run when the pull request head is the authorized SHA, or when
 * every commit after that SHA changes only the factory ledger. The dispatch
 * record remains the authorization. A product commit after that SHA is stale.
 */
import type { DispatchRecord } from "./machine.ts";

export const LEDGER_ONLY_PATH = ".factory/state/ledger.json";

/**
 * The current dispatch for a label. History is ignored.
 * Two current records for one label are a refusal, not a choice.
 */
export function selectLabeledDispatch<T extends { dispatch: DispatchRecord | null }>(
  rows: readonly T[],
  label: string,
): { ok: true; row: T } | { ok: false; reason: "no_dispatch_record" | "ambiguous_dispatch" } {
  const matches = rows.filter((row) => row.dispatch?.label === label);
  if (matches.length === 0) return { ok: false, reason: "no_dispatch_record" };
  if (matches.length > 1) return { ok: false, reason: "ambiguous_dispatch" };
  return { ok: true, row: matches[0] };
}

export function headMatchesDispatch(input: {
  dispatchPrHead: string;
  head: string;
  isAncestor: boolean;
  changedPaths: string[];
}): { ok: boolean; reason: string } {
  if (!input.dispatchPrHead || !input.head) return { ok: false, reason: "pr_head_mismatch" };
  if (input.head === input.dispatchPrHead) return { ok: true, reason: "authorized" };
  if (!input.isAncestor) return { ok: false, reason: "pr_head_mismatch" };
  if (input.changedPaths.every((path) => path === LEDGER_ONLY_PATH)) return { ok: true, reason: "authorized" };
  return { ok: false, reason: "pr_head_moved" };
}
