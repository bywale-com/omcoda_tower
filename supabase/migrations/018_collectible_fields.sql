-- 018 — collectible_fields. Capture kind lives in a table, not a SPA catalog.
-- Seed = today's COLLECTIBLE_FIELDS rows (that count). Do not recut 015 / 017 / 019.

CREATE TABLE IF NOT EXISTS collectible_fields (
  id TEXT PRIMARY KEY,
  field_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  capture TEXT NOT NULL CHECK (capture IN ('self_reportable', 'document_dependent')),
  employer_directed BOOLEAN NOT NULL DEFAULT false,
  ord INT NOT NULL DEFAULT 0
);

INSERT INTO collectible_fields (id, field_key, label, capture, employer_directed, ord) VALUES
  ('foreign_work_years', 'foreign_work_years', 'Foreign work years', 'self_reportable', false, 0),
  ('ee_profile_exists', 'ee_profile_exists', 'Express Entry profile exists', 'self_reportable', false, 1),
  ('ee_profile_last_updated', 'ee_profile_last_updated', 'EE profile last updated', 'self_reportable', false, 2),
  ('canadian_skilled_hours', 'canadian_skilled_hours', 'Canadian skilled hours', 'self_reportable', false, 3),
  ('language_clb', 'language_clb', 'Language CLB', 'self_reportable', false, 4),
  ('crs_score', 'crs_score', 'CRS score', 'self_reportable', false, 5),
  ('noc', 'noc', 'NOC', 'self_reportable', false, 6),
  ('teer_category', 'teer_category', 'TEER category', 'self_reportable', false, 7),
  ('eca_status', 'eca_status', 'ECA status', 'document_dependent', false, 8),
  ('foreign_trade_hours', 'foreign_trade_hours', 'Foreign trade hours', 'self_reportable', false, 9),
  ('has_trade_certificate', 'has_trade_certificate', 'Trade certificate', 'document_dependent', false, 10),
  ('has_qualifying_job_offer', 'has_qualifying_job_offer', 'Qualifying job offer', 'document_dependent', true, 11),
  ('has_ontario_job_offer', 'has_ontario_job_offer', 'Ontario job offer', 'document_dependent', true, 12),
  ('oinp_employer_revenue', 'oinp_employer_revenue', 'OINP employer revenue', 'document_dependent', true, 13),
  ('lmia_paperwork', 'lmia_paperwork', 'LMIA paperwork', 'document_dependent', true, 14)
ON CONFLICT (id) DO NOTHING;
