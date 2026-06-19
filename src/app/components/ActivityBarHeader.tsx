import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SIDEBAR_HEADER_HEIGHT } from "../constants/layout";
import { HolonBoundary } from "./docs/HolonBoundary";
import {
  ALL_NAV,
  DOCS_MODE_NAV_ICON,
  MORE_NAV_ICON,
  PRIMARY_NAV,
} from "./docs/primaryNavigationIcons";
import { SHELL_HOLON_ORDER } from "./docs/shellHolonOrder";
import { NotionIcon } from "./icons/NotionIcon";
import type { NotionIconName } from "../icons/notion-icon-urls";
import type { Tokens } from "./tokens";

const NAV_ICON_SIZE = 16;
const MENU_ICON_SIZE = 14;
const MORE_ICON_SIZE = 14;

type ActivityBarHeaderProps = {
  activeIcon: string;
  onIconClick: (id: string) => void;
  isDocsModeOpen: boolean;
  onToggleDocsMode: () => void;
  t: Tokens;
  isDark: boolean;
};

export function ActivityBarHeader({
  activeIcon,
  onIconClick,
  isDocsModeOpen,
  onToggleDocsMode,
  t,
  isDark,
}: ActivityBarHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen || !triggerRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const iconBtn = (id: string, icon: NotionIconName, label: string) => {
    const isActive = activeIcon === id;
    return (
      <button
        key={id}
        type="button"
        title={label}
        onClick={() => onIconClick(id)}
        style={{
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isActive ? t.activeRowBg : "transparent",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <NotionIcon
          name={icon}
          size={NAV_ICON_SIZE}
          color={isActive ? t.accent : t.textMuted}
        />
      </button>
    );
  };

  const menu = menuOpen
    ? createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: menuPos.top,
            left: menuPos.left,
            minWidth: 220,
            background: t.bgPrimary,
            border: `1px solid ${t.border}`,
            borderRadius: 6,
            boxShadow: isDark
              ? "0 8px 24px rgba(0,0,0,0.4)"
              : "0 4px 16px rgba(0,0,0,0.12)",
            padding: "4px 0",
            zIndex: 10000,
          }}
        >
          {ALL_NAV.map(({ id, icon, label, shortcut }) => {
            const isActive = activeIcon === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onIconClick(id);
                  setMenuOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  background: isActive ? t.activeRowBg : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = t.hoverBg;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <NotionIcon
                  name={icon}
                  size={MENU_ICON_SIZE}
                  color={isActive ? t.accent : t.textMuted}
                />
                <span style={{ flex: 1, fontSize: 12, color: t.textPrimary }}>{label}</span>
                {shortcut && (
                  <span style={{ fontSize: 10, color: t.textDim }}>{shortcut}</span>
                )}
              </button>
            );
          })}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <HolonBoundary
        id="primary-navigation"
        label="Primary Navigation"
        icon="compass"
        order={SHELL_HOLON_ORDER["primary-navigation"]}
        t={t}
        style={{
          height: SIDEBAR_HEADER_HEIGHT,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "0 8px",
          gap: 2,
          borderBottom: `1px solid ${t.border}`,
          background: t.boardPanel,
          boxSizing: "border-box",
          position: "relative",
          zIndex: menuOpen ? 100 : "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button
            type="button"
            title="Docs mode"
            onClick={onToggleDocsMode}
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isDocsModeOpen ? t.activeRowBg : "transparent",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <NotionIcon
              name={DOCS_MODE_NAV_ICON}
              size={NAV_ICON_SIZE}
              color={isDocsModeOpen ? t.accent : t.textMuted}
            />
          </button>

          {PRIMARY_NAV.map(({ id, icon, label }) => iconBtn(id, icon, label))}

          <button
            ref={triggerRef}
            type="button"
            title="More views"
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: menuOpen ? t.activeRowBg : "transparent",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.12s ease",
              }}
            >
              <NotionIcon name={MORE_NAV_ICON} size={MORE_ICON_SIZE} color={t.textMuted} />
            </span>
          </button>
        </div>
      </HolonBoundary>
      {menu}
    </>
  );
}
