import { PageHeader } from "@/components/ui/page-header";

/**
 * Contact Us page header. A light header introduces the page; the contact
 * details, forms and WhatsApp prompt live in the dedicated sections below.
 */
export function ContactHero() {
  return (
    <PageHeader
      title="Let’s Talk."
      description="Send an inquiry about a tyre or a quotation, share feedback, or reach Safeway Tyre directly on WhatsApp. We respond to enquiries as quickly as we can."
    />
  );
}
