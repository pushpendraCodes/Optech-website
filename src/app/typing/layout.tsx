import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Typing test",
  description:
    "Free English and Hindi typing test from Optech Computer Institute of Technology, Deori. Practise speed and accuracy online.",
  path: "/typing",
  keywords: ["typing test Deori", "Hindi typing test", "English typing class Deori"],
});

export default function TypingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
