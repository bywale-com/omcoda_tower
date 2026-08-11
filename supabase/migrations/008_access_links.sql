-- Direct access links (magic links) — hashed one-time tokens into sessions.
-- Product entry: /a/<token> redeems → session cookie → consultant desk.
-- OTP remains available as fallback.

CREATE TABLE IF NOT EXISTS access_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  invalidated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS access_links_lookup_idx
  ON access_links (firm_id, email, created_at DESC);

CREATE INDEX IF NOT EXISTS access_links_token_hash_idx
  ON access_links (token_hash);

-- At most one active (unconsumed, uninvalidated, unexpired-capable) link per user
CREATE UNIQUE INDEX IF NOT EXISTS access_links_one_active_per_user
  ON access_links (user_id)
  WHERE consumed_at IS NULL
    AND invalidated_at IS NULL;
