import { ImageResponse } from "next/og";

export const alt = "Safeway Tyre — Exporting Durable Tyres Worldwide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** A branded 1200×630 social card; no product photography is implied. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#00703D",
          color: "#FFFFFF",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              border: "10px solid #FFFFFF",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
            Safeway Tyre
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            <span>Exporting Durable</span>
            <span>Tyres Worldwide</span>
          </div>
          <div style={{ fontSize: 30, color: "#D7F0E1" }}>
            Truck &amp; bus · Agriculture · OTR · Forklift · Two &amp; three-wheeler
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 26,
            color: "#CFE9DA",
          }}
        >
          <span>Ludhiana, India</span>
          <span style={{ color: "#FF6A00", fontWeight: 700 }}>safewaytyre.com</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
