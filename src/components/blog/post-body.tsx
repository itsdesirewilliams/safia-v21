import type { PostBlock } from "@/lib/blog/blocks";
import { sanitizeRichText } from "@/lib/blog/sanitize";
import { cn } from "@/lib/cn";
import type { Media } from "@/lib/media/types";

export type PostBodyProps = {
  blocks: readonly PostBlock[];
  /** Media resolved by id, so image blocks render from the shared Media layer. */
  media: ReadonlyMap<string, Media>;
  /** Editor preview: show placeholders for empty image slots. */
  preview?: boolean;
};

const RICH_TEXT_CLASS =
  "text-lg leading-relaxed text-pretty text-ink-700 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_a]:font-medium [&_a]:text-brand-600 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-brand-700 [&_strong]:font-semibold [&_b]:font-semibold [&_em]:italic [&_i]:italic [&_u]:underline [&_s]:line-through [&_del]:line-through [&_br]:leading-relaxed [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_li]:pl-1 [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-brand-200 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-ink-600 [&_hr]:my-8 [&_hr]:border-ink-200 [&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-ink-950 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:leading-relaxed [&_pre]:text-white [&_code]:rounded [&_code]:bg-ink-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_h1]:text-h1 [&_h1]:pt-2 [&_h1]:text-ink-950 [&_h2]:text-h2 [&_h2]:pt-2 [&_h2]:text-ink-950 [&_h3]:text-h3 [&_h3]:pt-2 [&_h3]:text-ink-950 [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:pt-2 [&_h4]:text-ink-950 [&_h5]:text-lg [&_h5]:font-semibold [&_h5]:pt-2 [&_h5]:text-ink-950 [&_h6]:text-base [&_h6]:font-semibold [&_h6]:pt-2 [&_h6]:text-ink-950";

const HEADING_CLASS: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "text-h1 pt-2 text-ink-950",
  2: "text-h2 pt-2 text-ink-950",
  3: "text-h3 pt-2 text-ink-950",
  4: "text-xl font-semibold pt-2 text-ink-950",
  5: "text-lg font-semibold pt-2 text-ink-950",
  6: "text-base font-semibold pt-2 text-ink-950",
};

const ALIGN_CLASS: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
};

function RichText({ html, className }: { html: string; className?: string }) {
  const clean = sanitizeRichText(html);
  if (!clean) {
    return null;
  }
  return (
    <div
      className={className ?? RICH_TEXT_CLASS}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

function imageDetails(
  block: { mediaId: string; url?: string | null; caption: string | null; alt?: string | null },
  media: ReadonlyMap<string, Media>,
) {
  const asset = block.mediaId ? media.get(block.mediaId) : undefined;
  const url = asset?.url ?? block.url ?? null;
  const alt = block.caption ?? block.alt ?? asset?.alt ?? "";
  return { asset, url, alt };
}

function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex aspect-[4/3] items-center justify-center rounded-card border border-dashed border-ink-300 bg-ink-50 p-6 text-center text-sm text-ink-500">
      {label}
    </div>
  );
}

/**
 * Renders a Post's structured block body (ADR-0005, extended for the block
 * editor). Rich text is sanitized at render time as well as on save; image
 * blocks resolve their Media reference to a URL through the shared Media
 * layer. Empty image slots are skipped on the public page and shown as
 * placeholders in the editor preview.
 */
