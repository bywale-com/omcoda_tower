import { isFixturePresent } from "../fixtures/store";
import type { EscrowPort, EscrowStatus } from "../ports";

type Row = { status: EscrowStatus; counselGate: "pending" | "cleared" | "blocked" };
const byFirm = new Map<string, Row>();

export const standInEscrow: EscrowPort = {
  tag: "stand-in",
  async get(firmId) {
    const row = byFirm.get(firmId) ?? { status: "none" as const, counselGate: "pending" as const };
    const counselCleared =
      isFixturePresent("counsel_mt_msb_cleared", firmId) || isFixturePresent("counsel_mt_msb_cleared");
    return {
      status: row.status,
      counselGate: counselCleared ? "cleared" : row.counselGate,
    };
  },
  async hold(firmId) {
    const paymentOk =
      isFixturePresent("payment_identity_provisioned", firmId) ||
      isFixturePresent("payment_identity_provisioned");
    if (!paymentOk) {
      const failed: Row = { status: "failed_hold", counselGate: "pending" };
      byFirm.set(firmId, failed);
      return { status: "failed_hold" };
    }
    const held: Row = { status: "held", counselGate: "pending" };
    byFirm.set(firmId, held);
    return { status: "held" };
  },
};

export function clearStandInEscrow(): void {
  byFirm.clear();
}
