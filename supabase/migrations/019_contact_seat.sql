-- 019 — Contact workspace seat. Token /c/<token>, upload write, contact_uploaded.
-- Next free after 018. Do not recut 015 / 018 / A26 as a replacement.
-- Flag 15:43.

CREATE TABLE IF NOT EXISTS contact_access_links (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  enrollment_id TEXT,
  campaign_id TEXT,
  expires_at TIMESTAMPTZ,
  invalidated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_access_links_lookup_idx
  ON contact_access_links (firm_id, contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS contact_access_links_token_hash_idx
  ON contact_access_links (token_hash);

CREATE TABLE IF NOT EXISTS contact_uploads (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  kind TEXT,
  origin TEXT NOT NULL CHECK (origin IN ('kind', 'custom', 'question', 'any')),
  field_key TEXT,
  body_text TEXT,
  file_name TEXT,
  file_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_uploads_contact_idx
  ON contact_uploads (firm_id, contact_id, created_at DESC);

INSERT INTO event_write_set (event_name, version, table_name, ord) VALUES
('contact_uploaded', 1, 'contact_uploads', 0)
ON CONFLICT (event_name, version, table_name) DO NOTHING;

INSERT INTO event_test_data (id, event_name, version, table_name, ord, body) VALUES
(
  'etd-contact_uploaded-okonkwo-hours',
  'contact_uploaded',
  1,
  'contact_uploads',
  0,
  '{"id":"cup-harbor-okonkwo-hours","firm_id":"firm-harbor","firm":"Harbor RCIC","contact_id":"cr-harbor-1","contact_name":"Daniel Okonkwo","kind":"skilled hours note","origin":"custom","field_key":null,"body_text":"1680 Canadian skilled hours on the current permit.","file_name":null,"file_ref":null,"created_at":"2026-08-20T15:10:00.000Z"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
