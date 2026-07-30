import type { CSSProperties } from "react";
import type { Tokens } from "../../components/tokens";
import type { HowUiRef } from "../../theory/types";
import { uiKindStyle } from "../../theory/uiKindStyles";
import { useOptionalRegisterTrace } from "../../trace/RegisterTraceContext";
import {
  SURFACE_CATALOG,
  getSurfaceByLabel,
  listVocabLabels,
  resolveSurfaceLabel,
  type RegisterSurfaceEntry,
} from "../../trace/surfaceCatalog";

const ADD_STYLE = { color: "#B91C1C", bg: "rgba(220,38,38,0.12)" } as const;

function surfaceForChip(label: string): RegisterSurfaceEntry | undefined {
  return getSurfaceByLabel(label) ?? resolveSurfaceLabel(label);
}

function catalogNeedles(): string[] {
  const aliases: string[] = [];
  for (const e of SURFACE_CATALOG) {
    for (const a of e.aliases ?? []) aliases.push(a);
  }
  return [...listVocabLabels(), ...aliases].sort((a, b) => b.length - a.length);
}

const CATALOG_NEEDLES = catalogNeedles();

function FocusableChip({
  label,
  title,
  color,
  bg,
}: {
  label: string;
  title?: string;
  color: string;
  bg: string;
  t: Tokens;
}) {
  const trace = useOptionalRegisterTrace();
  const surface = surfaceForChip(label);
  const clickable = Boolean(surface && trace);

  const style: CSSProperties = {
    color,
    fontWeight: 600,
    background: bg,
    padding: "0 3px",
    borderRadius: 2,
    fontSize: "inherit",
    cursor: clickable ? "pointer" : undefined,
  };

  if (!clickable || !surface || !trace) {
    return (
      <span title={title} style={style}>
        {label}
      </span>
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      title="Open on canvas"
      style={style}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        trace.focusSurface(surface.label);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          trace.focusSurface(surface.label);
        }
      }}
      onMouseEnter={() => trace.setHovered(surface.id)}
      onMouseLeave={() => trace.setHovered(null)}
    >
      {label}
    </span>
  );
}

function UiRefChip({ uiRef, t }: { uiRef: HowUiRef; t: Tokens }) {
  const style = uiKindStyle(t, uiRef.kind);
  return (
    <FocusableChip
      label={uiRef.label}
      title={uiRef.does ?? style.label}
      color={style.color}
      bg={style.bg}
      t={t}
    />
  );
}

type TextPart =
  | { type: "text"; text: string }
  | { type: "ref"; ref: HowUiRef }
  | { type: "add"; label: string }
  | { type: "vocab"; label: string };

function splitTextWithRefs(text: string, refs: HowUiRef[], additions: string[]): TextPart[] {
  const sortedRefs = [...refs].sort((a, b) => b.label.length - a.label.length);
  const sortedAdds = [...additions].sort((a, b) => b.length - a.length);
  const parts: TextPart[] = [];
  let rest = text;

  while (rest.length > 0) {
    let bestRef: { idx: number; ref: HowUiRef } | null = null;
    for (const ref of sortedRefs) {
      const idx = rest.indexOf(ref.label);
      if (idx === -1) continue;
      if (!bestRef || idx < bestRef.idx || (idx === bestRef.idx && ref.label.length > bestRef.ref.label.length)) {
        bestRef = { idx, ref };
      }
    }
    let bestAdd: { idx: number; label: string } | null = null;
    for (const label of sortedAdds) {
      const idx = rest.indexOf(label);
      if (idx === -1) continue;
      if (!bestAdd || idx < bestAdd.idx || (idx === bestAdd.idx && label.length > bestAdd.label.length)) {
        bestAdd = { idx, label };
      }
    }
    let bestVocab: { idx: number; label: string } | null = null;
    for (const label of CATALOG_NEEDLES) {
      const idx = rest.indexOf(label);
      if (idx === -1) continue;
      if (
        !bestVocab ||
        idx < bestVocab.idx ||
        (idx === bestVocab.idx && label.length > bestVocab.label.length)
      ) {
        bestVocab = { idx, label };
      }
    }

    type Cand = { kind: "ref" | "add" | "vocab"; idx: number; len: number };
    const candidates: Cand[] = [];
    if (bestRef) candidates.push({ kind: "ref", idx: bestRef.idx, len: bestRef.ref.label.length });
    if (bestAdd) candidates.push({ kind: "add", idx: bestAdd.idx, len: bestAdd.label.length });
    if (bestVocab) candidates.push({ kind: "vocab", idx: bestVocab.idx, len: bestVocab.label.length });

    if (candidates.length === 0) {
      parts.push({ type: "text", text: rest });
      break;
    }

    // Earliest match; at same index prefer longest; ties prefer ref > add > vocab
    const rank = { ref: 0, add: 1, vocab: 2 } as const;
    candidates.sort((a, b) => a.idx - b.idx || b.len - a.len || rank[a.kind] - rank[b.kind]);
    const winner = candidates[0];

    if (winner.idx > 0) parts.push({ type: "text", text: rest.slice(0, winner.idx) });

    if (winner.kind === "ref" && bestRef) {
      parts.push({ type: "ref", ref: bestRef.ref });
      rest = rest.slice(bestRef.idx + bestRef.ref.label.length);
    } else if (winner.kind === "add" && bestAdd) {
      parts.push({ type: "add", label: bestAdd.label });
      rest = rest.slice(bestAdd.idx + bestAdd.label.length);
    } else if (winner.kind === "vocab" && bestVocab) {
      parts.push({ type: "vocab", label: bestVocab.label });
      rest = rest.slice(bestVocab.idx + bestVocab.label.length);
    }
  }

  return parts;
}

export function TextWithUiRefs({
  text,
  refs = [],
  additions = [],
  style,
  t,
}: {
  text: string;
  refs?: HowUiRef[];
  additions?: string[];
  style?: CSSProperties;
  t: Tokens;
}) {
  const parts = splitTextWithRefs(text, refs, additions);
  const blockStyle = uiKindStyle(t, "block");

  return (
    <span style={{ color: t.textPrimary, lineHeight: 1.5, ...style }}>
      {parts.map((part, i) =>
        part.type === "text" ? (
          <span key={i}>{part.text}</span>
        ) : part.type === "add" ? (
          <FocusableChip
            key={i}
            label={part.label}
            color={ADD_STYLE.color}
            bg={ADD_STYLE.bg}
            t={t}
          />
        ) : part.type === "vocab" ? (
          <FocusableChip
            key={i}
            label={part.label}
            color={blockStyle.color}
            bg={blockStyle.bg}
            t={t}
          />
        ) : (
          <UiRefChip key={i} uiRef={part.ref} t={t} />
        ),
      )}
    </span>
  );
}
