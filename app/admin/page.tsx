"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";
import { AdminAnnouncementsPanel } from "@/components/admin-announcements-panel";

type TeamRow = {
  id: string;
  teamName?: string;
  schoolName?: string;
  captainEmail?: string;
  captainDiscord?: string;
  teammates?: {
    firstName?: string;
    lastName?: string;
    faceitNickname?: string;
    faceitElo?: number | null;
    studentCertUrl?: string;
    parentConsentUrl?: string;
  }[];
  substitutes?: TeamRow["teammates"];
};

function collectDocLinks(t: TeamRow): { label: string; url: string }[] {
  const out: { label: string; url: string }[] = [];
  const add = (label: string, url?: string) => {
    if (url) out.push({ label, url });
  };
  t.teammates?.forEach((p, i) => {
    add(`Hráč ${i + 1} student`, p.studentCertUrl);
    add(`Hráč ${i + 1} souhlas`, p.parentConsentUrl);
  });
  t.substitutes?.forEach((p, i) => {
    add(`Náhradník ${i + 1} student`, p.studentCertUrl);
    add(`Náhradník ${i + 1} souhlas`, p.parentConsentUrl);
  });
  return out;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setErr(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/teams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      if (res.status === 401 || res.status === 403) {
        router.replace("/");
        return;
      }
      if (!res.ok) {
        setErr(
          j.error ??
            "Nelze načíst týmy (Firebase Admin + ADMIN_EMAILS + shoda e-mailu s účtem)."
        );
        setTeams([]);
        return;
      }
      setTeams(j.teams ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Chyba sítě");
    }
  }, [user, router]);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    void load();
  }, [user, loading, load]);

  async function approve(id: string) {
    if (!user) return;
    setBusy(id);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/teams/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const j = await res.json();
        setErr(j.error ?? "Schválení selhalo");
      }
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function reject(id: string) {
    if (!user) return;
    const reason = window.prompt("Důvod zamítnutí (volitelné)") ?? "";
    setBusy(id);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/teams/${id}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const j = await res.json();
        setErr(j.error ?? "Zamítnutí selhalo");
      }
      await load();
    } finally {
      setBusy(null);
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Načítání…
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-white">
        Super Admin
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Schvalování týmů, oznámení a odkaz na úpravu textů stránek (
        <Link href="/edit" className="text-[#39FF14] hover:underline">
          úvod
        </Link>
        ,{" "}
        <Link href="/pravidla/edit" className="text-[#39FF14] hover:underline">
          pravidla
        </Link>
        ,{" "}
        <Link href="/oznameni/edit" className="text-[#39FF14] hover:underline">
          text oznámení
        </Link>
        ).
      </p>

      <AdminAnnouncementsPanel />

      <h2 className="font-[family-name:var(--font-bebas)] text-3xl text-white">
        Čekající týmy
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Schválením se týmu odemkne Faceit hub a kapitánovi odejde e-mail (Resend).
      </p>
      <GlowButton type="button" variant="ghost" className="mt-6" onClick={() => void load()}>
        Obnovit seznam
      </GlowButton>

      {err ? (
        <p className="mt-6 text-sm text-red-400" role="alert">
          {err}
        </p>
      ) : null}

      <div className="mt-8 space-y-6">
        {teams.length === 0 ? (
          <GlassCard>
            <p className="text-slate-400">Žádné týmy ve stavu „čeká na schválení“.</p>
          </GlassCard>
        ) : (
          teams.map((t) => (
            <GlassCard key={t.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {t.teamName ?? "Bez názvu"}
                  </h2>
                  <p className="text-slate-400">{t.schoolName}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Kapitán: {t.captainEmail} · Discord: {t.captainDiscord}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <GlowButton
                    type="button"
                    disabled={busy === t.id}
                    onClick={() => void approve(t.id)}
                  >
                    {busy === t.id ? "…" : "Schválit"}
                  </GlowButton>
                  <GlowButton
                    type="button"
                    variant="ghost"
                    disabled={busy === t.id}
                    onClick={() => void reject(t.id)}
                  >
                    Zamítnout
                  </GlowButton>
                </div>
              </div>
              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#39FF14]">
                  Dokumenty (Storage odkazy)
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {collectDocLinks(t).map((l) => (
                    <li key={l.label + l.url}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 underline-offset-2 hover:text-[#39FF14] hover:underline"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </main>
  );
}
