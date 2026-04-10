import { Hero } from "@/components/home/hero";
import { HallOfFame } from "@/components/home/hall-of-fame";
import { HomePrizePool } from "@/components/home/home-prize-pool";
import { HomePhotoGallery } from "@/components/home/home-photo-gallery";
import { TwitchSection } from "@/components/home/twitch-section";
import { HomeAboutSection } from "@/components/home/home-about-section";
import { HomeTournamentRoadmap } from "@/components/home/home-tournament-roadmap";
import { HomeTournamentsSection } from "@/components/home/home-tournaments-section";
import { getPageContent } from "@/lib/get-cms-page";
import type { HomeCms } from "@/lib/cms-defaults";

export default async function Home() {
  const cms = (await getPageContent("home")) as HomeCms;
  return (
    <>
      <Hero
        heroTagline={cms.heroTagline}
        heroTitle={cms.heroTitle}
        heroTitleAccent={cms.heroTitleAccent}
        heroSubtitle={cms.heroSubtitle}
        heroPoweredBy={cms.heroPoweredBy}
      />
      <HomeAboutSection cards={cms.aboutCards} />
      <HomeTournamentRoadmap />
      <HomeTournamentsSection />
      <HomePrizePool />
      <HomePhotoGallery />
      <HallOfFame />
      <TwitchSection />
    </>
  );
}
