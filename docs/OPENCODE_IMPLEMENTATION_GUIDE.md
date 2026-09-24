# SAFEWAY TYRE — OPENCODE IMPLEMENTATION GUIDE

## 1. PURPOSE

This document is the permanent implementation context for the Safeway Tyre website.

OpenCode MUST read this document before implementing ANY ticket.

Ticket-specific GitHub Issues define WHAT is being built.

This guide defines HOW it must be built.

Do not repeat this entire guide inside individual ticket prompts.

Before every ticket:

1. Read this guide.
2. Read PROJECT_STATUS.md.
3. Read the specific GitHub Issue/ticket.
4. Check existing implementation before changing anything.

---

## 2. SOURCE OF TRUTH

Use this priority:

1. Explicit user instruction in the current task
2. Finalized GitHub Issue/ticket being implemented
3. OPENCODE_IMPLEMENTATION_GUIDE.md
4. PROJECT_STATUS.md
5. CONTEXT.md
6. ADRs
7. Safeway Tyre Master Product Data
8. Safeway Tyre Website/Page Module Specification
9. Existing implementation

Never silently override a higher-priority source with a lower-priority source.

The old Safeway Tyre website is normally REFERENCE ONLY.

It may be used for:

- information architecture
- navigation
- existing flow
- existing behavior
- explicit ticket-specific content exceptions

It must NOT normally be used for:

- product data
- product specifications
- pattern data
- pricing
- product imagery
- marketing claims
- certifications
- testimonials
- company statistics
- other factual content

If a ticket explicitly authorizes the old website as a content source, that exception applies ONLY to that ticket and ONLY to the specified content.

Example:

Ticket #17 Warranty explicitly authorizes the existing Safeway Tyre Warranty Policy page as the content source for the Warranty Policy.

Do not generalize that exception to other tickets.

---

## 3. PRODUCT DATA

Canonical product hierarchy:

Category
→ Pattern
→ Variants

There is NO separate Product entity.

Pattern is the primary product/page entity.

Variant is a specific configuration/size under a Pattern.

Size is a field of Variant.

Do not invent:

- product data
- pattern codes
- functional names
- specifications
- sizes
- certifications
- pricing

Public website:

NO PRODUCT PRICING.

Authoritative product data comes from the approved Safeway Tyre master dataset.

Canonical categories:

Motorcycle Tyres
slug: motorcycle

Three Wheeler Tyres
slug: three-wheeler

Truck & Bus Tyres
slug: truck-bus

Agriculture Tyres
slug: agriculture

Off-The-Road (OTR) Tyres
slug: otr

Forklift Tyres
slug: forklift

Tubes
slug: tubes

Terminology:

Use:
"Three Wheeler"

NOT:
"3 Wheeler"

Use:
"Forklift Tyres"

NOT:
"Forklift / Industrial Tyres"

Functional names must come from approved data.

Never invent functional names.

---

## 4. TECHNOLOGY

Core stack:

- Next.js
- App Router
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Custom Next.js Admin

Do not replace the architecture unless explicitly instructed.

Do not introduce a third-party CMS.

Do not introduce another database.

Do not introduce another media provider unless explicitly approved.

Avoid unnecessary dependencies.

---

## 5. ROUTING

Canonical product routes:

/products/<category-slug>

/products/<category-slug>/<pattern-slug>

There are NO Variant routes.

Important public routes:

/
/about-us
/catalogue
/contact-us
/quality-first
/warranty
/gallery
/blogs
/blogs/<slug>

Admin:

/admin
/admin/login
/admin/media

Do not create duplicate route systems.

---

## 6. NAVIGATION

Primary navigation:

About Us
Catalogue
Products
Contact Us
Quality First
Warranty

Products dropdown:

- Motorcycle Tyres
- Three Wheeler Tyres
- Truck & Bus Tyres
- Agriculture
- Off-The-Road (OTR)
- Forklift Tyres
- Tubes

Preserve this terminology unless explicitly changed later.

