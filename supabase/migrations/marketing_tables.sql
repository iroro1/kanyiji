-- Marketing module tables
-- Run in Supabase SQL Editor if not using migration runner

-- Groups (audience segments)
create table if not exists public.marketing_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  created_at timestamptz default now()
);

-- Group members
create table if not exists public.marketing_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.marketing_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(group_id, user_id)
);

create index if not exists idx_marketing_group_members_group on public.marketing_group_members(group_id);
create index if not exists idx_marketing_group_members_user on public.marketing_group_members(user_id);

-- Campaigns
create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  content text,
  sender_name text default 'Kanyiji',
  sender_email text default 'hello@kanyiji.ng',
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'sent')),
  created_at timestamptz default now(),
  sent_at timestamptz
);

-- Recipients per campaign (for history and tracking)
create table if not exists public.marketing_campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.marketing_campaigns(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  status text default 'pending' check (status in ('pending', 'sent', 'failed', 'delivered')),
  opened boolean default false,
  clicked boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_marketing_campaign_recipients_campaign on public.marketing_campaign_recipients(campaign_id);

-- RLS: Backend API uses service role (bypasses RLS). These policies apply only if anon/authenticated access is used.
alter table public.marketing_groups enable row level security;
alter table public.marketing_group_members enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.marketing_campaign_recipients enable row level security;

-- Drop existing policies so this migration can be re-run safely
drop policy if exists "marketing_groups_all" on public.marketing_groups;
drop policy if exists "marketing_group_members_all" on public.marketing_group_members;
drop policy if exists "marketing_campaigns_all" on public.marketing_campaigns;
drop policy if exists "marketing_campaign_recipients_all" on public.marketing_campaign_recipients;
drop policy if exists "Service role marketing_groups" on public.marketing_groups;
drop policy if exists "Service role marketing_group_members" on public.marketing_group_members;
drop policy if exists "Service role marketing_campaigns" on public.marketing_campaigns;
drop policy if exists "Service role marketing_campaign_recipients" on public.marketing_campaign_recipients;

-- Allow full access (API uses service role; these apply when using anon key)
create policy "marketing_groups_all" on public.marketing_groups for all using (true) with check (true);
create policy "marketing_group_members_all" on public.marketing_group_members for all using (true) with check (true);
create policy "marketing_campaigns_all" on public.marketing_campaigns for all using (true) with check (true);
create policy "marketing_campaign_recipients_all" on public.marketing_campaign_recipients for all using (true) with check (true);
