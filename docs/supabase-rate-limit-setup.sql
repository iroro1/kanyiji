-- Create rate limiting table for tracking email attempts
-- This table stores rate limit information server-side

CREATE TABLE IF NOT EXISTS email_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- email address or IP address
  action_type TEXT NOT NULL, -- 'signup' or 'resend'
  attempt_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  window_duration INTERVAL DEFAULT INTERVAL '1 hour',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint on identifier + action_type + window
  UNIQUE(identifier, action_type, window_start)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_rate_limits_lookup 
ON email_rate_limits(identifier, action_type, window_start);

-- Index for cleanup of old entries
CREATE INDEX IF NOT EXISTS idx_email_rate_limits_cleanup 
ON email_rate_limits(window_start);

-- Function to check and update rate limit
CREATE OR REPLACE FUNCTION check_email_rate_limit(
  p_identifier TEXT,
  p_action_type TEXT,
  p_max_attempts INTEGER DEFAULT 3,
  p_window_duration INTERVAL DEFAULT INTERVAL '1 hour'
)
RETURNS JSONB AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_current_count INTEGER;
  v_is_limited BOOLEAN;
  v_time_until_reset INTERVAL;
BEGIN
  -- Calculate window start (current hour)
  v_window_start := date_trunc('hour', NOW());
  
  -- Try to get or create rate limit entry
  INSERT INTO email_rate_limits (identifier, action_type, attempt_count, window_start, window_duration)
  VALUES (p_identifier, p_action_type, 1, v_window_start, p_window_duration)
  ON CONFLICT (identifier, action_type, window_start)
  DO UPDATE SET
    attempt_count = email_rate_limits.attempt_count + 1,
    updated_at = NOW()
  RETURNING attempt_count INTO v_current_count;
  
  -- Check if rate limit exceeded
  v_is_limited := v_current_count > p_max_attempts;
  
  -- Calculate time until reset
  v_time_until_reset := (v_window_start + p_window_duration) - NOW();
  
  -- Return result
  RETURN jsonb_build_object(
    'is_limited', v_is_limited,
    'attempt_count', v_current_count,
    'max_attempts', p_max_attempts,
    'time_until_reset_ms', EXTRACT(EPOCH FROM GREATEST(v_time_until_reset, INTERVAL '0')) * 1000,
    'window_start', v_window_start
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old rate limit entries (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM email_rate_limits
  WHERE window_start + window_duration < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions (adjust based on your RLS policies)
-- Allow authenticated users to check rate limits
ALTER TABLE email_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to manage rate limits
CREATE POLICY "Service role can manage rate limits"
ON email_rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Allow anonymous users to check rate limits (for signup)
CREATE POLICY "Anonymous can check rate limits"
ON email_rate_limits
FOR SELECT
TO anon
USING (true);

-- Note: INSERT/UPDATE should be done via the function which uses SECURITY DEFINER

-- Create a scheduled job to clean up old entries (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-rate-limits', '0 * * * *', 'SELECT cleanup_old_rate_limits();');