---

## 7. DESIGN DIRECTION

The website uses a premium editorial industrial/international design language.

The reference design supplied during the UI redesign establishes the visual direction.

Use characteristics such as:

- large editorial typography
- strong hierarchy
- large imagery/video
- rounded media containers
- asymmetrical compositions
- generous whitespace
- dark/light contrast
- restrained borders
- controlled shadows
- premium CTA treatments
- sophisticated navigation
- large footer
- subtle micro-interactions
- strong but controlled color

The design should feel like a high-end international tyre manufacturer.

It should NOT feel like:

- generic SaaS
- student project
- template website
- dashboard
- black-and-white-only corporate site
- excessive card grids
- excessive gradients
- excessive glassmorphism
- excessive shadows
- gimmicky 3D
- over-animated
- copied Dribbble design

Dribbble may be used for inspiration when explicitly requested.

Never copy another site's branding, layout, content, imagery, or code.

---

## 8. TYPOGRAPHY

Primary Latin typeface:

Inter

Devanagari:

Anek Devanagari

Use Anek Devanagari only when Devanagari text is required.

REMOVED:

Alfabet
Archivo

Do NOT reintroduce either unless explicitly instructed.

---

## 9. COLOR SYSTEM

Current design tokens include:

Brand blue:
#0b63f6

Accent orange:
#ff6a00

Deep:
#071018

Charcoal:
#111820

Off-white:
#f7f8fa

Soft grey:
#e8ecf0

Success green:
#16a34a

Use the existing design-token system.

Do not scatter duplicate color values throughout the application.

Orange is an accent.

Do not make the entire website orange.

Do not make the entire website black.

---

## 10. MOTION

Use the existing motion system.

Preferred:

- fade-up
- reveal
- stagger
- image scale
- arrow movement
- button transitions
- navigation transitions
- modal transitions
- smooth scrolling

Motion must feel subtle and premium.

Respect:

prefers-reduced-motion

Do not introduce an unnecessary animation framework.

---

## 11. RESPONSIVE DESIGN

Mobile-first.

Do not simply shrink desktop layouts.

Desktop may use:

- more columns
- larger typography
- complex compositions
- side-by-side layouts
- larger media

Mobile should use:

- fewer columns
- horizontal scrolling where appropriate
- condensed information
- strong hierarchy
- touch-friendly controls

Minimum practical touch target:

44px.

Avoid unintended horizontal overflow.

---

## 12. RESPONSIVE SLIDER

Approved repository asset structure:

public/assets/
├── landscape/
│   ├── catalogue/
│   └── business-profile/
└── portrait/
    ├── catalogue/
    └── business-profile/

Desktop/tablet:

16:9 landscape

Mobile below 768px:

4:5 portrait
1080×1350

Use native:

<picture>
<source>

Do NOT use JavaScript viewport detection.

Do NOT crop supplied images.

Do NOT substitute old-site images.

Do NOT replace this system with Supabase Storage unless explicitly instructed.

---

## 13. MEDIA ARCHITECTURE

Supabase Storage is the primary website media system.

Shared Media entity contains:

- id
- bucket
- storage_path
- type
- mime_type
- alt
- caption
- pattern_code
- category_slug
- uploaded_by
- created_at

Media types include:

- image
- video
- document

Current buckets include:

- product-images
- blog-images
- gallery
- testing-videos
- machine-images
- catalogue-pdfs

Use the shared Media layer.

Do not create separate media tables or upload systems for individual features.

---

## 14. MEDIA OWNERSHIP

Product/gallery images:

Pattern where applicable.

Generic/hero media:

appropriate Category/content context.

No Variant-level media.

Gallery does NOT require Pattern/Category tagging.

Quality First:

- testing videos
- machine images

Testing videos use storage-driven discovery.

Machine images use Masonry ONLY on Quality First.

Main Gallery is NOT Masonry.

---

## 15. ADMIN

Admin is a custom Next.js admin.

