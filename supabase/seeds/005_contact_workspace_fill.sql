-- Follow-on fill for the contact workspace (024–026).
-- 004 already landed thin on some environments; this seed still applies.
-- Do not paint these into the SPA. Flag 15:43.

INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, campaign_id)
SELECT v.id, v.firm_id, v.contact_id, v.agent_ref, v.sequence_id, v.campaign_id
FROM (VALUES
  ('enr-harbor-1', 'firm-harbor', 'cr-harbor-1', 'tpl.optin_launch.v1', 'tpl.optin_launch.v1', 'camp.optin.day'),
  ('enr-harbor-2', 'firm-harbor', 'cr-harbor-2', 'tpl.optin_launch.v1', 'tpl.optin_launch.v1', 'camp.optin.day'),
  ('enr-harbor-3', 'firm-harbor', 'cr-harbor-3', 'tpl.reactivation.v1', 'tpl.reactivation.v1', 'camp.react.meeting'),
  ('enr-harbor-4', 'firm-harbor', 'cr-harbor-4', 'tpl.optin_launch.v1', 'tpl.optin_launch.v1', 'camp.optin.day'),
  ('enr-cedar-1', 'firm-cedar', 'cr-cedar-1', 'tpl.optin_launch.v1', 'tpl.optin_launch.v1', 'camp.optin.day'),
  ('enr-cedar-2', 'firm-cedar', 'cr-cedar-2', 'tpl.reactivation.v1', 'tpl.reactivation.v1', 'camp.react.meeting'),
  ('enr-cedar-3', 'firm-cedar', 'cr-cedar-3', 'tpl.optin_launch.v1', 'tpl.optin_launch.v1', 'camp.optin.day')
) AS v(id, firm_id, contact_id, agent_ref, sequence_id, campaign_id)
WHERE EXISTS (SELECT 1 FROM contact_records c WHERE c.id = v.contact_id)
  AND EXISTS (SELECT 1 FROM campaign camp WHERE camp.id = v.campaign_id)
ON CONFLICT (id) DO UPDATE
  SET agent_ref = EXCLUDED.agent_ref,
      sequence_id = EXCLUDED.sequence_id,
      campaign_id = EXCLUDED.campaign_id;

