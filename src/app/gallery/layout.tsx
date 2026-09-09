import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Campus gallery",
  description:
    "Photos and videos from Optech Computer Institute of Technology, Deori — campus, labs, events, and student life.",
  path: "/gallery",
});

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
