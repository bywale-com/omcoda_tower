import type { CSSProperties } from "react";
import type { Tokens } from "../../components/tokens";
import type { HowUiRef } from "../../theory/types";
import { uiKindStyle } from "../../theory/uiKindStyles";

const ADD_STYLE = { color: "#B91C1C", bg: "rgba(220,38,38,0.12)" } as const;

function UiRefChip({ ref: uiRef, t }: { ref: HowUiRef; t: Tokens }) {
  const style = uiKindStyle(t, uiRef.kind);
  return (
    <span
      title={uiRef.does ?? style.label}
      style={{
        color: style.color,
        fontWeight: 600,
        background: style.bg,
        padding: "0 3px",
        borderRadius: 2,
        fontSize: "inherit",
      }}
    >
      {uiRef.label}
    </span>
  );
}

type TextPart =
  | { type: "text"; text: string }
  | { type: "ref"; ref: HowUiRef }
  | { type: "add"; label: string };

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

    const useRef =
      bestRef &&
      (!bestAdd ||
        bestRef.idx < bestAdd.idx ||
        (bestRef.idx === bestAdd.idx && bestRef.ref.label.length >= bestAdd.label.length));

    if (!useRef && !bestAdd) {
      parts.push({ type: "text", text: rest });
      break;
    }
    if (useRef && bestRef) {
      if (bestRef.idx > 0) parts.push({ type: "text", text: rest.slice(0, bestRef.idx) });
      parts.push({ type: "ref", ref: bestRef.ref });
      rest = rest.slice(bestRef.idx + bestRef.ref.label.length);
    } else if (bestAdd) {
      if (bestAdd.idx > 0) parts.push({ type: "text", text: rest.slice(0, bestAdd.idx) });
      parts.push({ type: "add", label: bestAdd.label });
      rest = rest.slice(bestAdd.idx + bestAdd.label.length);
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

  return (
    <span style={{ color: t.textPrimary, lineHeight: 1.5, ...style }}>
      {parts.map((part, i) =>
        part.type === "text" ? (
          <span key={i}>{part.text}</span>
        ) : part.type === "add" ? (
          <span
            key={i}
            style={{
              color: ADD_STYLE.color,
              fontWeight: 600,
              background: ADD_STYLE.bg,
              padding: "0 3px",
              borderRadius: 2,
            }}
          >
            {part.label}
          </span>
        ) : (
          <UiRefChip key={i} ref={part.ref} t={t} />
        ),
      )}
    </span>
  );
}
