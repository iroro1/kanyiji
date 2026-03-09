-- Run this in Supabase SQL Editor if marketing tables exist but group delete (or other ops) fail.
-- This drops and recreates RLS policies so DELETE/INSERT/SELECT work when the API uses anon key fallback.

-- Groups
alter table public.marketing_groups enable row level security;
drop policy if exists "marketing_groups_all" on public.marketing_groups;
drop policy if exists "Service role marketing_groups" on public.marketing_groups;
create policy "marketing_groups_all" on public.marketing_groups for all using (true) with check (true);

-- Group members
alter table public.marketing_group_members enable row level security;
drop policy if exists "marketing_group_members_all" on public.marketing_group_members;
drop policy if exists "Service role marketing_group_members" on public.marketing_group_members;
create policy "marketing_group_members_all" on public.marketing_group_members for all using (true) with check (true);

-- Campaigns
alter table public.marketing_campaigns enable row level security;
drop policy if exists "marketing_campaigns_all" on public.marketing_campaigns;
drop policy if exists "Service role marketing_campaigns" on public.marketing_campaigns;
create policy "marketing_campaigns_all" on public.marketing_campaigns for all using (true) with check (true);

-- Campaign recipients
alter table public.marketing_campaign_recipients enable row level security;
drop policy if exists "marketing_campaign_recipients_all" on public.marketing_campaign_recipients;
drop policy if exists "Service role marketing_campaign_recipients" on public.marketing_campaign_recipients;
create policy "marketing_campaign_recipients_all" on public.marketing_campaign_recipients for all using (true) with check (true);
