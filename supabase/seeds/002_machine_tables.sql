-- Seed machine rule/sequence/template rows from System Map corpus (platform defaults).
-- Idempotent upserts by primary key.

INSERT INTO seq_channel_ownership_order (id, firm_id, token, label, ord) VALUES
  ('ch-text', NULL, 'text', 'Text', 0),
  ('ch-email', NULL, 'email', 'Email', 1),
  ('ch-form', NULL, 'form', 'Form', 2)
ON CONFLICT (id) DO UPDATE SET token = EXCLUDED.token, label = EXCLUDED.label, ord = EXCLUDED.ord;

INSERT INTO seq_phase_order (id, firm_id, token, label, ord) VALUES
  ('ph-optin', NULL, 'optin', 'Opt-in', 0),
  ('ph-nudge', NULL, 'reengagement', 'Re-engagement (nudges)', 1),
  ('ph-react', NULL, 'reactivation', 'Reactivation', 2)
ON CONFLICT (id) DO UPDATE SET ord = EXCLUDED.ord;

INSERT INTO seq_eligibility_pipeline (id, firm_id, token, label, ord) VALUES
  ('ep-trig', NULL, 'trigger', 'Trigger (scoped pull)', 0),
  ('ep-const', NULL, 'constants', 'Constants', 1),
  ('ep-cond', NULL, 'conditions', 'Conditions (If)', 2),
  ('ep-rules', NULL, 'rules', 'Rules', 3),
  ('ep-out', NULL, 'output', 'Structured output', 4)
ON CONFLICT (id) DO UPDATE SET ord = EXCLUDED.ord;

INSERT INTO rule_attempt_criteria (id, firm_id, label, enabled, when_clause, condition_clause, set_value, threshold, threshold_unit, ord, source) VALUES
  ('acr-text', NULL, 'Text delivered, not opened → escalate next channel', true, 'channel=text AND delivered', 'not opened within threshold', 'escalate_forward', 30, 'minutes', 0, 'OPERATOR-REVISIONS §5b'),
  ('acr-email', NULL, 'Email opened, link not clicked → next attempt', true, 'channel=email AND opened', 'link not clicked within threshold', 'next_attempt_or_forward', 24, 'hours', 1, 'OPERATOR-REVISIONS §5b'),
  ('acr-form', NULL, 'Form started, not submitted → back to first channel', true, 'channel=form AND started', 'not submitted; re-entries do not reset clock', 'return_to_sequence_head', 24, 'hours', 2, 'OPERATOR-REVISIONS §5b'),
  ('acr-sms-nonreply', NULL, 'SMS-primer non-reply → proceed to email; low tier-signal', true, 'channel=sms AND primer_sent AND non_reply', 'Y-reply is priming not gate', 'tier_signal_low_nonreply', NULL, NULL, 6, 'guidelines/Reactivation.md')
ON CONFLICT (id) DO UPDATE SET threshold = EXCLUDED.threshold, label = EXCLUDED.label;

INSERT INTO rule_motion_precedence (id, firm_id, label, enabled, when_clause, condition_clause, set_value, ord, source) VALUES
  ('mp-1', NULL, 'Reactivation first if anything reactivation-worthy', true, 'outstanding signals', 'any reactivation-worthy', 'reactivation', 0, 'Seed §5.8'),
  ('mp-2', NULL, 'Nudge only when nothing reactivation-worthy', true, 'outstanding signals', 'no reactivation-worthy', 'nudge', 1, 'Seed §5.8'),
  ('mp-3', NULL, 'Nudge consolidates every self-reportable need into one form', true, 'motion=nudge', 'multiple needs', 'one_consolidated_form', 2, 'Seed §5.8'),
  ('mp-4', NULL, 'Reactivation: secondary → agenda on live_brief', true, 'motion=reactivation', 'secondary signals', 'attach_agenda', 3, 'Seed §5.8'),
  ('mp-5', NULL, 'One client, one motion, ever', true, 'motion chosen', 'always', 'single_motion_lock', 4, 'Seed §5.8')
ON CONFLICT (id) DO UPDATE SET enabled = EXCLUDED.enabled, ord = EXCLUDED.ord;

INSERT INTO rule_reachability_checks (id, firm_id, label, enabled, ord, source) VALUES
  ('rc-email', NULL, 'email valid', true, 0, 'Seed §5.2'),
  ('rc-phone', NULL, 'phone valid', true, 1, 'Seed §5.2'),
  ('rc-channel', NULL, '≥1 channel matching intended sequence', true, 2, 'Seed §5.2'),
  ('rc-typo', NULL, 'typo/garbage', true, 3, 'Seed §5.2'),
  ('rc-dedupe', NULL, 'dedupe / already-in-Tower', true, 4, 'Seed §5.2'),
  ('rc-consent', NULL, 'consent/silenced', true, 5, 'Seed §5.2'),
  ('rc-name', NULL, 'name present', true, 6, 'Seed §5.2')
ON CONFLICT (id) DO UPDATE SET enabled = EXCLUDED.enabled;

