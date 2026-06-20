import type { AuditRecord } from "./audits";

/** Row + name composite when both channels valid */
export type RecordReachability = "both" | "partial" | "none";

export function isRecordEmailValid(record: AuditRecord): boolean {
  const email = record.email.trim().toLowerCase();
  if (!email.includes("@") || email.endsWith("@")) return false;
  if (email.includes("gmial.com") || email.includes("example.invalid")) return false;
  return true;
}

export function isRecordPhoneValid(record: AuditRecord): boolean {
  const digits = record.phone.replace(/\D/g, "");
  if (digits.length < 10) return false;
  if (record.phone.includes("000-0000") || record.phone.includes("(000)")) return false;
  return true;
}

export function recordReachability(record: AuditRecord): RecordReachability {
  const emailOk = isRecordEmailValid(record);
  const phoneOk = isRecordPhoneValid(record);
  if (emailOk && phoneOk) return "both";
  if (emailOk || phoneOk) return "partial";
  return "none";
}

/** VS Code diff-style cell overlays (added / removed / partial) */
export function auditDiffOverlays(isDark: boolean) {
  if (isDark) {
    return {
      pass: "rgba(46, 160, 67, 0.22)",
      fail: "rgba(248, 81, 73, 0.22)",
      partial: "rgba(234, 179, 8, 0.22)",
    };
  }
  return {
    pass: "rgba(46, 160, 67, 0.18)",
    fail: "rgba(248, 81, 73, 0.16)",
    partial: "rgba(234, 179, 8, 0.18)",
  };
}

export function compositeRowOverlay(
  reachability: RecordReachability,
  isDark: boolean,
): string {
  const overlays = auditDiffOverlays(isDark);
  switch (reachability) {
    case "both":
      return overlays.pass;
    case "partial":
      return overlays.partial;
    case "none":
      return overlays.fail;
  }
}

export function channelCellOverlay(valid: boolean, isDark: boolean): string {
  const overlays = auditDiffOverlays(isDark);
  return valid ? overlays.pass : overlays.fail;
}
