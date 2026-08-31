"use client";

import { PageHero } from "@/components/ui/PageHero";
import { PublicTypingTest } from "@/components/typing/PublicTypingTest";

export default function TypingPage() {
  return (
    <>
      <PageHero
        eyebrow="typing_eyebrow"
        title="typing_title"
        titleAccent="typing_title_accent"
        description="typing_desc"
      />
      <section className="px-6 py-16 md:px-10 md:py-20">
        <PublicTypingTest />
      </section>
    </>
  );
}
