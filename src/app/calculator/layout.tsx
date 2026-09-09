import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Fee calculator",
  description:
    "Estimate course fees, coupons, and installments at Optech Computer Institute of Technology, Deori.",
  path: "/calculator",
});

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
