-- Automations alive: Trigger node backing table + webhook ids
-- Materialized from workflow.graph on Activate; dispatch reads these rows.

CREATE TABLE IF NOT EXISTS workflow_trigger (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
  firm_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('event', 'schedule', 'manual', 'webhook', 'constant')),
  event_name TEXT,
  condition JSONB NOT NULL DEFAULT '{}'::jsonb,
  schedule JSONB NOT NULL DEFAULT '{}'::jsonb,
  webhook_id TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workflow_id, node_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS workflow_trigger_webhook_uidx
  ON workflow_trigger (webhook_id)
  WHERE webhook_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS workflow_trigger_dispatch_idx
  ON workflow_trigger (firm_id, type, event_name)
  WHERE enabled = true;

ALTER TABLE workflow_trigger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS workflow_trigger_firm_isolation ON workflow_trigger;
CREATE POLICY workflow_trigger_firm_isolation ON workflow_trigger FOR ALL
  USING (firm_id = COALESCE(current_setting('request.jwt.claims', true)::jsonb->>'firm_id', firm_id))
  WITH CHECK (true);
