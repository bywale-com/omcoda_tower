import { BOARD_REGISTER_HOLONS } from "./boardRegisterMeta";
import { LOGIN_REGISTER_HOLONS } from "./loginRegisterMeta";
import type { RegisterHolonMeta } from "./types";

export const REGISTER_HOLON_META_LIST: RegisterHolonMeta[] = [
  ...LOGIN_REGISTER_HOLONS,
  ...BOARD_REGISTER_HOLONS,
];

export const REGISTER_HOLON_META_MAP = new Map<string, RegisterHolonMeta>(
  REGISTER_HOLON_META_LIST.map((meta) => [meta.id, meta]),
);