INSERT INTO rule_eligibility_pathway (id, firm_id, label, enabled, set_value, ord, source) VALUES
  ('epath-any', NULL, 'Pass if any of CEC|FSW|FST|PNP-* asserts', true, 'any_pathway_pass', 0, 'Seed §5.7'),
  ('epath-cec', NULL, 'CEC pathway assert', true, 'pathway_cec', 1, 'Seed §5.7'),
  ('epath-fsw', NULL, 'FSW pathway assert', true, 'pathway_fsw', 2, 'Seed §5.7'),
  ('epath-pnp', NULL, 'PNP-* pathway assert', false, 'pathway_pnp', 3, 'Seed §5.7')
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, enabled = EXCLUDED.enabled;

INSERT INTO rule_field_class_routing (id, firm_id, label, enabled, when_clause, condition_clause, set_value, ord, source) VALUES
  ('fcr-identity', NULL, 'Identity facts → contact_records', true, 'field_class=identity', 'always', 'route_contact_records', 0, 'Seed §5.9'),
  ('fcr-eligibility', NULL, 'Eligibility facts → evaluation inputs', true, 'field_class=eligibility', 'always', 'route_eligibility_inputs', 1, 'Seed §5.9'),
  ('fcr-agenda', NULL, 'Agenda / secondary → live_brief', true, 'field_class=agenda', 'motion chosen', 'route_live_brief', 2, 'Seed §5.9')
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, enabled = EXCLUDED.enabled;

INSERT INTO rule_cohort_scoring (id, firm_id, label, enabled, set_value, ord, source) VALUES
  ('cs-open-click', NULL, 'open+click > open only > no open', true, 'tier_from_open_click', 0, 'guidelines/Reactivation.md'),
  ('cs-top-tier', NULL, 'Y-reply + view-click + nurture-open + booking = top tier', true, 'top_tier', 1, 'guidelines/Reactivation.md')
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label;

INSERT INTO rule_metrics_thresholds (id, firm_id, label, enabled, set_value, threshold, ord, source) VALUES
  ('mt-ann-open', NULL, 'Announcement open <30% → deliverability/relationship flag', true, 'flag_deliverability_or_relationship', 30, 0, 'guidelines/Reactivation.md'),
  ('mt-email-open', NULL, 'Email open <35% → cooled relationship flag', true, 'flag_cooled', 35, 1, 'guidelines/Reactivation.md')
ON CONFLICT (id) DO UPDATE SET threshold = EXCLUDED.threshold;

