import { ArrowIcon, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ROUTES, type NavLink } from "@/lib/routes";

export type PagePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  /** Ticket that will replace this placeholder with the real domain page. */
  ticket?: string;
  links?: readonly NavLink[];
};

/**
 * Shared presentation for routes whose owning ticket has not landed yet. It
 * uses the full design system but is explicit that the page is a placeholder.
 */
export function PagePlaceholder({
  eyebrow,
  title,
  description,
  ticket,
  links,
}: PagePlaceholderProps) {
  return (
    <div className="bg-white">
      <Container size="default" className="py-20 lg:py-28">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-h1 mt-6 max-w-4xl text-balance text-ink-950">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-ink-600">
          {description}
        </p>

        {ticket && (
          <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-4 py-2 text-xs font-semibold text-ink-600">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-accent-500"
            />
            Placeholder — implemented by {ticket}
          </p>
        )}

        {links && links.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <ButtonLink href={link.href} variant="outline">
                  {link.label}
                  <ArrowIcon className="h-4 w-4" />
                </ButtonLink>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12">
          <ButtonLink href={ROUTES.home} variant="dark">
            Back to home
          </ButtonLink>
        </div>
      </Container>
    </div>
  );
}
