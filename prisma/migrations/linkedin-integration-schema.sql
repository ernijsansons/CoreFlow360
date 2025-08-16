-- CoreFlow360 - LinkedIn Integration Schema
-- Enhanced CRM with LinkedIn Sales Navigator integration

-- LinkedIn Integration Settings
CREATE TABLE linkedin_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  
  linkedin_profile_id VARCHAR(255) NOT NULL,
  linkedin_profile_url TEXT,
  sales_navigator_enabled BOOLEAN DEFAULT false,
  
  scopes TEXT[], -- Array of granted scopes
  integration_status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, REVOKED, ERROR
  
  -- Sync settings
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_frequency_hours INTEGER DEFAULT 24,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(50) DEFAULT 'PENDING',
  sync_error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(tenant_id, user_id),
  INDEX(linkedin_profile_id),
  INDEX(tenant_id, integration_status),
  INDEX(last_sync_at)
);

-- LinkedIn Profiles (enriched contact data)
CREATE TABLE linkedin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- LinkedIn identifiers
  linkedin_id VARCHAR(255) NOT NULL UNIQUE,
  profile_url TEXT NOT NULL,
  public_profile_url TEXT,
  sales_navigator_url TEXT,
  
  -- Basic profile information
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  headline TEXT,
  summary TEXT,
  location VARCHAR(255),
  industry VARCHAR(255),
  profile_picture_url TEXT,
  
  -- Professional details
  current_company VARCHAR(255),
  current_title VARCHAR(255),
  connections_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  
  -- Contact information (when available)
  email VARCHAR(255),
  phone VARCHAR(50),
  
  -- Sales Navigator data
  sales_navigator_profile JSONB,
  connection_degree INTEGER, -- 1st, 2nd, 3rd+ connection
  mutual_connections_count INTEGER DEFAULT 0,
  
  -- AI scoring and insights
  lead_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  social_selling_index INTEGER DEFAULT 0,
  
  -- Activity tracking
  last_activity_at TIMESTAMP WITH TIME ZONE,
  last_post_at TIMESTAMP WITH TIME ZONE,
  posts_count INTEGER DEFAULT 0,
  
  -- Job change tracking
  job_change_detected_at TIMESTAMP WITH TIME ZONE,
  previous_company VARCHAR(255),
  job_change_type VARCHAR(50), -- PROMOTION, NEW_ROLE, NEW_COMPANY
  
  -- Enrichment metadata
  enrichment_source VARCHAR(100), -- LinkedIn, Sales Navigator, etc.
  enrichment_confidence DECIMAL(3,2) DEFAULT 0.0,
  last_enriched_at TIMESTAMP WITH TIME ZONE,
  enrichment_status VARCHAR(50) DEFAULT 'PENDING',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX(tenant_id, linkedin_id),
  INDEX(tenant_id, current_company),
  INDEX(tenant_id, industry),
  INDEX(tenant_id, lead_score),
  INDEX(job_change_detected_at),
  INDEX(last_activity_at),
  FULLTEXT(headline, summary, current_company, current_title)
);

-- LinkedIn Companies (organization data)
CREATE TABLE linkedin_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- LinkedIn identifiers
  linkedin_id VARCHAR(255) NOT NULL UNIQUE,
  universal_name VARCHAR(255),
  company_url TEXT,
  
  -- Basic company information
  name VARCHAR(500) NOT NULL,
  description TEXT,
  website VARCHAR(500),
  industry VARCHAR(255),
  company_size VARCHAR(100),
  headquarters VARCHAR(255),
  company_type VARCHAR(100),
  founded_year INTEGER,
  
  -- Visual assets
  logo_url TEXT,
  cover_image_url TEXT,
  
  -- Metrics
  follower_count INTEGER DEFAULT 0,
  employee_count INTEGER DEFAULT 0,
  
  -- Specialties and keywords
  specialties TEXT[],
  keywords TEXT[],
  
  -- Growth and funding data (when available)
  funding_stage VARCHAR(100),
  latest_funding_amount DECIMAL(15,2),
  latest_funding_date DATE,
  valuation DECIMAL(15,2),
  
  -- Technology stack (when available)
  technologies TEXT[],
  
  -- Company intelligence
  growth_rate DECIMAL(5,2),
  hiring_trends VARCHAR(50), -- GROWING, STABLE, DECLINING
  recent_job_postings INTEGER DEFAULT 0,
  
  -- Activity tracking
  last_post_at TIMESTAMP WITH TIME ZONE,
  posts_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0.0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX(tenant_id, linkedin_id),
  INDEX(tenant_id, industry),
  INDEX(tenant_id, company_size),
  INDEX(tenant_id, employee_count),
  INDEX(founded_year),
  FULLTEXT(name, description, industry)
);

