import type { Metadata } from "next";
import { OznameniClient } from "./oznameni-client";
import { getPageContent } from "@/lib/get-cms-page";
import type { OznameniCms } from "@/lib/cms-defaults";
import { pageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = pageMetadata({
  title: "Oznámení",
  description:
    "Oficiální novinky a oznámení turnaje ESPORTARENA TSV pro kapitány i veřejnost.",
  path: "/oznameni",
});

export default async function OznameniPage() {
  const cms = (await getPageContent("oznameni")) as OznameniCms;
  return <OznameniClient intro={cms.intro} />;
}
