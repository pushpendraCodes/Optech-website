import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Scholarship exam",
  description:
    "Take the Optech Deori scholarship exam and unlock course fee discounts at Optech Computer Institute of Technology, Deori.",
  path: "/scholarship",
  keywords: ["scholarship exam Deori", "Optech scholarship"],
});

export default function ScholarshipLayout({ children }: { children: React.ReactNode }) {
  return children;
}
