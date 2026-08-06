import { useState } from "react";
import { SIDEBAR_HEADER_HEIGHT } from "../../constants/layout";
import type { Tokens } from "../../components/tokens";
import { useRegisterShell } from "../context/RegisterShellContext";
import { REGISTER_PASSES, type RegisterPassId } from "../passes/registerPasses";
import { RegisterComponentsTree } from "./RegisterComponentsTree";
import { RegisterEnrichmentTree, RegisterFurnishTree } from "./RegisterEnrichmentTree";
import { RegisterHowTree } from "./RegisterHowTree";
import { RegisterJourneyFlowsTree } from "./RegisterJourneyFlowsTree";
import { RegisterPassSection } from "./RegisterPassSection";
import { RegisterPriorsTree } from "./RegisterPriorsTree";
import { RegisterSmeTree } from "./RegisterSmeTree";
import { ShellHideButton, ShellShowButton } from "./RegisterShellChrome";
import { RegisterWiringPaperTree } from "./RegisterWiringPaperTree";

type RegisterLeftPanelProps = {
  width: number;
  t: Tokens;
};

function passTreeContent(passId: RegisterPassId, t: Tokens) {
  switch (passId) {
    case "personas-function":
      return <RegisterHowTree t={t} />;
    case "sme":
      return <RegisterSmeTree t={t} />;
    case "enrichment":
      return <RegisterEnrichmentTree t={t} />;
    case "furnish":
      return <RegisterFurnishTree t={t} />;
    case "priors":
      return <RegisterPriorsTree t={t} />;
    case "flows":
      return <RegisterJourneyFlowsTree t={t} />;
    case "wiring":
      return <RegisterWiringPaperTree t={t} />;
    case "components":
      return <RegisterComponentsTree t={t} />;
    default:
      return null;
  }
}

export function RegisterLeftPanel({ width, t }: RegisterLeftPanelProps) {
  const {
    ctVisible,
    setCtVisible,
    theoryVisible,
    setTheoryVisible,
    setRailVisible,
    revealTheory,
  } = useRegisterShell();
  // Pass sections start collapsed — expand on demand.
  const [openPassIds, setOpenPassIds] = useState<Set<RegisterPassId>>(() => new Set());

  const togglePassOpen = (passId: RegisterPassId) => {
    setOpenPassIds((prev) => {
      const next = new Set(prev);
      if (next.has(passId)) next.delete(passId);
      else next.add(passId);
      return next;
    });
  };

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
        height: "100%",
      }}
    >
      <header
        style={{
          height: SIDEBAR_HEADER_HEIGHT,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
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
        <ShellHideButton t={t} onClick={() => setRailVisible(false)} />
      </header>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "6px 0 12px" }}>
        <p
          style={{
            margin: "0 0 8px",
            padding: "0 12px",
            fontSize: 11,
            color: t.textMuted,
            lineHeight: 1.4,
          }}
        >
          Theory passes — text-first. See{" "}
          <code style={{ fontSize: 10 }}>docs/register/THREE-SURFACE-MODEL.md</code>
        </p>

        {REGISTER_PASSES.map((pass) => (
          <RegisterPassSection
            key={pass.id}
            passId={pass.id}
            label={pass.label}
            hint={pass.hint}
            hasTree={pass.hasTree}
            open={openPassIds.has(pass.id)}
            onToggleOpen={() => togglePassOpen(pass.id)}
            onSelectPass={() => {
              // Clicking a pass should surface its theory drawer if retracted.
              revealTheory();
            }}
            t={t}
          >
            {passTreeContent(pass.id, t)}
          </RegisterPassSection>
        ))}
      </div>

      {!theoryVisible || !ctVisible ? (
        <div
          style={{
            flexShrink: 0,
            padding: 10,
            borderTop: `1px solid ${t.border}`,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {!theoryVisible ? (
            <ShellShowButton t={t} label="Show theory" onClick={() => setTheoryVisible(true)} />
          ) : null}
          {!ctVisible ? (
            <ShellShowButton t={t} label="Show click-through" onClick={() => setCtVisible(true)} />
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
