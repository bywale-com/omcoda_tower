-- 013 — operator book people. Add contact (Agents / Automations) must show contacts.
-- Do not reopen 010–012 DDL. Flag: 15:43 untouched.

INSERT INTO ct_firms (id, name, posture, updated_at) VALUES
  ('firm-cedar', 'Cedar Immigration', 'Active', now()),
  ('firm-harbor', 'Harbor RCIC', 'Active', now())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, posture = EXCLUDED.posture, updated_at = now();

INSERT INTO campaign_states (firm_id, state) VALUES
  ('firm-harbor', 'running')
ON CONFLICT (firm_id) DO NOTHING;

INSERT INTO contact_records (id, firm_id, name, email, phone) VALUES
  ('cr-cedar-3', 'firm-cedar', 'Priya Shah', 'priya.shah@example.com', NULL),
  ('cr-harbor-1', 'firm-harbor', 'Daniel Okonkwo', 'daniel.okonkwo@example.com', NULL),
  ('cr-harbor-2', 'firm-harbor', 'Amina Cole', 'amina.cole@example.com', NULL),
  ('cr-harbor-3', 'firm-harbor', 'Wei Chen', 'wei.chen@example.com', NULL),
  ('cr-harbor-4', 'firm-harbor', 'Samira Haddad', 'samira.haddad@example.com', NULL)
ON CONFLICT (id) DO NOTHING;

-- Header firm dropdown reads auth users + firms (not ct_firms).
INSERT INTO firms (id, name, created_at) VALUES
  ('c1000000-0000-4000-8000-000000000010', 'Harbor RCIC', now()),
  ('c1000000-0000-4000-8000-000000000011', 'Cedar Immigration', now())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO users (id, firm_id, email, created_at) VALUES
  ('b1000000-0000-4000-8000-000000000010', 'c1000000-0000-4000-8000-000000000010', 'consultant@harbor.test', now()),
  ('b1000000-0000-4000-8000-000000000011', 'c1000000-0000-4000-8000-000000000011', 'owner@cedar.test', now())
ON CONFLICT (email) DO UPDATE SET firm_id = EXCLUDED.firm_id;
