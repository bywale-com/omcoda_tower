/**
 * H3 — one firm brand for CT demo surfaces (Contact / Consultant / Bind).
 * Cedar Pathways is the product face; never "Tower Immigration" on client touchpoints.
 */
import { CT_DEMO } from "./demoIds";

export const FIRM_BRAND = {
  firmId: CT_DEMO.firmId,
  name: "Cedar Pathways",
  short: "Cedar",
  email: "hello@cedarpathways.ca",
  mailAddress: "120 King St W, Suite 800, Toronto ON M5H 1J9",
  phone: "+1 (416) 555-0142",
  initials: "CP",
  brand: "#1B4F72",
  brandSoft: "rgba(27, 79, 114, 0.12)",
} as const;

export const FIRM_NAME = FIRM_BRAND.name;