INSERT INTO missing_fact_signals (id, firm_id, contact_id, field_key) VALUES
  ('mfs-harbor-1-hours', 'firm-harbor', 'cr-harbor-1', 'canadian_skilled_hours'),
  ('mfs-harbor-1-clb', 'firm-harbor', 'cr-harbor-1', 'language_clb'),
  ('mfs-harbor-1-years', 'firm-harbor', 'cr-harbor-1', 'foreign_work_years'),
  ('mfs-harbor-1-ee', 'firm-harbor', 'cr-harbor-1', 'ee_profile_last_updated'),
  ('mfs-harbor-1-crs', 'firm-harbor', 'cr-harbor-1', 'crs_score'),
  ('mfs-harbor-1-noc', 'firm-harbor', 'cr-harbor-1', 'noc'),
  ('mfs-harbor-2-hours', 'firm-harbor', 'cr-harbor-2', 'canadian_skilled_hours'),
  ('mfs-harbor-2-clb', 'firm-harbor', 'cr-harbor-2', 'language_clb'),
  ('mfs-harbor-2-ee', 'firm-harbor', 'cr-harbor-2', 'ee_profile_exists'),
  ('mfs-harbor-4-hours', 'firm-harbor', 'cr-harbor-4', 'canadian_skilled_hours'),
  ('mfs-harbor-4-clb', 'firm-harbor', 'cr-harbor-4', 'language_clb'),
  ('mfs-harbor-4-years', 'firm-harbor', 'cr-harbor-4', 'foreign_work_years'),
  ('mfs-cedar-1-hours', 'firm-cedar', 'cr-cedar-1', 'canadian_skilled_hours'),
  ('mfs-cedar-1-clb', 'firm-cedar', 'cr-cedar-1', 'language_clb'),
  ('mfs-cedar-1-crs', 'firm-cedar', 'cr-cedar-1', 'crs_score'),
  ('mfs-cedar-1-noc', 'firm-cedar', 'cr-cedar-1', 'noc'),
  ('mfs-cedar-3-hours', 'firm-cedar', 'cr-cedar-3', 'canadian_skilled_hours'),
  ('mfs-cedar-3-clb', 'firm-cedar', 'cr-cedar-3', 'language_clb'),
  ('mfs-cedar-3-ee', 'firm-cedar', 'cr-cedar-3', 'ee_profile_last_updated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO fact_writebacks (id, firm_id, contact_id, field_key, value) VALUES
  ('fwb-harbor-1-clb', 'firm-harbor', 'cr-harbor-1', 'language_clb', '9'::jsonb),
  ('fwb-harbor-1-years', 'firm-harbor', 'cr-harbor-1', 'foreign_work_years', '6'::jsonb),
  ('fwb-cedar-1-clb', 'firm-cedar', 'cr-cedar-1', 'language_clb', '8'::jsonb),
  ('fwb-cedar-2-noc', 'firm-cedar', 'cr-cedar-2', 'noc', '"21231"'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO contact_access_links
  (id, firm_id, contact_id, token_hash, enrollment_id, campaign_id)
VALUES
  ('cal-harbor-1', 'firm-harbor', 'cr-harbor-1', '573bf96db8bb9636fe617332770e902a8962eccd3d2bd170abd9d62feee7aee1', 'enr-harbor-1', 'camp.optin.day'),
  ('cal-harbor-2', 'firm-harbor', 'cr-harbor-2', '87407f3f649a52f6681541db8281c906bf70d24368daa968bc1efc0062f2566e', 'enr-harbor-2', 'camp.optin.day'),
  ('cal-harbor-3', 'firm-harbor', 'cr-harbor-3', '1b4623509438c180bda76ef80bfc5bb49a683375e776d7376d197d1b89bd495a', 'enr-harbor-3', 'camp.react.meeting'),
  ('cal-harbor-4', 'firm-harbor', 'cr-harbor-4', 'e4d035932c93c3bd1ca51629703009aa8c8dcca9aff69983e9e1adb8fa849917', 'enr-harbor-4', 'camp.optin.day'),
  ('cal-cedar-1', 'firm-cedar', 'cr-cedar-1', 'f65fc28050e6dcf71d56daf202db28f607875adc1a8309d942395ba81cc30ee0', 'enr-cedar-1', 'camp.optin.day'),
  ('cal-cedar-2', 'firm-cedar', 'cr-cedar-2', 'eb199d9a6b9ef22383b985fa62ca176dad4d1f7ac15ab0dad509c940fc9b22ea', 'enr-cedar-2', 'camp.react.meeting'),
  ('cal-cedar-3', 'firm-cedar', 'cr-cedar-3', '4d709d665455e0de4096b4c6b1bcb3c8eb365bde5f25e90c13e6f890a0563e9e', 'enr-cedar-3', 'camp.optin.day')
ON CONFLICT (id) DO UPDATE
  SET enrollment_id = EXCLUDED.enrollment_id,
      campaign_id = EXCLUDED.campaign_id;

INSERT INTO consent_records (contact_id, firm_id, basis, silenced, source, updated_at) VALUES
  ('cr-harbor-1', 'firm-harbor', 'express', false, 'contact_workspace', now()),
  ('cr-harbor-3', 'firm-harbor', 'express', false, 'contact_workspace', now()),
  ('cr-harbor-4', 'firm-harbor', 'none', false, 'ignored', now()),
  ('cr-cedar-1', 'firm-cedar', 'express', false, 'contact_workspace', now()),
  ('cr-cedar-2', 'firm-cedar', 'express', false, 'contact_workspace', now())
ON CONFLICT (contact_id, firm_id) DO NOTHING;

INSERT INTO contact_uploads
  (id, firm_id, contact_id, kind, origin, field_key, body_text, file_name, file_ref, created_at)
VALUES
  ('cup-harbor-1-hours', 'firm-harbor', 'cr-harbor-1', 'skilled hours note', 'custom', NULL, '1680 hours on the current permit.', NULL, NULL, '2026-08-20T15:10:00.000Z'),
  ('cup-harbor-1-letter', 'firm-harbor', 'cr-harbor-1', 'employer letter', 'kind', NULL, NULL, 'employer-letter.pdf', 'standin:cup-harbor-1-letter', '2026-08-18T11:02:00.000Z'),
  ('cup-harbor-1-pay', 'firm-harbor', 'cr-harbor-1', 'pay stub', 'kind', NULL, NULL, 'june-pay.pdf', 'standin:cup-harbor-1-pay', '2026-08-14T09:18:00.000Z'),
  ('cup-harbor-1-passport', 'firm-harbor', 'cr-harbor-1', 'passport', 'kind', NULL, NULL, 'passport-bio.pdf', 'standin:cup-harbor-1-passport', '2026-08-12T16:40:00.000Z'),
  ('cup-harbor-1-clb-q', 'firm-harbor', 'cr-harbor-1', 'language_clb', 'question', 'language_clb', 'CLB 9 from the last IELTS.', NULL, NULL, '2026-08-11T13:05:00.000Z'),
  ('cup-harbor-2-clb', 'firm-harbor', 'cr-harbor-2', 'language_clb', 'question', 'language_clb', 'CLB 9 from the last IELTS.', NULL, NULL, '2026-08-19T09:40:00.000Z'),
  ('cup-harbor-2-any', 'firm-harbor', 'cr-harbor-2', NULL, 'any', NULL, 'Extra note from the last consult.', 'cole-note.txt', 'standin:cup-harbor-2-any', '2026-08-18T10:12:00.000Z'),
  ('cup-harbor-2-letter', 'firm-harbor', 'cr-harbor-2', 'employer letter', 'kind', NULL, NULL, 'cole-employer.pdf', 'standin:cup-harbor-2-letter', '2026-08-16T15:33:00.000Z'),
  ('cup-harbor-2-hours', 'firm-harbor', 'cr-harbor-2', 'skilled hours note', 'custom', NULL, '920 hours so far this year.', NULL, NULL, '2026-08-15T11:08:00.000Z'),
  ('cup-harbor-3-any', 'firm-harbor', 'cr-harbor-3', NULL, 'any', NULL, 'Unspecified extra note.', 'note.txt', 'standin:cup-harbor-3-any', '2026-08-17T16:22:00.000Z'),
  ('cup-harbor-3-pay', 'firm-harbor', 'cr-harbor-3', 'pay stub', 'kind', NULL, NULL, 'wei-july-pay.pdf', 'standin:cup-harbor-3-pay', '2026-08-15T08:44:00.000Z'),
  ('cup-harbor-3-eca', 'firm-harbor', 'cr-harbor-3', 'ECA', 'kind', NULL, NULL, 'wei-eca.pdf', 'standin:cup-harbor-3-eca', '2026-08-10T19:01:00.000Z'),
  ('cup-harbor-3-offer', 'firm-harbor', 'cr-harbor-3', 'job offer', 'custom', NULL, 'Offer letter is with the employer still.', NULL, NULL, '2026-08-09T12:20:00.000Z'),
  ('cup-harbor-4-pay', 'firm-harbor', 'cr-harbor-4', 'pay stub', 'kind', NULL, NULL, 'july-pay.pdf', 'standin:cup-harbor-4-pay', '2026-08-16T08:11:00.000Z'),
  ('cup-harbor-4-passport', 'firm-harbor', 'cr-harbor-4', 'passport', 'kind', NULL, NULL, 'haddad-passport.pdf', 'standin:cup-harbor-4-passport', '2026-08-13T17:55:00.000Z'),
  ('cup-harbor-4-any', 'firm-harbor', 'cr-harbor-4', NULL, 'any', NULL, 'Called in; asked to hold the file.', NULL, NULL, '2026-08-12T14:02:00.000Z'),
  ('cup-harbor-4-clb', 'firm-harbor', 'cr-harbor-4', 'language_clb', 'question', 'language_clb', 'Retaking IELTS in September.', NULL, NULL, '2026-08-08T10:30:00.000Z'),
  ('cup-cedar-1-letter', 'firm-cedar', 'cr-cedar-1', 'employer letter', 'kind', NULL, NULL, 'ana-employer.pdf', 'standin:cup-cedar-1-letter', '2026-08-19T14:10:00.000Z'),
  ('cup-cedar-1-pay', 'firm-cedar', 'cr-cedar-1', 'pay stub', 'kind', NULL, NULL, 'ana-june-pay.pdf', 'standin:cup-cedar-1-pay', '2026-08-17T09:00:00.000Z'),
  ('cup-cedar-1-hours', 'firm-cedar', 'cr-cedar-1', 'skilled hours note', 'custom', NULL, '1440 hours on the open work permit.', NULL, NULL, '2026-08-16T11:45:00.000Z'),
  ('cup-cedar-1-clb', 'firm-cedar', 'cr-cedar-1', 'language_clb', 'question', 'language_clb', 'CLB 8.', NULL, NULL, '2026-08-14T18:22:00.000Z'),
  ('cup-cedar-2-any', 'firm-cedar', 'cr-cedar-2', NULL, 'any', NULL, 'Prefers a late-afternoon slot.', 'jon-note.txt', 'standin:cup-cedar-2-any', '2026-08-18T13:40:00.000Z'),
  ('cup-cedar-2-passport', 'firm-cedar', 'cr-cedar-2', 'passport', 'kind', NULL, NULL, 'jon-passport.pdf', 'standin:cup-cedar-2-passport', '2026-08-15T07:19:00.000Z'),
  ('cup-cedar-2-letter', 'firm-cedar', 'cr-cedar-2', 'employer letter', 'kind', NULL, NULL, 'jon-employer.pdf', 'standin:cup-cedar-2-letter', '2026-08-13T16:05:00.000Z'),
  ('cup-cedar-2-noc', 'firm-cedar', 'cr-cedar-2', 'noc', 'question', 'noc', 'NOC 21231 on the last NOA.', NULL, NULL, '2026-08-11T12:12:00.000Z'),
  ('cup-cedar-3-pay', 'firm-cedar', 'cr-cedar-3', 'pay stub', 'kind', NULL, NULL, 'priya-july-pay.pdf', 'standin:cup-cedar-3-pay', '2026-08-19T08:50:00.000Z'),
  ('cup-cedar-3-eca', 'firm-cedar', 'cr-cedar-3', 'ECA', 'kind', NULL, NULL, 'priya-eca.pdf', 'standin:cup-cedar-3-eca', '2026-08-17T15:27:00.000Z'),
  ('cup-cedar-3-any', 'firm-cedar', 'cr-cedar-3', NULL, 'any', NULL, 'Has not Agreed yet; sent the docs ahead.', NULL, NULL, '2026-08-16T09:33:00.000Z'),
  ('cup-cedar-3-hours', 'firm-cedar', 'cr-cedar-3', 'skilled hours note', 'custom', NULL, '1100 hours; still accumulating.', NULL, NULL, '2026-08-12T20:14:00.000Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO event_test_data (id, event_name, version, table_name, ord, body) VALUES
  (
    'etd-contact_uploaded-cole-letter',
    'contact_uploaded', 1, 'contact_uploads', 0,
    '{"id":"cup-harbor-2-letter","firm_id":"firm-harbor","firm":"Harbor RCIC","contact_id":"cr-harbor-2","contact_name":"Amina Cole","kind":"employer letter","origin":"kind","field_key":null,"body_text":null,"file_name":"cole-employer.pdf","file_ref":"standin:cup-harbor-2-letter","created_at":"2026-08-16T15:33:00.000Z"}'::jsonb
  ),
  (
    'etd-contact_uploaded-ana-hours',
    'contact_uploaded', 1, 'contact_uploads', 0,
    '{"id":"cup-cedar-1-hours","firm_id":"firm-cedar","firm":"Cedar Immigration","contact_id":"cr-cedar-1","contact_name":"Ana Ruiz","kind":"skilled hours note","origin":"custom","field_key":null,"body_text":"1440 hours on the open work permit.","file_name":null,"file_ref":null,"created_at":"2026-08-16T11:45:00.000Z"}'::jsonb
  ),
  (
    'etd-contact_uploaded-jon-passport',
    'contact_uploaded', 1, 'contact_uploads', 0,
    '{"id":"cup-cedar-2-passport","firm_id":"firm-cedar","firm":"Cedar Immigration","contact_id":"cr-cedar-2","contact_name":"Jon Hale","kind":"passport","origin":"kind","field_key":null,"body_text":null,"file_name":"jon-passport.pdf","file_ref":"standin:cup-cedar-2-passport","created_at":"2026-08-15T07:19:00.000Z"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;
