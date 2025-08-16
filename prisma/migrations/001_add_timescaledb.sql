-- PHASE 2.1: Add TimescaleDB Extension and Time-Series Tables
-- 
-- This migration adds TimescaleDB without breaking existing functionality
-- Run this AFTER your existing database is working

-- STEP 1: Add TimescaleDB extension (safe, doesn't affect existing tables)
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- STEP 2: Create new time-series tables alongside existing ones
-- Enhanced calls table with time-series optimization
CREATE TABLE calls_ts (
  -- Core fields (copy from your existing calls table structure)
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL,
  phone_number          VARCHAR(20) NOT NULL,
  customer_name         VARCHAR(255),
  status                VARCHAR(50) NOT NULL DEFAULT 'initiated',
  outcome               VARCHAR(100),
  duration_seconds      INTEGER DEFAULT 0,
  qualification_score   INTEGER CHECK (qualification_score BETWEEN 1 AND 10),
  ai_handled           BOOLEAN DEFAULT true,
  
  -- NEW: Enhanced fields for better analytics
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider              TEXT NOT NULL DEFAULT 'twilio',
  latency_ms            INTEGER,
  asr                   BOOLEAN DEFAULT NULL, -- Answer Success Rate
  acd_ms                INTEGER, -- Average Call Duration in ms
  pdd_ms                INTEGER, -- Post Dial Delay in ms
  mos_score             DECIMAL(3,2), -- Mean Opinion Score (1.0-5.0)
  
  -- NEW: Cost tracking with precision
  cost_breakdown        JSONB DEFAULT '{}'::jsonb,
  cost_total            DECIMAL(10,4) GENERATED ALWAYS AS (
    (SELECT COALESCE(SUM((value::text)::decimal), 0) 
     FROM jsonb_each_text(cost_breakdown))
  ) STORED,
  
  -- NEW: Search optimization
  search_vector         tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(phone_number, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(customer_name, '')), 'B')
  ) STORED,
  
  -- NEW: Enhanced metadata
  metadata              JSONB DEFAULT '{}'::jsonb,
  vapi_call_id         VARCHAR(100),
  twilio_call_id       VARCHAR(100),
  assistant_id         VARCHAR(100),
  system_prompt_version VARCHAR(50),
  
  -- Performance tracking
  first_response_latency INTEGER, -- Time to first AI response
  avg_response_time     INTEGER, -- Average AI response time
  interruption_count    INTEGER DEFAULT 0,
  ai_confidence_avg     DECIMAL(5,4), -- Average AI confidence
  transcription_accuracy DECIMAL(5,4), -- Transcription accuracy score
  
  CONSTRAINT fk_calls_ts_tenant FOREIGN KEY (tenant_id) REFERENCES "Tenant" (id)
);

-- Convert to hypertable for time-series superpowers
SELECT create_hypertable('calls_ts', 'created_at', 
  chunk_time_interval => INTERVAL '1 day',
  if_not_exists => TRUE
);

-- STEP 3: Create call_events table for granular tracking
CREATE TABLE call_events (
  time                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  call_id               UUID NOT NULL,
  tenant_id             UUID NOT NULL,
  event_type            TEXT NOT NULL,
  event_data            JSONB NOT NULL,
  
  -- Specific event fields for fast queries (generated columns)
  speaker               TEXT GENERATED ALWAYS AS (event_data->>'speaker') STORED,
  text                  TEXT GENERATED ALWAYS AS (event_data->>'text') STORED,
  confidence            DECIMAL(5,4) GENERATED ALWAYS AS ((event_data->>'confidence')::decimal) STORED,
  duration_ms           INTEGER GENERATED ALWAYS AS ((event_data->>'duration_ms')::integer) STORED,
  sentiment             TEXT GENERATED ALWAYS AS (event_data->>'sentiment') STORED,
  
  CONSTRAINT fk_call_events_tenant FOREIGN KEY (tenant_id) REFERENCES "Tenant" (id)
);

-- Convert call_events to hypertable with hourly chunks
SELECT create_hypertable('call_events', 'time',
  chunk_time_interval => INTERVAL '1 hour',
  if_not_exists => TRUE
);

-- STEP 4: Create performance metrics table
CREATE TABLE call_performance_metrics (
  time                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  call_id               UUID NOT NULL,
  tenant_id             UUID NOT NULL,
  metric_name           TEXT NOT NULL,
  metric_value          DECIMAL(10,4) NOT NULL,
  metric_unit          TEXT NOT NULL, -- 'ms', 'count', 'percentage', 'currency'
  tags                 JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT fk_perf_metrics_tenant FOREIGN KEY (tenant_id) REFERENCES "Tenant" (id)
);

