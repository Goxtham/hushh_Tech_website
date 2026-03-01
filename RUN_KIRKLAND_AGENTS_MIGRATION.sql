-- Run this in Supabase Dashboard > SQL Editor
-- Creates kirkland_agents table and policies

CREATE TABLE IF NOT EXISTS kirkland_agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  alias TEXT,
  phone TEXT,
  localized_phone TEXT,
  address1 TEXT,
  address2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'US',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  avg_rating DOUBLE PRECISION,
  review_count INTEGER DEFAULT 0,
  categories TEXT[] DEFAULT '{}',
  is_closed BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kirkland_agents_city ON kirkland_agents(city);
CREATE INDEX IF NOT EXISTS idx_kirkland_agents_state ON kirkland_agents(state);
CREATE INDEX IF NOT EXISTS idx_kirkland_agents_rating ON kirkland_agents(avg_rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_kirkland_agents_categories ON kirkland_agents USING GIN(categories);

ALTER TABLE kirkland_agents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can read kirkland agents') THEN
    CREATE POLICY "Authenticated users can read kirkland agents"
      ON kirkland_agents FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anon users can read kirkland agents') THEN
    CREATE POLICY "Anon users can read kirkland agents"
      ON kirkland_agents FOR SELECT TO anon USING (true);
  END IF;
END $$;
