export type RegisterTableDomain = "tenancy" | "auth";

export type RegisterTableField = {
  name: string;
  type: string;
  /** FK or constraint hint shown muted beside the type */
  note?: string;
};

export type RegisterTableDef = {
  id: string;
  name: string;
  domain: RegisterTableDomain;
  fields: RegisterTableField[];
  defaultPosition: { x: number; y: number };
};

export const REGISTER_TABLE_DOMAIN_COLORS: Record<
  RegisterTableDomain,
  { header: string; headerText: string }
> = {
  tenancy: { header: "#86EFAC", headerText: "#14532D" },
  auth: { header: "#FDBA74", headerText: "#9A3412" },
};

export const FIRMS_TABLE: RegisterTableDef = {
  id: "firms",
  name: "firms",
  domain: "tenancy",
  defaultPosition: { x: 800, y: 640 },
  fields: [
    { name: "id", type: "UUID" },
    { name: "name", type: "String" },
    { name: "created_at", type: "Timestamp" },
  ],
};

export const USERS_TABLE: RegisterTableDef = {
  id: "users",
  name: "users",
  domain: "tenancy",
  defaultPosition: { x: 800, y: 500 },
  fields: [
    { name: "id", type: "UUID" },
    { name: "firm_id", type: "UUID", note: "→ firms.id" },
    { name: "email", type: "String" },
    { name: "created_at", type: "Timestamp" },
  ],
};

export const OTP_CHALLENGES_TABLE: RegisterTableDef = {
  id: "otp_challenges",
  name: "otp_challenges",
  domain: "auth",
  defaultPosition: { x: 1040, y: 560 },
  fields: [
    { name: "id", type: "UUID" },
    { name: "firm_id", type: "UUID", note: "→ firms.id" },
    { name: "email", type: "String" },
    { name: "code_hash", type: "String" },
    { name: "expires_at", type: "Timestamp" },
    { name: "consumed_at", type: "Timestamp", note: "nullable" },
    { name: "created_at", type: "Timestamp" },
  ],
};

export const SESSIONS_TABLE: RegisterTableDef = {
  id: "sessions",
  name: "sessions",
  domain: "auth",
  defaultPosition: { x: 1040, y: 720 },
  fields: [
    { name: "id", type: "UUID" },
    { name: "user_id", type: "UUID", note: "→ users.id" },
    { name: "firm_id", type: "UUID", note: "→ firms.id" },
    { name: "token_hash", type: "String" },
    { name: "expires_at", type: "Timestamp" },
    { name: "created_at", type: "Timestamp" },
  ],
};

export const REGISTER_TABLES: RegisterTableDef[] = [
  FIRMS_TABLE,
  USERS_TABLE,
  OTP_CHALLENGES_TABLE,
  SESSIONS_TABLE,
];

export function getRegisterTable(id: string): RegisterTableDef | undefined {
  return REGISTER_TABLES.find((table) => table.id === id);
}