SELECT create_hypertable('call_performance_metrics', 'time',
  chunk_time_interval => INTERVAL '1 hour',
  if_not_exists => TRUE
);

-- STEP 5: Create system health metrics table
CREATE TABLE system_health_metrics (
  time                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metric_name           TEXT NOT NULL,
  metric_value          DECIMAL(10,4) NOT NULL,
  region               TEXT DEFAULT 'default',
  instance_id          TEXT DEFAULT 'default',
  tags                 JSONB DEFAULT '{}'::jsonb
);

SELECT create_hypertable('system_health_metrics', 'time',
  chunk_time_interval => INTERVAL '5 minutes',
  if_not_exists => TRUE
);

-- STEP 6: Create indexes for lightning-fast queries
-- These don't block reads, safe for production
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_ts_tenant_time 
  ON calls_ts (tenant_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_ts_phone 
  ON calls_ts (phone_number, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_ts_provider_status
  ON calls_ts (provider, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_ts_outcome
  ON calls_ts (outcome, created_at DESC)
  WHERE outcome IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_ts_cost 
  ON calls_ts (cost_total, created_at DESC) 
  WHERE cost_total > 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_ts_search 
  ON calls_ts USING GIN (search_vector);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_ts_qualification
  ON calls_ts (qualification_score, created_at DESC)
  WHERE qualification_score IS NOT NULL;

-- Call events indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_call_time 
  ON call_events (call_id, time DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_tenant_type_time 
  ON call_events (tenant_id, event_type, time DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_speaker_time
  ON call_events (speaker, time DESC)
  WHERE speaker IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_confidence
  ON call_events (confidence, time DESC)
  WHERE confidence IS NOT NULL;

-- Performance metrics indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_perf_metrics_call_metric
  ON call_performance_metrics (call_id, metric_name, time DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_perf_metrics_tenant_metric_time
  ON call_performance_metrics (tenant_id, metric_name, time DESC);

-- System health metrics indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_health_metric_time
  ON system_health_metrics (metric_name, time DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_health_region_time
  ON system_health_metrics (region, time DESC);

-- STEP 7: Add compression for old data (saves 90%+ storage)
ALTER TABLE calls_ts SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'tenant_id',
  timescaledb.compress_orderby = 'created_at DESC'
);

ALTER TABLE call_events SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'tenant_id, event_type',
  timescaledb.compress_orderby = 'time DESC'
);

ALTER TABLE call_performance_metrics SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'tenant_id, metric_name',
  timescaledb.compress_orderby = 'time DESC'
);

ALTER TABLE system_health_metrics SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'region, metric_name',
  timescaledb.compress_orderby = 'time DESC'
);

-- STEP 8: Add compression policies (compress data older than 7 days)
SELECT add_compression_policy('calls_ts', 
  compress_after => INTERVAL '7 days',
  if_not_exists => TRUE
);

SELECT add_compression_policy('call_events', 
  compress_after => INTERVAL '3 days',
  if_not_exists => TRUE
);

SELECT add_compression_policy('call_performance_metrics', 
  compress_after => INTERVAL '7 days',
  if_not_exists => TRUE
);

SELECT add_compression_policy('system_health_metrics', 
  compress_after => INTERVAL '1 day',
  if_not_exists => TRUE
);

-- STEP 9: Retention policies for automatic data management
SELECT add_retention_policy('call_events', 
  drop_after => INTERVAL '1 year',
  if_not_exists => TRUE
);

SELECT add_retention_policy('call_performance_metrics', 
  drop_after => INTERVAL '2 years',
  if_not_exists => TRUE
);

SELECT add_retention_policy('system_health_metrics', 
  drop_after => INTERVAL '6 months',
  if_not_exists => TRUE
);

-- Keep calls_ts forever (or set to 7 years for compliance)
-- SELECT add_retention_policy('calls_ts', drop_after => INTERVAL '7 years');

-- STEP 10: Create materialized views for common queries
-- These views will be automatically maintained by TimescaleDB

-- Daily call summary view
CREATE MATERIALIZED VIEW daily_call_summary
WITH (timescaledb.continuous) AS
SELECT 
  time_bucket('1 day', created_at) AS day,
  tenant_id,
  provider,
  COUNT(*) as total_calls,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_calls,
  COUNT(*) FILTER (WHERE asr = true) as answered_calls,
  COUNT(*) FILTER (WHERE outcome = 'qualified') as qualified_calls,
  COUNT(*) FILTER (WHERE outcome = 'appointment') as appointments,
  
  -- Performance metrics
  AVG(latency_ms) FILTER (WHERE latency_ms IS NOT NULL) as avg_latency_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency_ms,
  AVG(duration_seconds) FILTER (WHERE duration_seconds > 0) as avg_duration_seconds,
  
  -- Business metrics
  SUM(cost_total) as total_cost,
  COUNT(DISTINCT phone_number) as unique_callers,
  AVG(qualification_score) FILTER (WHERE qualification_score IS NOT NULL) as avg_qualification_score,
  
  -- AI metrics
  AVG(ai_confidence_avg) FILTER (WHERE ai_confidence_avg IS NOT NULL) as avg_ai_confidence,
  AVG(transcription_accuracy) FILTER (WHERE transcription_accuracy IS NOT NULL) as avg_transcription_accuracy
FROM calls_ts
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY day, tenant_id, provider
WITH NO DATA;

-- Refresh policy for daily summary (refresh every hour)
SELECT add_continuous_aggregate_policy('daily_call_summary',
  start_offset => INTERVAL '2 days',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour',
  if_not_exists => TRUE
);

-- Real-time metrics view (5-minute buckets)
CREATE MATERIALIZED VIEW realtime_call_metrics
WITH (timescaledb.continuous) AS
SELECT 
  time_bucket('5 minutes', created_at) AS bucket,
  tenant_id,
  provider,
  
  -- Call volume metrics
  COUNT(*) as call_count,
  COUNT(*) FILTER (WHERE asr = true) as answered_count,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
  
  -- Performance metrics
  AVG(latency_ms) FILTER (WHERE latency_ms IS NOT NULL) as avg_latency,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) as p99_latency,
  
  -- Business metrics
  SUM(cost_total) as total_cost,
  COUNT(*) FILTER (WHERE outcome = 'qualified') as qualified_count,
  COUNT(*) FILTER (WHERE outcome = 'appointment') as appointment_count
  
FROM calls_ts
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY bucket, tenant_id, provider
WITH NO DATA;

-- Refresh policy for real-time metrics (refresh every minute)
SELECT add_continuous_aggregate_policy('realtime_call_metrics',
  start_offset => INTERVAL '10 minutes',
  end_offset => INTERVAL '1 minute',
  schedule_interval => INTERVAL '1 minute',
  if_not_exists => TRUE
);

-- STEP 11: Create helper functions for common queries
CREATE OR REPLACE FUNCTION get_call_metrics(
  p_tenant_id UUID,
  p_start_time TIMESTAMPTZ DEFAULT NOW() - INTERVAL '24 hours',
  p_end_time TIMESTAMPTZ DEFAULT NOW()
) RETURNS TABLE (
  total_calls BIGINT,
  answered_calls BIGINT,
  answer_rate DECIMAL,
  avg_duration_seconds DECIMAL,
  total_cost DECIMAL,
  cost_per_call DECIMAL,
  unique_callers BIGINT,
  conversion_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_calls,
    COUNT(*) FILTER (WHERE asr = true)::BIGINT as answered_calls,
    ROUND(
      COUNT(*) FILTER (WHERE asr = true)::DECIMAL / 
      NULLIF(COUNT(*), 0) * 100, 2
    ) as answer_rate,
    ROUND(AVG(acd_ms) / 1000.0, 2) as avg_duration_seconds,
    ROUND(SUM(cost_total), 4) as total_cost,
    ROUND(
      SUM(cost_total) / NULLIF(COUNT(*), 0), 4
    ) as cost_per_call,
    COUNT(DISTINCT phone_number)::BIGINT as unique_callers,
    ROUND(
      COUNT(*) FILTER (WHERE outcome = 'appointment')::DECIMAL /
      NULLIF(COUNT(*), 0) * 100, 2
    ) as conversion_rate
  FROM calls_ts
  WHERE tenant_id = p_tenant_id
    AND created_at BETWEEN p_start_time AND p_end_time;
END;
$$ LANGUAGE plpgsql;

-- Function to get performance percentiles
CREATE OR REPLACE FUNCTION get_latency_percentiles(
  p_tenant_id UUID,
  p_hours_back INTEGER DEFAULT 24
) RETURNS TABLE (
  p50 DECIMAL,
  p95 DECIMAL,
  p99 DECIMAL,
  max_latency INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms), 2) as p50,
    ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms), 2) as p95,
    ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms), 2) as p99,
    MAX(latency_ms) as max_latency
  FROM calls_ts
  WHERE tenant_id = p_tenant_id
    AND latency_ms IS NOT NULL
    AND created_at > NOW() - (p_hours_back || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Function for real-time dashboard data
CREATE OR REPLACE FUNCTION get_realtime_dashboard(
  p_tenant_id UUID
) RETURNS TABLE (
  active_calls BIGINT,
  calls_last_hour BIGINT,
  revenue_last_hour DECIMAL,
  avg_latency_5min DECIMAL,
  conversion_rate_today DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE status = 'active') as active_calls,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as calls_last_hour,
      SUM(cost_total) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as revenue_last_hour,
      AVG(latency_ms) FILTER (WHERE created_at > NOW() - INTERVAL '5 minutes') as avg_latency_5min,
      COUNT(*) FILTER (WHERE outcome = 'appointment' AND created_at::DATE = CURRENT_DATE)::DECIMAL /
        NULLIF(COUNT(*) FILTER (WHERE created_at::DATE = CURRENT_DATE), 0) * 100 as conversion_rate_today
    FROM calls_ts
    WHERE tenant_id = p_tenant_id
  )
  SELECT 
    s.active_calls::BIGINT,
    s.calls_last_hour::BIGINT,
    ROUND(COALESCE(s.revenue_last_hour, 0), 2),
    ROUND(COALESCE(s.avg_latency_5min, 0), 2),
    ROUND(COALESCE(s.conversion_rate_today, 0), 2)
  FROM stats s;
