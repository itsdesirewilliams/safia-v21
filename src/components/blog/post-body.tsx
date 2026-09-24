import type { PostBlock } from "@/lib/blog/blocks";
import type { Media } from "@/lib/media/types";

export type PostBodyProps = {
  blocks: readonly PostBlock[];
  /** Media resolved by id, so image blocks render from the shared Media layer. */
  media: ReadonlyMap<string, Media>;
};

/**
 * Renders a Post's structured block body (ADR-0005). Image blocks resolve their
 * Media reference to a URL through the shared Media layer; an unresolved
 * reference renders a labelled stand-in rather than a broken image.
 */
export function PostBody({ blocks, media }: PostBodyProps) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <p
              key={index}
              className="text-lg leading-relaxed text-pretty text-ink-700"
            >
              {block.text}
            </p>
          );
        }

        if (block.type === "heading") {
          return block.level === 3 ? (
            <h3 key={index} className="text-h3 pt-2 text-ink-950">
              {block.text}
            </h3>
          ) : (
            <h2 key={index} className="text-h2 pt-2 text-ink-950">
              {block.text}
            </h2>
          );
        }

        const asset = media.get(block.mediaId);
        const alt = block.alt ?? asset?.alt ?? "";
        const caption = block.caption ?? asset?.caption ?? null;

        if (!asset) {
          return (
            <figure
              key={index}
              className="rounded-card border border-dashed border-ink-300 bg-ink-50 p-6 text-sm text-ink-500"
            >
              Image unavailable — its Media reference could not be resolved.
            </figure>
          );
        }

        return (
          <figure
            key={index}
            className="overflow-hidden rounded-card border border-ink-200"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- media has no intrinsic dimensions to hand next/image */}
            <img
              src={asset.url}
              alt={alt}
              className="block h-auto w-full"
              loading="lazy"
            />
            {caption && (
              <figcaption className="border-t border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-600">
                {caption}
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}
