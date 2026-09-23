import { isCategorySlug } from "@/lib/catalogue/categories";

/**
 * Validation for the editable Media metadata (Ticket 4).
 *
 * Alt text is accessibility metadata and caption is presentation metadata; both
 * are optional and neither is ever invented from the filename. `categorySlug`
 * is validated against the canonical catalogue categories; `patternCode` is
 * format-validated only (the authoritative code list lives in the product
 * dataset), so no association is ever fabricated here.
 */

export const ALT_MAX_LENGTH = 300;
export const CAPTION_MAX_LENGTH = 500;
export const PATTERN_CODE_MAX_LENGTH = 40;

const PATTERN_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export type MediaMetadataInput = {
  alt?: string | null;
  caption?: string | null;
  patternCode?: string | null;
  categorySlug?: string | null;
};

export type MediaMetadataValue = {
  alt: string | null;
  caption: string | null;
  patternCode: string | null;
  categorySlug: string | null;
};

export type MediaMetadataValidation =
  | { ok: true; value: MediaMetadataValue }
  | { ok: false; errors: Record<string, string> };

function clean(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function validateMediaMetadata(
  input: MediaMetadataInput,
): MediaMetadataValidation {
  const errors: Record<string, string> = {};

  const alt = clean(input.alt);
  const caption = clean(input.caption);
  const patternCodeRaw = clean(input.patternCode);
  const categorySlug = clean(input.categorySlug);

  if (alt && alt.length > ALT_MAX_LENGTH) {
    errors.alt = `Alt text must be ${ALT_MAX_LENGTH} characters or fewer.`;
  }

  if (caption && caption.length > CAPTION_MAX_LENGTH) {
    errors.caption = `Caption must be ${CAPTION_MAX_LENGTH} characters or fewer.`;
  }

  if (patternCodeRaw) {
    if (patternCodeRaw.length > PATTERN_CODE_MAX_LENGTH) {
      errors.patternCode = `Pattern code must be ${PATTERN_CODE_MAX_LENGTH} characters or fewer.`;
    } else if (!PATTERN_CODE_PATTERN.test(patternCodeRaw)) {
      errors.patternCode = "Pattern code contains invalid characters.";
    }
  }

  if (categorySlug && !isCategorySlug(categorySlug)) {
    errors.categorySlug = "Choose a category from the catalogue.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      alt,
      caption,
      patternCode: patternCodeRaw ? patternCodeRaw.toUpperCase() : null,
      categorySlug,
    },
  };
}
