import type { Metadata } from "next";

/** Production origin. Set NEXT_PUBLIC_SITE_URL on Vercel (https://your-domain). */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://optech-deori.edu.in"
).replace(/\/$/, "");

export const SITE = {
  legalName: "Optech Computer Institute of Technology",
  shortName: "Optech Computer Institute",
  brand: "Optech Deori",
  locality: "Deori",
  region: "Maharashtra",
  country: "IN",
  postalCode: "441901",
  streetAddress: "Ward No. 04, Ganesh Chowk, behind Shitala Mata Mandir",
  fullAddress:
    "Ward No. 04, Ganesh Chowk, behind Shitala Mata Mandir, Deori, Maharashtra 441901",
  email: "info@optech-deori.edu.in",
  telephone: "+91 0712 253 4587",
  foundingYear: "1994",
  geo: { latitude: 21.0684, longitude: 80.3667 },
  googlePlaceId: "ChIJkXVOL_OTKzoRjOzwf4HFYPo",
  googleMaps:
    "https://www.google.com/maps/place/?q=place_id:ChIJkXVOL_OTKzoRjOzwf4HFYPo",
  googleReview:
    "https://search.google.com/local/writereview?placeid=ChIJkXVOL_OTKzoRjOzwf4HFYPo",
} as const;

export const SITE_TITLE =
  "Optech Computer Institute of Technology Deori | Computer Courses in Deori, Maharashtra";

export const SITE_DESCRIPTION =
  "Optech Computer Institute of Technology, Deori (Maharashtra) — ISO-certified computer institute since 1994. PGDCA, Tally, typing, web development, and placement-focused courses at Ganesh Chowk, Deori 441901.";

export const SITE_KEYWORDS = [
  "Optech Computer Institute of Technology Deori",
  "Optech Computer Institute Deori",
  "OPTECH COMPUTER INSTITUTE OF TECHNOLOGY DEORI",
  "Optech Deori",
  "computer institute Deori",
  "computer courses Deori Maharashtra",
  "PGDCA Deori",
  "Tally course Deori",
  "typing class Deori",
  "computer institute Gondia",
  "ISO computer institute Maharashtra",
  "best computer institute Deori",
];

export const PUBLIC_PATHS: { path: string; changeFrequency: "weekly" | "monthly" | "daily"; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.9 },
  { path: "/courses", changeFrequency: "weekly", priority: 0.95 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.9 },
  { path: "/staff", changeFrequency: "monthly", priority: 0.7 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.6 },
  { path: "/videos", changeFrequency: "weekly", priority: 0.6 },
  { path: "/alumni", changeFrequency: "monthly", priority: 0.6 },
  { path: "/jobs", changeFrequency: "weekly", priority: 0.7 },
  { path: "/notices", changeFrequency: "daily", priority: 0.7 },
  { path: "/scholarship", changeFrequency: "monthly", priority: 0.7 },
  { path: "/calculator", changeFrequency: "monthly", priority: 0.5 },
  { path: "/typing", changeFrequency: "monthly", priority: 0.5 },
  { path: "/live", changeFrequency: "daily", priority: 0.5 },
  { path: "/links", changeFrequency: "monthly", priority: 0.4 },
  { path: "/reviews", changeFrequency: "monthly", priority: 0.6 },
];

export function absUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMeta({
  title,
  description,
  path,
  keywords = [],
  image,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = absUrl(path);
  const ogImages = image ? [{ url: absUrl(image), alt: title }] : undefined;

  return {
    title,
    description,
    keywords: [...SITE_KEYWORDS, ...keywords],
    alternates: { canonical: path || "/" },
    robots: noIndex
      ? { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url,
      siteName: SITE.legalName,
      title,
      description,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
