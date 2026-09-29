import { describe, expect, it } from "vitest";

import { formatFileDate, formatFileSize } from "@/lib/media/format";

describe("formatFileSize", () => {
  it("formats bytes, KB and MB", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(2048)).toBe("2 KB");
    expect(formatFileSize(1572864)).toBe("1.5 MB");
  });

  it("handles sizes that are unavailable", () => {
    expect(formatFileSize(null)).toBe("—");
    expect(formatFileSize(undefined)).toBe("—");
  });
});

describe("formatFileDate", () => {
  it("returns the date portion of an ISO timestamp", () => {
    expect(formatFileDate("2026-09-29T10:00:00.000Z")).toBe("2026-09-29");
  });

  it("handles a missing date", () => {
    expect(formatFileDate(null)).toBe("—");
    expect(formatFileDate("")).toBe("—");
  });
});
