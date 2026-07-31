/**
 * Operator desk scene for Register Prototype Canvas.
 * House-global + per-tenancy + support modules with addressable data-register-surface labels.
 */
import { useEffect, useState, type ReactNode } from "react";
import type { Tokens } from "../../components/tokens";
import {
  OPERATOR_HOUSE_MODULES,
  OPERATOR_SUPPORT_MODULES,
  OPERATOR_TENANCY_MODULES,
  SURFACE_CATALOG,
  getSurfaceByLabel,
  type RegisterSurfaceEntry,
} from "../trace/surfaceCatalog";
import { HiFiEmptyModule } from "./HiFiEmptyModule";
import { RegisterSurfaceMount, navBtnStyle, sectionLabelStyle } from "./registerSurfaceChrome";
import {
  AcquisitionAdsModule,
  ActivationForwardDeployModule,
  ActivationStateModule,
  AuditTrailModule,
  BookReadinessPanel,
  CommercialModule,
  ConfigurationLibrariesPanel,
  CustomerSupportModule,
  FirmHealthModule,
  FirmOperationsBindPanel,
  FounderAgencyControlsModule,
  OversightModule,
  ProvisionModule,
  ReferenceDataModule,
  RegisterEvolutionModule,
  resolveConfigLibSub,
  type ConfigLibSub,
} from "./operator";

type OperatorPrototypeSceneProps = {
  t: Tokens;
  isDark: boolean;
  focusedEntry: RegisterSurfaceEntry | null;
  hoveredId: string | null;
};

export function OperatorPrototypeScene({
  t,
  isDark,
  focusedEntry,
  hoveredId,
}: OperatorPrototypeSceneProps) {
  const [module, setModule] = useState<string>(OPERATOR_HOUSE_MODULES[0]);
  const [configSub, setConfigSub] = useState<ConfigLibSub>("Evaluation packs");

  useEffect(() => {
    if (!focusedEntry || focusedEntry.desk !== "operator") return;
    setModule(focusedEntry.module);
    const sub = resolveConfigLibSub(focusedEntry);
    if (sub) setConfigSub(sub);
  }, [focusedEntry]);

  const entry = getSurfaceByLabel(focusedEntry?.label ?? module) ?? focusedEntry;
  const title = focusedEntry?.label ?? module;
  const hoveredEntry = hoveredId
    ? SURFACE_CATALOG.find((e) => e.id === hoveredId) ?? null
    : null;

  const shared = { t, focusedEntry, hoveredId };

  let main: ReactNode;
  switch (module) {
    case "Acquisition & ads":
      main = <AcquisitionAdsModule {...shared} />;
      break;
    case "Activation & forward-deploy":
      main = <ActivationForwardDeployModule {...shared} />;
      break;
    case "Reference data":
      main = <ReferenceDataModule {...shared} />;
      break;
    case "Configuration libraries":
      main = (
        <ConfigurationLibrariesPanel
          t={t}
          isDark={isDark}
          focusedEntry={focusedEntry}
          hoveredId={hoveredId}
          sub={configSub}
          onSubChange={setConfigSub}
        />
      );
      break;
    case "Oversight":
      main = <OversightModule {...shared} />;
      break;
    case "Audit trail":
      main = <AuditTrailModule {...shared} />;
      break;
    case "Register & evolution":
      main = <RegisterEvolutionModule {...shared} />;
      break;
    case "Founder & agency controls":
      main = <FounderAgencyControlsModule {...shared} />;
      break;
    case "Customer support":
      main = <CustomerSupportModule {...shared} />;
      break;
    case "Provision":
      main = <ProvisionModule {...shared} />;
      break;
    case "Commercial":
      main = <CommercialModule {...shared} />;
      break;
    case "Firm operations bind":
      main = <FirmOperationsBindPanel {...shared} />;
      break;
    case "Book readiness":
      main = (
        <BookReadinessPanel
          t={t}
          isDark={isDark}
          focusedEntry={focusedEntry}
          hoveredId={hoveredId}
        />
      );
      break;
    case "Firm health":
      main = <FirmHealthModule {...shared} />;
      break;
    case "Activation state":
      main = <ActivationStateModule {...shared} />;
      break;
    default:
      main = (
        <RegisterSurfaceMount
          label={title}
          focused={Boolean(focusedEntry)}
          hovered={hoveredEntry?.module === module || hoveredEntry?.label === title}
          t={t}
        >
          <HiFiEmptyModule
            title={title}
            t={t}
            status={entry?.status ?? "new"}
            hint={
              entry?.status === "wrong-seat"
                ? "Re-homing from firm Hub — Configuration libraries / Book readiness destination"
                : undefined
            }
          />
        </RegisterSurfaceMount>
      );
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
      <aside
        style={{
          width: 188,
          flexShrink: 0,
          borderRight: `1px solid ${t.border}`,
          background: t.bgSecondary,
          overflowY: "auto",
        }}
      >
        <div style={sectionLabelStyle(t)}>House-global</div>
        {OPERATOR_HOUSE_MODULES.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setModule(id)}
            style={navBtnStyle(t, module === id)}
          >
            {id}
          </button>
        ))}
        <div style={sectionLabelStyle(t)}>Per-tenancy</div>
        {OPERATOR_TENANCY_MODULES.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setModule(id)}
            style={navBtnStyle(t, module === id)}
          >
            {id}
          </button>
        ))}
        <div style={sectionLabelStyle(t)}>Support</div>
        {OPERATOR_SUPPORT_MODULES.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setModule(id)}
            style={navBtnStyle(t, module === id)}
          >
            {id}
          </button>
        ))}
      </aside>

      <div style={{ flex: 1, minWidth: 0, minHeight: 0, padding: 12, display: "flex" }}>
        {main}
      </div>
    </div>
  );
}
