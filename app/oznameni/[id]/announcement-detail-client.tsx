"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { getFirebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  ANNOUNCEMENT_CATEGORY_LABEL,
  parseAnnouncementCategory,
} from "@/lib/announcements";

type AnnouncementDetail = {
  title: string;
  content: string;
  highlightedContent?: string;
  imageUrl: string | null;
  authorName: string;
  category: string;
  createdAtMs: number;
};

function formatDate(ms: number) {
  if (!ms) return "";
  return new Intl.DateTimeFormat("cs-CZ", { dateStyle: "long" }).format(new Date(ms));
}

function renderHighlightedText(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function AnnouncementDetailClient() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<AnnouncementDetail | null>(null);

  useEffect(() => {
    async function load() {
      if (!id || !isFirebaseConfigured()) {
        setError(!id ? "Neplatný odkaz." : "Firebase není nakonfigurováno.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const snap = await getDoc(doc(getFirebaseDb(), "announcements", id));
        if (!snap.exists()) {
          setError("Oznámení nebylo nalezeno.");
          setItem(null);
          return;
        }
        const x = snap.data();
        const ts = x.createdAt;
        const createdAtMs = ts && typeof ts.toMillis === "function" ? ts.toMillis() : 0;
        const legacyImage =
          Array.isArray(x.imageUrls) && typeof x.imageUrls[0] === "string"
            ? String(x.imageUrls[0])
            : null;
        setItem({
          title: String(x.title ?? "Oznámení"),
          content: String(x.content ?? ""),
          highlightedContent: String(x.highlightedContent ?? ""),
          imageUrl: x.imageUrl ? String(x.imageUrl) : legacyImage,
          authorName: String(x.authorName ?? "Administrace"),
          category: String(x.category ?? "general"),
          createdAtMs,
        });
      } catch {
        setError("Oznámení se nepodařilo načíst.");
        setItem(null);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-slate-500">Načítání…</div>;
  }
  if (error || !item) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-red-400">{error ?? "Oznámení není dostupné."}</p>
      </div>
    );
  }

  const category = ANNOUNCEMENT_CATEGORY_LABEL[parseAnnouncementCategory(item.category)];
  const highlighted = item.highlightedContent?.trim() ? item.highlightedContent : item.content;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-xs text-slate-500">
        <Link href="/oznameni" className="text-[#39FF14] hover:underline">
          Články
        </Link>{" "}
        <span className="mx-1 text-slate-600">›</span>
        <span>{category}</span>
      </p>

      <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-tight text-white sm:text-5xl">
        {item.title}
      </h1>
      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        <time>{formatDate(item.createdAtMs)}</time>
        <span>|</span>
        <span>{category}</span>
        <span>|</span>
        <span className="text-slate-300 normal-case">{item.authorName}</span>
      </div>

      {item.imageUrl ? (
        <div className="relative mt-7 aspect-[16/9] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 960px"
            unoptimized
          />
        </div>
      ) : null}

      <article className="mt-8 max-w-4xl whitespace-pre-wrap text-[1.12rem] leading-relaxed text-slate-200">
        {renderHighlightedText(highlighted)}
      </article>
    </main>
  );
}
