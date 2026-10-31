-- PKT-005. One stored row is one contact in one audit run.
-- The migrator runs this file as one query. No COMMIT.

ALTER TABLE reachability_verdicts ADD COLUMN audit_run_id TEXT;
ALTER TABLE sequence_ready ADD COLUMN audit_run_id TEXT;

UPDATE reachability_verdicts rv
SET audit_run_id = rv.details->>'auditRunId'
FROM audit_runs ar
WHERE ar.id = rv.details->>'auditRunId'
  AND ar.firm_id = rv.firm_id
  AND rv.audit_run_id IS NULL;

UPDATE sequence_ready sr
SET audit_run_id = rv.audit_run_id
FROM reachability_verdicts rv
WHERE rv.contact_id = sr.contact_id
  AND rv.firm_id = sr.firm_id
  AND rv.audit_run_id IS NOT NULL
  AND sr.audit_run_id IS NULL;

INSERT INTO audit_runs (id, firm_id, status, import_ids, summary, started_at)
SELECT kept.id, kept.firm_id, 'complete', '[]'::jsonb, '{}'::jsonb, kept.started_at
FROM (
  SELECT 'arun-kept-' || md5(firm_id) AS id,
         firm_id,
         COALESCE(MAX(updated_at), now()) AS started_at
  FROM (
    SELECT firm_id, updated_at FROM reachability_verdicts WHERE audit_run_id IS NULL
    UNION ALL
    SELECT firm_id, updated_at FROM sequence_ready WHERE audit_run_id IS NULL
  ) pending
  GROUP BY firm_id
) kept
WHERE NOT EXISTS (SELECT 1 FROM audit_runs ar WHERE ar.id = kept.id);

UPDATE reachability_verdicts
SET audit_run_id = 'arun-kept-' || md5(firm_id)
WHERE audit_run_id IS NULL;

UPDATE sequence_ready
SET audit_run_id = 'arun-kept-' || md5(firm_id)
WHERE audit_run_id IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM reachability_verdicts WHERE audit_run_id IS NULL)
     OR EXISTS (SELECT 1 FROM sequence_ready WHERE audit_run_id IS NULL) THEN
    RAISE EXCEPTION 'audit_run_id still null';
  END IF;
END $$;

ALTER TABLE reachability_verdicts ALTER COLUMN audit_run_id SET NOT NULL;
ALTER TABLE sequence_ready ALTER COLUMN audit_run_id SET NOT NULL;

ALTER TABLE reachability_verdicts DROP CONSTRAINT reachability_verdicts_pkey;
ALTER TABLE sequence_ready DROP CONSTRAINT sequence_ready_pkey;

ALTER TABLE reachability_verdicts ADD PRIMARY KEY (audit_run_id, contact_id);
ALTER TABLE sequence_ready ADD PRIMARY KEY (audit_run_id, contact_id);

ALTER TABLE reachability_verdicts
  ADD CONSTRAINT reachability_verdicts_audit_run_id_fkey
  FOREIGN KEY (audit_run_id) REFERENCES audit_runs(id) ON DELETE RESTRICT;

ALTER TABLE sequence_ready
  ADD CONSTRAINT sequence_ready_audit_run_id_fkey
  FOREIGN KEY (audit_run_id) REFERENCES audit_runs(id) ON DELETE RESTRICT;

CREATE INDEX reachability_verdicts_latest_idx
  ON reachability_verdicts (firm_id, contact_id, updated_at DESC);
CREATE INDEX sequence_ready_latest_idx
  ON sequence_ready (firm_id, contact_id, updated_at DESC);
