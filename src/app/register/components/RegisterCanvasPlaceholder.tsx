import type { Tokens } from "../../components/tokens";

type RegisterCanvasPlaceholderProps = {
  t: Tokens;
  isDark: boolean;
};

export function RegisterCanvasPlaceholder({ t, isDark }: RegisterCanvasPlaceholderProps) {
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
      aria-label="Loading flow canvas"
      style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        position: "relative",
        overflow: "hidden",
        background: isDark ? t.bgSecondary : t.hoverBg,
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
              <div
                style={{
                  width: "62%",
                  height: 11,
                  marginBottom: 6,
                  borderRadius: 4,
                  background: t.hoverBg,
                }}
              />
              <div
                style={{
                  width: "42%",
                  height: 9,
                  borderRadius: 4,
                  background: t.hoverBg,
                }}
              />
            </div>
            <div style={{ padding: 16 }}>
              <div
                style={{
                  width: "100%",
                  height: 120,
                  borderRadius: 6,
                  background: t.hoverBg,
                }}
              />
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
        Loading canvas…
      </div>
    </div>
    </>
  );
}
