import type { Metadata } from "next";
import { SupportCenter } from "@/components/support/support-center";
import { pageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = pageMetadata({
  title: "Centrum podpory",
  description:
    "FAQ, technická nápověda a kontaktní formulář pro kapitány a účastníky.",
  path: "/podpora",
});

export default function PodporaPage() {
  return <SupportCenter />;
}