Roles:

admin
editor

Roles are stored in the database role column.

Do NOT use JWT claims for authorization.

Server-side authorization is mandatory.

UI hiding is NOT security.

Current Media Admin:

/admin/media

Admin:

- full media management
- destructive operations where authorized

Editor:

- media management needed for content

Do not create another CMS.

---

## 16. SECURITY

Always use:

- server-side authorization
- Supabase RLS
- input validation
- file validation
- MIME validation
- size limits
- safe storage paths
- path traversal protection
- safe email handling
- rate limiting where appropriate

Never trust client-side role information.

Never expose secrets.

---

## 17. HOMEPAGE

Locked homepage order:

1. Navigation
2. Hero
3. Take a Tour of Our Industry
4. Product Ranges
5. Catalogue
6. Quality & Certifications
7. Testimonials
8. Instagram
9. Inquiry Form
10. Google Map
11. Footer

Hero MUST contain:

- video
- product search

Search supports:

- size
- patternCode
- displayName
- category

Search resolves to Patterns.

No pricing.

Tubes remain in Products navigation but are excluded from the six homepage Product Range cards while Tube data is deferred.

---

## 18. CONTACT

Route:

/contact-us

Query form:

- Name
- Country
- Phone Number
- Category
- Message

Feedback form:

- Name
- Country
- Phone
- Message

Submission architecture:

EMAIL ONLY.

Do NOT create a Contact/Inquiry database unless explicitly instructed.

Recipients:

Director@safewaytyre.com
marketing01@safewaytyre.com

IMPORTANT:

Display:

Director@safewaytyre.com

with the capital D.

Keep:

- server-side validation
- honeypot
- rate limiting
- country-aware phone validation

WhatsApp:

https://wa.me/+919915762182

---

## 19. SOCIAL LINKS

Instagram:

https://www.instagram.com/safewaytyre/

Facebook:

https://www.facebook.com/profile.php?id=61578894803518

LinkedIn:

https://www.linkedin.com/company/safeway-tyre/

X:

https://x.com/safewaytyre

Pinterest:

https://in.pinterest.com/safewaytyreindia/

Use these approved links wherever relevant.

Do not invent alternative accounts.

---

## 20. QUALITY FIRST

Route:

/quality-first

Approved structure:

Hero
→ Testing video story rail
→ Quality/testing explanation
→ Machine-image Masonry
→ CTA

Testing videos:

testing-videos/stories/

Supported:

.mp4
.webm

Storage presence determines visibility.

Natural filename ordering unless explicit ordering metadata exists.

Companion posters are supported.

Video viewer supports:

- native controls
- Escape
- backdrop close
- focus management
- body scroll lock
- graceful playback failure

Machine images:

machine-images

Use Masonry ONLY here.

---

## 21. GALLERY

Route:

/gallery

Gallery is:

- public
- regular responsive image grid
- NOT Masonry
- newest first by storage object creation time
- modal/fullscreen-style viewer
- next/previous
- mobile swipe
- desktop arrows
- close
- keyboard navigation where practical

Caption appears in viewer.

Missing caption:

Safeway Tyre

Gallery does not require Pattern/Category tags.

Gallery administration reuses Media Admin.

Gallery administration is Admin-only.

---

## 22. BLOGS

Routes:

/blogs
/blogs/<slug>

Post fields:

- title
- slug
- author
- thumbnail Media
- body structured JSON
- status
- publishedAt
- optional excerpt

Status:

Draft
Published

Unpublish:

Published → Draft

Blog images reference Media IDs.

No blog categories/tags unless explicitly added later.

Roles:

Admin:
all content/media

Editor:
Posts + required media

Use custom Next.js Admin.

No third-party CMS.

---

## 23. CATALOGUE

Route:

/catalogue

Uses supplied responsive catalogue assets.

Landscape:

16:9

Portrait:

4:5 / 1080×1350

Use the existing responsive slider.

Do NOT use old-site catalogue assets.

