-- ============================================================
-- HUSHH AGENTS - Run this in Supabase Dashboard SQL Editor
-- ============================================================
-- Go to: https://supabase.com/dashboard/project/ibsisfnjxeowvdtvgzff/sql
-- Paste this entire file and click "Run"
-- ============================================================

-- Agents table - stores available AI agents
CREATE TABLE IF NOT EXISTS hushh_agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  system_prompt TEXT,
  model_config JSONB DEFAULT '{}',
  category TEXT CHECK (category IN ('general', 'specialist', 'creative')) DEFAULT 'general',
  is_pro BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations table - stores chat sessions
CREATE TABLE IF NOT EXISTS hushh_agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  title TEXT,
  language_code TEXT DEFAULT 'en-US',
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Messages table - stores individual chat messages
CREATE TABLE IF NOT EXISTS hushh_agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES hushh_agent_conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  audio_url TEXT,
  language_code TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS hushh_agent_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier TEXT CHECK (tier IN ('limited', 'pro')) DEFAULT 'limited',
  daily_message_count INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS hushh_agent_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  is_voice BOOLEAN DEFAULT false,
  language_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hushh_agent_conversations_user_id ON hushh_agent_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_hushh_agent_messages_conversation_id ON hushh_agent_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_hushh_agent_subscriptions_user_id ON hushh_agent_subscriptions(user_id);

-- Enable RLS
ALTER TABLE hushh_agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hushh_agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE hushh_agent_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hushh_agent_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  -- Conversations
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own conversations' AND tablename = 'hushh_agent_conversations') THEN
    CREATE POLICY "Users can view own conversations" ON hushh_agent_conversations FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own conversations' AND tablename = 'hushh_agent_conversations') THEN
    CREATE POLICY "Users can insert own conversations" ON hushh_agent_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own conversations' AND tablename = 'hushh_agent_conversations') THEN
    CREATE POLICY "Users can update own conversations" ON hushh_agent_conversations FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own conversations' AND tablename = 'hushh_agent_conversations') THEN
    CREATE POLICY "Users can delete own conversations" ON hushh_agent_conversations FOR DELETE USING (auth.uid() = user_id);
  END IF;
  
  -- Subscriptions
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own subscription' AND tablename = 'hushh_agent_subscriptions') THEN
    CREATE POLICY "Users can view own subscription" ON hushh_agent_subscriptions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own subscription' AND tablename = 'hushh_agent_subscriptions') THEN
    CREATE POLICY "Users can insert own subscription" ON hushh_agent_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own subscription' AND tablename = 'hushh_agent_subscriptions') THEN
    CREATE POLICY "Users can update own subscription" ON hushh_agent_subscriptions FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- Usage
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own usage' AND tablename = 'hushh_agent_usage') THEN
    CREATE POLICY "Users can view own usage" ON hushh_agent_usage FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own usage' AND tablename = 'hushh_agent_usage') THEN
    CREATE POLICY "Users can insert own usage" ON hushh_agent_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Seed default agents
INSERT INTO hushh_agents (id, name, description, system_prompt, category, is_pro, is_active)
VALUES 
  ('hushh', 'Hushh', 'Your primary AI companion - helpful, friendly, and always ready to assist', 
   'You are Hushh, a friendly and intelligent AI assistant created by Hushh Labs. You help users with questions, creative tasks, and conversations in multiple languages including English, Hindi, and Tamil.', 
   'general', false, true),
  ('hushh-pro', 'Hushh Pro', 'Advanced AI with voice capabilities and premium features', 
   'You are Hushh Pro, the premium AI assistant from Hushh Labs with voice capabilities. You provide enhanced responses and can handle complex tasks.', 
   'general', true, true)
ON CONFLICT (id) DO UPDATE SET
  description = EXCLUDED.description,
  system_prompt = EXCLUDED.system_prompt;

-- Done!
SELECT 'Hushh Agents tables created successfully!' as status;
