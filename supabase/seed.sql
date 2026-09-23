-- Provisional catalogue seed for the homepage product search (spec #8 / #12).
--
-- ⚠️  This is a MINIMAL, PROVISIONAL seed, not the normalized product dataset.
-- The full Category → Pattern → Variant dataset and normalization seam are
-- Ticket 8 (#18). Pattern codes below are real Safeway codes observed on the
-- live reference site where available; the sample of sizes is representative.
-- Ticket 8 replaces this file with the normalized dataset.
--
-- Idempotent: safe to re-run. Run against the linked project with:
--   npx supabase db query --linked --file supabase/seed.sql

insert into public.categories (slug, display_name, sort_order)
values
  ('motorcycle', 'Motorcycle Tyres', 1),
  ('three-wheeler', 'Three Wheeler Tyres', 2),
  ('truck-bus', 'Truck & Bus Tyres', 3),
  ('agriculture', 'Agriculture Tyres', 4),
  ('otr', 'Off-The-Road (OTR) Tyres', 5),
  ('forklift', 'Forklift Tyres', 6),
  ('tubes', 'Tubes', 7)
on conflict (slug) do update
  set display_name = excluded.display_name,
      sort_order = excluded.sort_order;

insert into public.patterns (category_slug, pattern_code, display_name, slug)
values
  ('motorcycle', 'SFM-150', 'Motorcycle Tyres', 'motorcycle-tyres-sfm-150'),
  ('motorcycle', 'SFM-162', 'Motorcycle Tyres', 'motorcycle-tyres-sfm-162'),
  ('motorcycle', 'MC-1000', 'Motorcycle Tyres', 'motorcycle-tyres-mc-1000'),
  ('three-wheeler', 'TW-101', 'Three Wheeler Tyres', 'three-wheeler-tyres-tw-101'),
  ('truck-bus', 'TT-101', 'Truck & Bus Tyres', 'truck-bus-tyres-tt-101'),
  ('truck-bus', 'ITR-112', 'Truck & Bus Tyres', 'truck-bus-tyres-itr-112'),
  ('agriculture', 'TR-1042', 'Tractor Rear Tyres (R-1)', 'tractor-rear-tyres-r-1-tr-1042'),
  ('agriculture', 'TR-1065', 'Tractor Rear Tyres (R-1)', 'tractor-rear-tyres-r-1-tr-1065'),
  ('otr', 'OTR-101', 'Grader Tyres', 'grader-tyres-otr-101'),
  ('forklift', 'FKL-555', 'Forklift Solid Tyres', 'forklift-solid-tyres-fkl-555'),
  ('forklift', 'FKP-555', 'Forklift Pneumatic Tyres', 'forklift-pneumatic-tyres-fkp-555'),
  -- Tubes is seeded so search can prove it is excluded (spec #8).
  ('tubes', 'TU-101', 'Butyl Tubes', 'butyl-tubes-tu-101')
on conflict (slug) do update
  set category_slug = excluded.category_slug,
      pattern_code = excluded.pattern_code,
      display_name = excluded.display_name;

delete from public.variants
where pattern_id in (select id from public.patterns);

insert into public.variants (pattern_id, size, ply_rating, tt_tl, application)
select p.id, v.size, v.ply_rating, v.tt_tl, v.application
from (
  values
    ('SFM-150', '90/90-17', '4PR', 'TL', 'Front'),
    ('SFM-150', '100/90-17', '6PR', 'TL', 'Rear'),
    ('SFM-162', '120/80-17', '6PR', 'TL', 'Rear'),
    ('MC-1000', '2.75-18', '6PR', 'TT', 'Front'),
    ('TW-101', '4.00-8', '6PR', 'TT', 'Three Wheeler'),
    ('TT-101', '9.00-20', '14PR', 'TT', 'Truck'),
    ('TT-101', '10.00-20', '16PR', 'TT', 'Truck'),
    ('ITR-112', '295/80R22.5', '18PR', 'TL', 'Truck'),
    ('TR-1042', '12.4-28', '8PR', 'TT', 'Tractor Rear'),
    ('TR-1042', '13.6-28', '8PR', 'TT', 'Tractor Rear'),
    ('TR-1065', '16.9-28', '10PR', 'TT', 'Tractor Rear'),
    ('OTR-101', '14.00-24', '16PR', 'TT', 'Grader'),
    ('FKL-555', '6.50-10', null, null, 'Forklift'),
    ('FKP-555', '7.00-12', '12PR', 'TT', 'Forklift'),
    ('TU-101', '4.00-8', null, null, 'Tube')
) as v(pattern_code, size, ply_rating, tt_tl, application)
join public.patterns p on p.pattern_code = v.pattern_code;
