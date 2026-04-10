"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";

export function OznameniEditClient({ initialIntro }: { initialIntro: string }) {
  const { user } = useAuth();
  const [intro, setIntro] = useState(initialIntro);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
        body: JSON.stringify({ slug: "oznameni", intro }),
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
        Režim úprav
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-bebas)] text-4xl text-white">
        Oznámení — úvodní text
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Seznam příspěvků spravuješ v{" "}
        <Link href="/admin" className="text-[#39FF14] hover:underline">
          /admin
        </Link>
        . Zde upravíš jen odstavec nad seznamem.
      </p>
      <p className="mt-1 text-sm">
        <Link href="/oznameni" className="text-slate-400 underline-offset-2 hover:text-white hover:underline">
          Veřejná stránka
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
        <label className="text-xs text-slate-500">Úvodní text</label>
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={5}
          className="mt-2 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-slate-200"
        />
        <GlowButton
          type="button"
          className="mt-4"
          disabled={busy}
          onClick={() => void save()}
        >
          {busy ? "Ukládám…" : "Uložit"}
        </GlowButton>
      </GlassCard>
    </main>
  );
}
