-- Packet 023 seed. One Harbor exhausted pursuit; cursor stays on the campaign.
-- Failure stops spending; 022 stamps stay so a later completion is still a win.

INSERT INTO campaign_failure (id, firm_id, contact_id, campaign_id, sequence_id, payload)
VALUES
  (
    'cfail-harbor-4-exhausted',
    'firm-harbor',
    'cr-harbor-4',
    'camp.optin.day',
    'tpl.optin_launch.v1',
    '{"attemptId":"aa-harbor-4-exhausted","criteriaId":"acr-email-link","setValue":"fail"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO active_attempts
  (id, firm_id, contact_id, enrollment_id, owner_channel, status, state, window_started_at, fired_criteria)
VALUES
  (
    'aa-harbor-4-exhausted',
    'firm-harbor',
    'cr-harbor-4',
    'enr-harbor-4',
    'email',
    'exhausted',
    jsonb_build_object(
      'exhausted_at', '2026-08-21T18:40:00.000Z',
      'campaign_failure_id', 'cfail-harbor-4-exhausted',
      'attempt_n', 3
    ),
    '2026-08-20T12:00:00.000Z',
    '{}'::jsonb
  )
ON CONFLICT (id) DO UPDATE
  SET status = 'exhausted',
      state = EXCLUDED.state,
      enrollment_id = EXCLUDED.enrollment_id;

UPDATE enrollment
   SET pursuit_state = 'exhausted',
       exhausted_at = '2026-08-21T18:40:00.000Z'
 WHERE id = 'enr-harbor-4'
   AND campaign_id IS NOT NULL;
