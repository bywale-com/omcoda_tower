-- SYSTEMS-CHANGE-PACKET-020 — Operator panes read the six gates from
-- tables the operation already writes. No firm_readiness. No firm_health.
-- Filename 023: 018–020 are taken on main (collectible_fields, contact_seat,
-- workspace_opt_out). Do not recut packet 018 A34.

ALTER TABLE escrow_acceptances
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'held';

ALTER TABLE escrow_acceptances
  DROP CONSTRAINT IF EXISTS escrow_acceptances_status_check;

ALTER TABLE escrow_acceptances
  ADD CONSTRAINT escrow_acceptances_status_check
  CHECK (status IN (
    'held',
    'release_pending_window',
    'released',
    'returned',
    'disputed'
  ));

CREATE TABLE IF NOT EXISTS register_gaps (
  id text PRIMARY KEY,
  summary text NOT NULL,
  ticket text,
  firm_id text,
  source text,
  written boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS register_gaps_firm_idx
  ON register_gaps (firm_id, created_at DESC);
