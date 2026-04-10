import type { Metadata } from "next";
import { getPageContent } from "@/lib/get-cms-page";
import type { OznameniCms } from "@/lib/cms-defaults";
import { OznameniEditClient } from "./oznameni-edit-client";

export const metadata: Metadata = {
  title: "Úprava oznámení · CMS",
  robots: { index: false, follow: false },
};

export default async function OznameniEditPage() {
  const cms = (await getPageContent("oznameni")) as OznameniCms;
  return <OznameniEditClient initialIntro={cms.intro} />;
}
