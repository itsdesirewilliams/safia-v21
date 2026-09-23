# Quality First is a media-discovery page, not a DB-managed content collection

The Quality First page (story rail + testing explanation + machine images) renders media discovered directly from Supabase Storage at read time; no database record is required for a story video or machine image to appear. We chose this over a DB-managed collection (an ordered media-ID list, per-item draft/publish state, drag-to-reorder) because the page is a fixed three-section structure whose media is curated by adding files to a bucket, and the admin screen is only a convenience for upload/delete/hide. A DB-backed model would duplicate storage as a second source of truth and add authoring overhead for a page that is essentially "whatever is in the bucket".

## Considered Options

- **DB-managed collection:** ordered media list with per-item draft/publish and reorder. More control, but duplicates storage as a source of truth and adds admin burden for a simple marketing page.
- **Media-discovery from storage:** presence = visible; natural ordering; hide via discovery rules; optional metadata only. Simpler, and "add a file to publish" is the whole workflow.
