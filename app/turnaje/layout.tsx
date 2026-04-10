import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Turnaje · ESPORTARENA TSV",
  description:
    "Přehled turnajů studentské ligy — hry, prize pool, pravidla a přihlášené týmy.",
};

export default function TurnajeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
