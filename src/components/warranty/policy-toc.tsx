import { WARRANTY_SECTIONS } from "@/lib/warranty";

/**
 * "Contents" navigation for the warranty document. Sticky beside the body on
 * large screens; a plain numbered list above it on small screens.
 */
export function PolicyToc() {
  return (
    <nav aria-label="Contents" className="lg:sticky lg:top-28">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
        Contents
      </p>
      <ol className="mt-4 space-y-1 border-l border-ink-200 pl-4 text-sm">
        {WARRANTY_SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="flex items-baseline gap-3 py-1.5 text-ink-600 transition-colors hover:text-ink-950"
            >
              <span className="tabular-nums text-ink-400">{section.number}</span>
              <span>{section.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
