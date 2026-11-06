-- Tubes & Flaps catalogue extension.
--
-- The existing Category → Pattern → Variant schema cannot express reusable valve
-- products shared by several applications, or the separate Flaps family that has
-- no valve association. This migration adds the smallest dedicated extension:
-- applications, valves, a many-to-many application/valve link, tube variants and
-- flap variants. It does not alter the existing tyre tables.

create table if not exists public.tube_applications (
  slug text primary key,
  name text not null,
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tube_valves (
  code text primary key,
  aliases text[] not null default '{}',
  source_texts text[] not null default '{}',
  image_path text,
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tube_valve_applications (
  application_slug text not null references public.tube_applications (slug) on delete cascade,
  valve_code text not null references public.tube_valves (code) on delete cascade,
  display_order integer not null default 0,
  primary key (application_slug, valve_code)
);

create table if not exists public.tube_variants (
  id uuid primary key default gen_random_uuid(),
  valve_code text not null references public.tube_valves (code) on delete cascade,
  application_slug text not null references public.tube_applications (slug) on delete cascade,
  original_size text not null,
  -- Lower-case alphanumeric search key; original_size is always displayed.
  normalized_size text not null,
  source_valve_text text,
  source_table text,
  source_row integer,
  verification_status text not null default 'verified'
    check (verification_status in ('verified', 'needs_review', 'unreadable')),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (valve_code, application_slug, original_size, source_row)
);

create table if not exists public.flap_variants (
  id uuid primary key default gen_random_uuid(),
  original_size text not null,
  normalized_size text not null,
  source_table text,
  source_row integer,
  verification_status text not null default 'verified'
    check (verification_status in ('verified', 'needs_review', 'unreadable')),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (original_size, source_row)
);

create index if not exists tube_valves_active_idx
  on public.tube_valves (is_active, display_order);
create index if not exists tube_valve_applications_valve_idx
  on public.tube_valve_applications (valve_code, display_order);
create index if not exists tube_variants_valve_idx
  on public.tube_variants (valve_code, display_order);
create index if not exists tube_variants_application_idx
  on public.tube_variants (application_slug, display_order);
create index if not exists tube_variants_normalized_idx
  on public.tube_variants (normalized_size);
create index if not exists flap_variants_normalized_idx
  on public.flap_variants (normalized_size);
create index if not exists flap_variants_active_idx
  on public.flap_variants (is_active, display_order);

alter table public.tube_applications enable row level security;
alter table public.tube_valves enable row level security;
alter table public.tube_valve_applications enable row level security;
alter table public.tube_variants enable row level security;
alter table public.flap_variants enable row level security;

grant select on public.tube_applications, public.tube_valves,
  public.tube_valve_applications, public.tube_variants, public.flap_variants
  to anon, authenticated;
grant insert, update, delete on public.tube_applications, public.tube_valves,
  public.tube_valve_applications, public.tube_variants, public.flap_variants
  to authenticated;

drop policy if exists "tube applications public read" on public.tube_applications;
create policy "tube applications public read"
  on public.tube_applications for select
  using (is_active);

drop policy if exists "tube applications manager write" on public.tube_applications;
create policy "tube applications manager write"
  on public.tube_applications for all to authenticated
  using (public.current_user_role() in ('admin', 'operator'))
  with check (public.current_user_role() in ('admin', 'operator'));

drop policy if exists "tube valves public read" on public.tube_valves;
create policy "tube valves public read"
  on public.tube_valves for select
  using (is_active);

drop policy if exists "tube valves manager write" on public.tube_valves;
create policy "tube valves manager write"
  on public.tube_valves for all to authenticated
  using (public.current_user_role() in ('admin', 'operator'))
  with check (public.current_user_role() in ('admin', 'operator'));

drop policy if exists "tube application valves public read" on public.tube_valve_applications;
create policy "tube application valves public read"
  on public.tube_valve_applications for select
  using (
    exists (
      select 1 from public.tube_applications a
      where a.slug = application_slug and a.is_active
    )
    and exists (
      select 1 from public.tube_valves v
      where v.code = valve_code and v.is_active
    )
  );

drop policy if exists "tube application valves manager write" on public.tube_valve_applications;
create policy "tube application valves manager write"
  on public.tube_valve_applications for all to authenticated
  using (public.current_user_role() in ('admin', 'operator'))
  with check (public.current_user_role() in ('admin', 'operator'));

drop policy if exists "tube variants public read" on public.tube_variants;
create policy "tube variants public read"
  on public.tube_variants for select
  using (
    is_active
    and exists (
      select 1 from public.tube_applications a
      where a.slug = application_slug and a.is_active
    )
    and exists (
      select 1 from public.tube_valves v
      where v.code = valve_code and v.is_active
    )
  );

drop policy if exists "tube variants manager write" on public.tube_variants;
create policy "tube variants manager write"
  on public.tube_variants for all to authenticated
  using (public.current_user_role() in ('admin', 'operator'))
  with check (public.current_user_role() in ('admin', 'operator'));

drop policy if exists "flap variants public read" on public.flap_variants;
create policy "flap variants public read"
  on public.flap_variants for select
  using (is_active);

drop policy if exists "flap variants manager write" on public.flap_variants;
create policy "flap variants manager write"
  on public.flap_variants for all to authenticated
  using (public.current_user_role() in ('admin', 'operator'))
  with check (public.current_user_role() in ('admin', 'operator'));
