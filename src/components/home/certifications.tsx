import { CertificateCarousel } from "@/components/home/certificate-carousel";
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
          <ul className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-5 sm:mt-5 sm:gap-x-8 sm:gap-y-6">
            {logos.map((logo) => (
              <li key={logo.url} className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.url}
                  alt={logo.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-10 w-auto max-w-[7.5rem] object-contain sm:h-12 sm:max-w-[9rem]"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {certificates.length > 0 && (
        <div className={logos.length > 0 ? "border-t border-ink-100 pt-8" : ""}>
          <CertificateCarousel certificates={certificates} />
        </div>
      )}
    </div>
  );
}
