import type { Metadata } from "next";
import { getPageContent } from "@/lib/get-cms-page";
import type { PravidlaCms } from "@/lib/cms-defaults";
import { PravidlaEditClient } from "./pravidla-edit-client";

export const metadata: Metadata = {
  title: "Úprava pravidel · CMS",
  robots: { index: false, follow: false },
};

export default async function PravidlaEditPage() {
  const cms = (await getPageContent("pravidla")) as PravidlaCms;
  return <PravidlaEditClient initialSections={cms.sections} />;
}
