-- Create OTP tokens table for email verification and password reset
-- This table stores OTP tokens that are sent via Resend

CREATE TABLE IF NOT EXISTS email_otp_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('verification', 'password_reset')),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index for lookups
  UNIQUE(email, token, type, used)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_otp_tokens_lookup 
ON email_otp_tokens(email, token, type, used, expires_at);

-- Index for cleanup
CREATE INDEX IF NOT EXISTS idx_email_otp_tokens_cleanup 
ON email_otp_tokens(expires_at);

-- Function to verify OTP token
CREATE OR REPLACE FUNCTION verify_email_otp(
  p_email TEXT,
  p_token TEXT,
  p_type TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_token_record RECORD;
BEGIN
  -- Find valid token
  SELECT * INTO v_token_record
  FROM email_otp_tokens
  WHERE email = p_email
    AND token = p_token
    AND type = p_type
    AND used = FALSE
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If token not found or expired
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid or expired token'
    );
  END IF;
  
  -- Mark token as used
  UPDATE email_otp_tokens
  SET used = TRUE
  WHERE id = v_token_record.id;
  
  RETURN jsonb_build_object(
    'valid', true,
    'email', v_token_record.email,
    'type', v_token_record.type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_otp_tokens()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM email_otp_tokens
  WHERE expires_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE email_otp_tokens ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage tokens
CREATE POLICY "Service role can manage OTP tokens"
ON email_otp_tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow anonymous to insert tokens (for signup)
CREATE POLICY "Anonymous can create OTP tokens"
ON email_otp_tokens
FOR INSERT
TO anon
WITH CHECK (true);

