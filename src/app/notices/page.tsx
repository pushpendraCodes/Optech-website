import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { NoticesBoard } from "@/components/site/NoticesBoard";

export const metadata: Metadata = {
  title: "Notice Board",
  description: "Public notices from Optech Computer Institute, Deori.",
};

export default function NoticesPage() {
  return (
    <>
      <PageHero
        eyebrow="notices_eyebrow"
        title="notices_title"
        titleAccent="notices_title_accent"
        description="notices_desc"
      />
      <NoticesBoard />
    </>
  );
}
