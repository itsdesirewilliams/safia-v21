import { describe, expect, it } from "vitest";

import {
  CERTIFICATES_ROOT,
  CERTIFICATION_LOGOS_ROOT,
  discoverCertificates,
  discoverCertificationLogos,
  isCertificate,
  isCertificationLogo,
  labelFromFilename,
} from "@/lib/media/certification-assets";

describe("supported certification formats", () => {
  it("accepts web image formats as logos and only PDFs as certificates", () => {
    for (const filename of ["logo.png", "logo.svg", "logo.webp", "logo.JPG"]) {
      expect(isCertificationLogo(filename)).toBe(true);
    }
    expect(isCertificationLogo("logo.pdf")).toBe(false);

    expect(isCertificate("ISO-9001.pdf")).toBe(true);
    expect(isCertificate("ISO-9001.PDF")).toBe(true);
    expect(isCertificate("ISO-9001.png")).toBe(false);
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

  it("derives a clickable certificate name from the filename", () => {
    const certificates = discoverCertificates(["ISO-14001.pdf", "notes.txt"]);

    expect(certificates).toEqual([
      {
        filename: "ISO-14001.pdf",
        url: `${CERTIFICATES_ROOT}/ISO-14001.pdf`,
        name: "ISO 14001",
      },
    ]);
  });
});
