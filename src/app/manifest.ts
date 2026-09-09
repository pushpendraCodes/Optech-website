import type { MetadataRoute } from "next";
import { SITE, SITE_DESCRIPTION } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.legalName} Deori`,
    short_name: SITE.brand,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#d4a22f",
    lang: "en-IN",
    icons: [
      { src: "/icon.png", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/logo.webp", sizes: "512x512", type: "image/webp", purpose: "any" },
    ],
  };
}
