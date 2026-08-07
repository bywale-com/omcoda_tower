/**
 * Sending infrastructure — pool-send path (deliv-04). Allocates a house-managed branded
 * subdomain per firm, authenticates it on the house zone, warms it up, and previews the
 * CEM envelope (deliv-19). Custom-domain attach is a deferred upgrade — not built here.
 *
 * Fixture honesty: DNS auth chips only flip green from an explicit platform-ops action
 * (markPlatformDnsPublished) — never automatically on allocate. Founder-input fixtures
 * (ESP account, postmaster) are likewise only markable by an explicit founder action.
 */
import { useEffect, useState, type CSSProperties } from "react";
import type { Tokens } from "../../../components/tokens";
import {
  FOUNDER_INPUT_FIXTURES,
  bootstrapRealAccountFixtures,
  fixtureMeta,
  isFixturePresent,
  markFixture,
  useWireTick,
  wirePorts,
  type IpPoolTier,
  type PoolSubdomain,
  type WarmupStage,
  type WarmupState,
} from "../../../wire";
import { RegisterSurfaceMount, navBtnStyle, sectionLabelStyle } from "../registerSurfaceChrome";
import {
  DEMO_FIRMS,
  moduleFocus,
  panelShell,
  primaryBtnStyle,
  resolveHoveredEntry,
  secondaryBtnStyle,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

const WARMUP_STAGES: WarmupStage[] = ["cold", "ramp", "steady", "hold", "re-warmup"];
const FOUNDER_ROW_IDS = FOUNDER_INPUT_FIXTURES.filter(
  (id) =>
    id === "esp_account_provisioned" ||
    id === "postmaster_enrolled" ||
    id === "ca_sms_number_provisioned" ||
    id === "sms_account_provisioned",
);

function textInputStyle(t: Tokens): CSSProperties {
  return {
    fontSize: 12,
    fontFamily: "inherit",
    padding: "6px 8px",
    border: `1px solid ${t.border}`,
    borderRadius: 4,
    background: t.bgPrimary,
    color: t.textPrimary,
    boxSizing: "border-box",
  };
}

function metricBox(t: Tokens): CSSProperties {
  return {
    background: t.bgPrimary,
    border: `1px solid ${t.border}`,
    borderRadius: 4,
    padding: "8px 10px",
    minWidth: 0,
  };
}

function metricLabel(t: Tokens): CSSProperties {
  return { fontSize: 10, color: t.textDim };
}

function metricValue(t: Tokens): CSSProperties {
  return {
    fontSize: 12,
    fontWeight: 600,
    color: t.textPrimary,
    marginTop: 3,
    wordBreak: "break-all",
  };
}

export function SendingInfrastructureModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Sending infrastructure", focusedEntry, hoveredEntry);
  const tick = useWireTick();

  const [firmId, setFirmId] = useState<string>(DEMO_FIRMS[0].id);
  const [slug, setSlug] = useState(DEMO_FIRMS[0].id.replace(/^firm-/, ""));
  const [localPart, setLocalPart] = useState("hello");
  const [pool, setPool] = useState<PoolSubdomain | null>(null);
  const [authChips, setAuthChips] = useState<
    Array<{ id: string; label: string; present: boolean; fixture: string }>
  >([]);
  const [warmup, setWarmup] = useState<WarmupState | null>(null);
  const [ipTier, setIpTier] = useState<{ tier: IpPoolTier; ptrReady: boolean } | null>(null);
  const [allocNote, setAllocNote] = useState<string | null>(null);
  const [dnsMarkedNote, setDnsMarkedNote] = useState<string | null>(null);

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Sending infrastructure") return;
    setFirmId(DEMO_FIRMS[0].id);
  }, [focusedEntry]);

  useEffect(() => {
    void bootstrapRealAccountFixtures();
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [p, chips, w, tier] = await Promise.all([
        wirePorts.sendingPool.get(firmId),
        wirePorts.sendingPool.authChips(firmId),
        wirePorts.warmup.get(firmId),
        wirePorts.ipPool.getTier(firmId),
      ]);
      if (!alive) return;
      setPool(p);
      setAuthChips(chips);
      setWarmup(w);
      setIpTier(tier);
    })();
    return () => {
      alive = false;
    };
  }, [firmId, tick]);

  const firm = DEMO_FIRMS.find((f) => f.id === firmId) ?? DEMO_FIRMS[0];

  async function onAllocate() {
    const row = await wirePorts.sendingPool.allocate(firmId, slug);
    setPool(row);
    setAuthChips(await wirePorts.sendingPool.authChips(firmId));
    setAllocNote(`Allocated · ${row.fullDomain}`);
  }

  async function onMarkDns() {
    try {
      await wirePorts.sendingPool.markPlatformDnsPublished(firmId);
      setAuthChips(await wirePorts.sendingPool.authChips(firmId));
      setDnsMarkedNote(`Resend verify polled · ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      setDnsMarkedNote(err instanceof Error ? err.message : "Verify failed");
    }
  }

  async function onSetStage(stage: WarmupStage) {
    setWarmup(await wirePorts.warmup.setStage(firmId, stage));
  }

  async function onAssignShared() {
    await wirePorts.ipPool.assignShared(firmId);
    setIpTier(await wirePorts.ipPool.getTier(firmId));
  }

  const authReady = authChips.length > 0 && authChips.every((c) => c.present);

  return (
    <RegisterSurfaceMount
      label="Sending infrastructure"
      focused={focus.focused && focusedEntry?.label === "Sending infrastructure"}
      hovered={hoveredEntry?.label === "Sending infrastructure"}
      t={t}
    >
      {panelShell(
        t,
        "Sending infrastructure",
        statusChip(t, "house-global"),
        <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <aside
            style={{
              width: 200,
              flexShrink: 0,
              borderRight: `1px solid ${t.border}`,
              background: t.bgSecondary,
              overflowY: "auto",
            }}
          >
            <div style={sectionLabelStyle(t)}>Firm</div>
            {DEMO_FIRMS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFirmId(f.id);
                  setSlug(f.id.replace(/^firm-/, ""));
                  setAllocNote(null);
                  setDnsMarkedNote(null);
                }}
                style={navBtnStyle(t, f.id === firmId)}
              >
                <div style={{ fontWeight: 600 }}>{f.name}</div>
                <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>{f.id}</div>
              </button>
            ))}
            <p style={{ margin: "10px 12px", fontSize: 10, lineHeight: 1.45, color: t.textDim }}>
              Pool path (default) — zero firm DNS. Custom-domain attach is a deferred upgrade,
              not built here.
            </p>
          </aside>

          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflowY: "auto",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              background: `linear-gradient(165deg, ${t.bgPrimary} 0%, ${t.hoverBg} 55%, ${t.bgSecondary} 100%)`,
            }}
          >
            <div style={{ fontSize: 12, color: t.textMuted }}>
              Selected firm · <strong style={{ color: t.textPrimary }}>{firm.name}</strong>
            </div>

            {surfaceBlock(
              t,
              "Sending-domain pool",
              focus.labelFocused("Sending-domain pool") || focus.labelFocused("Allocate subdomain"),
              focus.labelHovered("Sending-domain pool") || focus.labelHovered("Allocate subdomain"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
                  Sending-domain pool
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  House-managed zone — allocates a branded subdomain per firm on request. No firm
                  DNS act on this path.
                </p>
                {pool ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <div style={metricBox(t)}>
                      <div style={metricLabel(t)}>Full domain</div>
                      <div style={metricValue(t)}>{pool.fullDomain}</div>
                    </div>
                    <div style={metricBox(t)}>
                      <div style={metricLabel(t)}>Identity id</div>
                      <div style={metricValue(t)}>{pool.identityId}</div>
                    </div>
                    <div style={metricBox(t)}>
                      <div style={metricLabel(t)}>Path</div>
                      <div style={metricValue(t)}>{pool.path}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: t.textDim, marginBottom: 10 }}>
                    Not allocated yet.
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <label style={{ fontSize: 11, color: t.textDim }}>
                    Slug
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      disabled={Boolean(pool)}
                      style={{ ...textInputStyle(t), marginTop: 4, width: 160, display: "block" }}
                    />
                  </label>
                  <button
                    type="button"
                    data-register-surface="Allocate subdomain"
                    onClick={onAllocate}
                    disabled={Boolean(pool)}
                    style={primaryBtnStyle(t, Boolean(pool))}
                  >
                    Allocate subdomain
                  </button>
                  {allocNote ? <span style={{ fontSize: 11, color: t.accent }}>{allocNote}</span> : null}
                </div>
              </>,
            )}

            {surfaceBlock(
              t,
              "Authentication panel",
              focus.labelFocused("Authentication panel"),
              focus.labelHovered("Authentication panel"),
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                    Authentication panel
                  </span>
                  {statusChip(t, authReady ? "ready" : "not ready", authReady ? "success" : "amber")}
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  SPF / DKIM / DMARC / Return-Path — chips read real Resend domain status for
                  mail.try-tower.com (never invent green).
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {authChips.map((c) => (
                    <span key={c.id}>{statusChip(t, c.label, c.present ? "success" : "danger")}</span>
                  ))}
                </div>
                <button
                  type="button"
                  data-register-surface="Mark platform DNS published"
                  onClick={onMarkDns}
                  disabled={!pool}
                  style={secondaryBtnStyle(t)}
                >
                  Verify domain in Resend
                </button>
                <div style={{ fontSize: 10, color: t.textDim, marginTop: 6 }}>
                  Polls Resend verification — greens only when Resend reports verified.
                </div>
                {dnsMarkedNote ? (
                  <div style={{ fontSize: 11, color: t.accent, marginTop: 6 }}>{dnsMarkedNote}</div>
                ) : null}
              </>,
            )}

            {surfaceBlock(
              t,
              "Warmup",
              focus.labelFocused("Warmup"),
              focus.labelHovered("Warmup"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>
                  Warmup
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {WARMUP_STAGES.map((s) => (
                    <span key={s}>{statusChip(t, s, warmup?.stage === s ? "accent" : "muted")}</span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  {WARMUP_STAGES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onSetStage(s)}
                      style={secondaryBtnStyle(t)}
                    >
                      Set {s}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: t.textMuted }}>
                  Remaining today ·{" "}
                  <strong style={{ color: t.textPrimary }}>{warmup?.remaining ?? 0}</strong> /{" "}
                  {warmup?.dailyCap ?? 0}
                </div>
              </>,
            )}

            {surfaceBlock(
              t,
              "Envelope panel",
              focus.labelFocused("Envelope panel"),
              focus.labelHovered("Envelope panel"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>
                  Envelope panel
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  CEM From preview — firm display name, no shared platform From (deliv-19).
                </p>
                {pool ? (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <label style={{ fontSize: 11, color: t.textDim }}>
                      Local-part
                      <input
                        value={localPart}
                        onChange={(e) => setLocalPart(e.target.value)}
                        style={{ ...textInputStyle(t), marginTop: 4, width: 120, display: "block" }}
                      />
                    </label>
                    <div style={{ fontSize: 12, color: t.textPrimary, fontFamily: "monospace" }}>
                      {firm.name} &lt;{localPart || "hello"}@{pool.fullDomain}&gt;
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: t.textDim }}>
                    Allocate a subdomain to preview the envelope.
                  </div>
                )}
              </>,
            )}

            {surfaceBlock(
              t,
              "Reputation units",
              focus.labelFocused("Reputation units"),
              focus.labelHovered("Reputation units"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>
                  Reputation units
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginBottom: 10,
                  }}
                >
                  {statusChip(t, `tier · ${ipTier?.tier ?? "shared"}`, "muted")}
                  {statusChip(
                    t,
                    ipTier?.ptrReady ? "PTR ready" : "PTR n/a (shared)",
                    ipTier?.ptrReady ? "success" : "muted",
                  )}
                </div>
                <button type="button" onClick={onAssignShared} style={secondaryBtnStyle(t)}>
                  Assign shared IP
                </button>
                <p style={{ margin: "10px 0 0", fontSize: 11, lineHeight: 1.5, color: t.textDim }}>
                  Shared tier is the default — dedicated IP + PTR is a founder-input upgrade, not
                  built here. Custom-domain attach is likewise deferred.
                </p>
              </>,
            )}

            <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
                Founder inputs (not modelable — never auto-green)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {FOUNDER_ROW_IDS.map((id) => {
                  const meta = fixtureMeta(id);
                  const present = isFixturePresent(id);
                  return (
                    <div
                      key={id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        background: t.bgPrimary,
                        border: `1px solid ${t.border}`,
                        borderRadius: 4,
                        padding: "8px 10px",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, color: t.textPrimary, fontWeight: 600 }}>
                          {meta.label}
                        </div>
                        <div style={{ fontSize: 10, color: t.textDim }}>{id} · founder-input</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {statusChip(t, present ? "provisioned" : "missing", present ? "success" : "amber")}
                        <button
                          type="button"
                          onClick={() =>
                            markFixture({
                              id,
                              present: !present,
                              markedBy: "founder",
                              note: "CT founder-input demo",
                            })
                          }
                          style={secondaryBtnStyle(t)}
                        >
                          {present ? "Unmark" : "Mark provisioned"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
