import { ArrowIcon } from "@/components/ui/button";
import { PlaceholderPanel } from "@/components/ui/placeholder-panel";
import {
  readCertificates,
  readCertificationLogos,
} from "@/lib/media/certification-assets";

/**
 * The homepage Quality & Certifications panel body. Certification marks and ISO
 * certificate PDFs are discovered from the supplied folders under
 * `public/assets` at read time, so the section updates simply by adding or
 * removing files. Nothing is invented: when nothing is supplied the labelled
 * placeholder remains.
 */
export function Certifications() {
  const logos = readCertificationLogos();
  const certificates = readCertificates();

  if (logos.length === 0 && certificates.length === 0) {
    return (
      <PlaceholderPanel
        kind="certification"
        label="Certifications Coming Soon"
        detail="Our certification marks and documents will be published here soon."
        className="h-full"
      />
    );
  }

  return (
    <div className="flex h-full flex-col gap-8 rounded-card border border-ink-200 bg-white p-6 sm:p-8">
      {logos.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-ink-500">
            Certification Marks
          </p>
          <ul className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-6">
            {logos.map((logo) => (
              <li key={logo.url}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.url}
                  alt={logo.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-12 w-auto max-w-[9rem] object-contain"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {certificates.length > 0 && (
        <div className={logos.length > 0 ? "border-t border-ink-100 pt-8" : ""}>
          <p className="text-sm font-semibold text-ink-500">Certificates</p>
          <ul className="mt-3 divide-y divide-ink-100">
            {certificates.map((certificate) => (
              <li key={certificate.url}>
                <a
                  href={certificate.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 py-3.5 text-sm font-semibold text-ink-950 transition-colors hover:text-brand-600"
                >
                  {certificate.name}
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition-colors group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">
                    <ArrowIcon className="h-4 w-4" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
