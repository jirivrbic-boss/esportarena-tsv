import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = pageMetadata({
  title: "Hledám tým",
  description:
    "Nástěnka Hledám tým / hráče — spojení hráčů a kapitánů napříč disciplínami.",
  path: "/hledam",
});

export default function HledamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
