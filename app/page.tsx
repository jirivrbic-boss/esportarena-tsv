import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Hero } from "@/components/home/hero";
import { HomeAboutSection } from "@/components/home/home-about-section";
import { HomeTournamentsSection } from "@/components/home/home-tournaments-section";
import { TwitchHub } from "@/components/home/twitch-embed";
import { getPageContent } from "@/lib/get-cms-page";
import type { HomeCms } from "@/lib/cms-defaults";
import {
  SITE_DEFAULT_DESCRIPTION,
  SITE_DEFAULT_TITLE,
  pageMetadata,
} from "@/lib/site-seo";

export const metadata: Metadata = pageMetadata({
  title: SITE_DEFAULT_TITLE,
  description: SITE_DEFAULT_DESCRIPTION,
  path: "/",
});

const heroVideoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim() || "";
const heroVideoIsLocalMp4 =
  heroVideoUrl.length > 0 && !/youtu(\.be|be\.com)/i.test(heroVideoUrl);

const HomeRegistrationCountdown = dynamic(() =>
  import("@/components/home/home-registration-countdown").then((m) => ({
    default: m.HomeRegistrationCountdown,
  }))
);

const HomeTournamentRoadmap = dynamic(() =>
  import("@/components/home/home-tournament-roadmap").then((m) => ({
    default: m.HomeTournamentRoadmap,
  }))
);

const HomePrizePool = dynamic(() =>
  import("@/components/home/home-prize-pool").then((m) => ({
    default: m.HomePrizePool,
  }))
);

const HomePhotoGallery = dynamic(() =>
  import("@/components/home/home-photo-gallery").then((m) => ({
    default: m.HomePhotoGallery,
  }))
);

const HallOfFame = dynamic(() =>
  import("@/components/home/hall-of-fame").then((m) => ({
    default: m.HallOfFame,
  }))
);

const HomePartners = dynamic(() =>
  import("@/components/home/home-partners").then((m) => ({
    default: m.HomePartners,
  }))
);

export default async function Home() {
  const cms = (await getPageContent("home")) as HomeCms;
  return (
    <>
      {heroVideoIsLocalMp4 ? (
        <link rel="preload" href={heroVideoUrl} as="video" type="video/mp4" />
      ) : null}
      <Hero
        heroTagline={cms.heroTagline}
        heroTitle={cms.heroTitle}
        heroTitleAccent={cms.heroTitleAccent}
        heroSubtitle={cms.heroSubtitle}
        heroPoweredBy={cms.heroPoweredBy}
      />
      <HomeRegistrationCountdown />
      <HomeAboutSection cards={cms.aboutCards} />
      <HomeTournamentRoadmap />
      <HomeTournamentsSection />
      <HomePrizePool />
      <HomePhotoGallery />
      <HallOfFame />
      <TwitchHub />
      <HomePartners />
    </>
  );
}
