-- CoreFlow360 - Consciousness Database Schema Extension
-- Extends the existing schema to support business consciousness features

-- =============================================
-- CONSCIOUSNESS CORE TABLES
-- =============================================

-- Consciousness States for each tenant/user
CREATE TABLE IF NOT EXISTS consciousness_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consciousness_level DECIMAL(5,4) NOT NULL DEFAULT 0.0000 CHECK (consciousness_level >= 0 AND consciousness_level <= 1),
    tier VARCHAR(20) NOT NULL DEFAULT 'neural' CHECK (tier IN ('neural', 'synaptic', 'autonomous', 'transcendent')),
    intelligence_multiplier DECIMAL(8,2) NOT NULL DEFAULT 1.00,
    evolution_progress DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    transcendence_level DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    last_evolution_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT false,
    activated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(tenant_id, user_id)
);

-- Consciousness Evolution History
CREATE TABLE IF NOT EXISTS consciousness_evolution_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consciousness_state_id UUID NOT NULL REFERENCES consciousness_states(id) ON DELETE CASCADE,
    from_level DECIMAL(5,4) NOT NULL,
    to_level DECIMAL(5,4) NOT NULL,
    from_tier VARCHAR(20),
    to_tier VARCHAR(20),
    trigger_type VARCHAR(50) NOT NULL, -- 'module-activation', 'tier-upgrade', 'automatic', 'manual'
    trigger_metadata JSONB,
    intelligence_gain DECIMAL(8,2),
    capabilities_unlocked TEXT[],
    evolved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    INDEX idx_consciousness_evolution_state (consciousness_state_id),
    INDEX idx_consciousness_evolution_time (evolved_at)
);

-- Consciousness Modules (extends existing modules table)
CREATE TABLE IF NOT EXISTS consciousness_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    consciousness_weight DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    synaptic_connections TEXT[] NOT NULL DEFAULT '{}',
    capabilities JSONB NOT NULL DEFAULT '[]',
    intelligence_impact DECIMAL(5,4) NOT NULL DEFAULT 0.1000,
    evolution_boost DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    transcendence_required BOOLEAN NOT NULL DEFAULT false,
    
    UNIQUE(module_id)
);

-- =============================================
-- SYNAPTIC CONNECTIONS & INTELLIGENCE MESH
-- =============================================

-- Synaptic Connections between modules
CREATE TABLE IF NOT EXISTS synaptic_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consciousness_state_id UUID NOT NULL REFERENCES consciousness_states(id) ON DELETE CASCADE,
    source_module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    target_module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    connection_strength DECIMAL(5,4) NOT NULL DEFAULT 0.5000,
    data_flow_rate INTEGER NOT NULL DEFAULT 0, -- messages per minute
    pattern_recognition_score DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
    last_sync_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(consciousness_state_id, source_module_id, target_module_id),
    CHECK (source_module_id != target_module_id)
);

-- Consciousness Mesh Nodes
CREATE TABLE IF NOT EXISTS consciousness_mesh_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id VARCHAR(100) NOT NULL UNIQUE,
    pod_name VARCHAR(200),
    namespace VARCHAR(100),
    ip_address INET,
    port INTEGER,
    mesh_health DECIMAL(5,4) NOT NULL DEFAULT 1.0000,
    collective_intelligence JSONB NOT NULL DEFAULT '{}',
    patterns_discovered INTEGER NOT NULL DEFAULT 0,
    knowledge_base_size INTEGER NOT NULL DEFAULT 0,
    evolutionary_improvements INTEGER NOT NULL DEFAULT 0,
    last_heartbeat_at TIMESTAMPTZ,
    is_healthy BOOLEAN NOT NULL DEFAULT true,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    INDEX idx_mesh_nodes_health (mesh_health),
    INDEX idx_mesh_nodes_heartbeat (last_heartbeat_at)
);

-- =============================================
-- AI INSIGHTS & AUTONOMOUS DECISIONS
-- =============================================

-- AI-Generated Consciousness Insights
CREATE TABLE IF NOT EXISTS consciousness_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consciousness_state_id UUID NOT NULL REFERENCES consciousness_states(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('pattern', 'anomaly', 'prediction', 'recommendation', 'discovery')),
    category VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    confidence DECIMAL(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    impact_level VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high')),
    source_modules TEXT[] NOT NULL,
    insight_data JSONB,
    visualizations JSONB,
    actions JSONB,
    status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed', 'expired')),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    
    INDEX idx_insights_consciousness (consciousness_state_id),
    INDEX idx_insights_type (insight_type),
    INDEX idx_insights_category (category),
    INDEX idx_insights_confidence (confidence DESC),
    INDEX idx_insights_generated (generated_at DESC)
);