Pricing is NOT public.

---

## 24. ABOUT US

Route:

/about-us

Developer-owned/static.

Contains:

- company/about content
- team
- Business Profile slider

Business Profile:

landscape 16:9
portrait 4:5 / 1080×1350

Use supplied repository assets.

Do not substitute old-site assets.

---

## 25. WARRANTY

Route:

/warranty

Developer-owned/static.

EXPLICIT CONTENT EXCEPTION:

The existing Safeway Tyre Warranty Policy page is an approved content source for Ticket #17:

https://www.safewaytyre.com/warrantly-policy

For that ticket:

- preserve policy meaning
- preserve legal terminology
- preserve policy structure where practical
- redesign presentation only

Do not invent warranty terms.

Do not turn Warranty into a CMS.

Do not turn Warranty into a claim-management system.

---

## 26. PLACEHOLDER POLICY

Placeholders are allowed when required inputs have not been supplied.

Examples:

- hero video
- product imagery
- certification assets
- testimonial imagery
- YouTube video
- map
- Quality First media
- catalogue assets

Placeholders must be:

- intentional
- visually polished
- clearly identifiable
- easy to replace

Never fill missing content by scraping the old website unless the current ticket explicitly authorizes it.

---

## 27. CONTACT INFORMATION

Director:

Director@safewaytyre.com

Marketing:

marketing01@safewaytyre.com

WhatsApp:

+919915762182

Use approved values only.

---

## 28. CODE QUALITY

Prefer reusable components.

Avoid:

- giant monolithic components
- duplicate UI primitives
- duplicate design tokens
- unnecessary dependencies
- dead code
- unnecessary architecture changes
- parallel implementations of existing functionality

Before changing architecture:

Check:

- this guide
- PROJECT_STATUS.md
- relevant ADRs
- existing implementation

---

## 29. TESTING STANDARD

Every implementation ticket must run the relevant project checks:

- typecheck
- lint
- unit tests
- e2e tests
- production build

Do not knowingly leave existing tests failing.

Do not claim a ticket is complete without reporting actual results.

---

## 30. TICKET DISCIPLINE

Implement ONLY the requested ticket.

Do NOT silently implement future tickets.

Do NOT redesign completed tickets unless explicitly instructed.

If an unrelated bug is discovered:

- do not automatically expand scope
- mention it in the final report
- fix it only if it blocks the current ticket or creates a regression

---

## 31. MANDATORY GIT + DEPLOYMENT WORKFLOW

AFTER EVERY IMPLEMENTATION RUN:

1. Run typecheck.
2. Run lint.
3. Run unit tests.
4. Run e2e tests.
5. Run production build.
6. Fix failures caused by the current implementation.
7. Commit all changes to Git.
8. Push the commit to the current GitHub branch.
9. Deploy to Vercel Production.
10. Verify the production deployment.
11. Verify the affected route(s) live.
12. Report the result.

This workflow is MANDATORY.

Every completed ticket must end with:

TEST
→ BUILD
→ COMMIT
→ PUSH
→ DEPLOY
→ VERIFY
→ REPORT

Do NOT finish with uncommitted implementation changes.

Do NOT leave completed work only locally.

Do NOT skip the GitHub push.

Do NOT finish with only a Vercel Preview deployment.

The completed implementation must be deployed to Production.

Expected production alias:

https://safia-v21.vercel.app

If deployment fails:

- diagnose
- fix if caused by current work
- retry
- do not claim completion until Production deployment succeeds

If GitHub push fails:

- diagnose
- resolve where possible
- do not claim completion while work remains only local

---

## 32. PRODUCTION VERIFICATION

After deployment:

Verify the affected route(s) using the live production URL.

At minimum verify:

- HTTP success
- page renders
- major content exists
- no obvious runtime failure
- ticket-specific functionality works

For UI tickets, verify desktop and mobile behavior where practical.

---

## 33. FINAL REPORT STANDARD

After every ticket report:

