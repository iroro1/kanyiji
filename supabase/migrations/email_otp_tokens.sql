-- Run this in Supabase SQL Editor if verification OTP emails are not sending.
-- The send-verification-email API stores tokens in this table.

create table if not exists public.email_otp_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text not null,
  type text not null check (type in ('verification', 'password_reset')),
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists idx_email_otp_tokens_email_type
  on public.email_otp_tokens (email, type);

create index if not exists idx_email_otp_tokens_expires
  on public.email_otp_tokens (expires_at);

-- Allow service role / API to manage rows (RLS can be added later if needed)
alter table public.email_otp_tokens enable row level security;

create policy "Service role can manage email_otp_tokens"
  on public.email_otp_tokens
  for all
  using (true)
  with check (true);
