import type { Metadata } from "next";
import { OznameniClient } from "./oznameni-client";
import { getPageContent } from "@/lib/get-cms-page";
import type { OznameniCms } from "@/lib/cms-defaults";

export const metadata: Metadata = {
  title: "Oznámení · ESPORTARENA TSV",
  description: "Novinky a oznámení turnaje ESPORTARENA TSV.",
};

export default async function OznameniPage() {
  const cms = (await getPageContent("oznameni")) as OznameniCms;
  return <OznameniClient intro={cms.intro} />;
}
