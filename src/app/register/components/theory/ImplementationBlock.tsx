import { useState } from "react";
import type { Tokens } from "../../components/tokens";
import { TextWithUiRefs } from "./TextWithUiRefs";
import { registerFieldLabelStyle } from "./RegisterTheoryPanel";

/** Implementation door — collapsed by default. Global Register interaction class. */
export function ImplementationBlock({
  problem,
  implementation,
  additions = [],
  notDone,
  t,
}: {
  problem?: string;
  implementation?: string;
  additions?: string[];
  notDone?: boolean;
  t: Tokens;
}) {
  const [open, setOpen] = useState(false);
  if (!implementation && !problem) return null;

  return (
    <div
      style={{
        width: "100%",
        marginTop: 4,
        padding: "10px 12px",
        borderRadius: 6,
        border: `1px solid ${notDone ? `${t.red}59` : t.border}`,
        background: t.hoverBg,
        display: "flex",
        flexDirection: "column",
        gap: open ? 8 : 0,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          width: "100%",
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={registerFieldLabelStyle(t)}>Implementation</span>
          {notDone ? (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: t.red,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Not done
            </span>
          ) : null}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: t.accent }}>{open ? "Collapse" : "Expand"}</span>
      </button>
      {open ? (
        <>
          {problem ? (
            <div style={{ fontSize: 13, color: t.textPrimary, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600 }}>Problem: </span>
              <TextWithUiRefs text={problem} additions={additions} t={t} style={{ fontSize: 13 }} />
            </div>
          ) : null}
          {implementation ? (
            <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
              <TextWithUiRefs
                text={implementation}
                additions={additions}
                t={t}
                style={{ fontSize: 13, whiteSpace: "pre-wrap", display: "block", color: t.textMuted }}
              />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