-- LinkedIn Profile Experience
CREATE TABLE linkedin_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  
  linkedin_experience_id VARCHAR(255),
  title VARCHAR(255),
  company_name VARCHAR(255),
  company_linkedin_id VARCHAR(255),
  location VARCHAR(255),
  
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  duration_months INTEGER,
  
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX(profile_id, is_current),
  INDEX(company_linkedin_id),
  INDEX(start_date, end_date)
);

-- LinkedIn Profile Education
CREATE TABLE linkedin_educations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  
  linkedin_education_id VARCHAR(255),
  school_name VARCHAR(255),
  degree VARCHAR(255),
  field_of_study VARCHAR(255),
  
  start_year INTEGER,
  end_year INTEGER,
  
  activities TEXT,
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX(profile_id),
  INDEX(school_name),
  INDEX(end_year)
);

-- LinkedIn Messages and Conversations
CREATE TABLE linkedin_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  linkedin_conversation_id VARCHAR(255) NOT NULL,
  profile_id UUID REFERENCES linkedin_profiles(id),
  
  conversation_type VARCHAR(50), -- MESSAGE, CONNECTION_REQUEST, INMAIL
  status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, ARCHIVED, BLOCKED
  
  last_message_at TIMESTAMP WITH TIME ZONE,
  message_count INTEGER DEFAULT 0,
  unread_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX(tenant_id, user_id),
  INDEX(profile_id),
  INDEX(last_message_at)
);

-- LinkedIn Messages
CREATE TABLE linkedin_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES linkedin_conversations(id) ON DELETE CASCADE,
  
  linkedin_message_id VARCHAR(255) NOT NULL,
  sender_profile_id UUID REFERENCES linkedin_profiles(id),
  
  message_type VARCHAR(50), -- INMAIL, CONNECTION_REQUEST, MESSAGE, AUTO_REPLY
  subject VARCHAR(500),
  body TEXT NOT NULL,
  
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  
  -- Message tracking
  is_automated BOOLEAN DEFAULT false,
  campaign_id UUID, -- Link to outreach campaigns
  template_id UUID, -- Link to message templates
  
  -- LinkedIn-specific data
  linkedin_thread_id VARCHAR(255),
  message_status VARCHAR(50), -- SENT, DELIVERED, READ, REPLIED
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX(conversation_id, sent_at),
  INDEX(sender_profile_id),
  INDEX(campaign_id),
  INDEX(sent_at)
);

-- Social Selling Campaigns
CREATE TABLE linkedin_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  campaign_type VARCHAR(50), -- CONNECTION_REQUEST, MESSAGE_SEQUENCE, CONTENT_ENGAGEMENT
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, ACTIVE, PAUSED, COMPLETED, ARCHIVED
  
  -- Target criteria
  target_criteria JSONB, -- Search filters and targeting rules
  daily_limit INTEGER DEFAULT 20,
  weekly_limit INTEGER DEFAULT 100,
  
  -- Timing settings
  send_days INTEGER[], -- Days of week (0=Sunday, 6=Saturday)
  send_hours_start INTEGER DEFAULT 9,
  send_hours_end INTEGER DEFAULT 17,
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Performance tracking
  targets_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  accepted_count INTEGER DEFAULT 0,
  replied_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  
  -- A/B testing
  is_ab_test BOOLEAN DEFAULT false,
  ab_test_group VARCHAR(10), -- A, B, etc.
  
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX(tenant_id, user_id),
  INDEX(status),
  INDEX(campaign_type),
  INDEX(started_at)
);

-- Campaign Message Templates
CREATE TABLE linkedin_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES linkedin_campaigns(id) ON DELETE CASCADE,
  
  template_name VARCHAR(255),
  template_type VARCHAR(50), -- CONNECTION_REQUEST, FOLLOW_UP, INMAIL
  sequence_order INTEGER DEFAULT 1,
  
  subject VARCHAR(500),
  body TEXT NOT NULL,
  
  -- Personalization variables
  variables JSONB, -- Dynamic variables to insert
  
  -- Delays and timing
  delay_days INTEGER DEFAULT 0,
  delay_hours INTEGER DEFAULT 0,
  
  -- Performance tracking
  sent_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.0,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX(campaign_id, sequence_order),
  INDEX(template_type)
);

-- Campaign Targets (prospects in campaigns)
CREATE TABLE linkedin_campaign_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES linkedin_campaigns(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, SENT, ACCEPTED, REPLIED, CONVERTED, FAILED
  current_step INTEGER DEFAULT 1,
  
  -- Outreach tracking
  connection_sent_at TIMESTAMP WITH TIME ZONE,
  connection_accepted_at TIMESTAMP WITH TIME ZONE,
  first_message_sent_at TIMESTAMP WITH TIME ZONE,
  last_message_sent_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  
  -- Custom notes and context
  notes TEXT,
  custom_variables JSONB, -- Personalization data
  
  -- Skip reasons
  skip_reason VARCHAR(255),
  skipped_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(campaign_id, profile_id),
  INDEX(campaign_id, status),
  INDEX(profile_id),
  INDEX(connection_sent_at)
);

