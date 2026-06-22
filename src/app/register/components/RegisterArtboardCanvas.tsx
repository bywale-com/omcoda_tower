import { REGISTER_VIEWS } from "../../components/docs/registerMeta";
import type { Tokens } from "../../components/tokens";
import { RegisterArtboardFrame } from "./RegisterArtboardFrame";

/** Gap between artboard mounts — spreads compositor work across frames. */
const ARTBOARD_MOUNT_STAGGER_MS = 350;

type RegisterArtboardCanvasProps = {
  t: Tokens;
  isDark: boolean;
};

export function RegisterArtboardCanvas({ t, isDark }: RegisterArtboardCanvasProps) {
  return (
    <>
      <style>{`
        @keyframes registerBootPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.42; }
        }
      `}</style>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: "auto",
          background: isDark ? t.bgSecondary : t.hoverBg,
          backgroundImage: `radial-gradient(${t.border} 1px, transparent 1px)`,
          backgroundSize: "18px 18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 120,
            padding: 48,
            width: "max-content",
            minHeight: "100%",
            boxSizing: "border-box",
          }}
        >
          {REGISTER_VIEWS.map((view, index) => (
            <RegisterArtboardFrame
              key={view.id}
              view={view}
              t={t}
              mountDelayMs={index * ARTBOARD_MOUNT_STAGGER_MS}
            />
          ))}
        </div>
      </div>
    </>
  );
}
