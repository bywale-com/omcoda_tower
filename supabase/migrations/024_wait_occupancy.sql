-- Packet 028 (Wait kind + approval note). Filename 021 in the packet is stale:
-- 021–023 on main are objective / exhaust / operator panes.

ALTER TABLE workflow_run
  DROP CONSTRAINT IF EXISTS workflow_run_status_check;
ALTER TABLE workflow_run
  ADD CONSTRAINT workflow_run_status_check
    CHECK (status IN ('running', 'waiting', 'success', 'failed', 'stopped'));
ALTER TABLE workflow_run
  ADD COLUMN IF NOT EXISTS resume_at TIMESTAMPTZ;
ALTER TABLE workflow_run
  ADD COLUMN IF NOT EXISTS waiting_node_id TEXT;

CREATE INDEX IF NOT EXISTS workflow_run_waiting_resume_idx
  ON workflow_run (status, resume_at)
  WHERE status = 'waiting';

CREATE TABLE IF NOT EXISTS wait_occupancy (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  workflow_id TEXT NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
  wait_node_id TEXT NOT NULL,
  workflow_run_id TEXT NOT NULL REFERENCES workflow_run(id) ON DELETE CASCADE,
  contact_id TEXT NOT NULL,
  title TEXT NOT NULL,
  approver TEXT NOT NULL CHECK (approver IN ('consultant', 'operator')),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'scheduled', 'approved')),
  approve_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workflow_run_id, wait_node_id, contact_id)
);
CREATE INDEX IF NOT EXISTS wait_occupancy_open_idx
  ON wait_occupancy (workflow_id, wait_node_id, status);
CREATE INDEX IF NOT EXISTS wait_occupancy_desk_idx
  ON wait_occupancy (firm_id, approver, status);
