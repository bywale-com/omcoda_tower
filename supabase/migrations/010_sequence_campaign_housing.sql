-- Change packet: sequence⊃campaigns, Automations persist/dispatch, run_audit.
-- Pictures are the spec. No qualify_gate. No launch_window/launch_day types.
-- Next campaign = next ord when this campaign's objective is met.

-- ── New tables ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS campaign (
  id TEXT PRIMARY KEY,
  firm_id TEXT,
  sequence_id TEXT NOT NULL REFERENCES sequence_template(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ord INT NOT NULL DEFAULT 0,
  override_this BOOLEAN NOT NULL DEFAULT false,
  attempt_count INT,
  wait_after_last_failed_seconds INT,
  nth_exception JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS campaign_sequence_ord_idx ON campaign (sequence_id, ord);

CREATE TABLE IF NOT EXISTS campaign_objective (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaign(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('click', 'form', 'meeting')),
  name TEXT NOT NULL,
  completion_table TEXT NOT NULL
    CHECK (completion_table IN ('messaging_events', 'fact_writebacks', 'meeting_booked')),
  source TEXT NOT NULL DEFAULT 'scratch'
    CHECK (source IN ('template', 'scratch')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id)
);

CREATE TABLE IF NOT EXISTS campaign_channel (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaign(id) ON DELETE CASCADE,
  token TEXT NOT NULL CHECK (token IN ('text', 'email', 'call')),
  ord INT NOT NULL DEFAULT 0,
  override_content BOOLEAN NOT NULL DEFAULT false,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, token)
);

CREATE TABLE IF NOT EXISTS seq_attempt_cycle (
  id TEXT PRIMARY KEY,
  firm_id TEXT,
  sequence_id TEXT REFERENCES sequence_template(id) ON DELETE CASCADE,
  attempt_count INT NOT NULL DEFAULT 3,
  wait_after_last_failed_seconds INT NOT NULL DEFAULT 86400,
  nth_exception JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaign_failure (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  campaign_id TEXT REFERENCES campaign(id) ON DELETE SET NULL,
  sequence_id TEXT REFERENCES sequence_template(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS campaign_failure_firm_idx ON campaign_failure (firm_id, contact_id);

CREATE TABLE IF NOT EXISTS contact_tag (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  source_workflow_id TEXT REFERENCES workflow(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_tag_contact_idx ON contact_tag (firm_id, contact_id, tag);

CREATE TABLE IF NOT EXISTS rule_pack (
  id TEXT PRIMARY KEY,
  firm_id TEXT,
  workflow_id TEXT REFERENCES workflow(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  families JSONB NOT NULL DEFAULT '[]'::jsonb,
  custom_json JSONB,
  named_code TEXT,
  named_code_on BOOLEAN NOT NULL DEFAULT false,
  enabled BOOLEAN NOT NULL DEFAULT true,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── sequence_template.firm_id ──────────────────────────────────────────────

ALTER TABLE sequence_template ADD COLUMN IF NOT EXISTS firm_id TEXT;

-- ── Drop old class CHECKs, migrate tokens, add three-class CHECK ───────────

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'sequence_template'::regclass AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%sequence_class%'
  LOOP
    EXECUTE format('ALTER TABLE sequence_template DROP CONSTRAINT %I', r.conname);
  END LOOP;
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'firm_sequence_binding'::regclass AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%sequence_class%'
  LOOP
    EXECUTE format('ALTER TABLE firm_sequence_binding DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- Seed teaching pair: launch_day class row becomes a campaign on opt-in sequence.
INSERT INTO campaign (id, firm_id, sequence_id, name, ord, override_this)
SELECT
  'camp.optin.window',
  NULL,
  'tpl.optin_launch.v1',
  'Launch window',
  0,
  false
WHERE EXISTS (SELECT 1 FROM sequence_template WHERE id = 'tpl.optin_launch.v1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO campaign (id, firm_id, sequence_id, name, ord, override_this)
SELECT
  'camp.optin.day',
  NULL,
  'tpl.optin_launch.v1',
  'Launch day',
  1,
  false
WHERE EXISTS (SELECT 1 FROM sequence_template WHERE id = 'tpl.optin_launch.v1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO campaign_objective (id, campaign_id, kind, name, completion_table, source)
VALUES
  ('obj.optin.window', 'camp.optin.window', 'click', 'Click this link', 'messaging_events', 'template'),
  ('obj.optin.day', 'camp.optin.day', 'form', 'They opt in', 'fact_writebacks', 'template')
ON CONFLICT (campaign_id) DO NOTHING;

-- Drop UNIQUE (firm_id, sequence_class) BEFORE remapping two classes onto optin.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'firm_sequence_binding'::regclass AND contype = 'u'
  LOOP
    EXECUTE format('ALTER TABLE firm_sequence_binding DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

UPDATE sequence_template SET sequence_class = 'optin'
WHERE sequence_class IN ('optin_launch', 'launch_day');

UPDATE firm_sequence_binding SET sequence_class = 'optin', template_id = 'tpl.optin_launch.v1'
WHERE sequence_class IN ('optin_launch', 'launch_day') OR template_id = 'tpl.launch_day.v1';

UPDATE enrollment SET sequence_id = 'tpl.optin_launch.v1'
WHERE sequence_id = 'tpl.launch_day.v1' OR agent_ref = 'tpl.launch_day.v1';

DELETE FROM firm_sequence_binding WHERE template_id = 'tpl.launch_day.v1';
DELETE FROM sequence_template WHERE id = 'tpl.launch_day.v1';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sequence_template_sequence_class_check'
  ) THEN
    ALTER TABLE sequence_template
      ADD CONSTRAINT sequence_template_sequence_class_check
      CHECK (sequence_class IN ('optin', 'reengagement', 'reactivation'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'firm_sequence_binding_sequence_class_check'
  ) THEN
    ALTER TABLE firm_sequence_binding
      ADD CONSTRAINT firm_sequence_binding_sequence_class_check
      CHECK (sequence_class IN ('optin', 'reengagement', 'reactivation'));
  END IF;
END $$;

-- ── Binding: default flag + inherit ─
ALTER TABLE firm_sequence_binding ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE firm_sequence_binding ADD COLUMN IF NOT EXISTS override_attempt BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE firm_sequence_binding ADD COLUMN IF NOT EXISTS override_channel BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE firm_sequence_binding ADD COLUMN IF NOT EXISTS override_content BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE firm_sequence_binding ADD COLUMN IF NOT EXISTS override_sequencing BOOLEAN NOT NULL DEFAULT false;

UPDATE firm_sequence_binding SET is_default = true
WHERE id IN (
  SELECT DISTINCT ON (firm_id, sequence_class) id
  FROM firm_sequence_binding
  ORDER BY firm_id, sequence_class, created_at
);

CREATE UNIQUE INDEX IF NOT EXISTS firm_sequence_binding_default_idx
  ON firm_sequence_binding (firm_id, sequence_class)
  WHERE is_default;

-- ── enrollment: FK sequence_id + campaign cursor ───────────────────────────

UPDATE enrollment SET sequence_id = agent_ref
WHERE sequence_id IS NULL AND agent_ref IS NOT NULL;

ALTER TABLE enrollment ADD COLUMN IF NOT EXISTS campaign_id TEXT REFERENCES campaign(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'enrollment_sequence_id_fkey'
  ) THEN
    ALTER TABLE enrollment
      ADD CONSTRAINT enrollment_sequence_id_fkey
      FOREIGN KEY (sequence_id) REFERENCES sequence_template(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ── action.type widen + agent_ref nullable + run_audit ─────────────────────

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'action'::regclass AND contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE action DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE action ALTER COLUMN agent_ref DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'action_type_check'
  ) THEN
    ALTER TABLE action
      ADD CONSTRAINT action_type_check
      CHECK (type IN (
        'call_agent',
        'ascribe_tag',
        'manage_lists',
        'assign_task',
        'notify_consultant',
        'run_audit'
      ));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'action_agent_ref_required'
  ) THEN
    ALTER TABLE action
      ADD CONSTRAINT action_agent_ref_required
      CHECK (type <> 'call_agent' OR agent_ref IS NOT NULL);
  END IF;
END $$;

-- ── workflow_trigger grain + scope ─────────────────────────────────────────

ALTER TABLE workflow_trigger ADD COLUMN IF NOT EXISTS grain TEXT NOT NULL DEFAULT 'global';
ALTER TABLE workflow_trigger ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'every_firm';
ALTER TABLE workflow_trigger ADD COLUMN IF NOT EXISTS scope_contact_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'workflow_trigger_grain_check'
  ) THEN
    ALTER TABLE workflow_trigger
      ADD CONSTRAINT workflow_trigger_grain_check
      CHECK (grain IN ('global', 'local'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'workflow_trigger_scope_check'
  ) THEN
    ALTER TABLE workflow_trigger
      ADD CONSTRAINT workflow_trigger_scope_check
      CHECK (scope IN ('every_firm', 'select_from'));
  END IF;
END $$;

-- ── attempt criteria may scope to a campaign channel ───────────────────────

ALTER TABLE rule_attempt_criteria
  ADD COLUMN IF NOT EXISTS campaign_channel_id TEXT REFERENCES campaign_channel(id) ON DELETE SET NULL;

-- ── Global attempt-cycle default (C6) ──────────────────────────────────────

INSERT INTO seq_attempt_cycle (id, firm_id, sequence_id, attempt_count, wait_after_last_failed_seconds)
VALUES ('sac-global', NULL, NULL, 3, 86400)
ON CONFLICT (id) DO NOTHING;
