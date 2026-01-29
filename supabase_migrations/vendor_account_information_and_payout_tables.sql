-- =============================================================================
-- Vendor account information + Payout / Statement tables
-- Run in Supabase SQL Editor for: vendor account info field, payouts & statement
-- =============================================================================

-- 1. Vendor account information (for signup, profile, admin)
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS account_information TEXT;

-- 2. Vendor earnings (per-order or aggregated; used for statement & balance)
CREATE TABLE IF NOT EXISTS vendor_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  gross_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'paid')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_earnings_vendor_id ON vendor_earnings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_earnings_status ON vendor_earnings(status);
CREATE INDEX IF NOT EXISTS idx_vendor_earnings_created_at ON vendor_earnings(created_at DESC);

-- 3. Vendor payouts (requested payouts; admin can mark as completed)
CREATE TABLE IF NOT EXISTS vendor_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  payment_method TEXT DEFAULT 'bank_transfer',
  payment_details JSONB DEFAULT '{}',
  reference TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_payouts_vendor_id ON vendor_payouts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payouts_status ON vendor_payouts(status);
CREATE INDEX IF NOT EXISTS idx_vendor_payouts_created_at ON vendor_payouts(created_at DESC);

-- 4. Vendor bank accounts (for receiving payouts)
CREATE TABLE IF NOT EXISTS vendor_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  bank_code TEXT,
  account_type TEXT DEFAULT 'savings',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_bank_accounts_vendor_id ON vendor_bank_accounts(vendor_id);

-- RLS (optional but recommended): allow vendors to read/update only their own rows
-- Uncomment and adjust if your project uses RLS on these tables.

-- ALTER TABLE vendor_earnings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vendor_payouts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vendor_bank_accounts ENABLE ROW LEVEL SECURITY;

-- Example policy (vendor can only see own earnings):
-- CREATE POLICY "Vendors can read own earnings" ON vendor_earnings
--   FOR SELECT USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Your app currently uses the service role key for payouts API, so RLS may be bypassed.
-- If you switch to anon key for vendor dashboard, add policies so vendor_id matches the authenticated vendor.