1. What was implemented
2. Important architecture/data changes
3. Tests
4. Typecheck
5. Lint
6. Production build
7. Git commit hash
8. GitHub push result
9. Production deployment URL
10. Live verification result
11. Remaining blockers
12. Any scope exceptions

Keep the report concise.

A ticket is COMPLETE only when:

- tests pass
- typecheck passes
- lint passes
- production build succeeds
- changes are committed
- changes are pushed
- production deployment succeeds
- affected production route is verified

---

## 34. TICKET MAP

Ticket #11
GitHub Issue #10
Site Shell/Foundation
Status: COMPLETE

Ticket #12
GitHub Issue #8
Homepage
Status: COMPLETE

Ticket #13
GitHub Issue #9
Responsive Slider
Status: COMPLETE

Ticket #14
GitHub Issue #2
Shared Media Layer + Admin
Status: COMPLETE

Ticket #15
GitHub Issue #3
Quality First
Status: COMPLETE

Ticket #16
GitHub Issue #6
Contact Us
Status: COMPLETE

Ticket #17
GitHub Issue #5
Warranty
Status: COMPLETE

Ticket #18
GitHub Issue #1
Catalogue
Status: COMPLETE

Ticket #19
GitHub Issue #2
Blogs & CMS
Status: COMPLETE

Ticket #20
GitHub Issue #4
About Us
Status: COMPLETE

Ticket #21
GitHub Issue #7
Gallery
Status: NEXT

---

## 35. DEPENDENCY MAP

#11 Site Shell
    ↓
    ├── #12 Homepage
    ├── #13 Responsive Slider
    ├── #14 Media + Admin
    ├── #16 Contact
    └── #17 Warranty

#13 Responsive Slider
    ↓
    ├── #18 Catalogue
    └── #20 About Us

#14 Media + Admin
    ↓
    ├── #15 Quality First
    ├── #19 Blogs & CMS
    └── #21 Gallery

Completed tickets should not be rebuilt merely because another ticket depends on them.

---

## 36. IMPORTANT IMPLEMENTATION DECISIONS

Locked decisions include:

- Next.js + Supabase
- Custom Next.js Admin
- Category → Pattern → Variants
- No public pricing
- Supabase Storage as primary media system
- Responsive slider remains repository-asset based
- Gallery is regular grid, NOT Masonry
- Quality First machine images use Masonry
- Quality First testing videos use storage discovery
- Gallery does not require Pattern/Category tags
- Blogs use structured body JSON
- Blog images reference Media IDs
- Contact submissions are email-only
- Warranty is static/developer-owned
- About Us is static/developer-owned
- Catalogue uses supplied responsive assets
- Inter + Anek Devanagari
- Alfabet removed
- Archivo removed
- Premium editorial industrial visual direction

Do not overturn these decisions without explicit user instruction.

---

## 37. CURRENT KNOWN LIMITATIONS

The website has known visual imperfections.

These are NOT automatically blockers.

Do not pause future ticket implementation to achieve pixel-perfect polish across completed tickets.

Fix an existing issue only when:

- it blocks the current ticket
- it causes a regression
- the user explicitly asks for it

Current missing inputs may include:

- final hero footage
- Quality First testing videos
- machine images
- detailed Quality First process content
- final certifications
- final testimonials
- Instagram token
- certain catalogue assets
- other documented missing inputs

Use placeholders where approved.

---

## 38. DO NOT BREAK EXISTING WORK

Before modifying existing functionality:

Check what is already implemented.

Do not break:

- homepage
- product search
- navigation
- footer
- responsive slider
- Supabase
- Media Admin
- Quality First
- Contact Us
- existing public routes

Run regression tests after changes.

---

## 39. PROJECT COMMUNICATION STYLE

When reporting implementation:

Be concise.

Report facts.

Do not produce unnecessary long explanations.

Always clearly identify:

- completed
- failed
- blocked
- deployed
- not implemented

---

END OF IMPLEMENTATION GUIDE
