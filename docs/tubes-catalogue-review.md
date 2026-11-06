# Tubes & Flaps catalogue â€” data review

Generated from the supplied Butyl Tubes transcription and the high-resolution catalogue pages.

## Counts

- Applications: 7
- Reusable valve products: 21
- Tube compatibility records (one per parsed valve per source row): 395
- Flap sizes: 22

### Records per application

- Agriculture, Industrial & OTR: 198
- Bus / Light Truck & Truck: 36
- Industrial Forklift & Truck: 44
- Passenger Car: 70
- Implement & Trailer: 17
- Lawn & Garden: 18
- Utility Vehicles: 12

## Valve products missing catalogue images

- TR-179A â€” placeholder shown; asset not present in the supplied pages.
- TRJ-1175C â€” placeholder shown; asset not present in the supplied pages.
- AB 15 82 â€” placeholder shown; asset not present in the supplied pages.
- TR-77A â€” placeholder shown; asset not present in the supplied pages.
- TR-76A â€” placeholder shown; asset not present in the supplied pages.
- AC3 5 82 â€” placeholder shown; asset not present in the supplied pages.

## Repeated size + valve + application entries retained from source

- js-2 / 5.00-10 / industrial-forklift-truck: 2 source rows
- js-2 / 5.00-8 / industrial-forklift-truck: 2 source rows
- tr-13 / 125/135-12 / passenger-car: 2 source rows
- tr-13 / 135/70R-13 / passenger-car: 2 source rows
- tr-13 / 145/70R-13 / passenger-car: 2 source rows
- tr-13 / 165/175/70R-14 / passenger-car: 2 source rows
- tr-13 / 175/185/70R-15 / passenger-car: 2 source rows
- tr-13 / 195/205/215/70R-16 / passenger-car: 2 source rows
- tr-13 / 3.50-8 / agriculture-industrial-otr: 2 source rows
- tr-13 / 4.00-8 / agriculture-industrial-otr: 2 source rows
- tr-13 / 4.00-8 / industrial-forklift-truck: 2 source rows
- tr-13 / 4.50-10 / agriculture-industrial-otr: 2 source rows
- tr-13 / 5.00-10 / agriculture-industrial-otr: 2 source rows
- tr-13 / 5.00-8 / industrial-forklift-truck: 2 source rows
- tr-15 / 6.00-16 / agriculture-industrial-otr: 2 source rows
- tr-15 / 9.00-16 / agriculture-industrial-otr: 2 source rows
- tr-218a / 13.00-24 / agriculture-industrial-otr: 2 source rows
- tr-218a / 14.00-24 / agriculture-industrial-otr: 2 source rows
- tr-218a / 14.00-25 / agriculture-industrial-otr: 2 source rows
- tr-218a / 8.00/8.3-20 / agriculture-industrial-otr: 2 source rows
- tr-75a / 8.25-15 / bus-light-truck: 2 source rows
- tr-75a / 9.00-16 / agriculture-industrial-otr: 2 source rows
- v1-08-3 / 3.50-8 / agriculture-industrial-otr: 2 source rows
- v1-08-3 / 4.00-8 / agriculture-industrial-otr: 2 source rows
- v1-08-3 / 4.00-8 / industrial-forklift-truck: 2 source rows

## Source additions

- The supplied Batch 1 transcription explicitly covers only the left-hand table on printed page 36.
- The right-hand page 36 table was transcribed from `NewCat 37.jpg` at 2262Ã—3200 and added as `PAGE36R` rows.
- All other rows come from the supplied batches 1â€“4 transcription.

## Valve aliases merged into one product record

- `TR-220` â†’ `TR-220A`
- `V1-08-01` â†’ `V1.08.1`
- `V1-08-03` â†’ `V1.08.3`
- `V1-08-3` â†’ `V1.08.3`

## Unusual source strings retained verbatim

`23X5`, `2.15-15`, `11L.16`, `160/R-15`, `AB 15 82`, `AC3 5 82`, `TRJ-1175C` and the source's `TR-220` spelling are preserved on the source record. The public display keeps the original size string.

## Supabase import

- Schema: `supabase/migrations/20261105000000_tubes_flaps_catalogue.sql`.
- Seed: `supabase/tubes-flaps-seed.sql` (generated from `src/lib/tubes/data.json`).
- The migration adds the smallest dedicated extension because the existing tyre schema cannot express reusable valves shared across applications, or valve-free flaps.
- The public catalogue currently reads the same bundled JSON as the rest of the existing catalogue architecture. The SQL has not been applied to a linked Supabase project from this workspace.

## Admin work still required

The existing admin dashboard has no product CRUD surface. A follow-up should add admin screens for applications, valves, valve image upload, application associations, tube variants, flap variants, display order and active status. The RLS policies in the migration already grant admin/operator writes so that UI can be added without another schema change.
