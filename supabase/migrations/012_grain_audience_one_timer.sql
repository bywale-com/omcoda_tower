-- 012 — one timer, A18 local_ref, A19 audience, seed people.
-- Do not reopen 010/011 DDL. Flag: 15:43 untouched.

ALTER TABLE campaign_channel
  ADD COLUMN IF NOT EXISTS rules_override BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS within_seconds INT;

CREATE TABLE IF NOT EXISTS seq_channel_rules (
  id TEXT PRIMARY KEY,
  firm_id TEXT,
  sequence_id TEXT REFERENCES sequence_template(id) ON DELETE CASCADE,
  token TEXT NOT NULL CHECK (token IN ('text', 'email', 'call')),
  within_seconds INT NOT NULL DEFAULT 1800,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS seq_channel_rules_global_idx
  ON seq_channel_rules (token) WHERE sequence_id IS NULL AND firm_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS seq_channel_rules_seq_idx
  ON seq_channel_rules (sequence_id, token) WHERE sequence_id IS NOT NULL;

INSERT INTO seq_channel_rules (id, firm_id, sequence_id, token, within_seconds) VALUES
  ('scr-global-text',  NULL, NULL, 'text',  1800),
  ('scr-global-email', NULL, NULL, 'email', 86400),
  ('scr-global-call',  NULL, NULL, 'call',  1800)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE rule_attempt_criteria
  ADD COLUMN IF NOT EXISTS sequence_id TEXT REFERENCES sequence_template(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS channel_token TEXT
    CHECK (channel_token IS NULL OR channel_token IN ('text', 'email', 'call', 'form'));

-- Face toggles (C6). Ids/labels/channel_token from the packet.
-- when_clause/condition_clause are what the tick already reads (channel + medium condition).
-- threshold leftover — do not read it for the timer.
INSERT INTO rule_attempt_criteria
  (id, firm_id, label, enabled, when_clause, condition_clause, set_value, channel_token, ord, source) VALUES
  ('acr-text-not-opened',     NULL, 'not opened',       true,  'channel=text',  'not opened',       'escalate_forward', 'text',  0, 'C6'),
  ('acr-text-not-delivered',  NULL, 'not delivered',    true,  'channel=text',  'not delivered',    'escalate_forward', 'text',  1, 'C6'),
  ('acr-email-not-opened',    NULL, 'not opened',       true,  'channel=email', 'not opened',       'escalate_forward', 'email', 0, 'C6'),
  ('acr-email-link',          NULL, 'link not clicked', true,  'channel=email', 'link not clicked', 'escalate_forward', 'email', 1, 'C6'),
  ('acr-call-not-answered',   NULL, 'not answered',     true,  'channel=call',  'not answered',     'escalate_forward', 'call',  0, 'C6'),
  ('acr-call-not-completed',  NULL, 'not completed',    true,  'channel=call',  'not completed',    'escalate_forward', 'call',  1, 'C6')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE workflow_trigger
  ADD COLUMN IF NOT EXISTS local_ref TEXT;

ALTER TABLE workflow_trigger
  DROP CONSTRAINT IF EXISTS workflow_trigger_local_ref;
ALTER TABLE workflow_trigger
  ADD CONSTRAINT workflow_trigger_local_ref
  CHECK (grain = 'global' OR local_ref IS NOT NULL);

ALTER TABLE workflow
  ADD COLUMN IF NOT EXISTS audience_scope TEXT NOT NULL DEFAULT 'every_firm',
  ADD COLUMN IF NOT EXISTS audience_contact_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'workflow_audience_scope_check'
  ) THEN
    ALTER TABLE workflow
      ADD CONSTRAINT workflow_audience_scope_check
      CHECK (audience_scope IN ('every_firm', 'select_from'));
  END IF;
END $$;

-- People seed. Templates/campaigns exist after 002; workflow after 003.
-- WHERE EXISTS so a fresh migrate (012 before seeds) does not fail.
INSERT INTO contact_records (id, firm_id, name, email, phone) VALUES
  ('cr-cedar-1', 'firm-cedar', 'Ana Ruiz', 'ana.ruiz@example.com', NULL),
  ('cr-cedar-2', 'firm-cedar', 'Jon Hale', 'jon.hale@example.com', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, campaign_id)
SELECT v.id, v.firm_id, v.contact_id, v.agent_ref, v.sequence_id, v.campaign_id
FROM (VALUES
  ('enr-cedar-1', 'firm-cedar', 'cr-cedar-1', 'tpl.optin_launch.v1', 'tpl.optin_launch.v1', 'camp.optin.window'),
  ('enr-cedar-2', 'firm-cedar', 'cr-cedar-2', 'tpl.optin_launch.v1', 'tpl.optin_launch.v1', 'camp.optin.window')
) AS v(id, firm_id, contact_id, agent_ref, sequence_id, campaign_id)
WHERE EXISTS (SELECT 1 FROM campaign c WHERE c.id = v.campaign_id)
ON CONFLICT (id) DO NOTHING;

INSERT INTO engagement_records (id, firm_id, contact_id, event_kind, payload) VALUES
  ('eng-cedar-1', 'firm-cedar', 'cr-cedar-1', 'sent',   '{"channel":"email"}'::jsonb),
  ('eng-cedar-2', 'firm-cedar', 'cr-cedar-1', 'opened', '{"channel":"email"}'::jsonb),
  ('eng-cedar-3', 'firm-cedar', 'cr-cedar-2', 'sent',   '{"channel":"text"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label)
SELECT 'run-cedar-1', 'wf-optin-launch', 'firm-cedar', 'success', 'event:audit.completed'
WHERE EXISTS (SELECT 1 FROM workflow WHERE id = 'wf-optin-launch')
ON CONFLICT (id) DO NOTHING;
