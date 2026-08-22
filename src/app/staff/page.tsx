import type { Metadata } from "next";
import { StaffView } from "@/components/staff/StaffView";

export const metadata: Metadata = {
  title: "Our Staff",
  description:
    "Meet the faculty and placement team at Optech Computer Institute, Deori — expert educators dedicated to student success.",
};

export default function StaffPage() {
  return <StaffView />;
}