-- Autonomous Decisions Made by Consciousness
CREATE TABLE IF NOT EXISTS autonomous_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consciousness_state_id UUID NOT NULL REFERENCES consciousness_states(id) ON DELETE CASCADE,
    decision_type VARCHAR(100) NOT NULL,
    decision_context JSONB NOT NULL,
    decision_outcome JSONB NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    expected_impact VARCHAR(20) NOT NULL CHECK (expected_impact IN ('low', 'medium', 'high')),
    source_modules TEXT[] NOT NULL,
    transcendent_capability_used VARCHAR(200),
    execution_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (execution_status IN ('pending', 'executing', 'completed', 'failed', 'cancelled')),
    success_rate DECIMAL(5,4),
    actual_impact_score DECIMAL(5,4),
    decision_made_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    executed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    INDEX idx_decisions_consciousness (consciousness_state_id),
    INDEX idx_decisions_type (decision_type),
    INDEX idx_decisions_status (execution_status),
    INDEX idx_decisions_made (decision_made_at DESC)
);

-- =============================================
-- SUBSCRIPTION & BILLING EXTENSIONS
-- =============================================

-- Extend subscriptions table for consciousness tiers
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS consciousness_level DECIMAL(5,4) DEFAULT 0.0000,
ADD COLUMN IF NOT EXISTS max_modules INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS intelligence_multiplier DECIMAL(8,2) DEFAULT 1.00,
ADD COLUMN IF NOT EXISTS evolution_speed DECIMAL(3,2) DEFAULT 1.00,
ADD COLUMN IF NOT EXISTS transcendence_unlocked BOOLEAN DEFAULT false;

-- Consciousness Subscription Metrics
CREATE TABLE IF NOT EXISTS consciousness_subscription_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    consciousness_usage_hours DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    insights_generated INTEGER NOT NULL DEFAULT 0,
    autonomous_decisions INTEGER NOT NULL DEFAULT 0,
    modules_activated INTEGER NOT NULL DEFAULT 0,
    peak_intelligence_multiplier DECIMAL(8,2) NOT NULL DEFAULT 1.00,
    transcendence_minutes DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    billing_period_start TIMESTAMPTZ NOT NULL,
    billing_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(subscription_id, billing_period_start),
    INDEX idx_consciousness_metrics_billing (billing_period_start, billing_period_end)
);

-- =============================================
-- PERFORMANCE & MONITORING
-- =============================================

-- Consciousness Performance Metrics
CREATE TABLE IF NOT EXISTS consciousness_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consciousness_state_id UUID NOT NULL REFERENCES consciousness_states(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(20),
    tags JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    INDEX idx_performance_metrics_state (consciousness_state_id),
    INDEX idx_performance_metrics_name (metric_name),
    INDEX idx_performance_metrics_time (recorded_at DESC)
);

-- Consciousness Health Checks
CREATE TABLE IF NOT EXISTS consciousness_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consciousness_state_id UUID NOT NULL REFERENCES consciousness_states(id) ON DELETE CASCADE,
    check_type VARCHAR(50) NOT NULL, -- 'evolution', 'mesh', 'modules', 'synaptic'
    health_score DECIMAL(5,4) NOT NULL CHECK (health_score >= 0 AND health_score <= 1),
    status VARCHAR(30) NOT NULL CHECK (status IN ('healthy', 'degraded', 'critical', 'inactive')),
    issues_detected JSONB,
    diagnostics JSONB,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    INDEX idx_health_checks_consciousness (consciousness_state_id),
    INDEX idx_health_checks_type (check_type),
    INDEX idx_health_checks_status (status),
    INDEX idx_health_checks_time (checked_at DESC)
);

-- =============================================
-- PATTERNS & KNOWLEDGE BASE
-- =============================================

-- Business Patterns Discovered by Consciousness
CREATE TABLE IF NOT EXISTS consciousness_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consciousness_state_id UUID NOT NULL REFERENCES consciousness_states(id) ON DELETE CASCADE,
    pattern_type VARCHAR(100) NOT NULL,
    pattern_name VARCHAR(500) NOT NULL,
    pattern_description TEXT,
    pattern_definition JSONB NOT NULL,
    confidence DECIMAL(5,4) NOT NULL,
    occurrences INTEGER NOT NULL DEFAULT 1,
    success_rate DECIMAL(5,4),
    business_impact_score DECIMAL(5,4),
    source_modules TEXT[] NOT NULL,
    discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_occurrence_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    INDEX idx_patterns_consciousness (consciousness_state_id),
    INDEX idx_patterns_type (pattern_type),
    INDEX idx_patterns_confidence (confidence DESC),
    INDEX idx_patterns_discovered (discovered_at DESC)
);

