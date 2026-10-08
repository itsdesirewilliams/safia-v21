"use server";

import { revalidatePath } from "next/cache";

import { requireMediaManager } from "@/lib/auth/session";
import { patternDirectory } from "@/lib/catalogue/pattern-directory";
import {
  isSafePatternImagePath,
  lookupPatternCode,
  normalizePatternCode,
  patternCodeFromFileName,
  PATTERN_IMAGE_BATCH_MAX,
  PATTERN_IMAGE_BUCKET_ID,
  type PatternImageBatchEntry,
  type PatternImageBatchFailure,
  type PatternImageBatchResult,
} from "@/lib/media/pattern-image-batch";
import { listPatternImageRecords } from "@/lib/media/pattern-images-server";
import {
  createMediaRecord,
  removeStorageObject,
  replaceMediaObject,
} from "@/lib/media/server";
import { validateUpload } from "@/lib/media/upload";

/**
 * Admin Pattern Image bulk upload server action (spec: Pattern media).
 *
 * The browser uploads each image straight to the dedicated `product-images`
 * bucket; this action is the authority. It derives the Pattern Code from the
 * filename, resolves it against the canonical dataset, and then creates or
 * (on a deliberate Replace) updates the single Media record associated with
 * that Pattern. Nothing about the association is entered by hand, no duplicate
 * Media records are created, and an object uploaded for a rejected entry is
 * cleaned up so storage never accumulates orphans.
 */
export async function commitPatternImagesAction(
  entries: PatternImageBatchEntry[],
): Promise<PatternImageBatchResult> {
  const profile = await requireMediaManager();

  const list = Array.isArray(entries)
    ? entries.slice(0, PATTERN_IMAGE_BATCH_MAX)
    : [];

  // The catalogue-wide index (master + TBR + PCR); filenames resolve against
  // it with the same alias-tolerant normalization the client preview uses.
  const directory = patternDirectory();

  const failures: PatternImageBatchFailure[] = [];
  const existingByCode = new Map(
    (await listPatternImageRecords()).map((record) => [
      record.code,
      record,
    ]),
  );
  const seenCodes = new Set<string>();
  let created = 0;
  let replaced = 0;

  const fail = async (
    name: string,
    path: string | null,
    error: string,
  ): Promise<void> => {
    failures.push({ name, error });
    if (path && isSafePatternImagePath(path)) {
      await removeStorageObject(PATTERN_IMAGE_BUCKET_ID, path);
    }
  };

  for (const entry of list) {
    const name = typeof entry?.name === "string" ? entry.name : "file";
    const path = typeof entry?.path === "string" ? entry.path : null;

    if (!entry || !path || !isSafePatternImagePath(path)) {
      await fail(name, null, "The upload path was not valid.");
      continue;
    }

    const candidate = patternCodeFromFileName(name);
    if (!candidate) {
      await fail(name, path, "Could not read a Pattern Code from the filename.");
      continue;
    }

    const lookup = lookupPatternCode(candidate, directory);
    if (lookup.status === "not-found") {
      await fail(name, path, "Pattern Code not found");
      continue;
    }
    if (lookup.status === "ambiguous") {
      const options = lookup.matches
        .map((match) => match.patternCode)
        .join(", ");
      await fail(
        name,
        path,
        `Pattern Code ${candidate} matches more than one pattern (${options}).`,
      );
      continue;
    }

    // The canonical catalogue Pattern Code is always the stored identifier.
    const pattern = lookup.entry;
    const code = pattern.patternCode;

    if (seenCodes.has(code)) {
      await fail(
        name,
        path,
        `Another file in this batch already resolves to ${code}.`,
      );
      continue;
    }
    seenCodes.add(code);

    const validation = validateUpload({
      fileName: name,
      mimeType: entry.mimeType,
      sizeBytes: entry.sizeBytes,
    });
    if (!validation.ok) {
      await fail(name, path, validation.error);
      continue;
    }
    if (validation.type !== "image") {
      await fail(name, path, "Only images can be added as Pattern images.");
      continue;
    }

    const existing = existingByCode.get(normalizePatternCode(code));

    if (existing && !entry.replace) {
      await fail(name, path, "Image already exists");
      continue;
    }

    if (existing) {
      const result = await replaceMediaObject({
        id: existing.mediaId,
        path,
        mimeType: entry.mimeType,
      });
      if (!result.ok) {
        await fail(name, path, result.error);
        continue;
      }
      existingByCode.set(normalizePatternCode(code), {
        ...existing,
        path,
      });
      replaced += 1;
      continue;
    }

    const result = await createMediaRecord({
      bucket: PATTERN_IMAGE_BUCKET_ID,
      path,
      type: "image",
      mimeType: entry.mimeType,
      uploadedBy: profile.id,
      patternCode: pattern.patternCode,
      categorySlug: pattern.categorySlug,
    });
    if (!result.ok) {
      await fail(name, path, result.error);
      continue;
    }

    existingByCode.set(normalizePatternCode(code), {
      mediaId: result.media.id,
      code,
      patternCode: pattern.patternCode,
      path,
      url: result.media.url,
    });
    created += 1;
  }

  revalidatePath("/admin/pattern-images");
  return { created, replaced, failures };
}
