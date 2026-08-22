import { Hero } from "@/components/sections/Hero";
import { CinematicReveal } from "@/components/sections/CinematicReveal";
import { Impact } from "@/components/sections/Impact";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
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
      <WhyChooseUs />
      <HomeAdBanner />
      <Reviews />
      <HomeCta />
      <HomeOverlays />
    </>
  );
}
