import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { DocsHighlightProvider } from "../../context/DocsHighlightContext";
import { light, type Tokens } from "../../components/tokens";
import { RegisterSelectionProvider } from "../context/RegisterSelectionContext";
import { RegisterFlowStepCanvas } from "../flowCanvas/RegisterFlowStepCanvas";
import { RegisterHowCanvas } from "../components/RegisterHowCanvas";
import { RegisterGate } from "../components/RegisterGate";
import { RegisterLeftPanel } from "../components/RegisterLeftPanel";
import { RegisterHolonCatalogBootstrap } from "../RegisterHolonCatalogBootstrap";
import { isRegisterRouteEnabled, isRegisterUnlocked, lockRegister } from "../registerAuth";
import { RegisterErrorBoundary } from "../components/RegisterErrorBoundary";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import { RegisterTheoryCanvas } from "../components/RegisterTheoryCanvas";
import { registerPassCanvasTitle } from "../passes/registerPasses";

const LEFT_PANEL_WIDTH = 280;

function registerCanvasTitle({
  registerPassId,
  selectedHowGraphId,
  activeFlowStepId,
}: {
  registerPassId: ReturnType<typeof useRegisterSelection>["registerPassId"];
  selectedHowGraphId: string | null;
  activeFlowStepId: string | null;
}): string {
  if (selectedHowGraphId && registerPassId === "personas-function") {
    return "How canvas";
  }
  if (activeFlowStepId && registerPassId === "wiring") {
    return "Flow step";
  }
  return registerPassCanvasTitle(registerPassId);
}

function RegisterPageBody({
  t,
  isDark,
  onLock,
}: {
  t: Tokens;
  isDark: boolean;
  onLock: () => void;
}) {
  const { registerPassId, selectedHowGraphId, activeFlowStepId } = useRegisterSelection();
  const canvasTitle = registerCanvasTitle({ registerPassId, selectedHowGraphId, activeFlowStepId });

  const showHowCanvas = registerPassId === "personas-function" && selectedHowGraphId != null;
  const showFlowStepCanvas = registerPassId === "wiring" && activeFlowStepId != null;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
        fontSize: 13,
        color: t.textPrimary,
        background: t.bgPrimary,
      }}
    >
      <RegisterHolonCatalogBootstrap t={t} />
      <RegisterLeftPanel width={LEFT_PANEL_WIDTH} t={t} />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          background: t.hoverBg,
        }}
      >
        <header
          style={{
            height: 35,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
            borderBottom: `1px solid ${t.border}`,
            background: t.bgSecondary,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
            }}
          >
            {canvasTitle}
          </span>
          <button
            type="button"
            onClick={onLock}
            style={{
              padding: "4px 10px",
              border: `1px solid ${t.border}`,
              borderRadius: 4,
              background: t.bgSecondary,
              color: t.textMuted,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Lock
          </button>
        </header>
        {showHowCanvas && selectedHowGraphId ? (
          <RegisterHowCanvas graphId={selectedHowGraphId} t={t} isDark={isDark} />
        ) : showFlowStepCanvas && activeFlowStepId ? (
          <RegisterFlowStepCanvas stepId={activeFlowStepId} t={t} isDark={isDark} />
        ) : (
          <RegisterTheoryCanvas t={t} />
        )}
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const t: Tokens = light;
  const isDark = false;

  useEffect(() => {
    let cancelled = false;

    async function checkUnlock() {
      if (!isRegisterRouteEnabled()) {
        setIsChecking(false);
        return;
      }

      const open = await isRegisterUnlocked();
      if (!cancelled) {
        setUnlocked(open);
        setIsChecking(false);
      }
    }

    void checkUnlock();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isRegisterRouteEnabled()) {
    return <Navigate to="/" replace />;
  }

  if (isChecking) {
    return null;
  }

  if (!unlocked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: 13,
          color: t.textPrimary,
          background: t.bgPrimary,
        }}
      >
        <RegisterGate t={t} onUnlock={() => setUnlocked(true)} />
      </div>
    );
  }

  return (
    <DocsHighlightProvider>
      <RegisterSelectionProvider>
        <RegisterErrorBoundary>
          <RegisterPageBody
            t={t}
            isDark={isDark}
            onLock={() => {
              void lockRegister().then(() => setUnlocked(false));
            }}
          />
        </RegisterErrorBoundary>
      </RegisterSelectionProvider>
    </DocsHighlightProvider>
  );
}
