# Post body as a structured block/document model (JSON)

A Post's `body` is stored as a structured block/document model — an ordered list of typed blocks (paragraph, heading, image-reference, and so on) — as JSON, rendered to HTML at read time. We chose this over raw HTML (sanitisation risk and editor lock-in) and Markdown (awkward to embed images at arbitrary points and to extend with custom blocks). Any block-based editor (TipTap, ProseMirror) can target the model.

## Considered Options

- **Raw HTML:** simplest, but carries an XSS-sanitisation burden and ties the stored model to one editor's HTML output.
- **Markdown:** human-readable, but embedding images at arbitrary positions and adding non-standard blocks is awkward.
- **Structured blocks as JSON:** portable, safe to render, extensible; slightly more serialisation work.
