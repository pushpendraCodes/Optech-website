"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/sections/Footer";
import { Navbar } from "@/components/ui/Navbar";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { MarqueeBar } from "@/components/site/MarqueeBar";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudent = pathname.startsWith("/student");

  if (isStudent) {
    return <main>{children}</main>;
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40">
        <MarqueeBar />
        <Navbar />
      </div>
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
