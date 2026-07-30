import type { HowGraph } from "./types";
import { CONSULTANT_CORE_GRAPH } from "./consultantCore";
import { CONSULTANT_GOVERNANCE_GRAPH } from "./consultantGovernance";
import { CONSULTANT_ACCESS_GRAPH } from "./consultantAccess";
import { CONTACT_CONSENT_GRAPH } from "./contactConsent";
import { CONTACT_REFRESH_GRAPH } from "./contactRefresh";
import { CONTACT_SILENCE_GRAPH } from "./contactSilence";
import { CONTACT_BOOK_GRAPH } from "./contactBook";
import { OPERATOR_ACQUISITION_GRAPH } from "./operatorAcquisition";
import { OPERATOR_ACTIVATION_GRAPH } from "./operatorActivation";
import { OPERATOR_REFERENCE_DATA_GRAPH } from "./operatorReferenceData";
import { OPERATOR_CONFIGURATION_LIBRARIES_GRAPH } from "./operatorConfigurationLibraries";
import { OPERATOR_OVERSIGHT_GRAPH } from "./operatorOversight";
import { OPERATOR_AUDIT_TRAIL_GRAPH } from "./operatorAuditTrail";
import { OPERATOR_REGISTER_EVOLUTION_GRAPH } from "./operatorRegisterEvolution";
import { OPERATOR_FOUNDER_CONTROLS_GRAPH } from "./operatorFounderControls";
import { OPERATOR_PROVISION_GRAPH } from "./operatorProvision";
import { OPERATOR_COMMERCIAL_GRAPH } from "./operatorCommercial";
import { OPERATOR_FIRM_BIND_GRAPH } from "./operatorFirmBind";
import { OPERATOR_BOOK_READINESS_GRAPH } from "./operatorBookReadiness";
import { OPERATOR_FIRM_HEALTH_GRAPH } from "./operatorFirmHealth";
import { OPERATOR_ACTIVATION_STATE_GRAPH } from "./operatorActivationState";
import { OPERATOR_SUPPORT_GRAPH } from "./operatorSupport";

/** Epics sorted by epicOrder — universal left-to-right priority. */
export const HOW_GRAPHS: HowGraph[] = [
  CONSULTANT_CORE_GRAPH,
  CONSULTANT_GOVERNANCE_GRAPH,
  CONSULTANT_ACCESS_GRAPH,
  CONTACT_CONSENT_GRAPH,
  CONTACT_REFRESH_GRAPH,
  CONTACT_SILENCE_GRAPH,
  CONTACT_BOOK_GRAPH,
  OPERATOR_ACQUISITION_GRAPH,
  OPERATOR_ACTIVATION_GRAPH,
  OPERATOR_REFERENCE_DATA_GRAPH,
  OPERATOR_CONFIGURATION_LIBRARIES_GRAPH,
  OPERATOR_OVERSIGHT_GRAPH,
  OPERATOR_AUDIT_TRAIL_GRAPH,
  OPERATOR_REGISTER_EVOLUTION_GRAPH,
  OPERATOR_FOUNDER_CONTROLS_GRAPH,
  OPERATOR_PROVISION_GRAPH,
  OPERATOR_COMMERCIAL_GRAPH,
  OPERATOR_FIRM_BIND_GRAPH,
  OPERATOR_BOOK_READINESS_GRAPH,
  OPERATOR_FIRM_HEALTH_GRAPH,
  OPERATOR_ACTIVATION_STATE_GRAPH,
  OPERATOR_SUPPORT_GRAPH,
].sort((a, b) => a.epicOrder - b.epicOrder);

export function getHowGraph(id: string): HowGraph | undefined {
  return HOW_GRAPHS.find((graph) => graph.id === id);
}
