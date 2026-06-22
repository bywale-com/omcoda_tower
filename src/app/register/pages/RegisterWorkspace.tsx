import { lazy, Suspense, useEffect, useState } from "react";
import { DocsHighlightProvider } from "../../context/DocsHighlightContext";
import type { Tokens } from "../../components/tokens";
import { RegisterSelectionProvider } from "../context/RegisterSelectionContext";
import { RegisterCanvasPlaceholder } from "../components/RegisterCanvasPlaceholder";
import { RegisterLeftPanel } from "../components/RegisterLeftPanel";
import { RegisterHolonCatalogBootstrap } from "../RegisterHolonCatalogBootstrap";

const RegisterArtboardCanvas = lazy(() =>
  import("../components/RegisterArtboardCanvas").then((module) => ({
    default: module.RegisterArtboardCanvas,
  })),
);

const LEFT_PANEL_WIDTH = 280;

type RegisterWorkspaceProps = {
  t: Tokens;
  isDark: boolean;
  onLock: () => void;
};

function deferCanvasReady(onReady: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const idleId = window.requestIdleCallback(onReady, { timeout: 2500 });
    return () => window.cancelIdleCallback(idleId);
  }

  const timerId = window.setTimeout(onReady, 400);
  return () => window.clearTimeout(timerId);
}

export default function RegisterWorkspace({ t, isDark, onLock }: RegisterWorkspaceProps) {
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => deferCanvasReady(() => setCanvasReady(true)), []);

  return (
    <DocsHighlightProvider>
      <RegisterSelectionProvider>
        <RegisterHolonCatalogBootstrap />
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
                Flow canvas
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

            {canvasReady ? (
              <Suspense fallback={<RegisterCanvasPlaceholder t={t} isDark={isDark} />}>
                <RegisterArtboardCanvas t={t} isDark={isDark} />
              </Suspense>
            ) : (
              <RegisterCanvasPlaceholder t={t} isDark={isDark} />
            )}
          </div>
        </div>
      </RegisterSelectionProvider>
    </DocsHighlightProvider>
  );
}
