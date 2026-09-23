/**
 * Media reference protection (Ticket 4).
 *
 * A Media record may be referenced by other content. The agreed rule is that
 * media deletion is blocked while a Post references it (Draft or Published);
 * the admin must remove the reference first. This module models references and
 * decides whether deletion is allowed — the decision is pure so it can be
 * tested without a database, while the actual lookup lives in the server data
 * layer.
 */

export type MediaReferenceKind = "post";

export type MediaReference = {
  kind: MediaReferenceKind;
  id: string;
  /** Human label shown to the administrator (e.g. the Post title). */
  label: string;
};

export type DeletionDecision = {
  allowed: boolean;
  reason: string | null;
};

const KIND_NOUN: Record<MediaReferenceKind, string> = {
  post: "Post",
};

function kindNoun(kind: MediaReferenceKind, count: number): string {
  const noun = KIND_NOUN[kind];
  return count === 1 ? noun : `${noun}s`;
}

export function evaluateMediaDeletion(
  references: readonly MediaReference[],
): DeletionDecision {
  if (references.length === 0) {
    return { allowed: true, reason: null };
  }

  const primary = references[0];
  const noun = kindNoun(primary.kind, references.length);

  if (references.length === 1) {
    return {
      allowed: false,
      reason: `This media is still used by a ${noun} ("${primary.label}"). Remove it from that ${noun} before deleting.`,
    };
  }

  const labels = references
    .slice(0, 3)
    .map((reference) => `"${reference.label}"`)
    .join(", ");

  return {
    allowed: false,
    reason: `This media is still used by ${references.length} ${noun} (${labels}). Remove those references before deleting.`,
  };
}

/** The media reference sources currently modelled. */
export const REFERENCE_KINDS: readonly MediaReferenceKind[] = ["post"];

/**
 * Normalise the rows returned by the `media_references` database function,
 * dropping anything malformed so the UI never shows an invented reference.
 */
export function mapMediaReferences(data: unknown): MediaReference[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const references: MediaReference[] = [];

  for (const row of data) {
    if (typeof row !== "object" || row === null) {
      continue;
    }
    const record = row as Record<string, unknown>;
    const kind = record.kind;
    const id = record.id;

    if (
      typeof kind !== "string" ||
      !(REFERENCE_KINDS as readonly string[]).includes(kind) ||
      typeof id !== "string" ||
      id === ""
    ) {
      continue;
    }

    const label =
      typeof record.label === "string" && record.label !== ""
        ? record.label
        : id;

    references.push({ kind: kind as MediaReferenceKind, id, label });
  }

  return references;
}
