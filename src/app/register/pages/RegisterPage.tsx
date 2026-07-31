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
import {
  RegisterRestoreDock,
  ShellHideButton,
  ShellShowButton,
} from "../components/RegisterShellChrome";
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
  const {
    ctVisible,
    setCtVisible,
    railVisible,
    theoryVisible,
    setTheoryVisible,
    setRailVisible,
  } = useRegisterShell();
  const title = theoryTitle(registerPassId);

  // Theory is fixed-width when CT is open; expands when CT is hidden.
  const theoryFixed = ctVisible;
  const theoryAlone = theoryVisible && !ctVisible;
  // Slim left dock only when the rail is away (theory restore lives in rail footer otherwise).
  const needRestoreDock = !railVisible;

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

      {needRestoreDock ? (
        <RegisterRestoreDock
          t={t}
          showRail={!railVisible}
          showTheory={!theoryVisible}
          onShowRail={() => setRailVisible(true)}
          onShowTheory={() => setTheoryVisible(true)}
        />
      ) : null}

      {railVisible ? <RegisterLeftPanel width={RAIL_W} t={t} /> : null}

      {theoryVisible ? (
        <section
          style={{
            width: theoryFixed ? THEORY_W : undefined,
            flex: theoryFixed ? undefined : 1,
            flexShrink: 0,
            minWidth: theoryFixed ? THEORY_W : 0,
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
              gap: 8,
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
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              {!railVisible ? (
                <ShellShowButton t={t} label="Show register" onClick={() => setRailVisible(true)} />
              ) : null}
              {theoryAlone && !ctVisible ? (
                <ShellShowButton t={t} label="Show click-through" onClick={() => setCtVisible(true)} />
              ) : null}
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
              <ShellHideButton t={t} onClick={() => setTheoryVisible(false)} />
            </div>
          </header>
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <RegisterTheoryCanvas t={t} />
          </div>
        </section>
      ) : null}

      {ctVisible ? <RegisterClickThroughPanel t={t} isDark={isDark} /> : null}

      {/* Empty restorer when every column is hidden (shouldn't be common). */}
      {!railVisible && !theoryVisible && !ctVisible ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            background: t.hoverBg,
          }}
        >
          <ShellShowButton t={t} label="Show register" onClick={() => setRailVisible(true)} />
          <ShellShowButton t={t} label="Show theory" onClick={() => setTheoryVisible(true)} />
          <ShellShowButton t={t} label="Show click-through" onClick={() => setCtVisible(true)} />
        </div>
      ) : null}
    </div>
  );
}

export function RegisterPage() {
  // Sync bypass — don't flash RegisterGate while auth is disabled.
  const bypass = isAuthDisabled();
  const [unlocked, setUnlocked] = useState(bypass);
  const [isChecking, setIsChecking] = useState(!bypass);
  const t: Tokens = light;
  const isDark = false;

  useEffect(() => {
    let cancelled = false;

    async function checkUnlock() {
      if (!isRegisterRouteEnabled()) {
        setIsChecking(false);
        return;
      }

      if (isAuthDisabled()) {
        if (!cancelled) {
          setUnlocked(true);
          setIsChecking(false);
        }
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
