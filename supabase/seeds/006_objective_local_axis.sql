-- Packet 022 seeds. Stamp existing people so the walk is not empty.
-- Cedar outbound = historical launch-window sends (cursor may have moved in 005).
-- One Harbor form satisfied end-to-end. Flag 15:43.

INSERT INTO outbound_messages
  (id, firm_id, contact_id, channel, purpose, to_addr, from_addr, provider_message_id, status,
   subject, body_text, content, enrollment_id, campaign_id, campaign_objective_id, attempt_id)
VALUES
  (
    'out-cedar-1-window',
    'firm-cedar',
    'cr-cedar-1',
    'email',
    'cem',
    'ana.ruiz@example.com',
    'Tower <noreply@cedar.try-tower.com>',
    'esp-cedar-1-window',
    'accepted',
    'Cedar — a next step on your file',
    'Click through when you have a minute.',
    '{"channel":"email","subject":"Cedar — a next step on your file"}'::jsonb,
    'enr-cedar-1',
    'camp.optin.window',
    'obj.optin.window',
    'aa-cedar-1-window'
  ),
  (
    'out-cedar-2-window',
    'firm-cedar',
    'cr-cedar-2',
    'sms',
    'cem',
    '+1-604-555-0202',
    NULL,
    'sms-cedar-2-window',
    'accepted',
    NULL,
    'Cedar: a next step on your file.',
    '{"channel":"sms","bodyText":"Cedar: a next step on your file."}'::jsonb,
    'enr-cedar-2',
    'camp.optin.window',
    'obj.optin.window',
    'aa-cedar-2-window'
  )
ON CONFLICT (id) DO UPDATE
  SET enrollment_id = EXCLUDED.enrollment_id,
      campaign_id = EXCLUDED.campaign_id,
      campaign_objective_id = EXCLUDED.campaign_objective_id,
      attempt_id = EXCLUDED.attempt_id;

UPDATE engagement_records
   SET payload = COALESCE(payload, '{}'::jsonb) || jsonb_build_object(
     'enrollmentId', 'enr-cedar-1',
     'campaignId', 'camp.optin.window',
     'campaignObjectiveId', 'obj.optin.window'
   )
 WHERE id IN ('eng-cedar-1', 'eng-cedar-2');

UPDATE engagement_records
   SET payload = COALESCE(payload, '{}'::jsonb) || jsonb_build_object(
     'enrollmentId', 'enr-cedar-2',
     'campaignId', 'camp.optin.window',
     'campaignObjectiveId', 'obj.optin.window'
   )
 WHERE id = 'eng-cedar-3';

INSERT INTO fact_writebacks
  (id, firm_id, contact_id, field_key, value, form_ref, campaign_objective_id)
VALUES
  (
    'fwb-harbor-1-optin',
    'firm-harbor',
    'cr-harbor-1',
    'opt_in',
    'true'::jsonb,
    'form.enr-harbor-1.obj.optin.day',
    'obj.optin.day'
  )
ON CONFLICT (id) DO UPDATE
  SET form_ref = EXCLUDED.form_ref,
      campaign_objective_id = EXCLUDED.campaign_objective_id,
      value = EXCLUDED.value;

INSERT INTO engagement_records (id, firm_id, contact_id, event_kind, payload) VALUES
  (
    'eng-harbor-1-objective-met',
    'firm-harbor',
    'cr-harbor-1',
    'objective_met',
    '{"enrollmentId":"enr-harbor-1","sequenceId":"tpl.optin_launch.v1","campaignId":"camp.optin.day","campaignObjectiveId":"obj.optin.day","kind":"form","completionTable":"fact_writebacks","completionId":"fwb-harbor-1-optin","nextCampaignId":null}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Last campaign on the opt-in sequence — cursor advances to NULL.
UPDATE enrollment
   SET campaign_id = NULL
 WHERE id = 'enr-harbor-1'
   AND EXISTS (SELECT 1 FROM fact_writebacks WHERE id = 'fwb-harbor-1-optin');
