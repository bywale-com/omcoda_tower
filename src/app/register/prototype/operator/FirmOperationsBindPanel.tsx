/**
 * Firm operations bind — firm-bind index → Bind packs modal → Armed / Active segmented control.
 * Furnish: published-only helper + Jump to Config empty-state; bound-version chips; bind-completeness.
 */
import { useEffect, useMemo, useState } from "react";
import type { Tokens } from "../../../components/tokens";
import {
  setPolicyDenyForced as forceEspPolicyDeny,
  useWireTick,
  wirePorts,
  type SendDenyReason,
} from "../../../wire";
import type { RegisterSurfaceEntry } from "../../trace/surfaceCatalog";
import { RegisterSurfaceMount, navBtnStyle, sectionLabelStyle } from "../registerSurfaceChrome";
import {
  type ConfigPack,
  packLabel,
  publishedPacks,
  seedConfigPacks,
} from "./operatorConfigLibraries";
import {
  DEMO_FIRMS,
  filterSelectStyle,
  moduleFocus,
  panelShell,
  primaryBtnStyle,
  resolveHoveredEntry,
  secondaryBtnStyle,
  statusChip,
  surfaceBlock,
} from "./operatorChrome";

type Posture = "Armed" | "Active";

type FirmBindState = {
  firmId: string;
  evalPackId: string | null;
  autoPackId: string | null;
  engPackId: string | null;
  posture: Posture;
};

function seedBindRows(): FirmBindState[] {
  return [
    {
      firmId: DEMO_FIRMS[0].id,
      evalPackId: "eval-alg-v2",
      autoPackId: "auto-welcome",
      engPackId: "eng-optin",
      posture: "Active",
    },
    {
      firmId: DEMO_FIRMS[1].id,
      evalPackId: "eval-soft-v1",
      autoPackId: "auto-book",
      engPackId: "eng-nudge",
      posture: "Armed",
    },
    {
      firmId: DEMO_FIRMS[2].id,
      evalPackId: "eval-alg-v2",
      autoPackId: "auto-welcome",
      engPackId: "eng-optin",
      posture: "Armed",
    },
    {
      firmId: DEMO_FIRMS[3].id,
      evalPackId: null,
      autoPackId: null,
      engPackId: null,
      posture: "Armed",
    },
  ];
}

function isBound(row: FirmBindState): boolean {
  return Boolean(row.evalPackId && row.autoPackId && row.engPackId);
}

const HELPER = "Published versions only — drafts omitted";

