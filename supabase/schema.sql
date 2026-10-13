-- ── Intervue Supabase Database Schema ──
-- Run this script in your Supabase project:
-- Go to: Supabase Dashboard > SQL Editor > New Query > Paste & Click "Run"

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  image TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  confirmation_code_hash TEXT,
  confirmation_code_expires TIMESTAMPTZ,
  confirmation_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration helpers for existing tables:
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_code_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_code_expires TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_attempts INTEGER DEFAULT 0;


-- Index for fast case-insensitive email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));

-- 2. Interview Practice Sessions Table
CREATE TABLE IF NOT EXISTS interview_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  category TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'typed',
  average_score NUMERIC(4, 1) NOT NULL,
  question_count INTEGER NOT NULL,
  entries JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast history queries and analytics aggregation
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_email ON interview_sessions(LOWER(user_email));
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON interview_sessions(created_at DESC);

-- 3. Pre-seed Default Demo Account (Password: intervue123)
INSERT INTO users (id, name, email, password_hash, image)
VALUES (
  'usr_demo_1',
  'Alex Rivera',
  'demo@intervue.io',
  '$2b$10$OD9.IBLYiBYOE97UdY6CyezUa01h8xdkTg9j9tg6PQGzmTw5Zq7tG',
  '👨‍💻'
)
ON CONFLICT (email) DO NOTHING;
