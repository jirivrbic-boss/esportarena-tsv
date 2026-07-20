import type { Metadata } from "next";
import { SupportCenter } from "@/components/support/support-center";

export const metadata: Metadata = {
  title: "Centrum podpory | ESPORTARENA TSV",
  description:
    "Časté dotazy k registraci týmů, účtu kapitána, turnajům a technické nápovědě.",
};

export default function PodporaPage() {
  return <SupportCenter />;
}
