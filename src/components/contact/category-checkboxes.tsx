import { CATEGORIES } from "@/lib/catalogue/categories";

import { FieldError, RequiredMark } from "./fields";

/** The six product categories offered on the inquiry form (Tubes deferred). */
const OPTIONS = CATEGORIES.filter((category) => category.slug !== "tubes");

export type CategoryCheckboxesProps = {
  idPrefix: string;
  defaultSelected?: readonly string[];
  error?: string;
  required?: boolean;
};

/**
 * Category selection for the inquiry form: all six product categories as
 * selectable checkbox-style options, multiple selections allowed. The checked
 * boxes submit under a repeated `category` field so the server receives every
 * selected category.
 */
export function CategoryCheckboxes({
  idPrefix,
  defaultSelected = [],
  error,
  required,
}: CategoryCheckboxesProps) {
  const fieldId = `${idPrefix}-category`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const selected = new Set(defaultSelected);

  return (
    <fieldset id={fieldId} aria-describedby={errorId}>
      <legend className="text-sm font-medium text-ink-950">
        Which category are you interested in? {required && <RequiredMark />}
      </legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {OPTIONS.map((category) => (
          <label
            key={category.slug}
            className="group flex cursor-pointer items-center gap-2.5 rounded-lg border border-ink-200 bg-white px-3.5 py-3 text-sm text-ink-800 transition-colors hover:border-ink-300 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-100/40"
          >
            <input
              type="checkbox"
              name="category"
              value={category.slug}
              defaultChecked={selected.has(category.slug)}
              className="h-4 w-4 shrink-0 rounded border-ink-300 text-brand-600 focus:ring-2 focus:ring-brand-500/40"
            />
            <span>{category.displayName}</span>
          </label>
        ))}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}
