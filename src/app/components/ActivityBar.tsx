import {
  Users,
  Search,
  GitBranch,
  Bell,
  Settings,
  UserCircle,
  LayoutDashboard,
  FileText,
  Zap,
} from "lucide-react";
import type { Tokens } from "./tokens";

type ActivityBarProps = {
  activeIcon: string;
  onIconClick: (icon: string) => void;
  t: Tokens;
};

const topIcons = [
  { id: "board", Icon: LayoutDashboard, label: "Board" },
  { id: "search", Icon: Search, label: "Search" },
  { id: "clients", Icon: Users, label: "Clients" },
  { id: "docs", Icon: FileText, label: "Documents" },
  { id: "automation", Icon: Zap, label: "Automation" },
  { id: "git", Icon: GitBranch, label: "Pipeline" },
];

const bottomIcons = [
  { id: "notifications", Icon: Bell, label: "Notifications" },
  { id: "account", Icon: UserCircle, label: "Account" },
  { id: "settings", Icon: Settings, label: "Settings" },
];

export function ActivityBar({ activeIcon, onIconClick, t }: ActivityBarProps) {
  return (
    <div
      style={{
        width: 48,
        flexShrink: 0,
        background: t.activityBar,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <div className="flex flex-col">
        {topIcons.map(({ id, Icon, label }) => {
          const isActive = activeIcon === id;
          return (
            <button
              key={id}
              title={label}
              onClick={() => onIconClick(id)}
              style={{
                width: 48,
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                borderLeft: isActive ? `2px solid ${t.accent}` : "2px solid transparent",
                border: "none",
                borderLeft: isActive ? `2px solid ${t.accent}` : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              <Icon
                size={20}
                color={isActive ? t.activityBarIconActive : t.activityBarIcon}
                strokeWidth={1.5}
              />
            </button>
          );
        })}
      </div>
      <div className="flex flex-col">
        {bottomIcons.map(({ id, Icon, label }) => (
          <button
            key={id}
            title={label}
            onClick={() => onIconClick(id)}
            style={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              borderLeft: "2px solid transparent",
              cursor: "pointer",
            }}
          >
            <Icon size={17} color={t.activityBarIcon} strokeWidth={1.5} />
          </button>
        ))}
      </div>
    </div>
  );
}
