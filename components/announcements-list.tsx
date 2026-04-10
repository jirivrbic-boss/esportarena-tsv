"use client";

import { useEffect, useState } from "react";
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
import { GlassCard } from "@/components/glass-card";

export type AnnouncementItem = {
  id: string;
  content: string;
  imageUrl: string | null;
  authorName: string;
  createdAtMs: number;
};

function formatDate(ms: number) {
  if (!ms) return "";
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ms));
}

export function AnnouncementsList() {
  const firebaseOk = isFirebaseConfigured();
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(firebaseOk);
  const [err, setErr] = useState<string | null>(() =>
    firebaseOk ? null : "Firebase není nakonfigurováno."
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
          return {
            id: d.id,
            content: String(x.content ?? ""),
            imageUrl: x.imageUrl ? String(x.imageUrl) : null,
            authorName: String(x.authorName ?? "Discord"),
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
          Zatím žádná oznámení. Novinky přidává administrace přes vyhrazený kanál
          na Discordu (viz dokumentace v repozitáři).
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((a, i) => (
        <GlassCard key={a.id} delay={i * 0.04}>
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 pb-2">
            <span className="text-sm font-medium text-[#39FF14]">
              {a.authorName}
            </span>
            <time className="text-xs text-slate-500">
              {formatDate(a.createdAtMs)}
            </time>
          </div>
          {a.imageUrl ? (
            <div className="relative mt-4 aspect-video w-full max-w-2xl overflow-hidden rounded-lg border border-white/10 bg-black">
              <Image
                src={a.imageUrl}
                alt=""
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 672px"
                unoptimized
              />
            </div>
          ) : null}
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
            {a.content}
          </p>
        </GlassCard>
      ))}
    </div>
  );
}
