/**
 * Keeps a packet's Wake line and its manifest on the same release.
 * Manual evidence is not a release. Gates that are not all true are not a release.
 */

export interface ReleaseManifest {
  wake?: string;
  release?: string;
  execution?: string;
  gates?: Record<string, boolean>;
  [key: string]: unknown;
}

const WAKE_LINE = /^\*\*Wake:\*\* .+$/m;

export function markReleased(
  markdown: string,
  manifest: ReleaseManifest,
): { ok: true; markdown: string; manifest: ReleaseManifest } | { ok: false; reason: string } {
  if (manifest.execution === "manual") return { ok: false, reason: "manual_evidence_not_a_release" };
  const gates = manifest.gates ?? {};
  const values = Object.values(gates);
  if (!values.length || values.some((gate) => gate !== true)) return { ok: false, reason: "gates_failed" };
  if (!WAKE_LINE.test(markdown)) return { ok: false, reason: "wake_line_missing" };
  return {
    ok: true,
    markdown: markdown.replace(WAKE_LINE, "**Wake:** sa"),
    manifest: { ...manifest, wake: "sa", release: "released" },
  };
}