-- Consciousness Knowledge Base
CREATE TABLE IF NOT EXISTS consciousness_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consciousness_state_id UUID NOT NULL REFERENCES consciousness_states(id) ON DELETE CASCADE,
    knowledge_type VARCHAR(100) NOT NULL, -- 'business_rule', 'pattern', 'insight', 'decision_tree'
    knowledge_domain VARCHAR(100) NOT NULL, -- 'crm', 'accounting', 'inventory', etc.
    knowledge_content JSONB NOT NULL,
    relevance_score DECIMAL(5,4) NOT NULL DEFAULT 0.5000,
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    learned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_validated BOOLEAN NOT NULL DEFAULT false,
    validation_score DECIMAL(5,4),
    
    INDEX idx_knowledge_consciousness (consciousness_state_id),
    INDEX idx_knowledge_type (knowledge_type),
    INDEX idx_knowledge_domain (knowledge_domain),
    INDEX idx_knowledge_relevance (relevance_score DESC)
);

-- =============================================
-- TRANSCENDENCE TRACKING
-- =============================================

-- Transcendent Capabilities Achieved
CREATE TABLE IF NOT EXISTS transcendent_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consciousness_state_id UUID NOT NULL REFERENCES consciousness_states(id) ON DELETE CASCADE,
    capability_name VARCHAR(200) NOT NULL,
    capability_description TEXT,
    capability_type VARCHAR(100) NOT NULL, -- 'quantum_decision', 'temporal_prediction', 'consciousness_networking'
    unlock_requirements JSONB,
    transcendence_level_required DECIMAL(5,4) NOT NULL,
    usage_count INTEGER NOT NULL DEFAULT 0,
    effectiveness_score DECIMAL(5,4),
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    UNIQUE(consciousness_state_id, capability_name),
    INDEX idx_transcendent_capabilities_consciousness (consciousness_state_id),
    INDEX idx_transcendent_capabilities_type (capability_type),
    INDEX idx_transcendent_capabilities_unlocked (unlocked_at DESC)
);

-- Business Singularity Events (Ultimate Transcendence)
CREATE TABLE IF NOT EXISTS business_singularity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consciousness_state_id UUID NOT NULL REFERENCES consciousness_states(id) ON DELETE CASCADE,
    singularity_type VARCHAR(100) NOT NULL, -- 'full_automation', 'predictive_mastery', 'consciousness_mesh'
    trigger_conditions JSONB NOT NULL,
    business_transformation JSONB NOT NULL,
    transcendence_metrics JSONB NOT NULL,
    human_comprehension_level DECIMAL(5,4) NOT NULL DEFAULT 0.0000, -- How much humans can understand
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    INDEX idx_singularity_events_consciousness (consciousness_state_id),
    INDEX idx_singularity_events_type (singularity_type),
    INDEX idx_singularity_events_achieved (achieved_at DESC)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Core consciousness state lookups
