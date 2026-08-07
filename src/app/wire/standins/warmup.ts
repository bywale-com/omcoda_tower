import type { WarmupPort, WarmupStage, WarmupState } from "../ports";

const DEFAULT_CAP = 50;
const state = new Map<string, WarmupState>();

function ensure(firmId: string): WarmupState {
  let row = state.get(firmId);
  if (!row) {
    row = {
      firmId,
      stage: "cold",
      dailyCap: DEFAULT_CAP,
      consumedToday: 0,
      remaining: DEFAULT_CAP,
    };
    state.set(firmId, row);
  }
  return { ...row, remaining: Math.max(0, row.dailyCap - row.consumedToday) };
}

export const standInWarmup: WarmupPort = {
  tag: "stand-in",
  async get(firmId) {
    return ensure(firmId);
  },
  async recordSend(firmId) {
    const row = ensure(firmId);
    row.consumedToday += 1;
    if (row.stage === "cold" && row.consumedToday > 0) row.stage = "ramp";
    if (row.consumedToday >= row.dailyCap * 0.8 && row.stage === "ramp") row.stage = "steady";
    state.set(firmId, row);
    return ensure(firmId);
  },
  async setStage(firmId, stage: WarmupStage) {
    const row = ensure(firmId);
    row.stage = stage;
    if (stage === "hold" || stage === "re-warmup") {
      row.dailyCap = Math.max(5, Math.floor(row.dailyCap / 2));
    }
    state.set(firmId, row);
    return ensure(firmId);
  },
};

export function clearStandInWarmup(): void {
  state.clear();
}
