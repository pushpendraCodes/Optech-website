import type { Metadata } from "next";
import { AboutView } from "./AboutView";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Optech Computer Institute of Technology, Deori — 30+ years of excellence in technical education since 1994.",
};

export default function AboutPage() {
  return <AboutView />;
}