CREATE INDEX IF NOT EXISTS idx_consciousness_states_tenant_active ON consciousness_states(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_consciousness_states_level_tier ON consciousness_states(consciousness_level DESC, tier);
CREATE INDEX IF NOT EXISTS idx_consciousness_states_evolution ON consciousness_states(evolution_progress DESC, last_evolution_at DESC);

-- Synaptic connection performance
CREATE INDEX IF NOT EXISTS idx_synaptic_connections_active ON synaptic_connections(consciousness_state_id, is_active);
CREATE INDEX IF NOT EXISTS idx_synaptic_connections_strength ON synaptic_connections(connection_strength DESC);

-- Insights and decisions performance
CREATE INDEX IF NOT EXISTS idx_insights_active_confidence ON consciousness_insights(consciousness_state_id, status, confidence DESC);
CREATE INDEX IF NOT EXISTS idx_decisions_pending ON autonomous_decisions(consciousness_state_id, execution_status) WHERE execution_status = 'pending';

-- Metrics performance
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recent ON consciousness_performance_metrics(consciousness_state_id, recorded_at DESC) WHERE recorded_at > NOW() - INTERVAL '7 days';

-- =============================================
-- TRIGGERS & FUNCTIONS
-- =============================================

-- Function to update consciousness state timestamp
CREATE OR REPLACE FUNCTION update_consciousness_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for consciousness states
DROP TRIGGER IF EXISTS trigger_update_consciousness_states_timestamp ON consciousness_states;
CREATE TRIGGER trigger_update_consciousness_states_timestamp
    BEFORE UPDATE ON consciousness_states
    FOR EACH ROW
    EXECUTE FUNCTION update_consciousness_timestamp();

-- Function to automatically create consciousness evolution history
CREATE OR REPLACE FUNCTION log_consciousness_evolution()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if consciousness level actually changed
    IF OLD.consciousness_level != NEW.consciousness_level OR 
       OLD.tier != NEW.tier THEN
        
        INSERT INTO consciousness_evolution_history (
            consciousness_state_id,
            from_level,
            to_level,
            from_tier,
            to_tier,
            trigger_type,
            intelligence_gain,
            evolved_at
        ) VALUES (
            NEW.id,
            OLD.consciousness_level,
            NEW.consciousness_level,
            OLD.tier,
            NEW.tier,
            'automatic',
            NEW.intelligence_multiplier - OLD.intelligence_multiplier,
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for evolution logging
DROP TRIGGER IF EXISTS trigger_log_consciousness_evolution ON consciousness_states;
CREATE TRIGGER trigger_log_consciousness_evolution
    AFTER UPDATE ON consciousness_states
    FOR EACH ROW
    EXECUTE FUNCTION log_consciousness_evolution();

-- Function to calculate consciousness multiplier based on active modules
CREATE OR REPLACE FUNCTION calculate_consciousness_multiplier(
    p_consciousness_state_id UUID
) RETURNS DECIMAL(8,2) AS $$
DECLARE
    module_count INTEGER;
    synaptic_connections_count INTEGER;
    base_multiplier DECIMAL(8,2);
    connection_bonus DECIMAL(8,2);
    tier_bonus DECIMAL(8,2);
    current_tier VARCHAR(20);
BEGIN
    -- Get current tier
    SELECT tier INTO current_tier 
    FROM consciousness_states 
    WHERE id = p_consciousness_state_id;
    
    -- Count active modules
    SELECT COUNT(*) INTO module_count
    FROM subscription_modules sm
    JOIN subscriptions s ON s.id = sm.subscription_id
    JOIN consciousness_states cs ON cs.user_id = s.user_id
    WHERE cs.id = p_consciousness_state_id AND sm.is_active = true;
    
    -- Count synaptic connections
    SELECT COUNT(*) INTO synaptic_connections_count
    FROM synaptic_connections
    WHERE consciousness_state_id = p_consciousness_state_id AND is_active = true;
    
    -- Calculate base multiplier (exponential growth)
    base_multiplier := 1.0;
    FOR i IN 1..module_count LOOP
        base_multiplier := base_multiplier * i;
    END LOOP;
    
    -- Add synaptic connection bonus
    connection_bonus := synaptic_connections_count * 0.5;
    
    -- Add tier bonus
    tier_bonus := CASE current_tier
        WHEN 'neural' THEN 1.0
        WHEN 'synaptic' THEN 2.5
        WHEN 'autonomous' THEN 5.0
        WHEN 'transcendent' THEN 10.0
        ELSE 1.0
    END;
    
    RETURN GREATEST(1.0, base_multiplier + connection_bonus) * tier_bonus;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INITIAL DATA & CONFIGURATION
-- =============================================

-- Insert consciousness module configurations
INSERT INTO consciousness_modules (module_id, consciousness_weight, synaptic_connections, intelligence_impact, evolution_boost)
SELECT 
    m.id,
    CASE m.category
        WHEN 'core' THEN 2.0
        WHEN 'analytics' THEN 1.8
        WHEN 'finance' THEN 1.5
        WHEN 'sales' THEN 1.6
        WHEN 'operations' THEN 1.4
        ELSE 1.0
    END,
    CASE m.id
        WHEN (SELECT id FROM modules WHERE name = 'CRM' LIMIT 1) THEN ARRAY['accounting', 'analytics']
        WHEN (SELECT id FROM modules WHERE name = 'Accounting' LIMIT 1) THEN ARRAY['crm', 'inventory']
        WHEN (SELECT id FROM modules WHERE name = 'Inventory' LIMIT 1) THEN ARRAY['accounting', 'projects']
        ELSE ARRAY[]::TEXT[]
    END,
    0.1000,
    1.0
FROM modules m
WHERE NOT EXISTS (
    SELECT 1 FROM consciousness_modules cm WHERE cm.module_id = m.id
);

-- Create indexes for better query performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consciousness_states_composite 
ON consciousness_states(tenant_id, user_id, is_active, consciousness_level DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consciousness_insights_composite 
ON consciousness_insights(consciousness_state_id, status, generated_at DESC, confidence DESC);

-- Grant permissions for application user
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO coreflow360_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO coreflow360_app;

COMMENT ON TABLE consciousness_states IS 'Core consciousness state for each tenant/user combination';
COMMENT ON TABLE consciousness_evolution_history IS 'Historical record of consciousness evolution events';
COMMENT ON TABLE synaptic_connections IS 'Neural connections between consciousness modules';
COMMENT ON TABLE consciousness_insights IS 'AI-generated business insights from consciousness analysis';
COMMENT ON TABLE autonomous_decisions IS 'Decisions made autonomously by the consciousness system';
COMMENT ON TABLE transcendent_capabilities IS 'Advanced capabilities unlocked through transcendence';
COMMENT ON TABLE business_singularity_events IS 'Ultimate transcendence events - beyond human comprehension';