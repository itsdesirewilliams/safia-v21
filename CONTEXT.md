# Safeway Tyre Website

The public website and product catalogue for Safeway Tyre (a brand of DEE RON Automotives LLP), rebuilt fresh in this repo. The catalogue is organised as Category → Pattern → Variant.

## Source of truth

- Product data comes only from the supplied master dataset (`supabase/master-product-data.json`).
- The old `safewaytyre.com` website is a reference for information architecture and links only — never for content, product data, imagery, artwork, UI design, or media. Do not scrape it to fill missing inputs; render a labelled placeholder instead.
- Missing external inputs are flagged, not invented (see `docs/missing-inputs.md`).

## Language

**Category**:
The top-level product grouping in navigation and data. Canonical categories (display name → slug): Motorcycle Tyres (`motorcycle`), Three Wheeler Tyres (`three-wheeler`), Truck & Bus Tyres (`truck-bus`), Agriculture Tyres (`agriculture`), Off-The-Road (OTR) Tyres (`otr`), Forklift Tyres (`forklift`), Tubes (`tubes`).
_Avoid_: Range, product range

**Pattern**:
A tyre product family identified by Safeway's internal `patternCode` (e.g. `TR-1042`). A Pattern belongs to one Category and holds one or more Variants. This is the entity shown on a product card and product detail page. It carries a customer-facing `displayName`; the `patternCode` remains the distinguishing secondary identifier.
_Avoid_: Product, model, SKU

**displayName**:
The customer-facing name of a Pattern. For categories with a functional source name (Agriculture, OTR, Forklift) this is that functional name; otherwise it is the Category name. Distinct from `patternCode`. The source JSON `name` field is renamed to `displayName` on ingest.
_Avoid_: name (use `displayName`), title

**patternCode**:
Safeway's internal identifier for a Pattern (e.g. `TR-1042`). Always shown as the secondary identifier alongside `displayName`; also always appended to the Pattern slug (e.g. `bias-tractor-tyres-tr-1042`).

**Variant**:
One purchasable configuration of a Pattern — a single row in the Pattern's specification table (e.g. one size at one ply rating). A Variant's `size` is a field, not its identity; the same size may repeat across variants that differ in other fields.
_Avoid_: Size, SKU, option

**Product**:
Non-canonical umbrella language for anything sellable. Never an entity; say Pattern or Variant instead.

**Tubes**:
A top-level Category whose products do not follow the Pattern → Variant shape. Its data structure is deferred until Tubes data is supplied.

**Tread pattern**:
The physical tread design of a tyre. Not a database entity; do not use bare "pattern" to mean tread design.

## Content & CMS

**Blog**:
The content section of the website (the "Blogs" navigation destination). It contains Posts.
_Avoid_: using "blog" for a single article

**Blog listing**:
The index page that lists every Post (thumbnail, title, author, metadata).
_Avoid_: blog index, archive

**Post**:
An individual article in the Blog, either Draft or Published. It carries a plain-text `author` byline, a `thumbnail` (Media), and a rich-text `body` that can embed Media at arbitrary points.
_Avoid_: blog, article

**Author**:
The plain-text byline on a Post. Not an entity — there is no separate author record.
_Avoid_: writer

**Media**:
A shared media asset (image, video, or PDF) stored in Supabase Storage, referenced by Posts (thumbnail and in-article) and optionally tagged to a Pattern or Category for product-page use. The Gallery does not consume these tags.
_Avoid_: asset, file (unless naming a specific type)

**Admin**:
A user role with full access: users, media, products, and all content.

**Editor**:
A user role limited to creating, editing, and publishing Posts and uploading media.

## Quality First

**Quality First**:
The page at `/quality-first` describing Safeway's testing and quality-control process, in three ordered sections: the story rail, the testing explanation, and the machine images. Story and machine media is discovered from Supabase Storage; no database record is required for media to display.
_Avoid_: quality page, QC page

**Story**:
A single testing video shown as a portrait, story-style card. Discovered from storage; displaying it does not require a database record.
_Avoid_: video, reel, clip

**Story rail**:
The horizontal, left-to-right sequence of story cards at the top of the Quality First page.
_Avoid_: video rail, video grid, carousel

**Machine image**:
An image of a testing machine, shown in a masonry layout at the end of the Quality First page. Discovered from the dedicated `machine-images` bucket.
_Avoid_: machine photo, facility image

**Testing explanation**:
The developer-owned text section between the story rail and the machine images, describing the testing process. Authored in code; it has no admin surface.
_Avoid_: QC copy, process description

## About Us

**About Us**:
The developer-owned page presenting Safeway's company information: a short company bio, a Team section, and the Business Profile slider. It has no admin surface; all content ships via code and provided asset folders.
_Avoid_: about page

**Business Profile slider**:
The responsive slider on the About Us page that presents the business-profile documents. Assets are developer-provided repo folders in two ratios — portrait (4:5, 1080×1350) below 768px and landscape (16:9) at 768px and above — selected by viewport rather than cropping one artwork. Uses the shared responsive slider.
_Avoid_: profile carousel

## Warranty

**Warranty**:
The developer-owned, static page describing Safeway's tyre warranty terms. Authored in ordinary page markup with no admin surface; it links back to Products, Quality First, Contact Us, and Catalogue.
_Avoid_: warranty policy CMS

## Contact Us

**Contact Us**:
The public page carrying the Query form, the Feedback form, and the WhatsApp contact CTA. Both forms are developer-owned and submit by email to Safeway's fixed addresses; no submission is stored and there is no admin surface.

**Query form**:
The form collecting a sales enquiry — Name, Country, Phone, a Category selected from the canonical categories, and a Message. WhatsApp is the alternative CTA for visitors who do not want to use the form.
_Avoid_: enquiry form, quote form

**Feedback form**:
The form collecting general feedback — Name, Country, Phone, and Message (no Category).
_Avoid_: suggestion form

## Gallery

**Gallery**:
The public image gallery at `/gallery` — a simple responsive grid of images discovered from a designated storage location. Clicking an image opens a viewer with next/previous navigation and a subtle lower-third caption. An optional Media record supplies caption/alt; when absent the caption defaults to "Safeway Tyre". Media management is Admin-only.
_Avoid_: masonry gallery, media library
