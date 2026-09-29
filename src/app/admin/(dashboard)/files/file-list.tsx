import Link from "next/link";

import { formatFileDate, formatFileSize } from "@/lib/media/format";
import type { LibraryFile } from "@/lib/media/library";
import { hasMissingCaption } from "@/lib/media/server";

/**
 * A compact, metadata-first list view of Admin-managed media: filename, bucket,
 * type, size, upload date and caption status, with a link into the caption
 * workflow for images missing one.
 */
export function FileList({
  files,
  captionCategory = "all",
}: {
  files: readonly LibraryFile[];
  captionCategory?: string;
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-card border border-ink-200 bg-white">
      <table className="w-full min-w-[52rem] text-left text-sm">
        <thead className="border-b border-ink-200 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Preview</th>
            <th className="px-4 py-3 font-semibold">Filename</th>
            <th className="px-4 py-3 font-semibold">Bucket</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Size</th>
            <th className="px-4 py-3 font-semibold">Uploaded</th>
            <th className="px-4 py-3 font-semibold">Caption</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {files.map((file) => {
            const fileName = file.path.split("/").pop() ?? file.path;
            const missing = hasMissingCaption(file);

            return (
              <tr key={file.id}>
                <td className="px-4 py-3">
                  {file.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={file.url}
                      alt=""
                      loading="lazy"
                      className="h-10 w-10 rounded-md border border-ink-200 object-cover"
                    />
                  ) : (
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink-200 bg-ink-50 text-[10px] font-semibold uppercase text-ink-500">
                      {file.type.slice(0, 4)}
                    </span>
                  )}
                </td>
                <td className="max-w-[16rem] px-4 py-3">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate font-medium text-ink-900 hover:text-brand-600"
                    title={fileName}
                  >
                    {fileName}
                  </a>
                  <span className="block truncate text-xs text-ink-400" title={file.path}>
                    {file.path}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-600">{file.bucket}</td>
                <td className="px-4 py-3 text-ink-600">{file.type}</td>
                <td className="px-4 py-3 text-ink-600">
                  {formatFileSize(file.sizeBytes)}
                </td>
                <td className="px-4 py-3 text-ink-600">
                  {formatFileDate(file.createdAt)}
                </td>
                <td className="px-4 py-3">
                  {missing ? (
                    <Link
                      href={`/admin/files/captions?category=${captionCategory}&id=${file.id}`}
                      className="inline-flex items-center rounded-md bg-accent-500 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white hover:bg-accent-600"
                    >
                      Missing Caption
                    </Link>
                  ) : (
                    <span
                      className="block max-w-[14rem] truncate text-ink-600"
                      title={file.caption ?? ""}
                    >
                      {file.caption}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
