"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import Image from "next/image";
import { getFirebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  ANNOUNCEMENT_CATEGORY_LABEL,
  parseAnnouncementCategory,
  toAnnouncementExcerpt,
} from "@/lib/announcements";
import { GlassCard } from "@/components/glass-card";

export type AnnouncementItem = {
  id: string;
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
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "long",
  }).format(new Date(ms));
}

function firebaseMissingMessage(): string {
  if (process.env.NODE_ENV === "production") {
    return "Databáze není dostupná: na hostingu (Vercel) chybí proměnné NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID a NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (a ostatní z .env.example). Po doplnění proveď nový deploy.";
  }
  return "Firebase není nakonfigurováno — zkopíruj .env.example do .env.local a doplň údaje.";
}

export function AnnouncementsList() {
  const firebaseOk = isFirebaseConfigured();
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [filterOpen, setFilterOpen] = useState(true);
  const [loading, setLoading] = useState(firebaseOk);
  const [err, setErr] = useState<string | null>(() =>
    firebaseOk ? null : firebaseMissingMessage()
  );

  useEffect(() => {
    if (!firebaseOk) return;
    const db = getFirebaseDb();
    const q = query(
      collection(db, "announcements"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    getDocs(q)
      .then((snap) => {
        const list: AnnouncementItem[] = snap.docs.map((d) => {
          const x = d.data();
          const ts = x.createdAt;
          const createdAtMs =
            ts && typeof ts.toMillis === "function" ? ts.toMillis() : 0;
          const legacyImage =
            Array.isArray(x.imageUrls) && typeof x.imageUrls[0] === "string"
              ? String(x.imageUrls[0])
              : null;
          return {
            id: d.id,
            title: String(x.title ?? "Oznámení"),
            content: String(x.content ?? ""),
            highlightedContent: String(x.highlightedContent ?? ""),
            imageUrl: x.imageUrl ? String(x.imageUrl) : legacyImage,
            authorName: String(x.authorName ?? "Discord"),
            category: String(x.category ?? "general"),
            createdAtMs,
          };
        });
        setItems(list);
      })
      .catch((e) => {
        setErr(e instanceof Error ? e.message : "Nelze načíst oznámení.");
      })
      .finally(() => setLoading(false));
  }, [firebaseOk]);

  if (loading) {
    return <p className="text-slate-500">Načítám oznámení…</p>;
  }
  if (err) {
    return <p className="text-red-400">{err}</p>;
  }
  if (items.length === 0) {
    return (
      <GlassCard>
        <p className="text-slate-400">
          Zatím žádná oznámení. Novinky přidává super administrátor v sekci Admin na
          webu.
        </p>
      </GlassCard>
    );
  }

  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter((x) => parseAnnouncementCategory(x.category) === activeCategory);

  return (
    <div>
      <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
        <button
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-white/[0.03] sm:px-5"
        >
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#39FF14]/20 text-lg">
              🔎
            </span>
            <div>
              <p className="text-base font-semibold text-white">Filtrování podle her</p>
              <p className="text-xs text-slate-500">
                {activeCategory === "all"
                  ? "Aktivní: všechny kategorie"
                  : `Aktivní: ${
                      ANNOUNCEMENT_CATEGORY_LABEL[
                        parseAnnouncementCategory(activeCategory)
                      ]
                    }`}
              </p>
            </div>
          </div>
          <span className="text-slate-400">{filterOpen ? "▴" : "▾"}</span>
        </button>

        {filterOpen ? (
          <div className="border-t border-white/10 px-4 py-4 sm:px-5">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { id: "all", label: "Všechny kategorie", icon: "•" },
                { id: "cs2", label: ANNOUNCEMENT_CATEGORY_LABEL.cs2, icon: "🎯" },
                { id: "lol", label: ANNOUNCEMENT_CATEGORY_LABEL.lol, icon: "🛡️" },
                {
                  id: "brawl_stars",
                  label: ANNOUNCEMENT_CATEGORY_LABEL.brawl_stars,
                  icon: "💥",
                },
                { id: "fc26", label: ANNOUNCEMENT_CATEGORY_LABEL.fc26, icon: "⚽" },
                { id: "general", label: ANNOUNCEMENT_CATEGORY_LABEL.general, icon: "📢" },
              ].map((item) => {
                const active = activeCategory === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveCategory(item.id)}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${
                      active
                        ? "border-[#39FF14]/60 bg-[#39FF14]/10 text-white"
                        : "border-white/10 bg-black/30 text-slate-300 hover:border-white/20 hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-base">
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className="text-sm text-slate-400 underline-offset-2 hover:text-white hover:underline"
              >
                Zrušit filtr
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {filteredItems.length === 0 ? (
        <GlassCard>
          <p className="text-slate-400">Pro vybraný filtr zatím nejsou žádná oznámení.</p>
        </GlassCard>
      ) : null}

      <div className="space-y-6">
        {filteredItems.map((a, i) => (
        <GlassCard key={a.id} delay={i * 0.04}>
          <Link
            href={`/oznameni/${a.id}`}
            className="grid items-start gap-4 transition-opacity hover:opacity-90 md:grid-cols-[360px_minmax(0,1fr)] md:gap-6"
          >
            {a.imageUrl ? (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-black">
                <Image
                  src={a.imageUrl}
                  alt={a.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 320px"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-white/10 bg-black/30 text-xs uppercase tracking-wider text-slate-500">
                Bez fotografie
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
                <time>{formatDate(a.createdAtMs)}</time>
                <span>|</span>
                <span>{ANNOUNCEMENT_CATEGORY_LABEL[parseAnnouncementCategory(a.category)]}</span>
                <span>|</span>
                <span className="text-slate-400">{a.authorName}</span>
              </div>
              <h3 className="mt-3 text-2xl font-bold text-white">{a.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {toAnnouncementExcerpt(a.content)}
              </p>
            </div>
          </Link>
        </GlassCard>
        ))}
      </div>
    </div>
  );
}
