-- Minimal catalogue schema for the homepage product search (spec #8 / #12).
--
-- Category → Pattern → Variant. Ticket 8 (#18) extends this with the full
-- normalization seam and the real dataset; the shape here is intentionally
-- minimal but already canonical. Pricing/shipping fields (fob_usd, container)
-- are deliberately absent so no pricing can ever be exposed publicly.
--
-- All three tables are public-read (the site is public); writes are reserved
-- for the service role until the admin/Media-layer ticket defines policies.

create table if not exists public.categories (
  slug text primary key,
  display_name text not null,
  sort_order integer not null default 0
);

create table if not exists public.patterns (
  id uuid primary key default gen_random_uuid(),
  category_slug text not null references public.categories (slug) on delete cascade,
  pattern_code text not null,
  display_name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  unique (category_slug, pattern_code)
);

create table if not exists public.variants (
  id uuid primary key default gen_random_uuid(),
  pattern_id uuid not null references public.patterns (id) on delete cascade,
  size text not null,
  ply_rating text,
  tt_tl text,
  application text,
  rim_width_inch text,
  tread text,
  tyre_type text,
  -- Internal-only per spec #1; never surfaced in the public search response.
  weight_kg numeric
);

create index if not exists patterns_category_slug_idx
  on public.patterns (category_slug);
create index if not exists patterns_pattern_code_idx
  on public.patterns (pattern_code);
create index if not exists patterns_display_name_idx
  on public.patterns (display_name);
create index if not exists variants_pattern_id_idx
  on public.variants (pattern_id);

alter table public.categories enable row level security;
alter table public.patterns enable row level security;
alter table public.variants enable row level security;

drop policy if exists "categories are public read" on public.categories;
create policy "categories are public read"
  on public.categories for select using (true);

drop policy if exists "patterns are public read" on public.patterns;
create policy "patterns are public read"
  on public.patterns for select using (true);

drop policy if exists "variants are public read" on public.variants;
create policy "variants are public read"
  on public.variants for select using (true);

-- Server-side search over size / patternCode / displayName / category.
-- Every hit resolves to a Pattern (never a Variant). ILIKE is sufficient at
-- this catalogue size (spec #8); no full-text search, no dedicated route.
create or replace function public.search_patterns(search text)
returns table (
  category_slug text,
  category_display_name text,
  pattern_slug text,
  pattern_code text,
  display_name text,
  sizes text[]
)
language sql
stable
as $$
  select
    c.slug,
    c.display_name,
    p.slug,
    p.pattern_code,
    p.display_name,
    array_remove(array_agg(distinct v.size order by v.size), null) as sizes
  from public.patterns p
  join public.categories c on c.slug = p.category_slug
  left join public.variants v on v.pattern_id = p.id
  where
    c.slug <> 'tubes'
    and (
      p.display_name ilike '%' || search || '%'
      or p.pattern_code ilike '%' || search || '%'
      or c.display_name ilike '%' || search || '%'
      or c.slug ilike '%' || search || '%'
      or v.size ilike '%' || search || '%'
    )
  group by c.slug, c.display_name, p.slug, p.pattern_code, p.display_name
  order by c.display_name, p.pattern_code
  limit 10;
$$;

grant execute on function public.search_patterns(text) to anon, authenticated;
