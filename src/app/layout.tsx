import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { StudentAuthProvider } from "@/components/providers/StudentAuth";
import { SiteChrome } from "@/components/site/SiteChrome";
import { CustomCursor } from "@/components/site/CustomCursor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Optech Computer Institute — Deori",
    template: "%s | Optech Deori",
  },
  description:
    "Maharashtra's premier tech institute since 1994. Industry-recognized certifications, hands-on training, and 95% placement support in Deori.",
  metadataBase: new URL("http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full bg-background text-foreground grain">
        <SmoothScrollProvider>
          <I18nProvider>
            <StudentAuthProvider>
              <CustomCursor />
              <SiteChrome>{children}</SiteChrome>
            </StudentAuthProvider>
          </I18nProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
