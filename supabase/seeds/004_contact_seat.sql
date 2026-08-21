-- Contact seat seed. Reasonable Files rows. One token so /c/… lands.
-- Do not paint these into the SPA. Flag 15:43.

INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, campaign_id)
SELECT v.id, v.firm_id, v.contact_id, v.agent_ref, v.sequence_id, v.campaign_id
FROM (VALUES
  ('enr-harbor-1', 'firm-harbor', 'cr-harbor-1', 'tpl.optin_launch.v1', 'tpl.optin_launch.v1', 'camp.optin.day'),
  ('enr-harbor-2', 'firm-harbor', 'cr-harbor-2', 'tpl.optin_launch.v1', 'tpl.optin_launch.v1', 'camp.optin.day')
) AS v(id, firm_id, contact_id, agent_ref, sequence_id, campaign_id)
WHERE EXISTS (SELECT 1 FROM contact_records c WHERE c.id = v.contact_id)
  AND EXISTS (SELECT 1 FROM campaign camp WHERE camp.id = v.campaign_id)
ON CONFLICT (id) DO NOTHING;

INSERT INTO missing_fact_signals (id, firm_id, contact_id, field_key) VALUES
  ('mfs-harbor-1-hours', 'firm-harbor', 'cr-harbor-1', 'canadian_skilled_hours'),
  ('mfs-harbor-1-clb', 'firm-harbor', 'cr-harbor-1', 'language_clb'),
  ('mfs-harbor-1-years', 'firm-harbor', 'cr-harbor-1', 'foreign_work_years'),
  ('mfs-harbor-1-ee', 'firm-harbor', 'cr-harbor-1', 'ee_profile_last_updated'),
  ('mfs-harbor-2-hours', 'firm-harbor', 'cr-harbor-2', 'canadian_skilled_hours')
ON CONFLICT (id) DO NOTHING;

-- Known raw tokens for local smoke: /c/c-harbor-okonkwo and /c/c-harbor-cole
INSERT INTO contact_access_links
  (id, firm_id, contact_id, token_hash, enrollment_id, campaign_id)
VALUES
  (
    'cal-harbor-1',
    'firm-harbor',
    'cr-harbor-1',
    '573bf96db8bb9636fe617332770e902a8962eccd3d2bd170abd9d62feee7aee1',
    'enr-harbor-1',
    'camp.optin.day'
  ),
  (
    'cal-harbor-2',
    'firm-harbor',
    'cr-harbor-2',
    '87407f3f649a52f6681541db8281c906bf70d24368daa968bc1efc0062f2566e',
    'enr-harbor-2',
    'camp.optin.day'
  )
ON CONFLICT (id) DO NOTHING;

-- Okonkwo has Agreed. Cole has not — 026 still lists Cole until workspace opt-out.
INSERT INTO consent_records (contact_id, firm_id, basis, silenced, source, updated_at)
VALUES ('cr-harbor-1', 'firm-harbor', 'express', false, 'contact_workspace', now())
ON CONFLICT (contact_id, firm_id) DO NOTHING;

INSERT INTO contact_uploads
  (id, firm_id, contact_id, kind, origin, field_key, body_text, file_name, file_ref, created_at)
VALUES
  ('cup-harbor-1-hours', 'firm-harbor', 'cr-harbor-1', 'skilled hours note', 'custom', NULL, '1680 hours on the current permit.', NULL, NULL, '2026-08-20T15:10:00.000Z'),
  ('cup-harbor-1-letter', 'firm-harbor', 'cr-harbor-1', 'employer letter', 'kind', NULL, NULL, 'employer-letter.pdf', 'standin:cup-harbor-1-letter', '2026-08-18T11:02:00.000Z'),
  ('cup-harbor-2-clb', 'firm-harbor', 'cr-harbor-2', 'language_clb', 'question', 'language_clb', 'CLB 9 from the last IELTS.', NULL, NULL, '2026-08-19T09:40:00.000Z'),
  ('cup-harbor-3-any', 'firm-harbor', 'cr-harbor-3', NULL, 'any', NULL, 'Unspecified extra note.', 'note.txt', 'standin:cup-harbor-3-any', '2026-08-17T16:22:00.000Z'),
  ('cup-harbor-4-pay', 'firm-harbor', 'cr-harbor-4', 'pay stub', 'kind', NULL, NULL, 'july-pay.pdf', 'standin:cup-harbor-4-pay', '2026-08-16T08:11:00.000Z')
ON CONFLICT (id) DO NOTHING;
