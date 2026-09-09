import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { StudentAuthProvider } from "@/components/providers/StudentAuth";
import { SiteChrome } from "@/components/site/SiteChrome";
import { AuroraCursorTrail } from "@/components/site/AuroraCursorTrail";
import { SeoJsonLd } from "@/components/seo/JsonLd";
import {
  SITE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_TITLE,
  siteUrl,
} from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE.legalName} Deori`,
  },
  description: SITE_DESCRIPTION,
  applicationName: `${SITE.legalName} Deori`,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE.legalName, url: siteUrl }],
  creator: SITE.legalName,
  publisher: SITE.legalName,
  category: "education",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { telephone: true, email: true, address: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: `${SITE.legalName} Deori`,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "32x32" }],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: SITE.brand,
    statusBarStyle: "black-translucent",
  },
  other: {
    "geo.region": "IN-MH",
    "geo.placename": "Deori, Maharashtra",
    "geo.position": `${SITE.geo.latitude};${SITE.geo.longitude}`,
    ICBM: `${SITE.geo.latitude}, ${SITE.geo.longitude}`,
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-IN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full bg-background text-foreground grain">
        <SeoJsonLd />
        <SmoothScrollProvider>
          <I18nProvider>
            <ReduxProvider>
              <StudentAuthProvider>
                <AuroraCursorTrail />
                <SiteChrome>{children}</SiteChrome>
              </StudentAuthProvider>
            </ReduxProvider>
          </I18nProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
