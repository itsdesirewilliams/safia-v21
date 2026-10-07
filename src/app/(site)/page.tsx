import Image from "next/image";
import Link from "next/link";

import { CategoryVisual } from "@/components/home/category-visual";
import { Certifications } from "@/components/home/certifications";
import { HeroVideo } from "@/components/home/hero-video";
import { InstagramFeed } from "@/components/home/instagram-feed";
import { SearchBox } from "@/components/home/search-box";
import { YouTubeTour } from "@/components/home/youtube-tour";
import { ParallaxMedia } from "@/components/motion/parallax-media";
import { RevealImage } from "@/components/motion/reveal-image";
import { RevealText } from "@/components/motion/reveal-text";
import { QueryForm } from "@/components/contact/query-form";
import { ArrowIcon, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CountryFlag } from "@/components/ui/country-flag";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  DEFAULT_YOUTUBE_VIDEO_ID,
  getHeroVideoUrl,
  getYoutubeVideoId,
} from "@/lib/config";
import {
  HERO_PLACEHOLDER_PHRASES,
  HERO_SUGGESTION_POOL,
  HOME_CATEGORY_CARDS,
  TESTIMONIALS,
} from "@/lib/homepage";
import {
  CATALOGUE_HEADER_HEIGHT,
  CATALOGUE_HEADER_WIDTH,
  readCatalogueHeaderImage,
} from "@/lib/media/catalogue-visual-assets";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { languageAlternates, localizedHref } from "@/lib/i18n/url";
import { readProductRangeImages } from "@/lib/media/product-range-assets";
import { isValidYoutubeVideoId } from "@/lib/media/youtube";
import { ROUTES } from "@/lib/routes";
import {
  CORPORATE_OFFICE_ADDRESS,
  CORPORATE_OFFICE_MAP_EMBED_URL,
  CORPORATE_OFFICE_MAPS_LINK,
  MARKETING_PHONES,
  PUBLIC_CONTACT_EMAILS,
  SITE,
  telHref,
} from "@/lib/site";

export async function generateMetadata() {
  const dict = await getDictionary();
  return {
    title: dict.meta.homeTitle,
    description: dict.meta.homeDescription,
    alternates: { canonical: "/", languages: languageAlternates("/") },
  };
}

