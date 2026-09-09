import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Student portal",
  description: "Private student portal for Optech Computer Institute of Technology, Deori.",
  path: "/student/login",
  noIndex: true,
});

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
