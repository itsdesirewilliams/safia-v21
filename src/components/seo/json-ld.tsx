import type { JsonLdNode } from "@/lib/seo/structured-data";

/**
 * Renders JSON-LD. `<` is escaped so no value can close the script element.
 */
export function JsonLd({ data }: { data: JsonLdNode | readonly JsonLdNode[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
