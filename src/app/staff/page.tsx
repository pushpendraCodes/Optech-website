import type { Metadata } from "next";
import { StaffView } from "@/components/staff/StaffView";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Our staff",
  description:
    "Faculty and placement team at Optech Computer Institute of Technology, Deori — experienced computer educators in Deori, Maharashtra.",
  path: "/staff",
});

export default function StaffPage() {
  return <StaffView />;
}