export function PostBody({ blocks, media, preview = false }: PostBodyProps) {
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

        if (block.type === "text") {
          return (
            <RichText
              key={index}
              html={block.html}
              className={cn(
                RICH_TEXT_CLASS,
                block.align ? ALIGN_CLASS[block.align] : undefined,
              )}
            />
          );
        }

        if (block.type === "heading") {
          if (!block.text) {
            return null;
          }
          const Tag = `h${block.level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
          return (
            <Tag
              key={index}
              className={cn(
                HEADING_CLASS[block.level],
                block.align ? ALIGN_CLASS[block.align] : undefined,
              )}
            >
              {block.text}
            </Tag>
          );
        }

        if (block.type === "image") {
          const { asset, url, alt } = imageDetails(block, media);
          const caption = block.caption ?? asset?.caption ?? null;

          if (!url) {
            if (block.mediaId && !asset) {
              return (
                <figure
                  key={index}
                  className="rounded-card border border-dashed border-ink-300 bg-ink-50 p-6 text-sm text-ink-500"
                >
                  Image unavailable — its Media reference could not be resolved.
                </figure>
              );
            }
            return preview ? (
              <ImagePlaceholder key={index} label="Image placeholder — add an image in the editor." />
            ) : null;
          }

          const width = block.width ? { width: `${block.width}%` } : undefined;
          return (
            <figure
              key={index}
              style={width}
              className={cn(
                "overflow-hidden rounded-card border border-ink-200",
                block.align === "right"
                  ? "ml-auto"
                  : block.align === "left"
                    ? "mr-auto"
                    : "mx-auto",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- media has no intrinsic dimensions to hand next/image */}
              <img
                src={url}
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
        }

        if (block.type === "imageText") {
          const { asset, url, alt } = imageDetails(block, media);
          const caption = block.caption ?? asset?.caption ?? null;
          const text = (
            <div>
              {block.heading && (
                <h3 className="text-h3 text-ink-950">{block.heading}</h3>
              )}
              <RichText
                html={block.html}
                className={`${block.heading ? "mt-3 " : ""}${RICH_TEXT_CLASS}`}
              />
            </div>
          );

          if (!url) {
            if (block.mediaId && !asset) {
              return (
                <figure
                  key={index}
                  className="rounded-card border border-dashed border-ink-300 bg-ink-50 p-6 text-sm text-ink-500"
                >
                  Image unavailable — its Media reference could not be resolved.
                </figure>
              );
            }
            if (!preview) {
              if (!block.html && !block.heading) {
                return null;
              }
              return <div key={index}>{text}</div>;
            }
          }

          return (
            <div
              key={index}
              className="grid gap-6 md:grid-cols-2 md:items-center"
            >
              <div className={block.position === "right" ? "md:order-2" : ""}>
                {url ? (
                  <figure className="overflow-hidden rounded-card border border-ink-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
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
                ) : block.mediaId && !asset ? (
                  <figure className="rounded-card border border-dashed border-ink-300 bg-ink-50 p-6 text-sm text-ink-500">
                    Image unavailable — its Media reference could not be resolved.
                  </figure>
                ) : (
                  <ImagePlaceholder label="Image placeholder — add an image in the editor." />
                )}
              </div>
              <div className={block.position === "right" ? "md:order-1" : ""}>
                {text}
              </div>
            </div>
          );
        }

        if (block.type === "list") {
          if (!block.heading && block.items.length === 0) {
            return null;
          }
          return (
            <section key={index} aria-labelledby={`list-${index}`}>
              {block.heading && (
                <h2 id={`list-${index}`} className="text-h2 text-ink-950">
                  {block.heading}
                </h2>
              )}
              <div className="mt-6 space-y-6">
                {block.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    {item.heading && (
                      <h3 className="text-h3 text-ink-950">{item.heading}</h3>
                    )}
                    <RichText
                      html={item.html}
                      className={`${item.heading ? "mt-2 " : ""}${RICH_TEXT_CLASS}`}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (block.type === "table") {
          const hasContent = block.rows.some((row) =>
            row.some((cell) => cell.trim() !== ""),
          );
          if (!hasContent) {
            return null;
          }
          const [header, ...body] = block.rows;
          return (
            <div
              key={index}
              className="overflow-x-auto rounded-card border border-ink-200"
            >
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                <thead className="bg-ink-50">
                  <tr>
                    {header.map((cell, cellIndex) => (
                      <th
                        key={cellIndex}
                        scope="col"
                        className="border-b border-ink-200 px-4 py-3 font-semibold text-ink-950"
                      >
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                {body.length > 0 && (
                  <tbody>
                    {body.map((row, rowIndex) => (
                      <tr key={rowIndex} className="even:bg-ink-50/50">
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="border-b border-ink-100 px-4 py-3 align-top text-ink-700"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          );
        }

        if (block.type === "faq") {
          if (!block.heading && block.items.length === 0) {
            return null;
          }
          return (
            <section key={index} aria-labelledby={`faq-${index}`}>
              {block.heading && (
                <h2 id={`faq-${index}`} className="text-h2 text-ink-950">
                  {block.heading}
                </h2>
              )}
              <div className="mt-6 divide-y divide-ink-200 rounded-card border border-ink-200 bg-white">
                {block.items.map((item, itemIndex) => (
                  <details key={itemIndex} className="group px-5 py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-ink-950 [&::-webkit-details-marker]:hidden">
                      <span>{item.question || "Question"}</span>
                      <span
                        aria-hidden="true"
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-600 transition-transform duration-200 group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <RichText
                      html={item.html}
                      className="mt-3 text-base leading-relaxed text-ink-700 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_a]:font-medium [&_a]:text-brand-600 [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_u]:underline"
                    />
                  </details>
                ))}
              </div>
            </section>
          );
        }

        return null;
      })}
    </div>
  );
}
