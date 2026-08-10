-- Machine tables v1 — materialize frozen System Map + automations objects
-- Continues CT TEXT firm_id pattern from 003. Auth UUID firms remain separate.
-- Walls are NOT tables. consent_records extended for waitlisted.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Extend consent for waitlisted (v3) ─────────────────────────────────────
ALTER TABLE consent_records
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'unsequenced'
    CHECK (status IN ('unsequenced', 'waitlisted', 'sequenced', 'silenced'));

UPDATE consent_records
SET status = CASE
  WHEN silenced THEN 'silenced'
  WHEN basis IN ('express', 'implied') THEN 'sequenced'
  ELSE 'unsequenced'
END
WHERE status = 'unsequenced' AND (silenced = true OR basis IN ('express', 'implied'));

-- ── Automations objects ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflow (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  name TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT 'contact'
    CHECK (target IN ('audit', 'contact', 'import', 'client')),
  graph JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[]}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS workflow_firm_idx ON workflow (firm_id);

CREATE TABLE IF NOT EXISTS workflow_state (
  workflow_id TEXT PRIMARY KEY REFERENCES workflow(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflow_target (
  workflow_id TEXT PRIMARY KEY REFERENCES workflow(id) ON DELETE CASCADE,
  target TEXT NOT NULL CHECK (target IN ('audit', 'contact', 'import', 'client'))
);

CREATE TABLE IF NOT EXISTS workflow_run (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
  firm_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'success', 'failed', 'stopped')),
  trigger_label TEXT,
  node_status JSONB NOT NULL DEFAULT '{}'::jsonb,
  counts JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS workflow_run_workflow_idx ON workflow_run (workflow_id, started_at DESC);

CREATE TABLE IF NOT EXISTS action (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL REFERENCES workflow(id) ON DELETE CASCADE,
  node_id TEXT,
  type TEXT NOT NULL DEFAULT 'call_agent'
    CHECK (type = 'call_agent'),
  agent_ref TEXT NOT NULL,
  payload_binding JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enrollment (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  agent_ref TEXT NOT NULL,
  sequence_id TEXT,
  workflow_run_id TEXT REFERENCES workflow_run(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS enrollment_firm_contact_idx ON enrollment (firm_id, contact_id);

-- ── Templates + bindings ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sequence_template (
  id TEXT PRIMARY KEY,
  sequence_class TEXT NOT NULL
    CHECK (sequence_class IN ('optin_launch', 'launch_day', 'reengagement', 'reactivation')),
  variant TEXT NOT NULL DEFAULT 'v1',
  label TEXT NOT NULL,
  cells JSONB NOT NULL DEFAULT '[]'::jsonb,
  source TEXT,
  silences JSONB NOT NULL DEFAULT '[]'::jsonb,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS firm_sequence_binding (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  sequence_class TEXT NOT NULL
    CHECK (sequence_class IN ('optin_launch', 'launch_day', 'reengagement', 'reactivation')),
  template_id TEXT NOT NULL REFERENCES sequence_template(id),
  overrides JSONB NOT NULL DEFAULT '[]'::jsonb,
  variable_bindings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (firm_id, sequence_class)
);

-- ── Rule tables (DATA) ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rule_attempt_criteria (
  id TEXT PRIMARY KEY,
  firm_id TEXT, -- NULL = platform default
  label TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  when_clause TEXT,
  condition_clause TEXT,
  set_value TEXT,
  threshold NUMERIC,
  threshold_unit TEXT,
  ord INT NOT NULL DEFAULT 0,
  source TEXT,
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS rule_motion_precedence (
  id TEXT PRIMARY KEY,
  firm_id TEXT,
  label TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  when_clause TEXT,
  condition_clause TEXT,
  set_value TEXT,
  ord INT NOT NULL DEFAULT 0,
  source TEXT,
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS rule_field_class_routing (
  id TEXT PRIMARY KEY,
  firm_id TEXT,
  label TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  when_clause TEXT,
  condition_clause TEXT,
  set_value TEXT,
  ord INT NOT NULL DEFAULT 0,
  source TEXT,
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS rule_reachability_checks (
  id TEXT PRIMARY KEY,
  firm_id TEXT,
  label TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  when_clause TEXT,
  condition_clause TEXT,
  set_value TEXT,
  ord INT NOT NULL DEFAULT 0,
  source TEXT,
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS rule_eligibility_pathway (
  id TEXT PRIMARY KEY,
  firm_id TEXT,
  label TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  when_clause TEXT,
  condition_clause TEXT,
  set_value TEXT,
  ord INT NOT NULL DEFAULT 0,
  source TEXT,
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS rule_cohort_scoring (
  id TEXT PRIMARY KEY,
  firm_id TEXT,
  label TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  when_clause TEXT,
  condition_clause TEXT,
  set_value TEXT,
  ord INT NOT NULL DEFAULT 0,
  source TEXT,
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS rule_metrics_thresholds (
  id TEXT PRIMARY KEY,
  firm_id TEXT,
  label TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  when_clause TEXT,
  condition_clause TEXT,
  set_value TEXT,
  threshold NUMERIC,
  ord INT NOT NULL DEFAULT 0,
  source TEXT,
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS seq_channel_ownership_order (
  id TEXT PRIMARY KEY,
  firm_id TEXT,
  token TEXT NOT NULL,
  label TEXT NOT NULL,
  ord INT NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS seq_phase_order (
  id TEXT PRIMARY KEY,
  firm_id TEXT,
  token TEXT NOT NULL,
  label TEXT NOT NULL,
  ord INT NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS seq_eligibility_pipeline (
  id TEXT PRIMARY KEY,
  firm_id TEXT,
  token TEXT NOT NULL,
  label TEXT NOT NULL,
  ord INT NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 1
);

-- ── Core-loop state ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_records (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  name TEXT,
  body JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_records_firm_idx ON contact_records (firm_id);

CREATE TABLE IF NOT EXISTS reachability_verdicts (
  contact_id TEXT NOT NULL,
  firm_id TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('reachable', 'partial', 'unreachable')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (contact_id, firm_id)
);

CREATE TABLE IF NOT EXISTS sequence_ready (
  contact_id TEXT NOT NULL,
  firm_id TEXT NOT NULL,
  ready BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (contact_id, firm_id)
);

CREATE TABLE IF NOT EXISTS campaign_states (
  firm_id TEXT PRIMARY KEY,
  state TEXT NOT NULL DEFAULT 'armed-for-activation'
    CHECK (state IN ('armed-for-activation', 'running')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cohort_tiers (
  contact_id TEXT NOT NULL,
  firm_id TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'unranked',
  score JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (contact_id, firm_id)
);

CREATE TABLE IF NOT EXISTS metrics_flags (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  flag TEXT NOT NULL,
  metric TEXT,
  value NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reference_versions (
  id TEXT PRIMARY KEY,
  firm_id TEXT, -- NULL = platform/house
  key TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (firm_id, key, version)
);

CREATE TABLE IF NOT EXISTS constants_packs (
  id TEXT PRIMARY KEY,
  firm_id TEXT,
  name TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS eligibility_evaluations (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  trigger_kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'done',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS eligibility_results (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT REFERENCES eligibility_evaluations(id) ON DELETE CASCADE,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  any_pathway_pass BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS eligibility_results_contact_idx
  ON eligibility_results (firm_id, contact_id, created_at DESC);

CREATE TABLE IF NOT EXISTS signals (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS motion_decisions (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  motion TEXT NOT NULL CHECK (motion IN ('nudge', 'reactivation', 'none')),
  reason JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS active_attempts (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  enrollment_id TEXT REFERENCES enrollment(id) ON DELETE SET NULL,
  owner_channel TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS engagement_records (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  event_kind TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fact_writebacks (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  field_key TEXT,
  value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS missing_fact_signals (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  field_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_runs (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'complete', 'failed')),
  enabled_checks JSONB NOT NULL DEFAULT '[]'::jsonb,
  import_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sequence_definitions (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  name TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prepared_workspaces (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'staged',
  body JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS escrow_acceptances (
  firm_id TEXT PRIMARY KEY,
  accepted BOOLEAN NOT NULL DEFAULT false,
  terms JSONB NOT NULL DEFAULT '{}'::jsonb,
  accepted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── RLS (firm-scoped). Service role bypasses; app must set request.firm_id when using JWT path.
-- `action` has no firm_id — isolated via workflow join (separate policy below).
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'workflow', 'workflow_run', 'enrollment',
    'firm_sequence_binding', 'contact_records', 'reachability_verdicts',
    'sequence_ready', 'campaign_states', 'cohort_tiers', 'metrics_flags',
    'eligibility_evaluations', 'eligibility_results', 'signals', 'motion_decisions',
    'active_attempts', 'engagement_records', 'fact_writebacks', 'missing_fact_signals',
    'audit_runs', 'sequence_definitions', 'prepared_workspaces', 'escrow_acceptances'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_firm_isolation', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL USING (firm_id = COALESCE(current_setting(''request.jwt.claims'', true)::jsonb->>''firm_id'', firm_id)) WITH CHECK (true)',
      t || '_firm_isolation', t
    );
  END LOOP;
END $$;

ALTER TABLE action ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS action_via_workflow ON action;
CREATE POLICY action_via_workflow ON action FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workflow w
      WHERE w.id = action.workflow_id
        AND w.firm_id = COALESCE(
          current_setting('request.jwt.claims', true)::jsonb->>'firm_id',
          w.firm_id
        )
    )
  )
  WITH CHECK (true);
