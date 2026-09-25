import { ArrowIcon, ButtonLink } from "@/components/ui/button";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { getOptionalCatalogueDownloadUrl } from "@/lib/config";

/**
 * The Catalogue page's independent download action (spec #1 / Ticket #18),
 * separate from the slider's slide navigation. It is a real download when
 * Safeway has supplied `NEXT_PUBLIC_CATALOGUE_DOWNLOAD_URL`, and a labelled
 * placeholder otherwise — never an inert or invented link.
 */
export function CatalogueDownload() {
  const url = getOptionalCatalogueDownloadUrl();

  if (!url) {
    return (
      <div className="mt-8">
        <PlaceholderPanel
          kind="media"
          label="Catalogue Download Coming Soon"
          detail="The downloadable catalogue will be available here soon."
        />
      </div>
    );
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
