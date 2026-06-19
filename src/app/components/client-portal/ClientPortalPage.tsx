import { ChevronRight, Moon, Sun, X } from "lucide-react";
import { getClientDetail, getClientMeta } from "../../data/clients";
import { isClientPortalAvailable } from "../../data/clientPortalData";
import { ClientPageHeader } from "../ClientPageHeader";
import { ClientIcon } from "../ClientIcon";
import { ClientEngagementCalendar } from "./ClientEngagementCalendar";
import { ClientHistorySection } from "../DataPanel";
import { JourneyTab } from "../JourneyTab";
import type { Tokens } from "../tokens";

const CLIENT_PORTAL_MAX_WIDTH = 1360;
const CLIENT_PORTAL_SIDE_PADDING = 48;

const CLIENT_PORTAL_CALENDAR_HEIGHT = 560;
const CLIENT_PORTAL_ENGAGEMENT_HEIGHT = 680;
const CLIENT_PORTAL_HISTORY_HEIGHT = 400;

type ClientPortalPageProps = {
  clientId: string;
  onClose: () => void;
  t: Tokens;
  isDark: boolean;
  onToggleTheme: () => void;
};

export function ClientPortalPage({ clientId, onClose, t, isDark, onToggleTheme }: ClientPortalPageProps) {
  if (!isClientPortalAvailable(clientId)) {
    return (
      <div style={{ padding: 40, fontFamily: "inherit", color: t.textPrimary }}>
        Client portal is not available for this file.
        <button type="button" onClick={onClose} style={{ marginLeft: 12 }}>
          Back
        </button>
      </div>
    );
  }

  const client = getClientDetail(clientId);
  const meta = getClientMeta(clientId);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        overflowY: "auto",
        overflowX: "hidden",
        background: t.bgPrimary,
        fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 14,
          right: CLIENT_PORTAL_SIDE_PADDING,
          zIndex: 210,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? "Light mode" : "Dark mode"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          {isDark ? (
            <Sun size={15} color={t.textMuted} strokeWidth={1.5} />
          ) : (
            <Moon size={15} color={t.textMuted} strokeWidth={1.5} />
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          title="Close preview"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <X size={15} color={t.textMuted} strokeWidth={1.75} />
        </button>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: CLIENT_PORTAL_MAX_WIDTH,
          margin: "0 auto",
          padding: `0 ${CLIENT_PORTAL_SIDE_PADDING}px 64px`,
        }}
      >
        <div
          style={{
            height: 22,
            display: "flex",
            alignItems: "center",
            padding: "0 2px",
            background: t.bgPrimary,
            flexShrink: 0,
            gap: 2,
            overflow: "hidden",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 400, whiteSpace: "nowrap" }}>
              Tower
            </span>
          </span>
          <ChevronRight size={10} color={t.textDim} strokeWidth={1.5} />
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ClientIcon initials={meta.initials} status={meta.status} size={11} />
            <span style={{ fontSize: 11, color: t.textPrimary, fontWeight: 500, whiteSpace: "nowrap" }}>
              {client.name}
            </span>
          </span>
        </div>

        <ClientPageHeader client={client} t={t} paddingX={0} />

        <section
          style={{
            height: CLIENT_PORTAL_CALENDAR_HEIGHT,
            borderTop: `1px solid ${t.borderLight}`,
          }}
        >
          <ClientEngagementCalendar t={t} clientId={clientId} />
        </section>

        <section
          style={{
            height: CLIENT_PORTAL_ENGAGEMENT_HEIGHT,
            borderTop: `1px solid ${t.borderLight}`,
          }}
        >
          <JourneyTab t={t} clientId={clientId} />
        </section>

        <ClientHistorySection
          t={t}
          isDark={isDark}
          paddingX={0}
          layout="stacked"
          chartHeight={CLIENT_PORTAL_HISTORY_HEIGHT}
        />
      </div>
    </div>
  );
}
