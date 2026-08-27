-- SYSTEMS-CHANGE-PACKET-020 — a few register_gaps so the Register pane
-- is not empty. Not a thick fake world. Table columns are the packet's.

INSERT INTO register_gaps (id, summary, ticket, firm_id, source, written)
VALUES
  (
    'gap-seq-silence',
    'Sequence silence clock not visible on Fleet health — contacts stall unnoticed.',
    'SUP-184',
    'firm-cedar',
    'Firm health',
    false
  ),
  (
    'gap-bind-gate',
    'Bind pack commit lacks before/after on Audit trail for Send gate reviewers.',
    NULL,
    'firm-cedar',
    'Firm operations bind',
    true
  ),
  (
    'gap-harbor-spf',
    'Harbor sending domain is allocated; SPF still lags the DNS check.',
    NULL,
    'firm-harbor',
    'Sending infrastructure',
    false
  )
ON CONFLICT (id) DO UPDATE SET
  summary = EXCLUDED.summary,
  ticket = EXCLUDED.ticket,
  firm_id = EXCLUDED.firm_id,
  source = EXCLUDED.source,
  written = EXCLUDED.written,
  updated_at = now();
