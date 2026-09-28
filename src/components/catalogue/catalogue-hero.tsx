import { ArrowIcon, ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ROUTES } from "@/lib/routes";

/** Catalogue page header: a light header with the page's two primary actions. */
export function CatalogueHero() {
  return (
    <PageHeader
      title="The Safeway Tyre Catalogue"
      description="Browse our tyre range by application and product category."
      actions={
        <>
          <ButtonLink href="#catalogue" variant="accent" size="lg">
            View the Catalogue
            <ArrowIcon className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href={ROUTES.contactUs} variant="outline" size="lg">
            Request a Quotation
          </ButtonLink>
        </>
      }
    />
  );
}
