import { Hero } from "@/components/sections/Hero";
import { CinematicReveal } from "@/components/sections/CinematicReveal";
import { Impact } from "@/components/sections/Impact";
import { HomeStaff } from "@/components/sections/HomeStaff";
import { HomeAlumni } from "@/components/sections/HomeAlumni";
import { Reviews } from "@/components/sections/Reviews";
import { HomeCta } from "@/components/sections/HomeCta";
import { HomeOverlays } from "@/components/site/HomeOverlays";
import { HomeAdBanner } from "@/components/site/AdBanner";

export default function Home() {
  return (
    <>
      <Hero />
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