-- LinkedIn Activities Tracking
CREATE TABLE linkedin_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES linkedin_companies(id) ON DELETE CASCADE,
  
  linkedin_activity_id VARCHAR(255),
  activity_type VARCHAR(50), -- POST, LIKE, COMMENT, SHARE, ARTICLE, JOB_CHANGE, COMPANY_UPDATE
  
  content TEXT,
  activity_url TEXT,
  
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Engagement metrics
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0.0,
  
  -- Content analysis
  sentiment VARCHAR(20), -- POSITIVE, NEUTRAL, NEGATIVE
  topics TEXT[],
  mentions TEXT[],
  hashtags TEXT[],
  
  -- Buying signals detection
  buying_signal_detected BOOLEAN DEFAULT false,
  signal_strength VARCHAR(20), -- LOW, MEDIUM, HIGH
  signal_keywords TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX(profile_id, published_at),
  INDEX(company_id, published_at),
  INDEX(activity_type),
  INDEX(buying_signal_detected),
  INDEX(published_at)
);

-- Sales Insights and Intelligence
CREATE TABLE linkedin_sales_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  
  insight_type VARCHAR(50), -- JOB_CHANGE, BUYING_SIGNAL, ENGAGEMENT, CONNECTION_PATH
  insight_data JSONB NOT NULL,
  
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
  
  is_actionable BOOLEAN DEFAULT true,
  action_taken BOOLEAN DEFAULT false,
  action_taken_at TIMESTAMP WITH TIME ZONE,
  
  -- Alert settings
  alert_sent BOOLEAN DEFAULT false,
  alert_sent_at TIMESTAMP WITH TIME ZONE,
  
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX(tenant_id, profile_id),
  INDEX(insight_type),
  INDEX(priority, is_actionable),
  INDEX(expires_at),
  INDEX(created_at)
);

-- Social Selling Index Tracking
CREATE TABLE linkedin_ssi_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  overall_score INTEGER NOT NULL,
  brand_score INTEGER,
  network_score INTEGER,
  insights_score INTEGER,
  relationships_score INTEGER,
  
  industry_average INTEGER,
  industry_rank VARCHAR(50),
  
  recommendations JSONB,
  
  measured_at DATE NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(tenant_id, user_id, measured_at),
  INDEX(tenant_id, user_id),
  INDEX(measured_at)
);

-- Connection Path Mapping
CREATE TABLE linkedin_connection_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  from_profile_id UUID NOT NULL REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  to_profile_id UUID NOT NULL REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  
  path_data JSONB NOT NULL, -- Array of intermediate connections
  path_length INTEGER NOT NULL,
  
  mutual_connections_count INTEGER DEFAULT 0,
  mutual_connections JSONB,
  
  path_discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  path_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(from_profile_id, to_profile_id),
  INDEX(tenant_id, from_profile_id),
  INDEX(path_length)
);

-- Add LinkedIn profile reference to existing customers table
ALTER TABLE customers ADD COLUMN linkedin_profile_id UUID REFERENCES linkedin_profiles(id);
ALTER TABLE customers ADD COLUMN linkedin_url TEXT;
ALTER TABLE customers ADD COLUMN linkedin_enriched_at TIMESTAMP WITH TIME ZONE;

-- Add LinkedIn profile reference to existing deals table
ALTER TABLE deals ADD COLUMN linkedin_profile_id UUID REFERENCES linkedin_profiles(id);

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_linkedin_profile ON customers(linkedin_profile_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_linkedin_profile ON deals(linkedin_profile_id);

-- Update timestamp triggers for LinkedIn tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_linkedin_integrations_updated_at 
    BEFORE UPDATE ON linkedin_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_linkedin_profiles_updated_at 
    BEFORE UPDATE ON linkedin_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_linkedin_companies_updated_at 
    BEFORE UPDATE ON linkedin_companies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_linkedin_conversations_updated_at 
    BEFORE UPDATE ON linkedin_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_linkedin_campaigns_updated_at 
    BEFORE UPDATE ON linkedin_campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_linkedin_message_templates_updated_at 
    BEFORE UPDATE ON linkedin_message_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_linkedin_campaign_targets_updated_at 
    BEFORE UPDATE ON linkedin_campaign_targets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_linkedin_sales_insights_updated_at 
    BEFORE UPDATE ON linkedin_sales_insights 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();