/** Cosmetic view manifest — defines what appears together on the register canvas. */
export type RegisterViewHolonRef = {
  holonId: string;
  /** Pattern holons repeat as list rows (e.g. client-row). */
  pattern?: boolean;
  instances?: number;
  state?: Record<string, string>;
  children?: RegisterViewHolonRef[];
};

export type RegisterViewManifest = {
  id: string;
  title: string;
  subtitle: string;
  width: number;
  region: string;
  activeNav?: string;
  contains: RegisterViewHolonRef[];
};
