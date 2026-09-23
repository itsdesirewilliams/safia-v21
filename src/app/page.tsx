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
      <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">
        <span aria-hidden="true" className="h-px w-8 bg-brand-600" />
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-ink-700">
          {description}
        </p>
      )}
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5"
      />
    </svg>
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
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [background-image:repeating-linear-gradient(115deg,rgba(255,255,255,0.025)_0_1px,transparent_1px_64px)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10"
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-28">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
            <span aria-hidden="true" className="h-px w-8 bg-brand-500" />
            Premium tyres made right
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Find the right tyre for every load and every road.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65">
            {SITE.name} manufactures and exports durable tyres worldwide. Search
            the catalogue by size, pattern code, name or category.
          </p>

          <div className="mt-10 max-w-2xl">
            <SearchBox />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={ROUTES.contactUs}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
            >
              Request a Quotation
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={SITE.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Take a Tour */}
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Take a Tour"
            title="Take a tour of our industry"
            description="See Safeway Tyre's operations, testing and quality process in action."
          />
          <div className="mt-10">
            {hasValidVideo ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-ink-200 shadow-card">
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
              <SectionPlaceholder
                label="Factory tour video not configured"
                detail="No YouTube video ID is available yet, so the tour is shown as a placeholder. Set YOUTUBE_VIDEO_ID to embed the tour."
              />
            )}
          </div>
        </div>
      </section>

      {/* Product Ranges */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Our Range"
            title="Product ranges"
            description="Six ranges covering transport, agriculture and industry. Browse each range to see its patterns."
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {HOME_CATEGORY_CARDS.map((card, index) => (
              <li key={card.slug}>
                <Link
                  href={ROUTES.category(card.slug)}
                  className="group flex h-full flex-col rounded-xl border border-ink-200 bg-white p-6 transition duration-200 hover:border-brand-600/50 hover:shadow-card"
                >
                  <span className="flex items-center justify-between">
                    <span className="text-sm font-semibold tabular-nums text-ink-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <ArrowRight className="h-4 w-4 text-ink-300 transition duration-200 group-hover:translate-x-0.5 group-hover:text-brand-600" />
                  </span>
                  <span className="mt-6 text-lg font-semibold tracking-tight text-ink-950">
                    {card.displayName}
                  </span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-ink-700">
                    {card.blurb}
                  </span>
                  <span className="mt-6 text-sm font-semibold text-brand-600">
                    View range
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Catalogue */}
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-end lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Catalogue"
            title="Explore the official catalogue"
            description="Browse the full Safeway Tyre catalogue of patterns and sizes. The interactive catalogue viewer ships with the catalogue module."
          />
          <div className="lg:justify-self-end">
            <Link
              href={ROUTES.catalogue}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-800"
            >
              Open the Catalogue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quality & Certifications */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Quality First"
            title="Quality &amp; certifications"
            description="Safeway Tyre products are backed by recognised quality and compliance marks."
          />
          {CERTIFICATIONS.length > 0 ? (
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CERTIFICATIONS.map((certification) => (
                <li
                  key={certification.name}
                  className="flex items-center gap-4 rounded-xl border border-ink-200 bg-white p-5"
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
                    <span className="block text-sm font-semibold text-ink-950">
                      {certification.name}
                    </span>
                    <span className="block text-xs text-ink-700">
                      {certification.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-10">
              <SectionPlaceholder
                label="Certification marks not supplied"
                detail="Certification logos and documents have not been supplied yet, so none are shown rather than inventing names or marks."
              />
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="What our clients say"
            title="Trusted by importers worldwide"
          />
          <div className="mt-10">
            {TESTIMONIALS.length > 0 ? (
              <ul className="grid gap-6 md:grid-cols-3">
                {TESTIMONIALS.map((testimonial) => (
                  <li
                    key={testimonial.author}
                    className="rounded-xl border border-ink-200 bg-ink-50 p-6"
                  >
                    <blockquote className="text-sm leading-relaxed text-ink-800">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>
                    <p className="mt-4 text-sm font-semibold text-ink-950">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-ink-700">
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
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Follow us"
            title="Latest on Instagram"
            description="The four most recent posts from Safeway Tyre's Instagram."
          />
          <div className="mt-10">
            <InstagramFeed />
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="border-b border-ink-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:px-8 lg:py-20">
          <div>
            <SectionHeading
              eyebrow="Get in touch"
              title="Send us an enquiry"
              description="Tell us the sizes and patterns you need and our team will respond with a quotation."
            />
            <dl className="mt-8 space-y-4 text-sm">
              <div className="flex flex-col gap-1 border-t border-ink-200 pt-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-700">
                  Email
                </dt>
                <dd>
                  <a
                    href={`mailto:${SITE.emails.director}`}
                    className="font-medium text-brand-600 hover:underline"
                  >
                    {SITE.emails.director}
                  </a>
                </dd>
              </div>
              <div className="flex flex-col gap-1 border-t border-ink-200 pt-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-700">
                  WhatsApp
                </dt>
                <dd>
                  <a
                    href={SITE.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-600 hover:underline"
                  >
                    {SITE.phone.primary}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
          <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-card sm:p-8">
            <QueryForm />
          </div>
        </div>
      </section>

      {/* Google Map */}
      <section className="bg-ink-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Visit us"
            title="Find us on the map"
            description="Safeway Tyre's corporate office in Ludhiana, India."
          />
          <div className="mt-10">
            {companyAddress ? (
              <div className="h-96 overflow-hidden rounded-xl border border-ink-200 shadow-card">
                <iframe
                  className="h-full w-full"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    companyAddress,
                  )}&output=embed`}
                  title="Safeway Tyre location"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <SectionPlaceholder
                label="Map location not configured"
                detail="No physical address is available yet, so the map is shown as a placeholder. Set NEXT_PUBLIC_COMPANY_ADDRESS to embed the map."
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
