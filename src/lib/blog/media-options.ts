import type { Media } from "@/lib/media/types";

/** A human label for a Media record: caption, alt, then filename. */
export function mediaLabel(media: Media): string {
  return (
    media.caption ??
    media.alt ??
    media.path.split("/").pop() ??
    media.path
  );
}

/** An option in a Media picker (the Post editor thumbnail and image blocks). */
export type MediaOption = {
  id: string;
  label: string;
};

/** Human labels for a Media picker: caption, else alt, else the filename. */
export function toMediaOptions(media: readonly Media[]): MediaOption[] {
  return media.map((entry) => ({
    id: entry.id,
    label:
      mediaLabel(entry),
  }));
}
