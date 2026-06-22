import type { CSSProperties } from "react";
import { SIDEBAR_HEADER_HEIGHT } from "../../constants/layout";
import type { Tokens } from "../../components/tokens";
import { DOCS_TREE_ROW_H } from "../../components/docs/treeLayout";

const LEFT_PANEL_WIDTH = 280;

const TREE_ROW_WIDTHS = ["72%", "58%", "64%", "52%", "68%", "48%", "60%"];

type RegisterBootSkeletonProps = {
  t: Tokens;
};

function SkeletonBlock({ t, style }: { t: Tokens; style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      style={{
        background: t.hoverBg,
        borderRadius: 4,
        animation: "registerBootPulse 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

function sectionLabelStyle(t: Tokens): CSSProperties {
  return {
    margin: 0,
    padding: "10px 12px 6px",
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1.25,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: t.textDim,
  };
}

export function RegisterBootSkeleton({ t }: RegisterBootSkeletonProps) {
  return (
    <>
      <style>{`
        @keyframes registerBootPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.42; }
        }
      `}</style>

      <div
        role="status"
        aria-live="polite"
        aria-label="Loading register"
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
        <aside
          style={{
            width: LEFT_PANEL_WIDTH,
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
            }}
          >
            <SkeletonBlock t={t} style={{ width: 72, height: 12 }} />
          </header>

          <div style={{ flex: 1, minHeight: 0, padding: "4px 0 12px" }}>
            <p style={sectionLabelStyle(t)}>Flows</p>
            <div style={{ padding: "2px 12px 14px" }}>
              <SkeletonBlock t={t} style={{ width: "55%", height: 11 }} />
            </div>

            <p style={sectionLabelStyle(t)}>Components</p>
            <div style={{ padding: "2px 0 8px" }}>
              {TREE_ROW_WIDTHS.map((width, index) => (
                <div
                  key={width}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    height: DOCS_TREE_ROW_H,
                    padding: "0 12px",
                    paddingLeft: 12 + (index % 3) * 14,
                  }}
                >
                  <SkeletonBlock t={t} style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0 }} />
                  <SkeletonBlock t={t} style={{ width, height: 11, flex: 1, maxWidth: 180 }} />
                </div>
              ))}
            </div>

            <p style={sectionLabelStyle(t)}>Tables</p>
            <div style={{ padding: "2px 12px 10px" }}>
              <SkeletonBlock t={t} style={{ width: "48%", height: 11 }} />
            </div>
          </div>
        </aside>

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
            <SkeletonBlock t={t} style={{ width: 88, height: 12 }} />
            <SkeletonBlock t={t} style={{ width: 44, height: 24, borderRadius: 4 }} />
          </header>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              position: "relative",
              overflow: "hidden",
              background: t.hoverBg,
              backgroundImage: `radial-gradient(${t.border} 1px, transparent 1px)`,
              backgroundSize: "18px 18px",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "flex-start",
                gap: 24,
                padding: "48px 48px 56px",
              }}
            >
              {[260, 360, 360].map((width, index) => (
                <div
                  key={width}
                  aria-hidden
                  style={{
                    width,
                    flexShrink: 0,
                    borderRadius: 8,
                    border: `1px solid ${t.border}`,
                    background: t.cardBg,
                    overflow: "hidden",
                    animation: "registerBootPulse 1.4s ease-in-out infinite",
                    animationDelay: `${index * 0.12}s`,
                  }}
                >
                  <div
                    style={{
                      padding: "8px 10px",
                      borderBottom: `1px solid ${t.border}`,
                      background: t.bgSecondary,
                    }}
                  >
                    <SkeletonBlock t={t} style={{ width: "62%", height: 11, marginBottom: 6 }} />
                    <SkeletonBlock t={t} style={{ width: "42%", height: 9 }} />
                  </div>
                  <div style={{ padding: 16 }}>
                    <SkeletonBlock t={t} style={{ width: "100%", height: 120, borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 12px",
                borderTop: `1px solid ${t.border}`,
                background: t.bgSecondary,
                color: t.textMuted,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: t.accent,
                  animation: "registerBootPulse 1.4s ease-in-out infinite",
                }}
              />
              Loading register…
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
