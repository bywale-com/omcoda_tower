import { SIDEBAR_HEADER_HEIGHT } from "../../constants/layout";
import type { Tokens } from "../../components/tokens";
import { RegisterComponentsTree } from "./RegisterComponentsTree";
import { RegisterFlowsTree } from "./RegisterFlowsTree";

type RegisterLeftPanelProps = {
  width: number;
  t: Tokens;
};

function sectionLabelStyle(t: Tokens) {
  return {
    margin: 0,
    padding: "10px 12px 6px",
    fontSize: 11,
    fontWeight: 500 as const,
    lineHeight: 1.25,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    color: t.textDim,
  };
}

export function RegisterLeftPanel({ width, t }: RegisterLeftPanelProps) {
  return (
    <aside
      style={{
        width,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${t.border}`,
        background: t.boardPanel,
        minHeight: 0,
      }}
    >
      <header
        style={{
          height: SIDEBAR_HEADER_HEIGHT,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          borderBottom: `1px solid ${t.border}`,
          background: t.boardPanel,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
            color: t.textPrimary,
          }}
        >
          Register
        </span>
      </header>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "4px 0 12px" }}>
        <p style={sectionLabelStyle(t)}>Flows</p>
        <RegisterFlowsTree t={t} />

        <p style={sectionLabelStyle(t)}>Components</p>
        <RegisterComponentsTree t={t} />

        <p style={sectionLabelStyle(t)}>Tables</p>
        <p style={{ margin: 0, padding: "2px 12px 10px", fontSize: 13, color: t.textMuted }}>
          Coming soon.
        </p>
      </div>
    </aside>
  );
}
