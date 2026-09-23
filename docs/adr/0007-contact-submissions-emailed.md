# Contact form submissions are emailed, not stored

Contact Us has two developer-owned forms (Query and Feedback). On submit, the server validates the input and relays it by email to two fixed Safeway addresses (`director@safewaytyre.com`, `marketing01@safewaytyre.com`); submissions are not persisted to the database and there is no admin inbox. We chose email-only over a database-backed inbox because the volume is low, the team already triages contact via WhatsApp/email, and persistence would add a table, an admin screen, and a retention/deletion policy for no immediate benefit. The transport provider (transactional email service vs SMTP) is a deferred implementation detail; this records the email-only shape.

## Considered Options

- **Email-only:** simplest; no schema, no admin screen, no data-retention burden; acceptable at low volume.
- **Database + email:** viewable and searchable in the admin, but adds a submissions table, an admin surface, and data-handling obligations.
- **CRM / third-party service:** richer tooling, but a second vendor and integration surface for a low-volume contact flow.
