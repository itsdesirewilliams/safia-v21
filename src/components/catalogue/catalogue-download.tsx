import { ArrowIcon, ButtonLink } from "@/components/ui/button";
import { getOptionalCatalogueDownloadUrl } from "@/lib/config";
import { readCataloguePdfUrl } from "@/lib/media/catalogue-assets";

/**
 * The Catalogue page's independent download action (spec #1 / Ticket #18),
 * separate from the slider's slide navigation. It points directly at the
 * supplied catalogue PDF in `public/assets/catalogue`; a configured
 * `NEXT_PUBLIC_CATALOGUE_DOWNLOAD_URL` is used only when no PDF is supplied, and
 * a labelled placeholder stands in otherwise — never an inert or invented link.
 */
export function CatalogueDownload() {
  const url = readCataloguePdfUrl() ?? getOptionalCatalogueDownloadUrl();

  // Without a supplied PDF there is nothing to download, so the action is
  // not shown at all.
  if (!url) {
    return null;
  }

  return (
    <div className="mt-8 flex justify-center">
      <ButtonLink
        href={url}
        variant="accent"
        size="lg"
        target="_blank"
        rel="noopener noreferrer"
      >
        Download the Catalogue
        <ArrowIcon className="h-4 w-4" />
      </ButtonLink>
    </div>
  );
}