END;
$$ LANGUAGE plpgsql;

-- STEP 12: Create triggers for automatic event logging
CREATE OR REPLACE FUNCTION log_call_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes to call_events
  IF OLD.status != NEW.status THEN
    INSERT INTO call_events (time, call_id, tenant_id, event_type, event_data)
    VALUES (
      NOW(),
      NEW.id,
      NEW.tenant_id,
      'status_change',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'duration_ms', EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) * 1000
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status changes
CREATE TRIGGER trigger_log_call_status_change
  AFTER UPDATE ON calls_ts
  FOR EACH ROW
  EXECUTE FUNCTION log_call_status_change();

-- STEP 13: Create views for easier querying
CREATE VIEW v_call_summary AS
SELECT 
  c.id,
  c.tenant_id,
  c.phone_number,
  c.customer_name,
  c.status,
  c.outcome,
  c.provider,
  c.created_at,
  c.duration_seconds,
  c.cost_total,
  c.qualification_score,
  c.latency_ms,
  c.ai_confidence_avg,
  
  -- Calculated fields
  CASE 
    WHEN c.created_at > NOW() - INTERVAL '24 hours' THEN 'today'
    WHEN c.created_at > NOW() - INTERVAL '7 days' THEN 'this_week'
    WHEN c.created_at > NOW() - INTERVAL '30 days' THEN 'this_month'
    ELSE 'older'
  END as recency,
  
  CASE 
    WHEN c.qualification_score >= 8 THEN 'hot'
    WHEN c.qualification_score >= 6 THEN 'warm'
    WHEN c.qualification_score >= 4 THEN 'cool'
    ELSE 'cold'
  END as lead_temperature,
  
  -- ROI calculation
  CASE 
    WHEN c.cost_total > 0 AND c.outcome = 'appointment' THEN
      ROUND(((250.0 - c.cost_total) / c.cost_total) * 100, 2) -- Assume $250 avg job value
    ELSE 0
  END as roi_percentage

