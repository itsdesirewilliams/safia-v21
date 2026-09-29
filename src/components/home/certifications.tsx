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
    <div className="flex h-full flex-col gap-8 rounded-card border border-ink-200 bg-white p-6 sm:p-8 lg:p-10">
      {logos.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-ink-500">
            Certification Marks
          </p>
          <ul className="mt-6 grid grid-cols-2 items-center gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            {logos.map((logo) => (
              <li
                key={logo.url}
                className="flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.url}
                  alt={logo.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-16 w-auto max-w-full object-contain sm:h-20 lg:h-24"
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
