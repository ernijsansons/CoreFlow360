-- CoreFlow360 - Value Proposition & Infographic Generation Schema
-- AI-powered personalized marketing materials system

-- Company Brand Elements
CREATE TABLE company_brand_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Brand identity
  company_name VARCHAR(255) NOT NULL,
  tagline VARCHAR(500),
  brand_description TEXT,
  
  -- Visual assets
  logo_url TEXT,
  logo_dark_url TEXT,
  favicon_url TEXT,
  cover_image_url TEXT,
  
  -- Brand colors
  primary_color VARCHAR(7), -- Hex color
  secondary_color VARCHAR(7),
  accent_color VARCHAR(7),
  background_color VARCHAR(7) DEFAULT '#FFFFFF',
  text_color VARCHAR(7) DEFAULT '#000000',
  
  -- Typography
  primary_font VARCHAR(100) DEFAULT 'Inter',
  secondary_font VARCHAR(100),
  font_weights INTEGER[] DEFAULT ARRAY[400, 500, 600, 700],
  
  -- Brand style
  visual_style VARCHAR(50) DEFAULT 'MODERN', -- CORPORATE, MODERN, PLAYFUL, TECHNICAL, MINIMALIST
  brand_personality TEXT[],
  
  -- Contact information
  website VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  
  -- Social media
  linkedin_url VARCHAR(255),
  twitter_url VARCHAR(255),
  facebook_url VARCHAR(255),
  instagram_url VARCHAR(255),
  
  -- Brand guidelines
  brand_voice TEXT,
  messaging_guidelines TEXT,
  visual_guidelines TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX(tenant_id, user_id),
  INDEX(company_name)
);

-- Value Propositions Repository
CREATE TABLE value_propositions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Core value proposition
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- COST_REDUCTION, EFFICIENCY_GAIN, etc.
  
  -- Problem it solves
  problem_statement TEXT NOT NULL,
  target_pain_points TEXT[],
  
  -- Solution details
  solution_description TEXT NOT NULL,
  key_benefits TEXT[],
  
  -- Quantifiable benefits (JSON array)
  quantifiable_benefits JSONB DEFAULT '[]',
  -- Structure: [{"metric": "Time Savings", "value": 50, "unit": "%", "timeframe": "monthly", "confidence": 0.9}]
  
  -- Supporting elements
  use_case TEXT,
  target_persona TEXT[],
  target_industry TEXT[],
  
  -- Social proof
  testimonials JSONB DEFAULT '[]',
  case_studies TEXT[],
  metrics JSONB DEFAULT '[]',
  
  -- Visual elements
  icon_url TEXT,
  color_scheme VARCHAR(50),
  visual_style VARCHAR(50) DEFAULT 'MODERN',
  
  -- AI optimization
  ai_optimization_score DECIMAL(3,2) DEFAULT 0.0,
  ai_suggestions TEXT[],
  
  -- Performance tracking
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX(tenant_id, user_id),
  INDEX(category),
  INDEX(target_industry),
  INDEX(ai_optimization_score),
  FULLTEXT(title, description, problem_statement, solution_description)
);

-- Customer Problems Repository
CREATE TABLE customer_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  linkedin_profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE SET NULL,
  
  -- Problem identification
  problem_title VARCHAR(255) NOT NULL,
  problem_description TEXT NOT NULL,
  problem_category VARCHAR(50) NOT NULL,
  severity VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
  urgency VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
  
  -- Impact assessment
  business_impact TEXT,
  financial_impact JSONB,
  -- Structure: {"lossAmount": 10000, "timeWasted": 20, "inefficiencyFactor": 1.5}
  
  -- Current situation
  current_solution TEXT,
  current_solution_limitations TEXT[],
  has_tried_alternatives BOOLEAN DEFAULT false,
  alternatives TEXT[],
  
  -- Decision factors
  decision_criteria TEXT[],
  budget JSONB,
  -- Structure: {"min": 5000, "max": 50000, "currency": "USD"}
  timeline VARCHAR(255),
  decision_makers TEXT[],
  
  -- Solution matching
  matched_value_props UUID[], -- Array of value_proposition IDs
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  
  -- Source tracking
  identified_from VARCHAR(50) NOT NULL, -- LINKEDIN, CALL, EMAIL, MEETING, SURVEY, SOCIAL, AI_ANALYSIS
  source_data JSONB,
  
  -- AI analysis
  sentiment VARCHAR(20), -- POSITIVE, NEUTRAL, NEGATIVE
  keywords TEXT[],
  topics TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX(tenant_id, customer_id),
  INDEX(linkedin_profile_id),
  INDEX(problem_category, severity),
  INDEX(identified_from),
  INDEX(confidence_score),
  FULLTEXT(problem_title, problem_description, business_impact)
);

