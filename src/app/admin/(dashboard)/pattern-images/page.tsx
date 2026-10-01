import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth/session";
import { patternDirectory } from "@/lib/catalogue/pattern-directory";
import { listPatternImageRecords } from "@/lib/media/pattern-images-server";

import { PatternImageBulkUpload } from "./pattern-image-bulk-upload";

export const metadata = { title: "Pattern Images" };

export const dynamic = "force-dynamic";

/**
 * Admin → Pattern Images (Admin-only). A dedicated management area for the
 * Pattern-level imagery used by the public product pages. It is deliberately
 * separate from the Gallery: images live in the `product-images` bucket and are
 * associated to a Pattern by the canonical Pattern Code, never by hand.
 */
export default async function PatternImagesPage() {
  await requireAdmin();

  const directory = patternDirectory();
  const existing = (await listPatternImageRecords()).map((record) => ({
    patternCode: record.patternCode,
    url: record.url,
  }));

  return (
    <Container className="py-10">
      <p className="text-eyebrow text-brand-600">Admin</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">
        Pattern Images
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-600">
        One image per Pattern. Upload images named after their Pattern Code
        (for example <code className="rounded bg-ink-100 px-1.5 py-0.5 text-xs">SFM-101.jpg</code>);
        the system matches the filename against the canonical product data,
        associates the image with that Pattern and shows it on the product
        pages. {existing.length}{" "}
        {existing.length === 1 ? "pattern has" : "patterns have"} an image.
      </p>

      <PatternImageBulkUpload directory={directory} existing={existing} />
    </Container>
  );
}
