export type SectionPlaceholderProps = {
  label: string;
  detail: string;
};

/**
 * A clearly-labelled stand-in for a section whose external input has not been
 * supplied. It never invents content — it states what is missing.
 */
export function SectionPlaceholder({ label, detail }: SectionPlaceholderProps) {
  return (
    <div className="rounded-xl border border-dashed border-ink-300 bg-ink-50 p-6 sm:p-8">
      <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-700">
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-brand-600"
        />
        {label}
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-700">
        {detail}
      </p>
    </div>
  );
}
