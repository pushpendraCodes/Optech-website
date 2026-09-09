import type { Metadata } from "next";
import { AboutView } from "./AboutView";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "About us",
  description:
    "About Optech Computer Institute of Technology, Deori — ISO-certified computer education since 1994 at Ganesh Chowk, Deori, Maharashtra 441901.",
  path: "/about",
  keywords: ["about Optech Deori", "computer institute history Deori"],
});

export default function AboutPage() {
  return <AboutView />;
}
