-- Kirkland Agents table for financial/business agents from WA
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

-- Indexes for search and filtering
CREATE INDEX IF NOT EXISTS idx_kirkland_agents_city ON kirkland_agents(city);
CREATE INDEX IF NOT EXISTS idx_kirkland_agents_state ON kirkland_agents(state);
CREATE INDEX IF NOT EXISTS idx_kirkland_agents_rating ON kirkland_agents(avg_rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_kirkland_agents_categories ON kirkland_agents USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_kirkland_agents_name ON kirkland_agents USING gin(to_tsvector('english', name));

-- RLS
ALTER TABLE kirkland_agents ENABLE ROW LEVEL SECURITY;

-- Read access for authenticated users
CREATE POLICY "Authenticated users can read kirkland agents"
  ON kirkland_agents FOR SELECT
  TO authenticated
  USING (true);

-- Anon can also read (public directory)
CREATE POLICY "Anon users can read kirkland agents"
  ON kirkland_agents FOR SELECT
  TO anon
  USING (true);
