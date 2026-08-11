-- Persist send content for Client Data Activity replay (email/SMS look-inside).
-- Envelope-only outbound_messages cannot power Hub-style channel replay.

ALTER TABLE outbound_messages
  ADD COLUMN IF NOT EXISTS subject TEXT;

ALTER TABLE outbound_messages
  ADD COLUMN IF NOT EXISTS body_text TEXT;

ALTER TABLE outbound_messages
  ADD COLUMN IF NOT EXISTS body_html TEXT;

ALTER TABLE outbound_messages
  ADD COLUMN IF NOT EXISTS content JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN outbound_messages.content IS
  'Channel payload snapshot: { subject?, bodyText?, bodyHtml?, channel } for Activity replay';
