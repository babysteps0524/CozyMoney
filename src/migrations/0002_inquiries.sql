CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  answer TEXT,
  answered_at INTEGER,
  answered_by TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inquiries_email
  ON inquiries(email);

CREATE INDEX IF NOT EXISTS idx_inquiries_status
  ON inquiries(status);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at
  ON inquiries(created_at);

CREATE INDEX IF NOT EXISTS idx_inquiries_user_id
  ON inquiries(user_id);
