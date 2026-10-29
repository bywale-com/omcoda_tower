/**
 * A worker may run when the pull request head is the authorized SHA, or when
 * every commit after that SHA changes only the factory ledger. The dispatch
 * record remains the authorization. A product commit after that SHA is stale.
 */

export const LEDGER_ONLY_PATH = ".factory/state/ledger.json";

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