INSERT INTO sequence_template (id, sequence_class, variant, label, cells, source, silences) VALUES
  ('tpl.optin_launch.v1', 'optin', 'v1', 'Opt-in',
   '[{"id":"ol-d1-sms","token":"day1_text_primer","label":"Day1 text primer","mode":"templated","day":1,"channel":"text"},{"id":"ol-d1-email","token":"day1_announcement_email","label":"Day1 announcement email","mode":"templated","day":1,"channel":"email"},{"id":"ol-d2-social","token":"day2_social_follow","label":"Day2 social follow","mode":"templated","day":2,"channel":"form"},{"id":"ol-d3-waitlist","token":"day3_waitlist","label":"Day3 waitlist","mode":"templated","day":3,"channel":"email"},{"id":"ol-d4-7","token":"days4_7_nurture","label":"Days4–7 nurture","mode":"templated","day":4,"channel":"email"}]'::jsonb,
   'guidelines/Reactivation.md', '[]'::jsonb),
  ('tpl.reactivation.v1', 'reactivation', 'v1', 'Reactivation',
   '[{"id":"rx-d0-sms","token":"day0_text_primer","mode":"templated"},{"id":"rx-d0-email","token":"day0_email","mode":"templated","deferredSlots":["no_login_client_view_link"]},{"id":"rx-d1-3","token":"days1_3_nurture","mode":"templated"},{"id":"rx-d3-slot","token":"day3_slot_opens","mode":"templated"}]'::jsonb,
   'guidelines/Reactivation.md',
   '["Repeat-compression undecided"]'::jsonb),
  ('tpl.reengagement.v1', 'reengagement', 'v1', 'Re-engagement',
   '[{"id":"re-touch-1","token":"nudge_1","mode":"templated"},{"id":"re-touch-2","token":"nudge_2","mode":"templated"}]'::jsonb,
   'Seed §5.3–5.5', '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET cells = EXCLUDED.cells, label = EXCLUDED.label, sequence_class = EXCLUDED.sequence_class;

DELETE FROM firm_sequence_binding
WHERE id IN ('bind.demo-firm.optin_launch', 'bind.demo-firm.launch_day');

INSERT INTO firm_sequence_binding (id, firm_id, sequence_class, template_id, variable_bindings, is_default) VALUES
  ('bind.demo-firm.optin', 'firm-cedar', 'optin', 'tpl.optin_launch.v1', '{"firm_name":"Cedar Immigration"}'::jsonb, true),
  ('bind.demo-firm.reactivation', 'firm-cedar', 'reactivation', 'tpl.reactivation.v1', '{"firm_name":"Cedar Immigration"}'::jsonb, true),
  ('bind.demo-firm.reengagement', 'firm-cedar', 'reengagement', 'tpl.reengagement.v1', '{"firm_name":"Cedar Immigration"}'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET template_id = EXCLUDED.template_id, sequence_class = EXCLUDED.sequence_class, is_default = EXCLUDED.is_default;

-- Teaching campaigns (names are examples; operator can rename). Next = next ord.
INSERT INTO campaign (id, firm_id, sequence_id, name, ord, override_this) VALUES
  ('camp.optin.window', NULL, 'tpl.optin_launch.v1', 'Launch window', 0, false),
  ('camp.optin.day', NULL, 'tpl.optin_launch.v1', 'Launch day', 1, false),
  ('camp.reeng.nudge', NULL, 'tpl.reengagement.v1', 'Nudge', 0, false),
  ('camp.react.meeting', NULL, 'tpl.reactivation.v1', 'Book a meeting', 0, false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, ord = EXCLUDED.ord, sequence_id = EXCLUDED.sequence_id;

INSERT INTO campaign_objective (id, campaign_id, kind, name, completion_table, source) VALUES
  ('obj.optin.window', 'camp.optin.window', 'click', 'Click this link', 'messaging_events', 'template'),
  ('obj.optin.day', 'camp.optin.day', 'form', 'They opt in', 'fact_writebacks', 'template'),
  ('obj.reeng.nudge', 'camp.reeng.nudge', 'form', 'Submit this form', 'fact_writebacks', 'template'),
  ('obj.react.meeting', 'camp.react.meeting', 'meeting', 'Book a meeting', 'meeting_booked', 'template')
ON CONFLICT (id) DO UPDATE SET kind = EXCLUDED.kind, name = EXCLUDED.name, completion_table = EXCLUDED.completion_table;

INSERT INTO campaign_states (firm_id, state) VALUES ('firm-cedar', 'running')
ON CONFLICT (firm_id) DO UPDATE SET state = EXCLUDED.state;

INSERT INTO reference_versions (id, firm_id, key, payload, version) VALUES
  ('ref.crs.cutoff.v1', NULL, 'crs_cutoff', '{"cutoff":480,"program":"CEC"}'::jsonb, 1)
ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload;

-- 012 people on connected tables. Named IDs. firm-cedar TEXT.
INSERT INTO seq_channel_rules (id, firm_id, sequence_id, token, within_seconds) VALUES
  ('scr-global-text',  NULL, NULL, 'text',  1800),
  ('scr-global-email', NULL, NULL, 'email', 86400),
  ('scr-global-call',  NULL, NULL, 'call',  1800)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rule_attempt_criteria
  (id, firm_id, label, enabled, when_clause, condition_clause, set_value, channel_token, ord, source) VALUES
  ('acr-text-not-opened',     NULL, 'not opened',       true,  'channel=text',  'not opened',       'escalate_forward', 'text',  0, 'C6'),
  ('acr-text-not-delivered',  NULL, 'not delivered',    true,  'channel=text',  'not delivered',    'escalate_forward', 'text',  1, 'C6'),
  ('acr-email-not-opened',    NULL, 'not opened',       true,  'channel=email', 'not opened',       'escalate_forward', 'email', 0, 'C6'),
  ('acr-email-link',          NULL, 'link not clicked', true,  'channel=email', 'link not clicked', 'escalate_forward', 'email', 1, 'C6'),
  ('acr-call-not-answered',   NULL, 'not answered',     true,  'channel=call',  'not answered',     'escalate_forward', 'call',  0, 'C6'),
  ('acr-call-not-completed',  NULL, 'not completed',    true,  'channel=call',  'not completed',    'escalate_forward', 'call',  1, 'C6')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ct_firms (id, name, posture, updated_at) VALUES
  ('firm-cedar', 'Cedar Immigration', 'Active', now()),
  ('firm-harbor', 'Harbor RCIC', 'Active', now())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, posture = EXCLUDED.posture, updated_at = now();

INSERT INTO contact_records (id, firm_id, name, email, phone) VALUES
  ('cr-cedar-1', 'firm-cedar', 'Ana Ruiz', 'ana.ruiz@example.com', NULL),
  ('cr-cedar-2', 'firm-cedar', 'Jon Hale', 'jon.hale@example.com', NULL),
  ('cr-cedar-3', 'firm-cedar', 'Priya Shah', 'priya.shah@example.com', NULL),
  ('cr-harbor-1', 'firm-harbor', 'Daniel Okonkwo', 'daniel.okonkwo@example.com', NULL),
  ('cr-harbor-2', 'firm-harbor', 'Amina Cole', 'amina.cole@example.com', NULL),
  ('cr-harbor-3', 'firm-harbor', 'Wei Chen', 'wei.chen@example.com', NULL),
  ('cr-harbor-4', 'firm-harbor', 'Samira Haddad', 'samira.haddad@example.com', NULL)
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
