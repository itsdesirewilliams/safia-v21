import type { Media } from "@/lib/media/types";

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
      entry.caption ?? entry.alt ?? entry.path.split("/").pop() ?? entry.path,
  }));
}
