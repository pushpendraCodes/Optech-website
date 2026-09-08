import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Classroom | Optech Computer Institute",
  description: "Watch Optech live batches in a 3D virtual classroom with real enrolled students.",
};

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
