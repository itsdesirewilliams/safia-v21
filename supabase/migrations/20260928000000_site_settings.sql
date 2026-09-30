-- ===========================================================================
-- Site settings: public website configuration managed by Admins
-- ===========================================================================
--
-- A tiny key/value store for site-wide settings. The first setting is the
-- active public website theme (`key = 'theme'`, `value = {"active":"…"}`).
--
-- Public reads (the public site must read the active theme for every visitor);
-- writes are restricted to Admins only, enforced in RLS. The public site reads
-- this through a tagged cache, so changing the value does not require a rebuild
-- or redeploy.
--
-- Idempotent: safe to re-run.
--   npx supabase db query --linked --file supabase/migrations/20260928000000_site_settings.sql
-- (or `supabase migration up` on a tracked project).

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

-- Everyone may read settings (they hold no secrets).
drop policy if exists "site settings are public read" on public.site_settings;
create policy "site settings are public read"
  on public.site_settings for select using (true);

-- Only full Admins may create/update/delete settings.
drop policy if exists "site settings are admin write" on public.site_settings;
create policy "site settings are admin write"
  on public.site_settings for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Default the active theme to the existing baseline (Theme 1).
insert into public.site_settings (key, value)
values ('theme', '{"active":"classic"}'::jsonb)
on conflict (key) do nothing;
