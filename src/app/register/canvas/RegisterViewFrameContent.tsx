import type { Tokens } from "../../components/tokens";
import { RegisterViewComposer } from "../composer/RegisterViewComposer";

type RegisterViewFrameContentProps = {
  viewId: string;
  t: Tokens;
};

export function RegisterViewFrameContent({ viewId, t }: RegisterViewFrameContentProps) {
  return <RegisterViewComposer viewId={viewId} t={t} />;
}
