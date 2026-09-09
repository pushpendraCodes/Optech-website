import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Virtual classroom",
  description:
    "Join live batches in the Optech virtual classroom. Optech Computer Institute of Technology, Deori — online class sessions for enrolled students.",
  path: "/live",
});

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
