import Image from "next/image";
import Link from "next/link";

import { QueryForm } from "@/components/contact/query-form";
import { InstagramFeed } from "@/components/home/instagram-feed";
import { SearchBox } from "@/components/home/search-box";
import { SectionPlaceholder } from "@/components/home/section-placeholder";
import {
  CERTIFICATIONS,
  HOME_CATEGORY_CARDS,
  TESTIMONIALS,
} from "@/lib/homepage";
import { getOptionalYoutubeVideoId, getPublicConfig } from "@/lib/config";
import { ROUTES } from "@/lib/routes";
import { SITE } from "@/lib/site";

export const metadata = {
  title: `${SITE.name} | ${SITE.tagline}`,
  description:
    "Search Safeway Tyre's catalogue by size, pattern code or category, explore our six product ranges, and send an enquiry.",
};

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base text-ink-800/70">{description}</p>
      )}
    </div>
  );
}

export default function HomePage() {
  const youtubeId = getOptionalYoutubeVideoId();
  const hasValidVideo = Boolean(
    youtubeId && YOUTUBE_ID_PATTERN.test(youtubeId),
  );
  const { companyAddress } = getPublicConfig();

  return (
    <>
      {/* Hero + product search */}
      <section className="bg-ink-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
            Premium tyres made right
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Find the right tyre for every load and every road.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/70">
            {SITE.name} manufactures and exports durable tyres worldwide. Search
            the catalogue by size, pattern code, name or category.
          </p>

          <div className="mt-8 max-w-2xl">
            <SearchBox />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={ROUTES.contactUs}
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
            >
              Request a Quotation
            </Link>
            <a
              href={SITE.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Take a Tour */}
      <section className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Take a Tour"
            title="Take a tour of our industry"
            description="See Safeway Tyre's operations, testing and quality process in action."
          />
          <div className="mt-8 overflow-hidden rounded-2xl border border-ink-100">
            {hasValidVideo ? (
              <div className="relative aspect-video w-full">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                  title="Safeway Tyre factory tour"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="p-4">
                <SectionPlaceholder
                  label="Factory tour video not configured"
                  detail="No YouTube video ID is available yet, so the tour is shown as a placeholder. Set YOUTUBE_VIDEO_ID to embed the tour."
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Product Ranges */}
      <section className="border-b border-ink-100 bg-ink-100/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our Range"
            title="Product ranges"
            description="Six ranges covering transport, agriculture and industry. Browse each range to see its patterns."
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HOME_CATEGORY_CARDS.map((card) => (
              <li key={card.slug}>
                <Link
                  href={ROUTES.category(card.slug)}
                  className="flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-brand-500 hover:shadow-sm"
                >
                  <span className="font-display text-lg font-semibold text-ink-950">
                    {card.displayName}
                  </span>
                  <span className="mt-2 flex-1 text-sm text-ink-800/70">
                    {card.blurb}
                  </span>
                  <span className="mt-4 text-sm font-semibold text-brand-600">
                    View range →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Catalogue */}
      <section className="border-b border-ink-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <SectionHeading
            eyebrow="Catalogue"
            title="Explore the official catalogue"
            description="Browse the full Safeway Tyre catalogue of patterns and sizes. The interactive catalogue viewer ships with the catalogue module."
          />
          <div className="lg:justify-self-end">
            <Link
              href={ROUTES.catalogue}
              className="inline-flex items-center justify-center rounded-lg bg-ink-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink-800"
            >
              Open the Catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* Quality & Certifications */}
      <section className="border-b border-ink-100 bg-ink-100/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Quality First"
            title="Quality &amp; certifications"
            description="Safeway Tyre products are backed by recognised quality and compliance marks."
          />
          {CERTIFICATIONS.length > 0 ? (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CERTIFICATIONS.map((certification) => (
                <li
                  key={certification.name}
                  className="flex items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5"
                >
                  {certification.logo ? (
                    <span className="relative h-12 w-16 shrink-0">
                      <Image
                        src={certification.logo}
                        alt={certification.name}
                        fill
                        sizes="64px"
                        className="object-contain"
                      />
                    </span>
                  ) : (
                    <span className="grid h-12 w-16 shrink-0 place-items-center rounded-md bg-ink-100 text-[10px] font-semibold uppercase tracking-wide text-ink-800">
                      Mark
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block font-display text-sm font-semibold text-ink-950">
                      {certification.name}
                    </span>
                    <span className="block text-xs text-ink-800/60">
                      {certification.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8">
              <SectionPlaceholder
                label="Certification marks not supplied"
                detail="Certification logos and documents have not been supplied yet, so none are shown rather than inventing names or marks."
              />
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What our clients say"
            title="Trusted by importers worldwide"
          />
          <div className="mt-8">
            {TESTIMONIALS.length > 0 ? (
              <ul className="grid gap-6 md:grid-cols-3">
                {TESTIMONIALS.map((testimonial) => (
                  <li
                    key={testimonial.author}
                    className="rounded-2xl border border-ink-100 bg-ink-100/30 p-6"
                  >
                    <blockquote className="text-sm text-ink-800/80">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>
                    <p className="mt-4 font-display text-sm font-semibold text-ink-950">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-ink-800/60">
                      {testimonial.location}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <SectionPlaceholder
                label="Testimonials not supplied"
                detail="Customer testimonials have not been supplied yet, so none are shown rather than inventing quotes."
              />
            )}
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="border-b border-ink-100 bg-ink-100/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Follow us"
            title="Latest on Instagram"
            description="The four most recent posts from Safeway Tyre's Instagram."
          />
          <div className="mt-8">
            <InstagramFeed />
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="border-b border-ink-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
          <div>
            <SectionHeading
              eyebrow="Get in touch"
              title="Send us an enquiry"
              description="Tell us the sizes and patterns you need and our team will respond with a quotation."
            />
            <div className="mt-6 space-y-2 text-sm text-ink-800/70">
              <p>
                <a
                  href={`mailto:${SITE.emails.director}`}
                  className="font-medium text-brand-600 hover:underline"
                >
                  {SITE.emails.director}
                </a>
              </p>
              <p>
                <a
                  href={SITE.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-600 hover:underline"
                >
                  WhatsApp: {SITE.phone.primary}
                </a>
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-ink-100 bg-ink-100/30 p-6 sm:p-8">
            <QueryForm />
          </div>
        </div>
      </section>

      {/* Google Map */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Visit us"
            title="Find us on the map"
            description="Safeway Tyre's corporate office in Ludhiana, India."
          />
          <div className="mt-8 overflow-hidden rounded-2xl border border-ink-100">
            {companyAddress ? (
              <iframe
                className="h-80 w-full"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  companyAddress,
                )}&output=embed`}
                title="Safeway Tyre location"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="p-4">
                <SectionPlaceholder
                  label="Map location not configured"
                  detail="No physical address is available yet, so the map is shown as a placeholder. Set NEXT_PUBLIC_COMPANY_ADDRESS to embed the map."
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
