import type { Metadata } from "next";
import { getDocRest } from "@/lib/firebase/firestore-rest-admin";
import { gameLabel, type GameId } from "@/lib/games";
import { pageMetadata } from "@/lib/site-seo";

type Props = { params: Promise<{ id: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const fallback = pageMetadata({
    title: "Turnaj",
    description: "Detail turnaje ESPORTARENA TSV — pravidla, termín a přihlášené týmy.",
    path: `/turnaje/${id}`,
  });

  if (!id) return fallback;

  try {
    const t = await getDocRest(`tournaments/${id}`);
    if (!t || !t.published) {
      return pageMetadata({
        title: "Turnaj",
        description: "Detail turnaje ESPORTARENA TSV.",
        path: `/turnaje/${id}`,
        noIndex: true,
      });
    }

    const name = String(t.name ?? "Turnaj").trim() || "Turnaj";
    const gameId = String(t.gameId ?? "cs2") as GameId;
    const game = gameLabel(gameId);
    const description = [
      `${name} — ${game}.`,
      "Oficiální studentský turnaj ESPORTARENA TSV pro české a slovenské školy.",
    ].join(" ");

    return pageMetadata({
      title: name,
      description,
      path: `/turnaje/${id}`,
      imagePath:
        typeof t.backgroundImageUrl === "string" && t.backgroundImageUrl
          ? t.backgroundImageUrl
          : undefined,
    });
  } catch {
    return fallback;
  }
}

export default function TurnajDetailLayout({ children }: Props) {
  return children;
}
