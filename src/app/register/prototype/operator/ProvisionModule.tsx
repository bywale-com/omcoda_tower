/**
 * Provision — New firm assisted door.
 */
import { useState } from "react";
import { RegisterSurfaceMount } from "../registerSurfaceChrome";
import {
  moduleFocus,
  panelShell,
  primaryBtnStyle,
  resolveHoveredEntry,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

export function ProvisionModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Provision", focusedEntry, hoveredEntry);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [channel, setChannel] = useState("email");
  const [created, setCreated] = useState<string | null>(null);

  const fieldStyle = {
    width: "100%",
    fontSize: 12,
    fontFamily: "inherit" as const,
    padding: "7px 9px",
    border: `1px solid ${t.border}`,
    borderRadius: 4,
    background: t.bgPrimary,
    color: t.textPrimary,
    boxSizing: "border-box" as const,
  };

  return (
    <RegisterSurfaceMount
      label="Provision"
      focused={focus.focused && focusedEntry?.label === "Provision"}
      hovered={hoveredEntry?.label === "Provision"}
      t={t}
    >
      {panelShell(
        t,
        "Provision",
        statusChip(t, "per-tenancy"),
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: 16,
            background: `linear-gradient(165deg, ${t.bgPrimary} 0%, ${t.hoverBg} 55%, ${t.bgSecondary} 100%)`,
          }}
        >
          {surfaceBlock(
            t,
            "New firm",
            focus.labelFocused("New firm") ||
              focusedEntry?.label === "Provision" ||
              focus.labelFocused("Provision"),
            focus.labelHovered("New firm"),
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
                New firm
              </div>
              <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                Assisted / operator-led door (OLG) into the same application lattice as Meta Approach —
                name + website + channel seed the tenancy.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420 }}>
                <label style={{ fontSize: 12, color: t.textPrimary }}>
                  <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>Firm name</div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Harbor RCIC Desk"
                    style={fieldStyle}
                  />
                </label>
                <label style={{ fontSize: 12, color: t.textPrimary }}>
                  <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>Website</div>
                  <input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="harborrcic.ca"
                    style={fieldStyle}
                  />
                </label>
                <label style={{ fontSize: 12, color: t.textPrimary }}>
                  <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>Channel</div>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    style={fieldStyle}
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Phone</option>
                  </select>
                </label>
                <button
                  type="button"
                  style={primaryBtnStyle(t, !name.trim() || !website.trim())}
                  disabled={!name.trim() || !website.trim()}
                  onClick={() =>
                    setCreated(`Seeded tenancy · ${name.trim()} · ${channel}`)
                  }
                >
                  Create firm tenancy
                </button>
                {created ? (
                  <div style={{ fontSize: 11, color: t.accent }}>{created}</div>
                ) : null}
              </div>
            </>,
          )}
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
