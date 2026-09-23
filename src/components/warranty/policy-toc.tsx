import { WARRANTY_SECTIONS } from "@/lib/warranty";

/**
 * "On this page" navigation for the warranty policy. Sticky on large screens;
 * a plain list above the content on small screens.
 */
export function PolicyToc() {
  return (
    <nav aria-label="On this page" className="lg:sticky lg:top-28">
      <p className="text-eyebrow text-ink-500">On this page</p>
      <ol className="mt-5 space-y-1 border-l border-ink-200">
        {WARRANTY_SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="group -ml-px flex min-h-11 items-center gap-3 border-l-2 border-transparent py-2 pl-4 text-sm text-ink-600 transition-colors hover:border-accent-500 hover:text-ink-950"
            >
              <span className="tabular-nums text-ink-400 group-hover:text-accent-600">
                {section.number}
              </span>
              <span>{section.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
