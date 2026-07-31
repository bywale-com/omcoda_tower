import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { DocsHighlightProvider } from "../../context/DocsHighlightContext";
import { light, type Tokens } from "../../components/tokens";
import { RegisterSelectionProvider } from "../context/RegisterSelectionContext";
import { RegisterShellProvider, useRegisterShell } from "../context/RegisterShellContext";
import { RegisterTraceProvider } from "../trace/RegisterTraceContext";
import { RegisterGate } from "../components/RegisterGate";
import { RegisterLeftPanel } from "../components/RegisterLeftPanel";
import { RegisterClickThroughPanel } from "../components/RegisterClickThroughPanel";
import { RegisterHolonCatalogBootstrap } from "../RegisterHolonCatalogBootstrap";
import {
  isAuthDisabled,
  isRegisterRouteEnabled,
  isRegisterUnlocked,
  lockRegister,
} from "../registerAuth";
import { RegisterErrorBoundary } from "../components/RegisterErrorBoundary";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import { RegisterTheoryCanvas } from "../components/RegisterTheoryCanvas";
import { registerPassCanvasTitle } from "../passes/registerPasses";

/** HQ shell constants — theory strip width when CT is open. */
const RAIL_W = 280;
const THEORY_W = 420;

function theoryTitle(registerPassId: ReturnType<typeof useRegisterSelection>["registerPassId"]): string {
  return `Theory · ${registerPassCanvasTitle(registerPassId)}`;
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
  const { registerPassId } = useRegisterSelection();
  const { ctVisible } = useRegisterShell();
  const title = theoryTitle(registerPassId);

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

      {/* Rail — Tower design kept; Show click-through lives in rail footer */}
      <RegisterLeftPanel width={RAIL_W} t={t} />

      {/* Theory strip — fixed width when CT open; expands when CT hidden (HQ) */}
      <section
        style={{
          width: ctVisible ? THEORY_W : undefined,
          flex: ctVisible ? undefined : 1,
          flexShrink: 0,
          minWidth: ctVisible ? THEORY_W : 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          borderRight: ctVisible ? `1px solid ${t.border}` : undefined,
          background: t.bgPrimary,
          overflow: "hidden",
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
            {title}
          </span>
          {!isAuthDisabled() ? (
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
          ) : null}
        </header>
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <RegisterTheoryCanvas t={t} />
        </div>
      </section>

      {ctVisible ? <RegisterClickThroughPanel t={t} isDark={isDark} /> : null}
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
        <RegisterShellProvider>
          <RegisterTraceProvider>
            <RegisterErrorBoundary>
              <RegisterPageBody
                t={t}
                isDark={isDark}
                onLock={() => {
                  void lockRegister().then(() => setUnlocked(false));
                }}
              />
            </RegisterErrorBoundary>
          </RegisterTraceProvider>
        </RegisterShellProvider>
      </RegisterSelectionProvider>
    </DocsHighlightProvider>
  );
}
