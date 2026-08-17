-- 015 — house workflow + notes. Handle itself is walker code (previous writes).
-- Flag: 15:43 untouched.

ALTER TABLE workflow ALTER COLUMN firm_id DROP NOT NULL;
ALTER TABLE workflow_trigger ALTER COLUMN firm_id DROP NOT NULL;

ALTER TABLE contact_records
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- House graph: contact file → Audit → If failed → tag. Draft until Activate.
INSERT INTO workflow (id, firm_id, name, target, graph, updated_at)
VALUES (
  'wf-house-contact-import',
  NULL,
  'Contact file → audit → tag',
  'contact',
  '{
    "nodes": [
      {"id":"trigger-1","type":"trigger","position":{"x":120,"y":0},"data":{"label":"Contact import","configured":true,"triggerKind":"event","triggerEvent":"contact_import","grain":"global"}},
      {"id":"action-audit","type":"action","position":{"x":120,"y":148},"data":{"label":"Audit the contacts","configured":true,"actionType":"run_audit","pickTable":"import_batch"}},
      {"id":"if-failed","type":"branch","position":{"x":120,"y":296},"data":{"label":"If this contact failed","configured":true,"branchKind":"if","pickTable":"sequence_ready","pickField":"ready","pickOp":"eq","pickValue":"false"}},
      {"id":"action-invalid","type":"action","position":{"x":0,"y":444},"data":{"label":"Tag invalid","configured":true,"actionType":"ascribe_tag","tag":"invalid","notesFromVerdict":true}},
      {"id":"action-valid","type":"action","position":{"x":240,"y":444},"data":{"label":"Tag valid","configured":true,"actionType":"ascribe_tag","tag":"valid"}}
    ],
    "edges": [
      {"id":"e-t-a","source":"trigger-1","target":"action-audit"},
      {"id":"e-a-if","source":"action-audit","target":"if-failed"},
      {"id":"e-if-inv","source":"if-failed","target":"action-invalid","sourceHandle":"true"},
      {"id":"e-if-val","source":"if-failed","target":"action-valid","sourceHandle":"false"}
    ]
  }'::jsonb,
  now()
)
ON CONFLICT (id) DO UPDATE SET graph = EXCLUDED.graph, firm_id = NULL, name = EXCLUDED.name, updated_at = now();

INSERT INTO workflow_state (workflow_id, status)
VALUES ('wf-house-contact-import', 'draft')
ON CONFLICT (workflow_id) DO NOTHING;
