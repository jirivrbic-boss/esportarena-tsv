"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import type { AboutCard, HomeCms } from "@/lib/cms-defaults";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";

function emptyCards(n: number, existing: AboutCard[]): AboutCard[] {
  const out = [...existing];
  while (out.length < n) out.push({ title: "", body: "" });
  return out.slice(0, n);
}

export function HomeEditClient({ initial }: { initial: HomeCms }) {
  const { user } = useAuth();
  const [heroTagline, setHeroTagline] = useState(initial.heroTagline);
  const [heroTitle, setHeroTitle] = useState(initial.heroTitle);
  const [heroTitleAccent, setHeroTitleAccent] = useState(initial.heroTitleAccent);
  const [heroSubtitle, setHeroSubtitle] = useState(initial.heroSubtitle);
  const [heroPoweredBy, setHeroPoweredBy] = useState(initial.heroPoweredBy);
  const [aboutCards, setAboutCards] = useState<AboutCard[]>(() =>
    emptyCards(3, initial.aboutCards)
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function setCard(i: number, patch: Partial<AboutCard>) {
    setAboutCards((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c))
    );
  }

  async function save() {
    if (!user) return;
    setBusy(true);
    setMsg(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: "home",
          heroTagline,
          heroTitle,
          heroTitleAccent,
          heroSubtitle,
          heroPoweredBy,
          aboutCards,
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        setMsg(j.error ?? "Uložení selhalo.");
        return;
      }
      setMsg("Uloženo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-[#39FF14]">
        Režim úprav · úvodní stránka
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-bebas)] text-4xl text-white">
        CMS domovské stránky
      </h1>
      <p className="mt-2 text-sm">
        <Link href="/" className="text-[#39FF14] hover:underline">
          Zobrazit web
        </Link>
      </p>

      {msg ? (
        <p
          className={`mt-4 text-sm ${msg === "Uloženo." ? "text-[#39FF14]" : "text-red-400"}`}
        >
          {msg}
        </p>
      ) : null}

      <GlassCard className="mt-8">
        <h2 className="text-lg font-semibold text-white">Hero</h2>
        <div className="mt-4 space-y-3">
          <Field label="Tagline (horní řádek)" value={heroTagline} onChange={setHeroTagline} />
          <Field label="Hlavní název (bílý)" value={heroTitle} onChange={setHeroTitle} />
          <Field label="Akcent (zelený)" value={heroTitleAccent} onChange={setHeroTitleAccent} />
          <label className="block text-xs text-slate-500">Podnadpis</label>
          <textarea
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
          />
          <Field label="Powered by řádek" value={heroPoweredBy} onChange={setHeroPoweredBy} />
        </div>
      </GlassCard>

      <GlassCard className="mt-6">
        <h2 className="text-lg font-semibold text-white">Tři karty pod hero</h2>
        {aboutCards.map((c, i) => (
          <div key={i} className="mt-6 border-t border-white/10 pt-6 first:mt-4 first:border-t-0 first:pt-0">
            <p className="text-xs text-[#39FF14]">Karta {i + 1}</p>
            <Field label="Nadpis" value={c.title} onChange={(v) => setCard(i, { title: v })} />
            <label className="mt-2 block text-xs text-slate-500">Text</label>
            <textarea
              value={c.body}
              onChange={(e) => setCard(i, { body: e.target.value })}
              rows={4}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-slate-200"
            />
          </div>
        ))}
      </GlassCard>

      <GlowButton type="button" className="mt-8" disabled={busy} onClick={() => void save()}>
        {busy ? "Ukládám…" : "Uložit vše"}
      </GlowButton>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <label className="block text-xs text-slate-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
      />
    </>
  );
}
