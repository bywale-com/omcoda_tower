import type { PaletteBlock } from "../../../../data/automationWorkflows";
import type { Tokens } from "../../../tokens";
import { AttachStepMenu } from "../AttachStepMenu";

type EdgeInsertMenuProps = {
  t: Tokens;
  onSelect: (block: PaletteBlock) => void;
  onClose: () => void;
};

export function EdgeInsertMenu({ t, onSelect, onClose }: EdgeInsertMenuProps) {
  return (
    <AttachStepMenu
      t={t}
      title="Insert step"
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
