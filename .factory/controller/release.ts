import { readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";

/**
 * Keeps a packet's Wake line and its manifest on the same release.
 * Manual evidence is not a release. Gates that are not all true are not a release.
 * A packet that changes the glass is not a release until the controller can read
 * a plate image and all five plate-read buckets are filled.
 */

export const PLATE_BUCKETS = ["Copy", "Do not build", "Implied", "Completes", "Out of scope"] as const;

export type PlateBucket = (typeof PLATE_BUCKETS)[number];

export type UiClass = "none" | "changes";

export interface PlateArtifact {
  bytes: number;
  header?: ArrayLike<number>;
}

export interface PlateEvidence {
  artifacts?: Readonly<Record<string, PlateArtifact>>;
}

export interface ReleaseManifest {
  id?: string;
  wake?: string;
  release?: string;
  execution?: string;
  ui?: UiClass | string;
  plates?: "none" | string;
  gates?: Record<string, boolean>;
  [key: string]: unknown;
}

const WAKE_LINE = /^\*\*Wake:\*\* .+$/m;
const UI_LINE = /^\*\*UI:\*\* (none|changes)[ \t]*$/gm;
const BUCKET_LINE = /^(?:#{1,6}[ \t]+)?(Do not build|Out of scope|Copy|Implied|Completes)[ \t]*(?::[ \t]*(.*))?$/i;
const ARTIFACT_LINE = /^Artifact:[ \t]+(\S+)[ \t]*$/m;
const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;
const ARCHITECT_APPROVAL_KEYS = ["founderApproved", "plateApproval", "approver", "founderApproval", "founderPlateApproval"] as const;

export function markReleased(
  markdown: string,
  manifest: ReleaseManifest,
  evidence: PlateEvidence = {},
): { ok: true; markdown: string; manifest: ReleaseManifest } | { ok: false; reason: string } {
  if (manifest.execution === "manual") return { ok: false, reason: "manual_evidence_not_a_release" };
  const gates = manifest.gates ?? {};
  const values = Object.values(gates);
  if (!values.length || values.some((gate) => gate !== true)) return { ok: false, reason: "gates_failed" };
  if (!WAKE_LINE.test(markdown)) return { ok: false, reason: "wake_line_missing" };

  const agreed = agreedUi(markdown, manifest);
  if (!agreed.ok) return agreed;
  const ui = agreed.ui;
  const body = platesBody(markdown);

  if (ui === "none") {
    if (body === null || !isNonePlates(body)) return { ok: false, reason: "plates_not_none" };
    return {
      ok: true,
      markdown: markdown.replace(WAKE_LINE, "**Wake:** sa"),
      manifest: releasedManifest(manifest, "none", "none"),
    };
  }

  if (!manifest.id) return { ok: false, reason: "packet_id_missing" };
  const plate = body === null ? { artifact: null, buckets: emptyBuckets() } : readPlate(body);
  if (!plate.artifact || !accessibleArtifact(plate.artifact, evidence.artifacts)) {
    return { ok: false, reason: "plate_missing" };
  }
  if (PLATE_BUCKETS.some((bucket) => plate.buckets[bucket].length === 0)) {
    return { ok: false, reason: "plate_read_incomplete" };
  }

  return {
    ok: true,
    markdown: markdown.replace(WAKE_LINE, "**Wake:** sa"),
    manifest: releasedManifest(manifest, "changes", plate.artifact),
  };
}

function agreedUi(
  markdown: string,
  manifest: ReleaseManifest,
): { ok: true; ui: UiClass } | { ok: false; reason: string } {
  UI_LINE.lastIndex = 0;
  const lines = markdown.match(UI_LINE) ?? [];
  UI_LINE.lastIndex = 0;
  const fromMarkdown = lines.length === 1 ? (lines[0].includes("changes") ? "changes" : "none") : null;
  const fromManifest = manifest.ui === "none" || manifest.ui === "changes" ? manifest.ui : null;
  if (fromMarkdown && fromManifest && fromMarkdown !== fromManifest) {
    return { ok: false, reason: "ui_classification_mismatch" };
  }
  if (!fromMarkdown || !fromManifest) return { ok: false, reason: "ui_unclassified" };
  return { ok: true, ui: fromMarkdown };
}

function platesBody(markdown: string): string | null {
  const match = /^## Plates[ \t]*$/m.exec(markdown);
  if (!match || match.index === undefined) return null;
  const rest = markdown.slice(match.index + match[0].length).replace(/^\r?\n/, "");
  const next = /^## [^#\n].*$/m.exec(rest);
  return (next ? rest.slice(0, next.index) : rest).trim();
}

function isNonePlates(body: string): boolean {
  return /^(?:none|no plate)\.?$/i.test(body.trim());
}

function emptyBuckets(): Record<PlateBucket, string> {
  return { Copy: "", "Do not build": "", Implied: "", Completes: "", "Out of scope": "" };
}

function canonicalBucket(label: string): PlateBucket {
  const found = PLATE_BUCKETS.find((bucket) => bucket.toLowerCase() === label.toLowerCase());
  if (!found) throw new Error(`unknown plate bucket ${label}`);
  return found;
}

function readPlate(body: string): { artifact: string | null; buckets: Record<PlateBucket, string> } {
  const artifact = ARTIFACT_LINE.exec(body)?.[1] ?? null;
  const collected: Record<PlateBucket, string[]> = {
    Copy: [],
    "Do not build": [],
    Implied: [],
    Completes: [],
    "Out of scope": [],
  };
  let current: PlateBucket | null = null;
  for (const line of body.split(/\r?\n/)) {
    if (ARTIFACT_LINE.test(line)) {
      current = null;
      continue;
    }
    const match = BUCKET_LINE.exec(line);
    if (match) {
      current = canonicalBucket(match[1]);
      const inline = (match[2] ?? "").trim();
      if (inline) collected[current].push(inline);
      continue;
    }
    if (current && line.trim()) collected[current].push(line.trim());
  }
  const buckets = emptyBuckets();
  for (const bucket of PLATE_BUCKETS) buckets[bucket] = collected[bucket].join(" ").trim();
  return { artifact, buckets };
}

function accessibleArtifact(path: string, artifacts: PlateEvidence["artifacts"]): boolean {
  if (!safePlatePath(path)) return false;
  const file = artifacts?.[path];
  return !!file && Number.isFinite(file.bytes) && file.bytes > 0 && imageMagic(file.header);
}

function safePlatePath(path: string): boolean {
  if (!IMAGE_EXT.test(path)) return false;
  if (path.startsWith("/") || path.includes("\\")) return false;
  return path.split("/").every((part) => part !== "" && part !== "." && part !== "..");
}

function imageMagic(header: ArrayLike<number> | undefined): boolean {
  if (!header || header.length < 4) return false;
  const byte = (index: number) => header[index] ?? -1;
  if (byte(0) === 0x89 && byte(1) === 0x50 && byte(2) === 0x4e && byte(3) === 0x47) return true;
  if (byte(0) === 0xff && byte(1) === 0xd8 && byte(2) === 0xff) return true;
  if (byte(0) === 0x47 && byte(1) === 0x49 && byte(2) === 0x46 && byte(3) === 0x38) return true;
  return (
    header.length >= 12 &&
    byte(0) === 0x52 &&
    byte(1) === 0x49 &&
    byte(2) === 0x46 &&
    byte(3) === 0x46 &&
    byte(8) === 0x57 &&
    byte(9) === 0x45 &&
    byte(10) === 0x42 &&
    byte(11) === 0x50
  );
}

/** Reads plate images from disk. A missing, empty, or non-image file is omitted. */
export function readPlateArtifacts(root: string, paths: readonly string[]): Record<string, PlateArtifact> {
  const found: Record<string, PlateArtifact> = {};
  for (const path of paths) {
    const abs = plateFile(root, path);
    if (!abs) continue;
    let buf: Buffer;
    try {
      buf = readFileSync(abs);
    } catch {
      continue;
    }
    const header = buf.subarray(0, 16);
    if (buf.length === 0 || !imageMagic(header)) continue;
    found[path] = { bytes: buf.length, header };
  }
  return found;
}

function plateFile(root: string, path: string): string | null {
  if (!safePlatePath(path)) return null;
  const rootAbs = resolve(root);
  const abs = resolve(rootAbs, path);
  const rel = relative(rootAbs, abs);
  if (rel.startsWith("..") || isAbsolute(rel)) return null;
  return abs;
}

function releasedManifest(manifest: ReleaseManifest, ui: UiClass, plates: "none" | string): ReleaseManifest {
  const next: ReleaseManifest = { ...manifest, wake: "sa", release: "released", ui, plates };
  for (const key of ARCHITECT_APPROVAL_KEYS) delete next[key];
  return next;
}