export function FirmOperationsBindPanel({
  t,
  focusedEntry,
  hoveredId,
}: {
  t: Tokens;
  focusedEntry: RegisterSurfaceEntry | null;
  hoveredId: string | null;
}) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Firm operations bind", focusedEntry, hoveredEntry);
  const [packs] = useState<ConfigPack[]>(seedConfigPacks);
  const [rows, setRows] = useState<FirmBindState[]>(seedBindRows);
  const [selectedId, setSelectedId] = useState(rows[0].firmId);
  const [bindOpen, setBindOpen] = useState(false);
  const [pickEval, setPickEval] = useState("");
  const [pickAuto, setPickAuto] = useState("");
  const [pickEng, setPickEng] = useState("");
  const [jumpNote, setJumpNote] = useState<string | null>(null);
  const tick = useWireTick();
  const [gateChips, setGateChips] = useState<
    Array<{ reason: SendDenyReason; label: string; blocking: boolean; advisory?: boolean }>
  >([]);
  const [gateNote, setGateNote] = useState<string | null>(null);
  const [probeResult, setProbeResult] = useState<{ ok: boolean; detail: string } | null>(null);
  const [policyDenyForced, setPolicyDenyForced] = useState(false);

  const row = rows.find((r) => r.firmId === selectedId) ?? rows[0];
  const firm = DEMO_FIRMS.find((f) => f.id === row.firmId) ?? DEMO_FIRMS[0];
  const bound = isBound(row);

  const evalOptions = useMemo(() => publishedPacks("evaluation", packs), [packs]);
  const autoOptions = useMemo(() => publishedPacks("automation", packs), [packs]);
  const engOptions = useMemo(() => publishedPacks("engagement", packs), [packs]);

  const boundPacks = useMemo(() => {
    const find = (id: string | null) => packs.find((p) => p.id === id);
    return {
      eval: find(row.evalPackId),
      auto: find(row.autoPackId),
      eng: find(row.engPackId),
    };
  }, [packs, row]);

  const completeness = [
    { slot: "Evaluation", pack: boundPacks.eval, missing: !row.evalPackId },
    { slot: "Automation", pack: boundPacks.auto, missing: !row.autoPackId },
    { slot: "Engagement", pack: boundPacks.eng, missing: !row.engPackId },
  ];

  function openBindModal() {
    setPickEval(row.evalPackId ?? evalOptions[0]?.id ?? "");
    setPickAuto(row.autoPackId ?? autoOptions[0]?.id ?? "");
    setPickEng(row.engPackId ?? engOptions[0]?.id ?? "");
    setBindOpen(true);
    setJumpNote(null);
  }

  function onBind() {
    if (!pickEval || !pickAuto || !pickEng) return;
    setRows((prev) =>
      prev.map((r) =>
        r.firmId === row.firmId
          ? { ...r, evalPackId: pickEval, autoPackId: pickAuto, engPackId: pickEng }
          : r,
      ),
    );
    setBindOpen(false);
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      const chips = await wirePorts.sendGate.chips(row.firmId);
      if (alive) setGateChips(chips);
    })();
    return () => {
      alive = false;
    };
  }, [row.firmId, tick]);

  async function setPosture(posture: Posture) {
    if (!bound) return;
    setRows((prev) =>
      prev.map((r) => (r.firmId === row.firmId ? { ...r, posture } : r)),
    );
    if (posture !== "Active") {
      setGateNote(null);
      return;
    }
    const decision = await wirePorts.sendGate.decide({
      firmId: row.firmId,
      channel: "email",
      purpose: "cem",
      posture: "Active",
    });
    setGateNote(
      decision.allow
        ? "Send gate allows — posture Active, no denies outstanding."
        : `Fail-closed · posture set to Active, but Send gate still denies (${decision.reasons.join(", ")}) — sends stay blocked until resolved.`,
    );
  }

  async function probeCemLeave() {
    setProbeResult(null);
    const decision = await wirePorts.sendGate.decide({
      firmId: row.firmId,
      channel: "email",
      purpose: "cem",
      posture: row.posture,
    });
    if (!decision.allow) {
      setProbeResult({ ok: false, detail: `Send gate denied · ${decision.reasons.join(", ")}` });
      return;
    }
    const pooled = await wirePorts.sendingPool.get(row.firmId);
    if (!pooled) {
      setProbeResult({
        ok: false,
        detail: "No pool allocated — open Sending infrastructure to allocate a subdomain first.",
      });
      return;
    }
    const result = await wirePorts.espMailer.send({
      to: "contact@example.test",
      from: `${firm.name} <hello@${pooled.fullDomain}>`,
      subject: "CEM probe",
      bodyText: "Probe send issued from Firm operations bind · Send gates.",
      firmId: row.firmId,
      sendingIdentityId: pooled.identityId,
      purpose: "cem",
    });
    setProbeResult(
      result.ok
        ? { ok: true, detail: `Sent (sink) · ${result.messageId}` }
        : { ok: false, detail: `ESP denied · ${result.deny}${result.detail ? ` — ${result.detail}` : ""}` },
    );
  }

  async function togglePolicyDenyForced() {
    const next = !policyDenyForced;
    forceEspPolicyDeny(next);
    setPolicyDenyForced(next);
    setGateChips(await wirePorts.sendGate.chips(row.firmId));
  }

  const canBind = Boolean(pickEval && pickAuto && pickEng);
  const selectStyle = { ...filterSelectStyle(t), width: "100%", minWidth: 0, boxSizing: "border-box" as const };

  function packDropdown(
    surface: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: ConfigPack[],
  ) {
    const empty = options.length === 0;
    return (
      <label data-register-surface={surface}>
        <span style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, display: "block", marginBottom: 4 }}>
          {label}
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={selectStyle}
          disabled={empty}
        >
          {empty ? (
            <option value="">No published versions</option>
          ) : (
            <>
              <option value="">Select published version…</option>
              {options.map((p) => (
                <option key={p.id} value={p.id}>{packLabel(p)}</option>
              ))}
            </>
          )}
        </select>
        <span
          data-register-surface="Published-only helper"
          style={{ fontSize: 10, color: t.textDim, marginTop: 4, display: "block" }}
        >
          {HELPER}
        </span>
        {empty ? (
          <button
            type="button"
            data-register-surface="Jump to Configuration libraries"
            onClick={() => setJumpNote("Jump to Configuration libraries")}
            style={{ ...secondaryBtnStyle(t), marginTop: 6 }}
          >
            Jump to Configuration libraries
          </button>
        ) : null}
      </label>
    );
  }

  return (
    <RegisterSurfaceMount
      label="Firm operations bind"
      focused={focus.focused && focusedEntry?.label === "Firm operations bind"}
      hovered={hoveredEntry?.label === "Firm operations bind"}
      t={t}
    >
      {panelShell(
        t,
        "Firm operations bind",
        statusChip(t, "per-tenancy"),
        <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <aside
            style={{
              width: 220,
              flexShrink: 0,
              borderRight: `1px solid ${t.border}`,
              background: t.bgSecondary,
              overflowY: "auto",
            }}
          >
            <div style={sectionLabelStyle(t)}>Firm-bind index</div>
            <div data-register-surface="Firm-bind index">
              {rows.map((r) => {
                const f = DEMO_FIRMS.find((d) => d.id === r.firmId)!;
                return (
                  <button
                    key={r.firmId}
                    type="button"
                    onClick={() => {
                      setSelectedId(r.firmId);
                      setJumpNote(null);
                    }}
                    style={navBtnStyle(t, r.firmId === selectedId)}
                  >
                    <div style={{ fontWeight: 600 }}>{f.name}</div>
                    <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>
                      {isBound(r) ? `${r.posture} · 3 packs` : "Unbound"}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div
            style={{
              flex: 1,
              minHeight: 0,
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
            {jumpNote ? (
              <div style={{ fontSize: 11, color: t.accent }}>Opened · {jumpNote}</div>
            ) : null}

            {surfaceBlock(
              t,
              "Bind packs",
              focus.labelFocused("Bind packs") ||
                focus.labelFocused("Bound-version chips") ||
                focus.labelFocused("Published-only helper"),
              focus.labelHovered("Bind packs") ||
                focus.labelHovered("Bound-version chips") ||
                focus.labelHovered("Published-only helper"),
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                    Bind packs
                  </span>
                  <button type="button" onClick={openBindModal} style={secondaryBtnStyle(t)}>
                    Bind packs
                  </button>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  House-authored published versions only — drafts from Configuration libraries omitted.
                </p>
                {bound ? (
                  <div
                    data-register-surface="Bound-version chips"
                    style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                  >
                    {boundPacks.eval
                      ? statusChip(t, `Evaluation · ${packLabel(boundPacks.eval)}`, "muted")
                      : null}
                    {boundPacks.auto
                      ? statusChip(t, `Automation · ${packLabel(boundPacks.auto)}`, "muted")
                      : null}
                    {boundPacks.eng
                      ? statusChip(t, `Engagement · ${packLabel(boundPacks.eng)}`, "muted")
                      : null}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <span style={{ fontSize: 12, color: t.textDim }}>No packs bound — open Bind packs</span>
                    <button
                      type="button"
                      data-register-surface="Jump to Configuration libraries"
                      onClick={() => setJumpNote("Jump to Configuration libraries")}
                      style={secondaryBtnStyle(t)}
                    >
                      Jump to Configuration libraries
                    </button>
                  </div>
                )}
              </>,
            )}

            {surfaceBlock(
              t,
              "Armed / Active",
              focus.labelFocused("Armed / Active") || focus.labelFocused("Bind-completeness"),
              focus.labelHovered("Armed / Active") || focus.labelHovered("Bind-completeness"),
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
                  Armed / Active
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Armed = bound packs ready (no contact-facing sends). Active = execution on. Disabled
                  until three bound versions exist.
                </p>
                <div
                  data-register-surface="Bind-completeness"
                  style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}
                >
                  {completeness.map((c) =>
                    statusChip(
                      t,
                      c.missing ? `${c.slot} · missing` : `${c.slot} · bound`,
                      c.missing ? "amber" : "success",
                    ),
                  )}
                </div>
                <div style={{ display: "flex", gap: 0, borderRadius: 4, overflow: "hidden", border: `1px solid ${t.border}` }}>
                  {(["Armed", "Active"] as Posture[]).map((p) => {
                    const active = row.posture === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        disabled={!bound}
                        onClick={() => setPosture(p)}
                        style={{
                          flex: 1,
                          fontSize: 12,
                          fontWeight: 600,
                          fontFamily: "inherit",
                          padding: "8px 12px",
                          border: "none",
                          cursor: bound ? "pointer" : "not-allowed",
                          background: active ? t.accent : t.bgPrimary,
                          color: active ? "#fff" : bound ? t.textPrimary : t.textDim,
                          opacity: bound ? 1 : 0.55,
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                {gateNote ? (
                  <div style={{ marginTop: 10, fontSize: 11, color: t.accent }}>{gateNote}</div>
                ) : null}
              </>,
            )}

            {surfaceBlock(
              t,
              "Send gates",
              focus.labelFocused("Send gates") ||
                focus.labelFocused("ESP policy reject") ||
                focus.labelFocused("Domain authentication readiness"),
              focus.labelHovered("Send gates") ||
                focus.labelHovered("ESP policy reject") ||
                focus.labelHovered("Domain authentication readiness"),
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
                    Send gates
                  </span>
                  {statusChip(
                    t,
                    gateChips.some((c) => c.blocking) ? "blocking" : "clear",
                    gateChips.some((c) => c.blocking) ? "danger" : "success",
                  )}
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Fail-closed snapshot from sendGate.chips — setting Active does not silence a deny;
                  it stays blocking until resolved.
                </p>

                <div data-register-surface="Domain authentication readiness" style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: t.textDim, marginBottom: 4 }}>
                    Domain authentication readiness
                  </div>
                  {(() => {
                    const authChip = gateChips.find((c) => c.reason === "auth");
                    return statusChip(
                      t,
                      authChip ? (authChip.blocking ? "auth not ready" : "auth ready") : "auth unknown",
                      authChip?.blocking ? "danger" : "success",
                    );
                  })()}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {gateChips.map((c) => (
                    <span
                      key={c.reason}
                      data-register-surface={c.reason === "policy" ? "ESP policy reject" : undefined}
                    >
                      {statusChip(
                        t,
                        c.label,
                        c.advisory ? "amber" : c.blocking ? "danger" : "success",
                      )}
                    </span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <button type="button" style={secondaryBtnStyle(t)} onClick={probeCemLeave}>
                    Probe CEM leave
                  </button>
                  <button
                    type="button"
                    onClick={togglePolicyDenyForced}
                    style={{
                      ...secondaryBtnStyle(t),
                      background: policyDenyForced ? t.amberBg : t.bgPrimary,
                      borderColor: policyDenyForced ? t.amber : t.border,
                      color: policyDenyForced ? t.amber : t.textPrimary,
                    }}
                  >
                    {policyDenyForced ? "Force ESP policy deny · ON" : "Force ESP policy deny"}
                  </button>
                </div>
                {probeResult ? (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 11,
                      color: probeResult.ok ? t.success : t.red,
                    }}
                  >
                    {probeResult.detail}
                  </div>
                ) : null}
              </>,
            )}
          </div>
        </div>,
      )}

      {bindOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
          }}
          onClick={() => setBindOpen(false)}
        >
          <div
            data-register-surface="Bind packs"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 440,
              background: t.bgPrimary,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              padding: 18,
              boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, marginBottom: 4 }}>
              Bind packs
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: t.textMuted }}>
              {firm.name} — select three published versions from Configuration libraries.
            </p>
            {jumpNote ? (
              <div style={{ fontSize: 11, color: t.accent, marginBottom: 10 }}>Opened · {jumpNote}</div>
            ) : null}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {packDropdown(
                "Evaluation pack version",
                "Evaluation pack",
                pickEval,
                setPickEval,
                evalOptions,
              )}
              {packDropdown(
                "Automation pack version",
                "Automation pack",
                pickAuto,
                setPickAuto,
                autoOptions,
              )}
              {packDropdown(
                "Engagement template version",
                "Engagement template",
                pickEng,
                setPickEng,
                engOptions,
              )}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              <button
                type="button"
                data-register-surface="Bind"
                disabled={!canBind}
                onClick={onBind}
                style={primaryBtnStyle(t, !canBind)}
              >
                Bind
              </button>
              <button type="button" onClick={() => setBindOpen(false)} style={secondaryBtnStyle(t)}>
                Cancel
              </button>
              <button
                type="button"
                data-register-surface="Jump to Configuration libraries"
                onClick={() => setJumpNote("Jump to Configuration libraries")}
                style={secondaryBtnStyle(t)}
              >
                Jump to Configuration libraries
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </RegisterSurfaceMount>
  );
}
