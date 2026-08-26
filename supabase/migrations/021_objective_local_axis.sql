-- 021 — Objective met is a Local event (packet 022).
-- Stamp the ask on the completion row; match like triggerLocalAxesMatch.
-- Next free after 020_workspace_opt_out. Packet filename 019 was taken.
-- Do not recut 015 / 018 / 019 / 020. Flag 15:43.
-- Do not mint campaign_objective_met or goal.

ALTER TABLE outbound_messages
  ADD COLUMN IF NOT EXISTS enrollment_id TEXT,
  ADD COLUMN IF NOT EXISTS campaign_id TEXT,
  ADD COLUMN IF NOT EXISTS campaign_objective_id TEXT,
  ADD COLUMN IF NOT EXISTS attempt_id TEXT;

CREATE INDEX IF NOT EXISTS outbound_messages_objective_idx
  ON outbound_messages (campaign_objective_id, contact_id);

ALTER TABLE fact_writebacks
  ADD COLUMN IF NOT EXISTS form_ref TEXT,
  ADD COLUMN IF NOT EXISTS campaign_objective_id TEXT;

CREATE INDEX IF NOT EXISTS fact_writebacks_objective_idx
  ON fact_writebacks (campaign_objective_id, contact_id);

ALTER TABLE meeting_booked
  ADD COLUMN IF NOT EXISTS campaign_objective_id TEXT;

INSERT INTO event_write_set (event_name, version, table_name, ord) VALUES
('objective_met', 1, 'engagement_records', 0),
('objective_met', 1, 'enrollment', 1)
ON CONFLICT (event_name, version, table_name) DO NOTHING;

INSERT INTO event_test_data (id, event_name, version, table_name, ord, body) VALUES
(
  'etd-objective_met-form-engagement',
  'objective_met',
  1,
  'engagement_records',
  0,
  '{"id":"eng-harbor-okonkwo-objective-met-form","firm_id":"firm-standin-harbor","firm":"Harbor RCIC","contact_id":"cr-harbor-okonkwo","contact_name":"Daniel Okonkwo","event_kind":"objective_met","payload":{"enrollmentId":"enr-harbor-okonkwo-optin","sequenceId":"tpl.optin_launch.v1","campaignId":"camp.optin.day","campaignObjectiveId":"obj.optin.day","kind":"form","completionTable":"fact_writebacks","completionId":"fwb-harbor-okonkwo-optin","nextCampaignId":null},"created_at":"2026-08-21T16:20:00.000Z"}'::jsonb
),
(
  'etd-objective_met-form-enrollment',
  'objective_met',
  1,
  'enrollment',
  1,
  '{"id":"enr-harbor-okonkwo-optin","firm_id":"firm-standin-harbor","firm":"Harbor RCIC","contact_id":"cr-harbor-okonkwo","contact_name":"Daniel Okonkwo","agent_ref":"tpl.optin_launch.v1","sequence_id":"tpl.optin_launch.v1","campaign_id":null,"campaign_objective_id":"obj.optin.day","kind":"form","enrolled_at":"2026-08-13T09:00:00.000Z"}'::jsonb
),
(
  'etd-objective_met-meeting-engagement',
  'objective_met',
  1,
  'engagement_records',
  2,
  '{"id":"eng-harbor-cole-objective-met-meeting","firm_id":"firm-standin-harbor","firm":"Harbor RCIC","contact_id":"cr-harbor-cole","contact_name":"Amina Cole","event_kind":"objective_met","payload":{"enrollmentId":"enr-harbor-cole-react","sequenceId":"tpl.reactivation.v1","campaignId":"camp.react.meeting","campaignObjectiveId":"obj.react.meeting","kind":"meeting","completionTable":"meeting_booked","completionId":"mtg-harbor-cole-2026-08-21","nextCampaignId":null},"created_at":"2026-08-15T19:02:10.000Z"}'::jsonb
),
(
  'etd-objective_met-meeting-enrollment',
  'objective_met',
  1,
  'enrollment',
  3,
  '{"id":"enr-harbor-cole-react","firm_id":"firm-standin-harbor","firm":"Harbor RCIC","contact_id":"cr-harbor-cole","contact_name":"Amina Cole","agent_ref":"tpl.reactivation.v1","sequence_id":"tpl.reactivation.v1","campaign_id":null,"campaign_objective_id":"obj.react.meeting","kind":"meeting","enrolled_at":"2026-08-14T11:00:00.000Z"}'::jsonb
),
(
  'etd-objective_met-click-engagement',
  'objective_met',
  1,
  'engagement_records',
  4,
  '{"id":"eng-harbor-chen-objective-met-click","firm_id":"firm-standin-harbor","firm":"Harbor RCIC","contact_id":"cr-harbor-chen","contact_name":"Wei Chen","event_kind":"objective_met","payload":{"enrollmentId":"enr-harbor-chen-optin","sequenceId":"tpl.optin_launch.v1","campaignId":"camp.optin.window","campaignObjectiveId":"obj.optin.window","kind":"click","completionTable":"messaging_events","completionId":"evt-harbor-chen-clicked","nextCampaignId":"camp.optin.day"},"created_at":"2026-08-16T10:04:00.000Z"}'::jsonb
),
(
  'etd-objective_met-click-enrollment',
  'objective_met',
  1,
  'enrollment',
  5,
  '{"id":"enr-harbor-chen-optin","firm_id":"firm-standin-harbor","firm":"Harbor RCIC","contact_id":"cr-harbor-chen","contact_name":"Wei Chen","agent_ref":"tpl.optin_launch.v1","sequence_id":"tpl.optin_launch.v1","campaign_id":"camp.optin.day","campaign_objective_id":"obj.optin.window","kind":"click","enrolled_at":"2026-08-12T14:24:00.000Z"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
