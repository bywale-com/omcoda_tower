-- 011 — C11 variations. C0/C9/C13/channel-rules map onto 010.
-- Runtime reads campaign_channel_variation; campaign_channel.content stays leftover.
-- Do not persist the dead three radios. Do not mint a second channel-rules table.
-- Flag: 15:43 untouched.

CREATE TABLE IF NOT EXISTS campaign_channel_variation (
  id TEXT PRIMARY KEY,
  campaign_channel_id TEXT NOT NULL REFERENCES campaign_channel(id) ON DELETE CASCADE,
  ord INT NOT NULL DEFAULT 0,
  apply_mode TEXT NOT NULL DEFAULT 'every'
    CHECK (apply_mode IN ('every', 'only_this', 'every_except')),
  attempt_n INT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS campaign_channel_variation_ord_idx
  ON campaign_channel_variation (campaign_channel_id, ord);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'campaign_channel_variation_attempt_n'
  ) THEN
    ALTER TABLE campaign_channel_variation
      ADD CONSTRAINT campaign_channel_variation_attempt_n
      CHECK (apply_mode = 'every' OR attempt_n IS NOT NULL);
  END IF;
END $$;

INSERT INTO campaign_channel_variation (id, campaign_channel_id, ord, apply_mode, content)
SELECT
  'var-' || id,
  id,
  0,
  'every',
  COALESCE(content, '{}'::jsonb)
FROM campaign_channel
WHERE NOT EXISTS (
  SELECT 1 FROM campaign_channel_variation v WHERE v.campaign_channel_id = campaign_channel.id
);

-- Leftover from 010: enrollment.sequence_id NOT NULL once backfill has no nulls.
UPDATE enrollment SET sequence_id = agent_ref
WHERE sequence_id IS NULL AND agent_ref IS NOT NULL
  AND EXISTS (SELECT 1 FROM sequence_template t WHERE t.id = enrollment.agent_ref);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM enrollment WHERE sequence_id IS NULL) THEN
    ALTER TABLE enrollment ALTER COLUMN sequence_id SET NOT NULL;
  END IF;
END $$;
