import type { NotionIconName } from "../../../icons/notion-icon-urls";
import type { HolonLucideIconName } from "../holonIcons";

export type RegisterHolonRenderKey = string;

/** Canvas + catalog metadata — extend when adding holons to the product UI. */
export type RegisterHolonMeta = {
  id: string;
  label: string;
  icon?: NotionIconName;
  lucideIcon?: HolonLucideIconName;
  order: number;
  parentId?: string | null;
  /** Register canvas view ids that include this holon */
  views?: readonly string[];
  /** Cosmetic surface renderer key */
  render?: RegisterHolonRenderKey;
  /** Repeat pattern holons per view (e.g. client-row × 2 on board-clients) */
  patternInstances?: Partial<Record<string, number>>;
};

export type RegisterViewLayoutId = "login-card" | "board-sidebar";

export type RegisterViewManifest = {
  id: string;
  title: string;
  subtitle: string;
  width: number;
  region: string;
  layout: RegisterViewLayoutId;
  layoutProps?: Record<string, unknown>;
};

export type ComposedHolonNode = {
  meta: RegisterHolonMeta;
  children: ComposedHolonNode[];
};
