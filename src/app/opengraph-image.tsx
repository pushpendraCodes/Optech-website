import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Optech Computer Institute of Technology, Deori, Maharashtra";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(145deg, #0a0a0b 0%, #14121a 48%, #1c1428 100%)",
          color: "#f4f4f5",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 20,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#d4a22f",
          }}
        >
          ISO certified · Est. 1994
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 58,
            fontWeight: 700,
            lineHeight: 1.08,
            marginTop: 22,
            maxWidth: 980,
          }}
        >
          Optech Computer Institute of Technology
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: "#d4a22f",
            marginTop: 16,
          }}
        >
          Deori, Maharashtra
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#a1a1aa",
            marginTop: 28,
          }}
        >
          Computer courses · Certifications · Placement support
        </div>
      </div>
    ),
    size,
  );
}