export default async function HomePage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const configuredYoutubeId = getYoutubeVideoId();
  const youtubeId = isValidYoutubeVideoId(configuredYoutubeId)
    ? configuredYoutubeId
    : DEFAULT_YOUTUBE_VIDEO_ID;
  const heroVideoUrl = getHeroVideoUrl();
  const productRangeImages = readProductRangeImages();
  const catalogueHeaderImage = readCatalogueHeaderImage();

  return (
    <>
      {/* Hero — two-panel: copy/search + factory video */}
      <section className="bg-ink-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[96rem]">
          <div className="relative overflow-hidden rounded-lg bg-ink-950">
            <div
              aria-hidden="true"
              className="absolute inset-0 [background:radial-gradient(120%_110%_at_88%_0%,color-mix(in_srgb,var(--color-primary)_28%,transparent),transparent_58%),radial-gradient(90%_90%_at_0%_100%,color-mix(in_srgb,var(--color-accent)_16%,transparent),transparent_55%)]"
            />

            <div className="relative grid gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-14 lg:py-16">
              <div>
                <RevealText
                  as="h1"
                  text={dict.home.heroTitle}
                  className="text-h1 text-white"
                  delay={120}
                />
                <Reveal variant="mask" delay={280} className="mt-5">
                  <p className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                    {dict.home.heroSubtitle}
                  </p>
                </Reveal>

                <Reveal variant="mask" delay={400} className="mt-8 max-w-2xl">
                  <div id="search" className="scroll-mt-28">
                    <SearchBox
                      suggestions={HERO_SUGGESTION_POOL}
                      placeholderPhrases={HERO_PLACEHOLDER_PHRASES}
                      labels={dict.search}
                      locale={locale}
                    />
                  </div>
                </Reveal>

                <Reveal variant="mask" delay={520} className="mt-8">
                  <div className="flex flex-wrap gap-3">
                    <ButtonLink
                      href={localizedHref(locale, ROUTES.contactUs)}
                      variant="accent"
                      size="lg"
                      shape="rounded-rectangle"
                    >
                      {dict.common.requestQuotation}
                      <ArrowIcon className="h-4 w-4" />
                    </ButtonLink>
                    <ButtonLink
                      href={localizedHref(locale, ROUTES.catalogue)}
                      variant="onDark"
                      size="lg"
                      shape="rounded-rectangle"
                    >
                      {dict.common.exploreCatalogue}
                    </ButtonLink>
                  </div>
                </Reveal>
              </div>

              <RevealImage delay={60}>
                <ParallaxMedia>
                  <div data-reveal-media>
                    <HeroVideo
                      src={heroVideoUrl}
                      poster="/media/hero-poster.svg"
                      label={`${SITE.name} factory and manufacturing`}
                    />
                  </div>
                </ParallaxMedia>
              </RevealImage>
            </div>
          </div>
        </div>
      </section>

      {/* Take a Tour */}
      <section className="bg-white py-20 lg:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
            <div>
              <Reveal variant="mask">
                <SectionHeading
                  accentLine
                  title={dict.home.tourHeading}
                  description={dict.home.tourDescription}
                />
              </Reveal>
            </div>
            <Reveal delay={120}>
              <YouTubeTour
                id={youtubeId}
                title="Safeway Tyre factory tour"
              />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Product ranges */}
      <section className="bg-ink-50 py-20 lg:py-28">
        <Container>
          <Reveal variant="mask">
            <SectionHeading
              accentLine
              title={dict.home.rangesHeading}
              description={dict.home.rangesDescription}
            />
          </Reveal>

          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {HOME_CATEGORY_CARDS.map((card, index) => (
              <li key={card.slug}>
                <Reveal delay={(index % 3) * 90} className="h-full">
                  <Link
                    href={localizedHref(locale, ROUTES.category(card.slug))}
                    className="group flex h-full flex-col rounded-card border border-ink-200 bg-white p-3 transition duration-300 hover:-translate-y-1 hover:border-ink-300 hover:shadow-card motion-reduce:hover:translate-y-0"
                  >
                    <RevealImage>
                      <div data-reveal-media>
                        <CategoryVisual
                          label={card.displayName}
                          image={productRangeImages[card.slug]}
                        />
                      </div>
                    </RevealImage>
                    <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-h3 text-ink-950">
                          {dict.categories[card.slug]}
                        </h3>
                        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition-colors duration-200 group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">
                          <ArrowIcon className="h-4 w-4" />
                        </span>
                      </div>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">
                        {card.blurb}
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
            <div className="relative rounded-card bg-ink-950 px-6 py-14 sm:px-12 lg:px-16 lg:py-20">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-card [background:radial-gradient(110%_120%_at_90%_0%,color-mix(in_srgb,var(--color-primary)_40%,transparent),transparent_58%),radial-gradient(70%_70%_at_0%_110%,color-mix(in_srgb,var(--color-accent)_18%,transparent),transparent_55%)]"
              />
              <div className="relative z-0 grid gap-10 lg:grid-cols-2 lg:items-center">
                <div className="lg:max-w-lg">
                  <SectionHeading
                    accentLine
                    tone="dark"
                    title={dict.home.catalogueHeading}
                    description={dict.home.catalogueDescription}
                  />
                  <div className="mt-8">
                    <ButtonLink
                      href={localizedHref(locale, ROUTES.catalogue)}
                      variant="accent"
                      size="lg"
                    >
                      {dict.common.openCatalogue}
                      <ArrowIcon className="h-4 w-4" />
                    </ButtonLink>
                  </div>
                </div>

                {!catalogueHeaderImage && (
                  <div className="relative hidden h-72 lg:block">
                    <div aria-hidden="true" className="absolute inset-0">
                      <div className="absolute left-6 top-4 h-64 w-52 -rotate-6 rounded-lg border border-white/10 bg-white/[0.06]" />
                      <div className="absolute left-24 top-8 h-64 w-56 rotate-3 rounded-lg border border-white/15 bg-white/[0.09] p-5">
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
                )}
              </div>

              {catalogueHeaderImage && (
                <>
                  {/* Mobile / tablet: below the button, inside the card. */}
                  <div className="relative mt-10 lg:hidden">
                    <RevealImage>
                      <div data-reveal-media>
                        <Image
                          src={catalogueHeaderImage}
                          alt=""
                          width={CATALOGUE_HEADER_WIDTH}
                          height={CATALOGUE_HEADER_HEIGHT}
                          sizes="(max-width: 640px) 280px, 340px"
                          className="mx-auto h-auto w-full max-w-[280px] drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)] sm:max-w-[340px]"
                        />
                      </div>
                    </RevealImage>
                  </div>

                  {/* Desktop: floats over the card, extending slightly beyond. */}
                  <RevealImage className="pointer-events-none absolute -right-3 top-1/2 z-10 hidden w-[40%] max-w-[440px] -translate-y-1/2 lg:block">
                    <div data-reveal-media>
                      <Image
                        src={catalogueHeaderImage}
                        alt=""
                        width={CATALOGUE_HEADER_WIDTH}
                        height={CATALOGUE_HEADER_HEIGHT}
                        sizes="(min-width: 1024px) 440px, 100vw"
                        className="block h-auto w-full drop-shadow-[0_30px_50px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                  </RevealImage>
                </>
              )}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Quality & certifications */}
      <section className="bg-white pb-20 lg:pb-28">
        <Container>
          <Reveal variant="mask">
            <SectionHeading
              accentLine
              title={dict.home.qualityHeading}
              description={dict.home.qualityDescription}
            />
          </Reveal>
          <div className="mt-14">
            <Reveal>
              <Certifications />
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
                accentLine
                title={dict.home.testimonialsHeading}
              />
            </Reveal>
            {TESTIMONIALS.length > 0 ? (
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {TESTIMONIALS.map((testimonial, index) => (
                  <li
                    key={`${testimonial.author}-${testimonial.location}`}
                    className="h-full"
                  >
                    <Reveal delay={(index % 3) * 90} className="h-full">
                      <div className="flex h-full flex-col rounded-card border border-ink-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-ink-300 hover:shadow-card motion-reduce:hover:translate-y-0">
                        <blockquote className="text-base leading-relaxed text-ink-800">
                          &ldquo;{testimonial.quote}&rdquo;
                        </blockquote>
                        <p className="mt-5 text-sm font-semibold text-ink-950">
                          {testimonial.author}
                          <span className="inline-flex flex-wrap items-center gap-x-1.5 font-normal text-ink-500">
                            <span>— {testimonial.location}</span>
                            <CountryFlag
                              code={testimonial.countryCode}
                              country={testimonial.location}
                            />
                          </span>
                        </p>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
            ) : (
              <Reveal delay={100}>
                <PlaceholderPanel
                  kind="testimonial"
                  label="Testimonials Coming Soon"
                  detail="Customer testimonials will be published here soon."
                />
              </Reveal>
            )}
          </div>
        </Container>
      </section>

      {/* Instagram */}
      <section className="bg-white py-20 lg:py-28">
        <Container>
          <Reveal variant="mask">
            <SectionHeading
              accentLine
              title={dict.home.instagramHeading}
              description={dict.home.instagramDescription}
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
              <Reveal variant="mask">
                <SectionHeading
                  accentLine
                  title={dict.home.inquiryHeading}
                  description={dict.home.inquiryDescription}
                />
              </Reveal>
              <Reveal delay={80}>
                <dl className="mt-10 space-y-5 text-sm">
                  <div className="border-t border-ink-200 pt-5">
                    <dt className="text-sm font-semibold text-ink-500">
                      {dict.common.email}
                    </dt>
                    <dd className="mt-2 space-y-1">
                      {PUBLIC_CONTACT_EMAILS.map((email) => (
                        <span key={email} className="block break-all">
                          <a
                            href={`mailto:${email}`}
                            className="font-semibold text-brand-600 hover:underline"
                          >
                            {email}
                          </a>
                        </span>
                      ))}
                    </dd>
                  </div>
                  <div className="border-t border-ink-200 pt-5">
                    <dt className="text-sm font-semibold text-ink-500">
                      {dict.common.phone}
                    </dt>
                    <dd className="mt-2 space-y-1">
                      {MARKETING_PHONES.map((phone) => (
                        <span key={phone} className="block whitespace-nowrap">
                          <a
                            href={telHref(phone)}
                            className="font-semibold text-brand-600 hover:underline"
                          >
                            {phone}
                          </a>
                        </span>
                      ))}
                    </dd>
                  </div>
                  <div className="border-t border-ink-200 pt-5">
                    <dt className="text-sm font-semibold text-ink-500">
                      {dict.common.whatsapp}
                    </dt>
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
          <Reveal variant="mask">
            <SectionHeading
              accentLine
              title={dict.home.mapHeading}
              description={dict.home.mapDescription}
            />
          </Reveal>
          <div className="mt-14">
            <div className="overflow-hidden rounded-card border border-ink-200 bg-white shadow-card">
              <iframe
                className="block h-80 w-full sm:h-96"
                src={CORPORATE_OFFICE_MAP_EMBED_URL}
                title={`Map of ${CORPORATE_OFFICE_ADDRESS}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 px-5 py-4">
                <p className="text-sm text-ink-600">
                  {CORPORATE_OFFICE_ADDRESS}
                </p>
                <a
                  href={CORPORATE_OFFICE_MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
                >
                  {dict.common.openInGoogleMaps}
                  <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
