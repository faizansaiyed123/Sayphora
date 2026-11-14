-- Disposable recruiter/demo customer sessions.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS demo_expires_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS users_demo_expiry_idx ON users (demo_expires_at) WHERE is_demo = true;
