"use client";

import dynamic from "next/dynamic";

const CinematicReveal = dynamic(
  () => import("@/components/sections/CinematicReveal").then((m) => m.CinematicReveal),
  { ssr: false },
);
const Impact = dynamic(() => import("@/components/sections/Impact").then((m) => m.Impact));
const HomeStaff = dynamic(() => import("@/components/sections/HomeStaff").then((m) => m.HomeStaff));
const HomeAlumni = dynamic(() => import("@/components/sections/HomeAlumni").then((m) => m.HomeAlumni));
const Reviews = dynamic(() => import("@/components/sections/Reviews").then((m) => m.Reviews));
const HomeCta = dynamic(() => import("@/components/sections/HomeCta").then((m) => m.HomeCta));
const HomeOverlays = dynamic(
  () => import("@/components/site/HomeOverlays").then((m) => m.HomeOverlays),
  { ssr: false },
);
const HomeAdBanner = dynamic(
  () => import("@/components/site/AdBanner").then((m) => m.HomeAdBanner),
  { ssr: false },
);

export function HomeBelowFold() {
  return (
    <>
      <CinematicReveal />
      <Impact />
      <HomeStaff />
      <HomeAlumni />
      <Reviews />
      <HomeCta />
      <HomeAdBanner />
      <HomeOverlays />
    </>
  );
}
