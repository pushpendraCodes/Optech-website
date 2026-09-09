import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Job listings & placements",
  description:
    "Placement jobs and internships from Optech Computer Institute of Technology, Deori — data entry, computer operator, DTP, and campus openings.",
  path: "/jobs",
  keywords: ["jobs Deori", "computer operator jobs Deori", "Optech placement"],
});

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
