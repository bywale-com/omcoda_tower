import type { Tokens } from "../../components/tokens";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import { EnrichmentPane, FurnishPane } from "../panes/EnrichmentFurnishPane";
import { FlowsPane } from "../panes/FlowsPane";
import { PersonasFunctionPane } from "../panes/PersonasFunctionPane";
import { PriorsPane } from "../panes/PriorsPane";
import { SmePane } from "../panes/SmePane";
import { WiringPaperPane } from "../panes/WiringPaperPane";
import {
  ComponentsPaneHint,
  CtPlantPlaceholderPane,
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
      return <EnrichmentPane t={t} />;
    case "furnish":
      return <FurnishPane t={t} />;
    case "priors":
      return <PriorsPane t={t} />;
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