-- Infographic Templates
CREATE TABLE infographic_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- PROBLEM_SOLUTION, BEFORE_AFTER, ROI_CALCULATOR, etc.
  
  -- Template structure
  layout JSONB NOT NULL,
  -- Structure: {"type": "VERTICAL", "sections": 5, "headerHeight": 100, "margins": {...}}
  
  sections JSONB NOT NULL,
  -- Structure: [{"id": "header", "type": "HEADER", "title": "Header", "position": 1, "required": true, ...}]
  
  -- Customization options
  color_schemes JSONB DEFAULT '[]',
  fonts JSONB DEFAULT '[]',
  icon_sets JSONB DEFAULT '[]',
  
  -- Compatibility
  supported_formats VARCHAR(20)[] DEFAULT ARRAY['PNG', 'PDF', 'SVG'],
  dimensions JSONB DEFAULT '[]',
  -- Structure: [{"width": 800, "height": 1200, "dpi": 300}]
  
  -- Pricing and access
  is_premium BOOLEAN DEFAULT false,
  price_tier VARCHAR(20) DEFAULT 'FREE', -- FREE, BASIC, PRO, ENTERPRISE
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  
  -- Metadata
  tags TEXT[],
  industry_focus TEXT[],
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX(category),
  INDEX(is_premium, price_tier),
  INDEX(usage_count),
  INDEX(rating),
  FULLTEXT(name, description)
);

-- Generated Infographics
CREATE TABLE generated_infographics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Generation context
  value_prop_ids UUID[], -- Array of value_proposition IDs used
  customer_problem_ids UUID[], -- Array of customer_problem IDs addressed
  template_id UUID NOT NULL REFERENCES infographic_templates(id),
  
  -- Content
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  sections JSONB NOT NULL,
  
  -- Visual settings
  color_scheme JSONB NOT NULL,
  font JSONB NOT NULL,
  icon_set JSONB,
  brand_elements_id UUID REFERENCES company_brand_elements(id),
  
  -- Generated assets
  preview_url TEXT,
  final_assets JSONB DEFAULT '[]',
  -- Structure: [{"format": "PNG", "url": "...", "size": "800x1200", "fileSize": "2.5MB"}]
  
  -- AI generation metadata
  ai_prompt TEXT,
  generation_model VARCHAR(100),
  generation_time_ms INTEGER,
  quality_score DECIMAL(3,2) DEFAULT 0.0,
  
  -- Sharing and usage
  is_shared BOOLEAN DEFAULT false,
  shared_url TEXT,
  share_password VARCHAR(100),
  share_expires_at TIMESTAMP WITH TIME ZONE,
  
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  -- Feedback
  rating INTEGER,
  feedback TEXT,
  feedback_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'GENERATED', -- GENERATING, GENERATED, FAILED, ARCHIVED
  error_message TEXT,
  
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX(tenant_id, user_id),
  INDEX(customer_id),
  INDEX(template_id),
  INDEX(status),
  INDEX(generated_at),
  INDEX(is_shared, shared_url)
);

-- Personalized Marketing Materials
CREATE TABLE personalized_marketing_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  material_type VARCHAR(50) NOT NULL, -- INFOGRAPHIC, PROPOSAL, CASE_STUDY, EMAIL_TEMPLATE, PRESENTATION, ONE_PAGER
  
  -- Personalization context
  customer_problem_ids UUID[],
  selected_value_prop_ids UUID[],
  
  customer_profile JSONB,
  -- Structure: {"company": "...", "industry": "...", "size": "...", "role": "...", "painPoints": [...]}
  
  -- Generated content
  content JSONB NOT NULL,
  assets JSONB DEFAULT '[]',
  -- Structure: [{"thumbnailUrl": "...", "previewUrl": "...", "finalUrl": "...", "format": "..."}]
  
  -- Metadata
  title VARCHAR(255),
  description TEXT,
  generation_prompt TEXT,
  
  -- Performance tracking
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_to VARCHAR(255),
  
  opened BOOLEAN DEFAULT false,
  opened_at TIMESTAMP WITH TIME ZONE,
  open_count INTEGER DEFAULT 0,
  
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMP WITH TIME ZONE,
  click_count INTEGER DEFAULT 0,
  
  downloaded BOOLEAN DEFAULT false,
  downloaded_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER DEFAULT 0,
  
  converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMP WITH TIME ZONE,
  conversion_value DECIMAL(10,2),
  
  -- A/B Testing
  ab_test_group VARCHAR(10),
  
  -- Feedback
  rating INTEGER,
  feedback TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX(tenant_id, customer_id),
  INDEX(material_type),
  INDEX(sent, opened, clicked, converted),
  INDEX(created_at)
);

