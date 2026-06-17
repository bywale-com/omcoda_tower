import { GitBranch, PanelLeft, PanelBottom, Settings2 } from "lucide-react";
import type { ReactNode } from "react";
import type { Tokens } from "./tokens";
import { usePanel } from "../context/PanelContext";

type StatusBarProps = {
  t: Tokens;
  isDark: boolean;
};

function StatusItem({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "0 8px",
        height: "100%",
        fontSize: 11,
        cursor: "default",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.15)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {children}
    </div>
  );
}

function StatusIconButton({
  children,
  title,
  onClick,
  active,
}: {
  children: ReactNode;
  title: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width: 28,
        height: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? "rgba(0,0,0,0.15)" : "transparent",
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
        color: "rgba(255,255,255,0.9)",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.15)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = active ? "rgba(0,0,0,0.15)" : "transparent"; }}
    >
      {children}
    </button>
  );
}

export function StatusBar({ t, isDark }: StatusBarProps) {
  const { isPanelOpen, togglePanel } = usePanel();
  const iconColor = "rgba(255,255,255,0.88)";

  return (
    <div style={{
      width: "100%",
      height: 22,
      background: t.accent,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
      color: "rgba(255,255,255,0.9)",
      userSelect: "none",
    }}>
      {/* Left: main · utility icons · Agents Window */}
      <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
        <StatusItem>
          <GitBranch size={11} strokeWidth={1.5} />
          <span>main</span>
        </StatusItem>

        <div style={{ display: "flex", alignItems: "center", height: "100%", paddingLeft: 2 }}>
          <StatusIconButton title="Toggle sidebar">
            <PanelLeft size={13} color={iconColor} strokeWidth={1.5} />
          </StatusIconButton>
          <StatusIconButton title="Toggle panel" onClick={togglePanel} active={isPanelOpen}>
            <PanelBottom size={13} color={iconColor} strokeWidth={1.5} />
          </StatusIconButton>
          <StatusIconButton title="Settings">
            <Settings2 size={13} color={iconColor} strokeWidth={1.5} />
          </StatusIconButton>
        </div>

        <button
          type="button"
          style={{
            marginLeft: 4,
            padding: "1px 8px",
            fontSize: 10,
            fontWeight: 500,
            color: "rgba(255,255,255,0.95)",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.45)",
            borderRadius: 999,
            cursor: "pointer",
            whiteSpace: "nowrap",
            lineHeight: 1.4,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.12)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          Agents Window
        </button>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
        <StatusItem><span>UTF-8</span></StatusItem>
        <StatusItem><span>Tower v2.1</span></StatusItem>
      </div>
    </div>
  );
}
