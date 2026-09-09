import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Videos",
  description:
    "Watch course demos and campus videos from Optech Computer Institute of Technology, Deori.",
  path: "/videos",
});

export default function VideosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
