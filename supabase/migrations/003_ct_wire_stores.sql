-- CT wire cutover — durable stores for halt, consent, OAuth, audit, send plane
-- firm_id / contact_id are TEXT to match Register CT demo ids (firm-cedar, …)
-- Auth `firms` UUID tenancy remains for sessions; CT keys are separate until unified.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS ct_firms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  posture TEXT NOT NULL DEFAULT 'Idle'
    CHECK (posture IN ('Idle', 'Armed', 'Active')),
  pool_slug TEXT,
  pool_domain TEXT,
  sending_identity_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS halt_records (
  id TEXT PRIMARY KEY,
  consultant_id TEXT NOT NULL,
  contact_id TEXT,
  firm_id TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('contact', 'firm-book')),
  reason TEXT,
  halted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lifted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS halt_records_firm_active_idx
  ON halt_records (firm_id)
  WHERE lifted_at IS NULL;

CREATE INDEX IF NOT EXISTS halt_records_contact_active_idx
  ON halt_records (contact_id)
  WHERE lifted_at IS NULL AND scope = 'contact';

CREATE TABLE IF NOT EXISTS consent_records (
  contact_id TEXT NOT NULL,
  firm_id TEXT NOT NULL,
  basis TEXT NOT NULL DEFAULT 'none'
    CHECK (basis IN ('express', 'implied', 'none')),
  silenced BOOLEAN NOT NULL DEFAULT false,
  source TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (contact_id, firm_id)
);

CREATE TABLE IF NOT EXISTS crm_oauth_grants (
  firm_id TEXT PRIMARY KEY,
  granted BOOLEAN NOT NULL DEFAULT false,
  revoked BOOLEAN NOT NULL DEFAULT false,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  firm_id TEXT,
  payload JSONB
);

CREATE INDEX IF NOT EXISTS audit_events_subject_idx
  ON audit_events (subject_id, at DESC);

CREATE INDEX IF NOT EXISTS audit_events_kind_idx
  ON audit_events (kind, at DESC);

CREATE TABLE IF NOT EXISTS primary_store_rows (
  collection TEXT NOT NULL,
  id TEXT NOT NULL,
  body JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (collection, id)
);

CREATE TABLE IF NOT EXISTS outbound_messages (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  purpose TEXT NOT NULL,
  to_addr TEXT NOT NULL,
  from_addr TEXT,
  provider_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'accepted',
  deny_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS outbound_messages_firm_idx
  ON outbound_messages (firm_id, created_at DESC);

CREATE TABLE IF NOT EXISTS messaging_events (
  id TEXT PRIMARY KEY,
  at TIMESTAMPTZ NOT NULL DEFAULT now(),
  firm_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  event_class TEXT NOT NULL,
  contact_id TEXT,
  provider_event_id TEXT UNIQUE,
  raw JSONB
);

CREATE INDEX IF NOT EXISTS messaging_events_firm_idx
  ON messaging_events (firm_id, at DESC);

CREATE TABLE IF NOT EXISTS provider_webhook_receipts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  provider TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  signature_ok BOOLEAN NOT NULL DEFAULT false,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB NOT NULL,
  UNIQUE (provider, provider_event_id)
);

CREATE TABLE IF NOT EXISTS sending_domains (
  firm_id TEXT PRIMARY KEY,
  subdomain TEXT NOT NULL,
  full_domain TEXT NOT NULL,
  resend_domain_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ
);