-- Marketing Material Performance Analytics
CREATE TABLE marketing_material_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES personalized_marketing_materials(id) ON DELETE CASCADE,
  
  event_type VARCHAR(50) NOT NULL, -- VIEW, OPEN, CLICK, DOWNLOAD, SHARE, CONVERT
  event_data JSONB,
  
  -- User context
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  
  -- Timing
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id VARCHAR(100),
  
  INDEX(material_id, event_type),
  INDEX(event_timestamp),
  INDEX(session_id)
);

-- Infographic Template Ratings and Reviews
CREATE TABLE template_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES infographic_templates(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  
  -- Usage context
  used_for_industry VARCHAR(100),
  used_for_purpose VARCHAR(100),
  
  -- Helpful votes
  helpful_votes INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(template_id, tenant_id, user_id),
  INDEX(template_id, rating),
  INDEX(created_at)
);

-- Value Proposition Performance Analytics
CREATE TABLE value_proposition_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value_prop_id UUID NOT NULL REFERENCES value_propositions(id) ON DELETE CASCADE,
  
  -- Time period
  date_period DATE NOT NULL,
  period_type VARCHAR(20) DEFAULT 'DAILY', -- DAILY, WEEKLY, MONTHLY
  
  -- Usage metrics
  times_used INTEGER DEFAULT 0,
  materials_generated INTEGER DEFAULT 0,
  
  -- Engagement metrics
  total_views INTEGER DEFAULT 0,
  total_downloads INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  
  -- Conversion metrics
  leads_generated INTEGER DEFAULT 0,
  meetings_booked INTEGER DEFAULT 0,
  deals_influenced INTEGER DEFAULT 0,
  revenue_influenced DECIMAL(12,2) DEFAULT 0,
  
  -- Performance scores
  engagement_rate DECIMAL(5,2) DEFAULT 0.0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(value_prop_id, date_period, period_type),
  INDEX(value_prop_id, date_period),
  INDEX(period_type)
);

-- AI Optimization History
CREATE TABLE ai_optimization_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- VALUE_PROPOSITION, INFOGRAPHIC_TEMPLATE, MARKETING_MATERIAL
  entity_id UUID NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  optimization_type VARCHAR(50) NOT NULL, -- CONTENT_IMPROVEMENT, PERFORMANCE_BOOST, A_B_TEST
  
  -- Original vs optimized
  original_data JSONB NOT NULL,
  optimized_data JSONB NOT NULL,
  
  -- AI model details
  ai_model VARCHAR(100) NOT NULL,
  optimization_prompt TEXT,
  confidence_score DECIMAL(3,2),
  
  -- Performance comparison
  original_performance JSONB,
  optimized_performance JSONB,
  improvement_metrics JSONB,
  
  -- Approval and implementation
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, IMPLEMENTED, REJECTED
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX(entity_type, entity_id),
  INDEX(tenant_id, optimization_type),
  INDEX(status),
  INDEX(created_at)
);

-- Add triggers for updated_at columns
CREATE TRIGGER update_company_brand_elements_updated_at 
    BEFORE UPDATE ON company_brand_elements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_value_propositions_updated_at 
    BEFORE UPDATE ON value_propositions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_problems_updated_at 
    BEFORE UPDATE ON customer_problems 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_infographic_templates_updated_at 
    BEFORE UPDATE ON infographic_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_infographics_last_modified 
    BEFORE UPDATE ON generated_infographics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personalized_marketing_materials_updated_at 
    BEFORE UPDATE ON personalized_marketing_materials 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default infographic templates