FROM calls_ts c;

-- Performance monitoring view
CREATE VIEW v_performance_dashboard AS
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  provider,
  COUNT(*) as total_calls,
  AVG(latency_ms) as avg_latency,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency,
  SUM(cost_total) as total_cost,
  COUNT(*) FILTER (WHERE outcome = 'appointment') as appointments,
  ROUND(
    COUNT(*) FILTER (WHERE outcome = 'appointment')::DECIMAL / 
    NULLIF(COUNT(*), 0) * 100, 2
  ) as conversion_rate
FROM calls_ts
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at), provider
ORDER BY hour DESC;

COMMENT ON EXTENSION timescaledb IS 'TimescaleDB extension for time-series data';
COMMENT ON TABLE calls_ts IS 'Enhanced calls table with TimescaleDB time-series optimization';
COMMENT ON TABLE call_events IS 'Granular call events for detailed analytics';
COMMENT ON TABLE call_performance_metrics IS 'Performance metrics time-series data';
COMMENT ON MATERIALIZED VIEW daily_call_summary IS 'Daily aggregated call metrics';
COMMENT ON MATERIALIZED VIEW realtime_call_metrics IS 'Real-time call metrics (5-minute buckets)';

-- Grant permissions (adjust for your user roles)
GRANT SELECT, INSERT, UPDATE ON calls_ts TO PUBLIC;
GRANT SELECT, INSERT ON call_events TO PUBLIC;
GRANT SELECT, INSERT ON call_performance_metrics TO PUBLIC;
GRANT SELECT ON daily_call_summary TO PUBLIC;
GRANT SELECT ON realtime_call_metrics TO PUBLIC;
GRANT SELECT ON v_call_summary TO PUBLIC;
GRANT SELECT ON v_performance_dashboard TO PUBLIC;