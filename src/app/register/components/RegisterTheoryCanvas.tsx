import type { Tokens } from "../../components/tokens";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import { FlowsPane } from "../panes/FlowsPane";
import { PersonasFunctionPane } from "../panes/PersonasFunctionPane";
import { SmePane } from "../panes/SmePane";
import { WiringPaperPane } from "../panes/WiringPaperPane";
import {
  ComponentsPaneHint,
  CtPlantPlaceholderPane,
  RegisterPlaceholderPane,
  SeedPane,
  WorldPane,
} from "../panes/WorldPane";

type RegisterTheoryCanvasProps = {
  t: Tokens;
};

export function RegisterTheoryCanvas({ t }: RegisterTheoryCanvasProps) {
  const { registerPassId } = useRegisterSelection();

  switch (registerPassId) {
    case "seed":
      return <SeedPane t={t} />;
    case "world":
      return <WorldPane t={t} />;
    case "personas-function":
      return <PersonasFunctionPane t={t} />;
    case "sme":
      return <SmePane t={t} />;
    case "enrichment":
      return (
        <RegisterPlaceholderPane
          t={t}
          title="Enrichment — Can'ts"
          body="Design gaps discovered by asking the right question of the right persona. Populate after Function completes — each Can't joins surfaceIds."
        />
      );
    case "furnish":
      return (
        <RegisterPlaceholderPane
          t={t}
          title="Furnish"
          body="Supporting affordances that don't change Core Function — written with implementationProblem + relative click-path before CT plant."
        />
      );
    case "flows":
      return <FlowsPane t={t} />;
    case "wiring":
      return <WiringPaperPane t={t} />;
    case "components":
      return <ComponentsPaneHint t={t} />;
    case "ct-plant":
      return <CtPlantPlaceholderPane t={t} />;
    default:
      return <WorldPane t={t} />;
  }
}
