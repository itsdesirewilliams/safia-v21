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
    <div className="rounded-2xl border border-dashed border-ink-100 bg-ink-100/50 p-6">
      <p className="font-display text-sm font-semibold text-ink-800">
        {label}
      </p>
      <p className="mt-1 text-sm text-ink-800/70">{detail}</p>
    </div>
  );
}
