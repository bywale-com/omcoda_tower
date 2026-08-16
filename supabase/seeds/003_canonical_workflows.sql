-- Three canonical Automations workflows + constants packs (firm-cedar).
-- Graphs match validated shape: Trigger → (Constants) → (Branch/Rules) → Action → Exit.

INSERT INTO constants_packs (id, firm_id, name, payload, version) VALUES
  ('pack.crs.defaults', 'firm-cedar', 'pack.crs.defaults',
   '{"cutoff":480,"program":"CEC","source":"external_crs"}'::jsonb, 1),
  ('pack.eligibility.scope', 'firm-cedar', 'pack.eligibility.scope',
   '{"pathways":["CEC","FSW","FST","PNP"],"anyPass":true}'::jsonb, 1),
  ('pack.firm.cedar', 'firm-cedar', 'pack.firm.cedar',
   '{"firm_name":"Cedar Immigration","locale":"en-CA"}'::jsonb, 1)
ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, name = EXCLUDED.name;

-- 1) New firm → opt-in launch
INSERT INTO workflow (id, firm_id, name, target, graph) VALUES (
  'wf-optin-launch',
  'firm-cedar',
  'New firm → opt-in launch',
  'audit',
  '{
    "nodes": [
      {"id":"trigger-1","type":"trigger","position":{"x":280,"y":80},"data":{"label":"Onboarding / audit completed","configured":true,"triggerKind":"event","target":"audit","triggerEvent":"audit.completed"}},
      {"id":"rule-1","type":"rule","position":{"x":280,"y":200},"data":{"label":"Scope book (eligibility)","configured":true,"ruleId":"immigration-service-eligibility","ruleSummary":"Pass if any CEC|FSW|FST|PNP pathway asserts"}},
      {"id":"action-1","type":"action","position":{"x":280,"y":320},"data":{"label":"Call opt-in agent","configured":true,"actionType":"enroll_sequence","agentRef":"tpl.optin_launch.v1","actionSummary":"Call agent · tpl.optin_launch.v1"}},
      {"id":"exit-1","type":"exit","position":{"x":280,"y":440},"data":{"label":"Exit","configured":true}}
    ],
    "edges": [
      {"id":"e-trigger-1-rule-1","source":"trigger-1","target":"rule-1","type":"automation"},
      {"id":"e-rule-1-action-1","source":"rule-1","target":"action-1","type":"automation"},
      {"id":"e-action-1-exit-1","source":"action-1","target":"exit-1","type":"automation"}
    ]
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, graph = EXCLUDED.graph, updated_at = now();

INSERT INTO workflow_state (workflow_id, status) VALUES ('wf-optin-launch', 'draft')
ON CONFLICT (workflow_id) DO NOTHING;
INSERT INTO workflow_target (workflow_id, target) VALUES ('wf-optin-launch', 'audit')
ON CONFLICT (workflow_id) DO UPDATE SET target = EXCLUDED.target;

-- 2) Eligibility changed → reactivation
INSERT INTO workflow (id, firm_id, name, target, graph) VALUES (
  'wf-eligibility-reactivation',
  'firm-cedar',
  'Eligibility changed → reactivation',
  'client',
  '{
    "nodes": [
      {"id":"trigger-1","type":"trigger","position":{"x":280,"y":80},"data":{"label":"Eligibility changed","configured":true,"triggerKind":"event","target":"client","triggerEvent":"eligibility.changed"}},
      {"id":"branch-1","type":"branch","position":{"x":280,"y":200},"data":{"label":"Reactivation-worthy?","configured":true,"branchKind":"if","filterSummary":"reactivation-worthy"}},
      {"id":"action-1","type":"action","position":{"x":280,"y":320},"data":{"label":"Call reactivation agent","configured":true,"actionType":"enroll_sequence","agentRef":"tpl.reactivation.v1","actionSummary":"Call agent · tpl.reactivation.v1"}},
      {"id":"exit-1","type":"exit","position":{"x":280,"y":440},"data":{"label":"Exit","configured":true}}
    ],
    "edges": [
      {"id":"e-trigger-1-branch-1","source":"trigger-1","target":"branch-1","type":"automation"},
      {"id":"e-branch-1-action-1","source":"branch-1","target":"action-1","type":"automation"},
      {"id":"e-action-1-exit-1","source":"action-1","target":"exit-1","type":"automation"}
    ]
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, graph = EXCLUDED.graph, updated_at = now();

INSERT INTO workflow_state (workflow_id, status) VALUES ('wf-eligibility-reactivation', 'draft')
ON CONFLICT (workflow_id) DO NOTHING;
INSERT INTO workflow_target (workflow_id, target) VALUES ('wf-eligibility-reactivation', 'client')
ON CONFLICT (workflow_id) DO UPDATE SET target = EXCLUDED.target;

-- 3) External webhook → re-evaluate
INSERT INTO workflow (id, firm_id, name, target, graph) VALUES (
  'wf-webhook-reeval',
  'firm-cedar',
  'External change (webhook) → re-evaluate',
  'client',
  '{
    "nodes": [
      {"id":"trigger-1","type":"trigger","position":{"x":280,"y":80},"data":{"label":"Webhook · external CRS/score","configured":true,"triggerKind":"webhook","target":"client","webhookId":"wh_crs_external_v1"}},
      {"id":"constant-1","type":"constant","position":{"x":280,"y":200},"data":{"label":"CRS defaults","configured":true,"constantKind":"data_reference","constantsPackId":"pack.crs.defaults","constantSummary":"pack.crs.defaults"}},
      {"id":"rule-1","type":"rule","position":{"x":280,"y":320},"data":{"label":"Re-evaluate eligibility","configured":true,"ruleId":"immigration-service-eligibility","ruleSummary":"Re-evaluate eligibility pathways"}},
      {"id":"action-1","type":"action","position":{"x":280,"y":440},"data":{"label":"Call reactivation / nudge agent","configured":true,"actionType":"enroll_sequence","agentRef":"tpl.reactivation.v1","actionSummary":"Call agent · tpl.reactivation.v1"}},
      {"id":"exit-1","type":"exit","position":{"x":280,"y":560},"data":{"label":"Exit","configured":true}}
    ],
    "edges": [
      {"id":"e-trigger-1-constant-1","source":"trigger-1","target":"constant-1","type":"automation"},
      {"id":"e-constant-1-rule-1","source":"constant-1","target":"rule-1","type":"automation"},
      {"id":"e-rule-1-action-1","source":"rule-1","target":"action-1","type":"automation"},
      {"id":"e-action-1-exit-1","source":"action-1","target":"exit-1","type":"automation"}
    ]
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, graph = EXCLUDED.graph, updated_at = now();

INSERT INTO workflow_state (workflow_id, status) VALUES ('wf-webhook-reeval', 'draft')
ON CONFLICT (workflow_id) DO NOTHING;
INSERT INTO workflow_target (workflow_id, target) VALUES ('wf-webhook-reeval', 'client')
ON CONFLICT (workflow_id) DO UPDATE SET target = EXCLUDED.target;

-- Materialize triggers for draft graphs (Activate also re-materializes)
INSERT INTO workflow_trigger (id, workflow_id, firm_id, node_id, type, event_name, condition, schedule, webhook_id, enabled) VALUES
  ('wtrig-wf-optin-launch-trigger-1', 'wf-optin-launch', 'firm-cedar', 'trigger-1', 'event', 'audit.completed', '{}'::jsonb, '{}'::jsonb, NULL, true),
  ('wtrig-wf-eligibility-reactivation-trigger-1', 'wf-eligibility-reactivation', 'firm-cedar', 'trigger-1', 'event', 'eligibility.changed', '{}'::jsonb, '{}'::jsonb, NULL, true),
  ('wtrig-wf-webhook-reeval-trigger-1', 'wf-webhook-reeval', 'firm-cedar', 'trigger-1', 'webhook', NULL, '{}'::jsonb, '{}'::jsonb, 'wh_crs_external_v1', true)
ON CONFLICT (workflow_id, node_id) DO UPDATE SET
  type = EXCLUDED.type,
  event_name = EXCLUDED.event_name,
  webhook_id = EXCLUDED.webhook_id,
  enabled = EXCLUDED.enabled,
  updated_at = now();

INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label) VALUES
  ('run-cedar-1', 'wf-optin-launch', 'firm-cedar', 'success', 'event:audit.completed')
ON CONFLICT (id) DO NOTHING;
