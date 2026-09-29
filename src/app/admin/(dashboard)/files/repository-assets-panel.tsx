import { formatFileSize } from "@/lib/media/format";
import { readRepositoryAssets } from "@/lib/media/repository-assets";

/**
 * Read-only inventory of the developer/repository-managed assets. These ship
 * with the code under `public/assets` and are edited in the repository, never
 * through Supabase — so there are deliberately no upload/edit/delete controls
 * here. They are shown for visibility and clarity only.
 */
export function RepositoryAssetsPanel() {
  const groups = readRepositoryAssets();
  const total = groups.reduce((sum, group) => sum + group.files.length, 0);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-card border border-accent-500/40 bg-accent-500/10 px-4 py-3 text-sm text-ink-800">
        <span className="font-semibold text-accent-700">
          Developer / repository assets
        </span>
        <span>
          {total} {total === 1 ? "file" : "files"} in{" "}
          <code className="rounded bg-white/60 px-1.5 py-0.5 text-xs">
            public/assets
          </code>
          . These are managed in the repository and are read-only here.
        </span>
      </div>

      <div className="mt-6 space-y-6">
        {groups.map((group) => (
          <section
            key={group.id}
            className="rounded-card border border-ink-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink-950">
                  {group.label}
                </h2>
                <p className="mt-0.5 text-sm text-ink-500">
                  {group.description}
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-ink-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-600">
                Repository
              </span>
            </div>

            {group.files.length === 0 ? (
              <p className="mt-3 text-sm text-ink-400">
                No files supplied yet.
              </p>
            ) : (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {group.files.map((file) => (
                  <li
                    key={file.url}
                    className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 px-3 py-2 text-sm"
                  >
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-0 truncate font-medium text-ink-800 hover:text-brand-600"
                      title={file.name}
                    >
                      {file.name}
                    </a>
                    <span className="shrink-0 text-xs text-ink-400">
                      {formatFileSize(file.sizeBytes)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
