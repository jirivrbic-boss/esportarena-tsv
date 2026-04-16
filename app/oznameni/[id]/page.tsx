import type { Metadata } from "next";
import { AnnouncementDetailClient } from "./announcement-detail-client";

export const metadata: Metadata = {
  title: "Detail oznámení · ESPORTARENA TSV",
  description: "Detail novinky a oznámení turnaje ESPORTARENA TSV.",
};

export default function OznameniDetailPage() {
  return <AnnouncementDetailClient />;
}