INSERT INTO infographic_templates (id, name, description, category, layout, sections, color_schemes, fonts, icon_sets, tags, industry_focus) VALUES 
(
  gen_random_uuid(),
  'Problem-Solution Modern',
  'Modern vertical layout showcasing customer problems alongside your solutions',
  'PROBLEM_SOLUTION',
  '{"type": "VERTICAL", "sections": 5, "headerHeight": 120, "footerHeight": 80, "margins": {"top": 20, "bottom": 20, "left": 30, "right": 30}}',
  '[
    {"id": "header", "type": "HEADER", "title": "Header", "position": 1, "required": true, "maxElements": 3, "supportedElements": ["title", "subtitle", "logo"]},
    {"id": "problem", "type": "PROBLEM", "title": "Problem Statement", "position": 2, "required": true, "maxElements": 5, "supportedElements": ["title", "description", "bullet-points", "icon", "stats"]},
    {"id": "solution", "type": "SOLUTION", "title": "Our Solution", "position": 3, "required": true, "maxElements": 5, "supportedElements": ["title", "description", "features", "benefits", "icon"]},
    {"id": "benefits", "type": "BENEFITS", "title": "Key Benefits", "position": 4, "required": true, "maxElements": 6, "supportedElements": ["benefit-cards", "metrics", "icons"]},
    {"id": "cta", "type": "CTA", "title": "Call to Action", "position": 5, "required": true, "maxElements": 3, "supportedElements": ["button", "contact", "next-steps"]}
  ]',
  '[
    {"name": "Corporate Blue", "primary": "#2563EB", "secondary": "#64748B", "accent": "#F59E0B", "background": "#FFFFFF", "text": "#1F2937", "success": "#10B981", "warning": "#F59E0B", "error": "#EF4444"},
    {"name": "Tech Purple", "primary": "#7C3AED", "secondary": "#6B7280", "accent": "#EC4899", "background": "#F9FAFB", "text": "#111827", "success": "#059669", "warning": "#D97706", "error": "#DC2626"}
  ]',
  '[
    {"name": "Inter", "family": "Inter, sans-serif", "weights": [400, 500, 600, 700], "styles": ["normal", "italic"]},
    {"name": "Poppins", "family": "Poppins, sans-serif", "weights": [400, 500, 600, 700], "styles": ["normal"]}
  ]',
  '[
    {"name": "Lucide Icons", "style": "LINE", "baseUrl": "https://lucide.dev/icons/", "icons": [{"name": "problem", "keywords": ["issue", "challenge"]}, {"name": "solution", "keywords": ["fix", "resolve"]}, {"name": "benefit", "keywords": ["value", "gain"]}]}
  ]',
  ARRAY['modern', 'problem-solution', 'business', 'professional'],
  ARRAY['Technology', 'SaaS', 'Consulting', 'Healthcare', 'Finance']
),
(
  gen_random_uuid(),
  'ROI Calculator Visual',
  'Interactive ROI calculator with before/after comparison and financial impact visualization',
  'ROI_CALCULATOR',
  '{"type": "VERTICAL", "sections": 4, "headerHeight": 100, "footerHeight": 60, "margins": {"top": 25, "bottom": 25, "left": 40, "right": 40}}',
  '[
    {"id": "header", "type": "HEADER", "title": "ROI Header", "position": 1, "required": true, "maxElements": 2, "supportedElements": ["title", "logo"]},
    {"id": "current-state", "type": "METRICS", "title": "Current State", "position": 2, "required": true, "maxElements": 4, "supportedElements": ["metrics", "costs", "inefficiencies"]},
    {"id": "future-state", "type": "METRICS", "title": "Future State", "position": 3, "required": true, "maxElements": 4, "supportedElements": ["metrics", "savings", "improvements"]},
    {"id": "roi-summary", "type": "METRICS", "title": "ROI Summary", "position": 4, "required": true, "maxElements": 3, "supportedElements": ["roi-percentage", "payback-period", "total-savings"]}
  ]',
  '[
    {"name": "Financial Green", "primary": "#059669", "secondary": "#4B5563", "accent": "#DC2626", "background": "#FFFFFF", "text": "#1F2937", "success": "#10B981", "warning": "#F59E0B", "error": "#EF4444"}
  ]',
  '[{"name": "Roboto", "family": "Roboto, sans-serif", "weights": [400, 500, 700], "styles": ["normal"]}]',
  '[{"name": "Financial Icons", "style": "SOLID", "baseUrl": "", "icons": [{"name": "dollar", "keywords": ["money", "cost"]}, {"name": "growth", "keywords": ["increase", "roi"]}]}]',
  ARRAY['roi', 'calculator', 'financial', 'metrics'],
  ARRAY['Finance', 'SaaS', 'Manufacturing', 'Healthcare']
);

-- Insert default color schemes and design assets for quick setup
-- This would be expanded with more templates, color schemes, fonts, etc.