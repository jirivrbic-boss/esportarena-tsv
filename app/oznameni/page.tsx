import type { Metadata } from "next";
import { OznameniClient } from "./oznameni-client";

export const metadata: Metadata = {
  title: "Oznámení · ESPORTARENA TSV",
  description: "Novinky a oznámení turnaje ESPORTARENA TSV.",
};

export default function OznameniPage() {
  return <OznameniClient />;
}
