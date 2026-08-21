CREATE TABLE IF NOT EXISTS oauth_tokens (
  account_email TEXT PRIMARY KEY,
  owner_email TEXT NOT NULL,
  encrypted_tokens TEXT NOT NULL,
  connected_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS oauth_states (
  state TEXT PRIMARY KEY,
  owner_email TEXT NOT NULL,
  account_email TEXT NOT NULL,
  expires_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS application_items (
  id TEXT PRIMARY KEY,
  account_email TEXT NOT NULL,
  source_message_id TEXT NOT NULL,
  source_rfc822_id TEXT,
  thread_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  reply_to TEXT NOT NULL,
  subject TEXT NOT NULL,
  received_at TEXT NOT NULL,
  analysis_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('discovered', 'analyzed', 'resume-ready', 'draft-ready', 'drafted', 'sent', 'logged', 'complete', 'quarantined', 'needs-review')),
  priority INTEGER NOT NULL DEFAULT 50,
  artifact_key TEXT,
  draft_id TEXT,
  reply_message_id TEXT,
  sent_at TEXT,
  sheet_logged_at TEXT,
  archived_at TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TEXT,
  lease_owner TEXT,
  lease_expires_at TEXT,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS manual_review_items (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL UNIQUE,
  reason_codes_json TEXT NOT NULL DEFAULT '[]',
  gmail_label_name TEXT NOT NULL,
  label_applied_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  resolved_at TEXT,
  FOREIGN KEY (item_id) REFERENCES application_items(id)
) STRICT;

CREATE TABLE IF NOT EXISTS assistant_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS audit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_email TEXT NOT NULL,
  item_id TEXT,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL
) STRICT;

CREATE INDEX IF NOT EXISTS idx_application_items_received_at ON application_items(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_application_items_work_queue ON application_items(status, next_attempt_at, priority DESC, received_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_application_items_account_message ON application_items(account_email, source_message_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_manual_review_items_updated_at ON manual_review_items(updated_at DESC);
