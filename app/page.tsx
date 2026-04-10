import { Hero } from "@/components/home/hero";
import { HallOfFame } from "@/components/home/hall-of-fame";
import { TwitchSection } from "@/components/home/twitch-section";
import { HomeAboutSection } from "@/components/home/home-about-section";
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
      <HallOfFame />
      <TwitchSection />
    </>
  );
}
