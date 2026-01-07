-- =====================================================
-- Hushh Folio - Portfolio Builder Tables
-- Created: 2026-01-07
-- Description: Database schema for AI-powered portfolio builder
-- =====================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. Main Portfolios Table
-- =====================================================
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- URL slug (unique identifier for portfolio URL)
    slug VARCHAR(100) UNIQUE NOT NULL,
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    dob DATE,
    phone VARCHAR(50),
    linkedin_url TEXT,
    
    -- AI Generated Content
    headline VARCHAR(500),           -- AI generated headline
    bio TEXT,                        -- AI generated bio/summary
    tagline VARCHAR(255),            -- Short tagline
    
    -- Template Settings
    template_id VARCHAR(50) DEFAULT 'minimal',  -- minimal, executive, creative, modern, developer
    theme_color VARCHAR(7) DEFAULT '#F97316',   -- Primary color (Hushh orange default)
    
    -- Photos
    original_photo_url TEXT,         -- Original uploaded photo
    enhanced_photo_url TEXT,         -- Imagen enhanced professional photo
    
    -- Social Links
    social_links JSONB DEFAULT '{}', -- { twitter, github, instagram, etc }
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft',  -- draft, generating, published, archived
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    firebase_url TEXT,               -- Final deployed URL on Firebase
    
    -- Analytics
    views_count INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    
    -- Wizard Progress
    wizard_step INT DEFAULT 1,       -- Current step in wizard (1-7)
    wizard_completed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_portfolios_status ON portfolios(status);

-- =====================================================
-- 2. Portfolio Sections Table
-- =====================================================
CREATE TABLE IF NOT EXISTS portfolio_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
    
    -- Section Type
    section_type VARCHAR(50) NOT NULL,  -- skills, experience, projects, education, certifications, contact, custom
    title VARCHAR(255),                  -- Section title (can be customized)
    
    -- Content (flexible JSONB storage)
    content JSONB NOT NULL DEFAULT '{}',
    
    -- Display Settings
    order_index INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster section lookups
CREATE INDEX IF NOT EXISTS idx_portfolio_sections_portfolio_id ON portfolio_sections(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_sections_type ON portfolio_sections(section_type);

-- =====================================================
-- 3. Portfolio Interview (Agentic Questions & Answers)
-- =====================================================
CREATE TABLE IF NOT EXISTS portfolio_interview (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
    
    -- Question Details
    question_id INT NOT NULL,            -- Question number (1-12)
    question_text TEXT NOT NULL,         -- The question asked
    answer_text TEXT,                    -- User's answer
    
    -- AI Processing
    ai_processed BOOLEAN DEFAULT FALSE,  -- Whether AI has processed this answer
    extracted_data JSONB,                -- AI extracted structured data
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for interview lookups
CREATE INDEX IF NOT EXISTS idx_portfolio_interview_portfolio_id ON portfolio_interview(portfolio_id);

-- =====================================================
-- 4. Portfolio Templates (Available Templates)
-- =====================================================
CREATE TABLE IF NOT EXISTS portfolio_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    preview_image_url TEXT,
    
    -- Template Settings
    default_colors JSONB DEFAULT '{}',
    features JSONB DEFAULT '[]',         -- List of features: ['dark_mode', 'animations', 'github_integration']
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    
    -- Order for display
    display_order INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. Portfolio Analytics
-- =====================================================
CREATE TABLE IF NOT EXISTS portfolio_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
    
    -- Event Details
    event_type VARCHAR(50) NOT NULL,     -- view, click, share, download
    event_data JSONB DEFAULT '{}',       -- Additional event data
    
    -- Visitor Info
    visitor_id VARCHAR(100),             -- Anonymous visitor ID
    visitor_ip VARCHAR(50),
    user_agent TEXT,
    referrer TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_portfolio_id ON portfolio_analytics(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_created_at ON portfolio_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_event_type ON portfolio_analytics(event_type);

-- =====================================================
-- 6. Reserved Slugs (Prevent using system slugs)
-- =====================================================
CREATE TABLE IF NOT EXISTS portfolio_reserved_slugs (
    slug VARCHAR(100) PRIMARY KEY,
    reason VARCHAR(255)
);

-- Insert reserved slugs
INSERT INTO portfolio_reserved_slugs (slug, reason) VALUES
    ('admin', 'System reserved'),
    ('api', 'System reserved'),
    ('hushh', 'Brand reserved'),
    ('hushhfolio', 'Brand reserved'),
    ('portfolio', 'System reserved'),
    ('new', 'System reserved'),
    ('edit', 'System reserved'),
    ('settings', 'System reserved'),
    ('dashboard', 'System reserved'),
    ('login', 'System reserved'),
    ('signup', 'System reserved'),
    ('logout', 'System reserved'),
    ('profile', 'System reserved'),
    ('help', 'System reserved'),
    ('support', 'System reserved'),
    ('about', 'System reserved'),
    ('contact', 'System reserved'),
    ('terms', 'System reserved'),
    ('privacy', 'System reserved')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 7. Insert Default Templates
-- =====================================================
INSERT INTO portfolio_templates (id, name, description, preview_image_url, default_colors, features, display_order) VALUES
    ('minimal', 'Minimal', 'Clean, white background with typography-focused design', '/images/templates/minimal-preview.png', 
     '{"primary": "#F97316", "background": "#FFFFFF", "text": "#1F2937"}', 
     '["clean_design", "fast_loading", "mobile_first"]', 1),
    
    ('executive', 'Executive', 'Corporate feel with navy and gold accents for professionals', '/images/templates/executive-preview.png', 
     '{"primary": "#1E3A5F", "accent": "#C9A227", "background": "#F8FAFC"}', 
     '["testimonials", "achievements", "corporate_style"]', 2),
    
    ('creative', 'Creative', 'Bold colors and gradients for designers and artists', '/images/templates/creative-preview.png', 
     '{"primary": "#8B5CF6", "secondary": "#EC4899", "background": "#0F172A"}', 
     '["gradients", "animations", "portfolio_gallery"]', 3),
    
    ('modern', 'Modern', 'Dark mode with glassmorphism and smooth animations', '/images/templates/modern-preview.png', 
     '{"primary": "#10B981", "background": "#111827", "surface": "#1F2937"}', 
     '["dark_mode", "glassmorphism", "smooth_animations"]', 4),
    
    ('developer', 'Developer', 'Terminal-style design with GitHub integration', '/images/templates/developer-preview.png', 
     '{"primary": "#22C55E", "background": "#0D1117", "terminal": "#161B22"}', 
     '["terminal_style", "github_stats", "code_snippets"]', 5)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 8. RLS Policies
-- =====================================================

-- Enable RLS
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_interview ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_analytics ENABLE ROW LEVEL SECURITY;

-- Portfolios Policies
CREATE POLICY "Users can view their own portfolios"
    ON portfolios FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own portfolios"
    ON portfolios FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
    ON portfolios FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
    ON portfolios FOR DELETE
    USING (auth.uid() = user_id);

-- Public can view published portfolios (for public portfolio pages)
CREATE POLICY "Anyone can view published portfolios"
    ON portfolios FOR SELECT
    USING (is_published = TRUE);

-- Portfolio Sections Policies
CREATE POLICY "Users can manage their portfolio sections"
    ON portfolio_sections FOR ALL
    USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    );

-- Public can view sections of published portfolios
CREATE POLICY "Anyone can view sections of published portfolios"
    ON portfolio_sections FOR SELECT
    USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE is_published = TRUE
        )
    );

