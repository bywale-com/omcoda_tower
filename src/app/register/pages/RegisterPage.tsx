import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { DocsHighlightProvider } from "../../context/DocsHighlightContext";
import { light, type Tokens } from "../../components/tokens";
import { RegisterSelectionProvider } from "../context/RegisterSelectionContext";
import { RegisterFlowCanvas } from "../components/RegisterFlowCanvas";
import { RegisterGate } from "../components/RegisterGate";
import { RegisterLeftPanel } from "../components/RegisterLeftPanel";
import { RegisterHolonCatalogBootstrap } from "../RegisterHolonCatalogBootstrap";
import { isRegisterRouteEnabled, isRegisterUnlocked, lockRegister } from "../registerAuth";
import { RegisterErrorBoundary } from "../components/RegisterErrorBoundary";

const LEFT_PANEL_WIDTH = 280;

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
              View canvas
            </span>
            <button
              type="button"
              onClick={() => {
                void lockRegister().then(() => setUnlocked(false));
              }}
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
          <RegisterFlowCanvas t={t} isDark={isDark} />
        </div>
      </div>
        </RegisterErrorBoundary>
      </RegisterSelectionProvider>
    </DocsHighlightProvider>
  );
}
