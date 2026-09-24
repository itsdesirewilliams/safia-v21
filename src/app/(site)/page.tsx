import Link from "next/link";

import { CategoryVisual } from "@/components/home/category-visual";
import { InstagramFeed } from "@/components/home/instagram-feed";
import { SearchBox } from "@/components/home/search-box";
import { QueryForm } from "@/components/contact/query-form";
import { ArrowIcon, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stat } from "@/components/ui/stat";
import { getHeroVideoUrl, getOptionalYoutubeVideoId, getPublicConfig } from "@/lib/config";
import {
  CERTIFICATIONS,
  HERO_SUGGESTION_POOL,
  HOME_CATEGORY_CARDS,
  HOME_STATS,
  TESTIMONIALS,
} from "@/lib/homepage";
import { ROUTES } from "@/lib/routes";
import { SITE } from "@/lib/site";

export const metadata = {
  title: `${SITE.name} | ${SITE.tagline}`,
  description:
    "Search Safeway Tyre's catalogue by size, pattern code or category, explore our product ranges, and send an enquiry.",
};

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function TourPlaceholder() {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-card bg-ink-950">
      <div
        aria-hidden="true"
        className="absolute inset-0 [background:radial-gradient(100%_100%_at_75%_10%,rgba(11,99,246,0.35),transparent_60%),radial-gradient(80%_80%_at_0%_100%,rgba(255,106,0,0.16),transparent_55%)]"
      />
      <div className="relative flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="ml-1 h-6 w-6"
          >
            <path d="M8 5.5v13l11-6.5-11-6.5Z" />
          </svg>
        </span>
        <p className="text-sm font-semibold text-white">
          Factory tour video not configured
        </p>
        <p className="max-w-sm text-sm text-white/60">
          No YouTube video ID is available yet, so the tour is shown as a
          placeholder. Set YOUTUBE_VIDEO_ID to embed the tour.
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const youtubeId = getOptionalYoutubeVideoId();
  const hasValidVideo = Boolean(youtubeId && YOUTUBE_ID_PATTERN.test(youtubeId));
  const { companyAddress } = getPublicConfig();
  const heroVideoUrl = getHeroVideoUrl();

  return (
    <>
      {/* Hero — two-panel: copy/search + factory video */}
      <section className="bg-ink-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[96rem]">
          <div className="relative overflow-hidden rounded-card bg-ink-950">
            <div
              aria-hidden="true"
              className="absolute inset-0 [background:radial-gradient(120%_110%_at_88%_0%,rgba(11,99,246,0.28),transparent_58%),radial-gradient(90%_90%_at_0%_100%,rgba(255,106,0,0.16),transparent_55%)]"
            />

            <div className="relative grid gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-14 lg:py-16">
              <div className="animate-fade-up">
                <h1 className="text-h1 text-white">
                  Tires That Keep the World Moving
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                  {SITE.name} manufactures and exports durable tyres for
                  international markets. Search the catalogue by size, pattern
                  code, name or category.
                </p>

                <div id="search" className="mt-8 max-w-2xl scroll-mt-28">
                  <SearchBox suggestions={HERO_SUGGESTION_POOL} />
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink
                    href={ROUTES.contactUs}
                    variant="accent"
                    size="lg"
                    shape="rounded-rectangle"
                  >
                    Request a Quotation
                    <ArrowIcon className="h-4 w-4" />
                  </ButtonLink>
                  <ButtonLink
                    href={ROUTES.catalogue}
                    variant="onDark"
                    size="lg"
                    shape="rounded-rectangle"
                  >
                    Explore the Catalogue
                  </ButtonLink>
                </div>
              </div>

              <figure className="relative overflow-hidden rounded-card border border-white/10 bg-ink-900 shadow-pop animate-fade-up [animation-delay:160ms]">
                <div className="aspect-video w-full">
                  <video
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster="/media/hero-poster.svg"
                  >
                    <source src={heroVideoUrl} type="video/mp4" />
                  </video>
                </div>
                <figcaption className="sr-only">
                  {SITE.name} factory and manufacturing
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Take a Tour */}
      <section className="bg-white py-20 lg:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
            <div>
              <Reveal>
                <SectionHeading
                  eyebrow="Take a Tour"
                  title="Take a tour of our industry"
                  description="See Safeway Tyre's operations, testing and quality process in action."
                />
              </Reveal>
              <Reveal delay={80}>
                <ButtonLink
                  href={ROUTES.qualityFirst}
                  variant="outline"
                  size="md"
                  className="mt-8"
                >
                  Explore Quality First
                  <ArrowIcon className="h-4 w-4" />
                </ButtonLink>
              </Reveal>
            </div>
            <Reveal delay={120}>
              {hasValidVideo ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-card border border-ink-200 shadow-card">
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
                <TourPlaceholder />
              )}
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Product ranges */}
      <section className="bg-ink-50 py-20 lg:py-28">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Our Range"
              title="Product ranges"
              description="Six ranges covering transport, agriculture and industry. Browse each range to see its patterns."
            />
          </Reveal>

          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {HOME_CATEGORY_CARDS.map((card, index) => (
              <li key={card.slug}>
                <Reveal delay={(index % 3) * 90} className="h-full">
                  <Link
                    href={ROUTES.category(card.slug)}
                    className="group flex h-full flex-col rounded-card border border-ink-200 bg-white p-3 transition duration-300 hover:border-ink-300 hover:shadow-card"
                  >
                    <CategoryVisual
                      index={index}
                      label={card.displayName}
                    />
                    <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-h3 text-ink-950">
                          {card.displayName}
                        </h3>
                        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition-colors duration-200 group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">
                          <ArrowIcon className="h-4 w-4" />
                        </span>
                      </div>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">
                        {card.blurb}
                      </p>
                      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-ink-400">
                        {card.patterns}{" "}
                        {card.patterns === 1 ? "pattern" : "patterns"}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Catalogue */}
      <section className="bg-white py-20 lg:py-28">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-card bg-ink-950 px-6 py-14 sm:px-12 lg:px-16 lg:py-20">
              <div
                aria-hidden="true"
                className="absolute inset-0 [background:radial-gradient(110%_120%_at_90%_0%,rgba(11,99,246,0.4),transparent_58%),radial-gradient(70%_70%_at_0%_110%,rgba(255,106,0,0.18),transparent_55%)]"
              />
              <div className="relative grid gap-14 lg:grid-cols-2 lg:items-center">
                <div>
                  <SectionHeading
                    tone="dark"
                    eyebrow="Catalogue"
                    title="Explore the official catalogue"
                    description="Browse the full Safeway Tyre catalogue of patterns and sizes. The interactive catalogue viewer ships with the catalogue module."
                  />
                  <div className="mt-8">
                    <ButtonLink
                      href={ROUTES.catalogue}
                      variant="accent"
                      size="lg"
                    >
                      Open the Catalogue
                      <ArrowIcon className="h-4 w-4" />
                    </ButtonLink>
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className="relative hidden h-72 lg:block"
                >
                  <div className="absolute left-6 top-4 h-64 w-52 -rotate-6 rounded-2xl border border-white/10 bg-white/[0.06]" />
                  <div className="absolute left-24 top-8 h-64 w-56 rotate-3 rounded-2xl border border-white/15 bg-white/[0.09] p-5">
                    <div className="h-3 w-24 rounded-full bg-accent-500/80" />
                    <div className="mt-5 space-y-3">
                      <div className="h-2.5 w-full rounded-full bg-white/20" />
                      <div className="h-2.5 w-4/5 rounded-full bg-white/15" />
                      <div className="h-2.5 w-3/5 rounded-full bg-white/10" />
                    </div>
                    <div className="mt-8 grid grid-cols-3 gap-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-14 rounded-lg bg-white/[0.07]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Quality & certifications */}
      <section className="bg-white pb-20 lg:pb-28">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Quality First"
              title="Quality & certifications"
              description="Safeway Tyre products are backed by recognised quality and compliance marks."
            />
          </Reveal>
          <div className="mt-14 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Reveal>
              <div className="h-full rounded-card bg-ink-950 p-8 sm:p-10">
                <p className="text-lg leading-relaxed text-white/75">
                  From freight and agriculture to industry and off-road, every
                  Safeway range is built on the same manufacturing discipline.
                </p>
                <div className="mt-10 grid grid-cols-3 gap-6">
                  {HOME_STATS.map((item) => (
                    <Stat
                      key={item.label}
                      value={item.value}
                      label={item.label}
                      tone="dark"
                    />
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              {CERTIFICATIONS.length > 0 ? (
                <ul className="grid gap-4 sm:grid-cols-2">
                  {CERTIFICATIONS.map((certification) => (
                    <li
                      key={certification.name}
                      className="rounded-card border border-ink-200 bg-white p-6"
                    >
                      <p className="text-sm font-semibold text-ink-950">
                        {certification.name}
                      </p>
                      <p className="mt-1 text-sm text-ink-500">
                        {certification.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <PlaceholderPanel
                  kind="certification"
                  label="Certification marks not supplied"
                  detail="Certification logos and documents have not been supplied yet, so none are shown rather than inventing names or marks."
                  className="h-full"
                />
              )}
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="bg-ink-50 py-20 lg:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
            <Reveal>
              <SectionHeading
                eyebrow="What our clients say"
                title="Trusted by importers worldwide"
              />
            </Reveal>
            <Reveal delay={100}>
              {TESTIMONIALS.length > 0 ? (
                <ul className="grid gap-5 md:grid-cols-2">
                  {TESTIMONIALS.map((testimonial) => (
                    <li
                      key={testimonial.author}
                      className="rounded-card border border-ink-200 bg-white p-8"
                    >
                      <blockquote className="text-lg leading-relaxed text-ink-800">
                        &ldquo;{testimonial.quote}&rdquo;
                      </blockquote>
                      <p className="mt-6 text-sm font-semibold text-ink-950">
                        {testimonial.author}
                      </p>
                      <p className="text-sm text-ink-500">
                        {testimonial.location}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <PlaceholderPanel
                  kind="testimonial"
                  label="Testimonials not supplied"
                  detail="Customer testimonials have not been supplied yet, so none are shown rather than inventing quotes."
                />
              )}
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Instagram */}
      <section className="bg-white py-20 lg:py-28">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Follow us"
              title="Latest on Instagram"
              description="The four most recent posts from Safeway Tyre's Instagram."
            />
          </Reveal>
          <div className="mt-14">
            <InstagramFeed />
          </div>
        </Container>
      </section>

      {/* Inquiry */}
      <section className="bg-ink-50 py-20 lg:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <Reveal>
                <SectionHeading
                  eyebrow="Get in touch"
                  title="Send us an enquiry"
                  description="Tell us the sizes and patterns you need and our team will respond with a quotation."
                />
              </Reveal>
              <Reveal delay={80}>
                <dl className="mt-10 space-y-5 text-sm">
                  <div className="border-t border-ink-200 pt-5">
                    <dt className="text-eyebrow text-ink-500">Email</dt>
                    <dd className="mt-2">
                      <a
                        href={`mailto:${SITE.emails.director}`}
                        className="font-semibold text-brand-600 hover:underline"
                      >
                        {SITE.emails.director}
                      </a>
                    </dd>
                  </div>
                  <div className="border-t border-ink-200 pt-5">
                    <dt className="text-eyebrow text-ink-500">WhatsApp</dt>
                    <dd className="mt-2">
                      <a
                        href={SITE.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-brand-600 hover:underline"
                      >
                        {SITE.phone.primary}
                      </a>
                    </dd>
                  </div>
                </dl>
              </Reveal>
            </div>
            <Reveal delay={120}>
              <div className="rounded-card border border-ink-200 bg-white p-6 shadow-card sm:p-8">
                <QueryForm />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Map */}
      <section className="bg-white py-20 lg:py-28">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Visit us"
              title="Find us on the map"
              description="Safeway Tyre's corporate office in Ludhiana, India."
            />
          </Reveal>
          <div className="mt-14">
            {companyAddress ? (
              <div className="h-96 overflow-hidden rounded-card border border-ink-200 shadow-card">
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
              <PlaceholderPanel
                kind="location"
                label="Map location not configured"
                detail="No physical address is available yet, so the map is shown as a placeholder. Set NEXT_PUBLIC_COMPANY_ADDRESS to embed the map."
              />
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
