import { describe, expect, it } from "vitest";

import {
  CERTIFICATES_ROOT,
  CERTIFICATION_LOGOS_ROOT,
  discoverCertificates,
  discoverCertificationLogos,
  isCertificateImage,
  isCertificationLogo,
  labelFromFilename,
  readCertificates,
  readCertificationLogos,
} from "@/lib/media/certification-assets";

describe("supported certification formats", () => {
  it("accepts image formats as logos and as certificate previews", () => {
    for (const filename of ["logo.png", "logo.svg", "logo.webp", "logo.JPG"]) {
      expect(isCertificationLogo(filename)).toBe(true);
    }
    expect(isCertificationLogo("logo.pdf")).toBe(false);

    for (const filename of [
      "cert.webp",
      "cert.jpg",
      "cert.jpeg",
      "cert.png",
      "cert.WEBP",
    ]) {
      expect(isCertificateImage(filename)).toBe(true);
    }
    // The source PDFs are archive files only — never certificate previews.
    expect(isCertificateImage("cert.pdf")).toBe(false);
  });
});

describe("filename labels", () => {
  it("turns separators into spaces and drops the extension", () => {
    expect(labelFromFilename("ISO-9001.pdf")).toBe("ISO 9001");
    expect(labelFromFilename("iso_14001.pdf")).toBe("iso 14001");
  });
});

describe("certification discovery", () => {
  it("maps logos to public URLs, naturally ordered", () => {
    const logos = discoverCertificationLogos(["logo-10.png", "logo-2.png"]);

    expect(logos.map((logo) => logo.filename)).toEqual([
      "logo-2.png",
      "logo-10.png",
    ]);
    expect(logos[0]).toEqual({
      filename: "logo-2.png",
      url: `${CERTIFICATION_LOGOS_ROOT}/logo-2.png`,
      alt: "logo 2",
    });
  });

  it("percent-encodes spaces in logo filenames", () => {
    const [logo] = discoverCertificationLogos(["ISO 9001 mark.png"]);
    expect(logo.url).toBe(
      `${CERTIFICATION_LOGOS_ROOT}/ISO%209001%20mark.png`,
    );
  });

  it("derives a display name from the certificate image filename", () => {
    const certificates = discoverCertificates(["ISO-14001.webp", "notes.pdf"]);

    expect(certificates).toEqual([
      {
        filename: "ISO-14001.webp",
        url: `${CERTIFICATES_ROOT}/ISO-14001.webp`,
        name: "ISO 14001",
      },
    ]);
  });
});

describe("supplied certification assets", () => {
  it("discovers the six uploaded certification logos", () => {
    const logos = readCertificationLogos();

    expect(logos).toHaveLength(6);
    for (const logo of logos) {
      expect(logo.url.startsWith(`${CERTIFICATION_LOGOS_ROOT}/`)).toBe(true);
      expect(logo.alt.length).toBeGreaterThan(0);
    }
  });

  it("discovers the three uploaded ISO certificate images (never the PDFs)", () => {
    const certificates = readCertificates();

    expect(certificates).toHaveLength(3);
    for (const certificate of certificates) {
      expect(certificate.url.startsWith(`${CERTIFICATES_ROOT}/`)).toBe(true);
      expect(certificate.url.toLowerCase().endsWith(".pdf")).toBe(false);
      expect(certificate.name.length).toBeGreaterThan(0);
    }
  });
});
