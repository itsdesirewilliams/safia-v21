# Safeway Tyre — Project Status

Last updated:
2026-09-24

## Production

https://safia-v21.vercel.app

## Branch

master

## Current implementation status

### Ticket #11 — Site Shell/Foundation
Status: COMPLETE

### Ticket #12 — Homepage
Status: COMPLETE

### Ticket #13 — Responsive Slider
Status: COMPLETE

### Ticket #14 — Shared Media Layer + Admin
Status: COMPLETE

### Ticket #15 — Quality First
Status: COMPLETE

### Ticket #16 — Contact Us
Status: COMPLETE

### Ticket #17 — Warranty
Status: NEXT

### Ticket #18 — Catalogue
Status: PENDING

### Ticket #19 — Blogs & CMS
Status: PENDING

### Ticket #20 — About Us
Status: PENDING

### Ticket #21 — Gallery
Status: PENDING

## Current next task

Ticket #17 — Warranty

GitHub Issue:
#5

Route:

/warranty

Special content source:

https://www.safewaytyre.com/warrantly-policy

This is an explicit exception to the normal old-site source rule.

Use the existing Warranty Policy as the content source.

Primary objective:

Preserve the policy content/meaning/terminology while redesigning its presentation using the current Safeway Tyre design system.

Do not invent or alter warranty terms.

## Completed implementation commits

Ticket #15:

2503848

Ticket #16:

68c9361

The exact latest commit should be checked from Git before starting the next ticket.

## Production deployment

All completed tickets must be:

- committed
- pushed to GitHub
- deployed to Vercel Production
- live-verified

Production alias:

https://safia-v21.vercel.app

## Current design system

Typography:

Inter
Anek Devanagari

Removed:

Alfabet
Archivo

Visual direction:

Premium
Editorial
Industrial
International
Image/video-led
Strong typography
Controlled color
Subtle motion
High-end frontend quality

## Current media system

Supabase Storage + shared Media layer.

Admin:

/admin/media

Quality First media:

- testing-videos
- machine-images

Gallery:

regular grid, not Masonry

Quality First machine images:

Masonry

## Admin note

The first admin/editor account may require bootstrap if one has not yet been created.

Roles:

admin
editor

Roles are never self-assigned.

## Known limitations

Known visual bugs may remain.

Do not automatically stop future ticket work to polish them.

Fix only when they block the current ticket, create a regression, or are explicitly requested.

Missing media/content should use documented placeholders rather than old-site scraping unless explicitly authorized by the current ticket.

## Future sequence

#17 Warranty
→ #18 Catalogue
→ #19 Blogs & CMS
→ #20 About Us
→ #21 Gallery