-- Portfolio Interview Policies
CREATE POLICY "Users can manage their interview responses"
    ON portfolio_interview FOR ALL
    USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    );

-- Portfolio Analytics Policies
CREATE POLICY "Users can view analytics for their portfolios"
    ON portfolio_analytics FOR SELECT
    USING (
        portfolio_id IN (
            SELECT id FROM portfolios WHERE user_id = auth.uid()
        )
    );

-- Anyone can insert analytics (for tracking views)
CREATE POLICY "Anyone can insert analytics"
    ON portfolio_analytics FOR INSERT
    WITH CHECK (TRUE);

-- Templates are public
ALTER TABLE portfolio_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view templates"
    ON portfolio_templates FOR SELECT
    USING (is_active = TRUE);

-- Reserved slugs are public for checking
ALTER TABLE portfolio_reserved_slugs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reserved slugs"
    ON portfolio_reserved_slugs FOR SELECT
    USING (TRUE);

-- =====================================================
-- 9. Updated At Trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_portfolio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portfolios_updated_at
    BEFORE UPDATE ON portfolios
    FOR EACH ROW
    EXECUTE FUNCTION update_portfolio_updated_at();

CREATE TRIGGER update_portfolio_sections_updated_at
    BEFORE UPDATE ON portfolio_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_portfolio_updated_at();

-- =====================================================
-- 10. Function to Generate Unique Slug
-- =====================================================
CREATE OR REPLACE FUNCTION generate_portfolio_slug(p_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INT := 0;
BEGIN
    -- Convert name to slug format
    base_slug := LOWER(REGEXP_REPLACE(p_name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := TRIM(BOTH '-' FROM base_slug);
    
    -- Check if slug exists or is reserved
    final_slug := base_slug;
    
    WHILE EXISTS (
        SELECT 1 FROM portfolios WHERE slug = final_slug
        UNION
        SELECT 1 FROM portfolio_reserved_slugs WHERE slug = final_slug
    ) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 11. Function to Increment View Count
-- =====================================================
CREATE OR REPLACE FUNCTION increment_portfolio_views(p_portfolio_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE portfolios 
    SET views_count = views_count + 1 
    WHERE id = p_portfolio_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Done! 
-- =====================================================

COMMENT ON TABLE portfolios IS 'Main table for user portfolios in Hushh Folio';
COMMENT ON TABLE portfolio_sections IS 'Portfolio content sections (skills, experience, etc.)';
COMMENT ON TABLE portfolio_interview IS 'Agentic interview questions and answers';
COMMENT ON TABLE portfolio_templates IS 'Available portfolio templates';
COMMENT ON TABLE portfolio_analytics IS 'Portfolio view and interaction analytics';
