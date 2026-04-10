"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import type { RuleSection } from "@/lib/cms-defaults";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";

export function PravidlaEditClient({
  initialSections,
}: {
  initialSections: RuleSection[];
}) {
  const { user } = useAuth();
  const [sections, setSections] = useState<RuleSection[]>(() =>
    initialSections.length
      ? initialSections.map((s) => ({ ...s }))
      : [{ title: "", body: "" }]
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function update(i: number, patch: Partial<RuleSection>) {
    setSections((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s))
    );
  }

  function addSection() {
    setSections((prev) => [...prev, { title: "", body: "" }]);
  }

  function removeSection(i: number) {
    setSections((prev) => prev.filter((_, idx) => idx !== i));
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
        body: JSON.stringify({ slug: "pravidla", sections }),
      });
      const j = await res.json();
      if (!res.ok) {
        setMsg(j.error ?? "Uložení selhalo.");
        return;
      }
      setMsg("Uloženo. Veřejná stránka se projeví po obnovení.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-[#39FF14]">
        Režim úprav
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-bebas)] text-4xl text-white">
        Pravidla (CMS)
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        <Link href="/pravidla" className="text-[#39FF14] hover:underline">
          Zobrazit veřejnou stránku
        </Link>
      </p>

      {msg ? (
        <p
          className={`mt-4 text-sm ${msg.startsWith("Uloženo") ? "text-[#39FF14]" : "text-red-400"}`}
        >
          {msg}
        </p>
      ) : null}

      <div className="mt-8 space-y-6">
        {sections.map((s, i) => (
          <GlassCard key={i}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500">Blok {i + 1}</span>
              <GlowButton
                type="button"
                variant="ghost"
                className="!text-xs text-red-300"
                onClick={() => removeSection(i)}
              >
                Odstranit
              </GlowButton>
            </div>
            <label className="mt-3 block text-xs text-slate-500">Nadpis</label>
            <input
              value={s.title}
              onChange={(e) => update(i, { title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
            />
            <label className="mt-3 block text-xs text-slate-500">Text</label>
            <textarea
              value={s.body}
              onChange={(e) => update(i, { body: e.target.value })}
              rows={6}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-slate-200"
            />
          </GlassCard>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <GlowButton type="button" variant="ghost" onClick={addSection}>
          Přidat blok
        </GlowButton>
        <GlowButton type="button" disabled={busy} onClick={() => void save()}>
          {busy ? "Ukládám…" : "Uložit do Firestore"}
        </GlowButton>
      </div>
    </main>
  );
}
