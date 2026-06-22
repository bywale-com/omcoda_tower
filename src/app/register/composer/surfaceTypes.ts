import type { ReactNode } from "react";
import type { Tokens } from "../../components/tokens";

export type RegisterSurfaceProps = {
  t: Tokens;
  viewId: string;
  layoutProps?: Record<string, unknown>;
  instanceIndex?: number;
  children?: ReactNode;
};

export type RegisterSurfaceComponent = (props: RegisterSurfaceProps) => ReactNode;
