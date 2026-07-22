import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = pageMetadata({
  title: "Registrace kapitána",
  description:
    "Založení účtu kapitána pro správu týmů v portálu ESPORTARENA TSV.",
  path: "/registrace",
});

export default function RegistraceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
