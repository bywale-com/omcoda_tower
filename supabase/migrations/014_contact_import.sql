-- 014 — contact import lands the book (SA 013). 013 on main is operator book people.
-- Flag: 15:43 untouched. Do not auto-audit here.

CREATE TABLE IF NOT EXISTS import_batch (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'contact'
    CHECK (kind IN ('contact')),
  source TEXT NOT NULL DEFAULT 'file'
    CHECK (source IN ('file', 'crm', 'assisted')),
  filename TEXT,
  row_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS import_batch_firm_idx ON import_batch (firm_id, created_at DESC);

ALTER TABLE contact_records
  ADD COLUMN IF NOT EXISTS import_batch_id TEXT
    REFERENCES import_batch(id) ON DELETE SET NULL;
