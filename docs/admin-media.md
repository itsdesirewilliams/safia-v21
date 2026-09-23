# Media layer & admin

Ticket 4 (#14) — the shared Media foundation and the custom admin that manages
it. Later tickets (Quality First #15, Blogs/CMS #19, Gallery #21) build on this
without changing the architecture.

## What exists

- **`public.media`** — the shared Media entity: `bucket`, `storage_path`,
  `type` (`image` | `video` | `document`), `mime_type`, `alt`, `caption`,
  optional `pattern_code`, optional `category_slug`, `uploaded_by`,
  `created_at`, `hidden` (default `false`). Uniqueness on `(bucket,
  storage_path)`.
- **`public.profiles`** — `role` (`admin` | `editor`) for each auth user,
  auto-created with **no role** on signup. Authorization is read from this
  column via `public.current_user_role()`; never from JWT claims.
- **Storage buckets** (all public-read, private-write):
  `product-images`, `blog-images`, `gallery`, `testing-videos`,
  `machine-images`, `catalogue-pdfs`.
- **Admin** at **`/admin/media`** — upload, list, search/filter, preview, edit
  caption/alt and Pattern/Category associations, hide/reveal, and delete.
- **Shared media layer** in `src/lib/media/` — validation, storage-path
  building, row mapping, public-URL resolution, reference protection. Public
  components should consume media through this layer, never hard-coded URLs.
  (The Ticket #13 responsive slider remains repository-asset based by design.)

## Roles

| Capability | admin | editor |
| --- | --- | --- |
| Read media (public site) | ✔ | ✔ |
| Upload media / edit metadata (general buckets) | ✔ | ✔ |
| Upload/edit/hide Quality First media (`testing-videos`, `machine-images`) | ✔ | ✘ |
| Delete media | ✔ | ✘ |

Access is enforced by Postgres RLS (`public.media`, `storage.objects`) and by
server-side guards (`requireMediaManager`, `requireAdmin` in
`src/lib/auth/session.ts`). The UI only hides controls as a convenience.

## Bootstrap the first admin

Roles are never self-assigned. Create the first admin locally:

```bash
ADMIN_EMAIL=you@safewaytyre.com ADMIN_PASSWORD='choose-a-strong-password' \
  node scripts/create-admin.mjs
```

Then sign in at `/admin/login`. To add an editor, create the same way and set
`role = 'editor'` (SQL shown below), or extend the script.

```sql
update public.profiles set role = 'editor' where email = 'editor@example.com';
```

## Bucket → media type

| Bucket | Accepts |
| --- | --- |
| `product-images` | image |
| `blog-images` | image, video, document |
| `gallery` | image, video |
| `testing-videos` | video |
| `machine-images` | image |
| `catalogue-pdfs` | document |

Uploads are validated by content type (not the filename), size (images 10 MB,
videos 200 MB, PDFs 25 MB), and path traversal is rejected. Object keys are
`[scope/]YYYY-MM/<id>-<name>`.

## Deletion protection

A Media record that is referenced by a Post cannot be deleted:

- The admin checks references first and explains, in the UI, exactly why the
  deletion is blocked (naming the Post).
- A database trigger (`media_block_referenced_delete`) is the final authority,
  so deletions through any path are refused while a reference exists.

The reference lookup (`public.media_references` / `public.media_is_referenced`)
is guarded with `to_regclass('public.posts')`, so it returns "no references"
until the Posts table lands in Ticket 9.

**Known limitation (ADR-0005):** a Post body is a structured JSON block model,
so the correct reference check is an exact test against the image-reference
block. Until Ticket 9 defines that block shape, the guard approximates it with
a substring scan of the serialised body; Ticket 9 must replace the scan with an
exact check and keep the Post columns in sync with these functions.

## Storage layout

```
product-images/[patternCode|categorySlug|]YYYY-MM/<id>-<name>
blog-images/YYYY-MM/<id>-<name>
gallery/YYYY-MM/<id>-<name>
testing-videos/stories/YYYY-MM/<id>-<name>
machine-images/YYYY-MM/<id>-<name>
catalogue-pdfs/YYYY-MM/<id>-<name>
```

Gallery and Quality First discovery read from their buckets, so a file dropped
into `gallery/`, `machine-images/`, or `testing-videos/stories/` appears without
a database record; an optional Media record supplies caption/alt. Quality First
story videos live under the dedicated `stories/` folder (spec #3).

## Hiding without deleting

`public.media.hidden` removes an item from public discovery without touching its
file. Quality First discovery excludes hidden items at read time; reveal the
item to bring it back. Hide/reveal is Admin-only and is offered on the Quality
First buckets (`testing-videos`, `machine-images`).

Hiding acts on a Media record, so it applies to items uploaded through the
admin (which always create a record). A file dropped straight into a bucket with
no Media record is publicly visible but has no admin row to hide; upload it
through the admin, or add a `media` record for its `(bucket, storage_path)`, to
manage it.
