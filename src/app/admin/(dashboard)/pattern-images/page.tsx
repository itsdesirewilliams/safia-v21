import { AdminPageHeader } from "@/components/admin/page-header";
import { requireMediaManager } from "@/lib/auth/session";
import { patternDirectory } from "@/lib/catalogue/pattern-directory";
import { listPatternImageRecords } from "@/lib/media/pattern-images-server";

import { PatternImageBulkUpload } from "./pattern-image-bulk-upload";

export const metadata = { title: "Pattern Images" };

export const dynamic = "force-dynamic";

/**
 * Admin → Pattern Images (admin/operator). A dedicated management area for the
 * Pattern-level imagery used by the public product pages. It is deliberately
 * separate from the Gallery: images live in the `product-images` bucket and are
 * associated to a Pattern by the canonical Pattern Code, never by hand.
 */
export default async function PatternImagesPage() {
  await requireMediaManager();

  const directory = patternDirectory();
  const existing = (await listPatternImageRecords()).map((record) => ({
    patternCode: record.patternCode,
    url: record.url,
  }));

  return (
    <div>
      <AdminPageHeader
        eyebrow="Products"
        title="Pattern images"
        description={`One image per Pattern, matched by filename to the canonical Pattern Code (e.g. SFM-101.png). ${existing.length} ${
          existing.length === 1 ? "pattern has" : "patterns have"
        } an image.`}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Products" },
          { label: "Pattern Images" },
        ]}
      />

      <PatternImageBulkUpload directory={directory} existing={existing} />
    </div>
  );
}
