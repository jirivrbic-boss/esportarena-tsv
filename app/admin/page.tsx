"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useAdminTempBypass } from "@/contexts/admin-temp-context";
import { isClientAdminEmail } from "@/lib/admin-client";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";
import { AdminAnnouncementsPanel } from "@/components/admin-announcements-panel";
import { gameLabel, type GameId } from "@/lib/games";

type TeamRow = {
  id: string;
  gameId?: GameId;
  teamName?: string;
  schoolName?: string;
  status?: "pending" | "approved" | "rejected";
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
  const tempBypass = useAdminTempBypass();
  const router = useRouter();
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [lfgSeedMsg, setLfgSeedMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      if (tempBypass) {
        setErr(
          "Dočasný náhled: přihlas se účtem administrátora — e-mail musí být v ADMIN_EMAILS (server) a v NEXT_PUBLIC_ADMIN_EMAILS (klient), nebo jako super admin v lib/super-admin.ts."
        );
        setTeams([]);
      }
      return;
    }
    setErr(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/teams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      if (res.status === 401 || res.status === 403) {
        if (tempBypass) {
          setErr(
            (j as { error?: string }).error ??
              "API odmítlo přístup — tento účet není admin (zkontroluj ADMIN_EMAILS na Netlify a stejný seznam v NEXT_PUBLIC_ADMIN_EMAILS)."
          );
          setTeams([]);
          return;
        }
        router.replace("/");
        return;
      }
      if (!res.ok) {
        setErr(
          j.error ??
            "Nelze načíst týmy — účet nemá oprávnění administrátora (ADMIN_EMAILS / super admin)."
        );
        setTeams([]);
        return;
      }
      setTeams(j.teams ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Chyba sítě");
    }
  }, [user, router, tempBypass]);

  const pendingTeams = teams.filter((team) => team.status === "pending");

  useEffect(() => {
    if (loading) return;
    if (tempBypass) {
      void load();
      return;
    }
    if (!user) {
      router.replace("/prihlaseni");
      return;
    }
    if (!isClientAdminEmail(user.email)) {
      router.replace("/");
      return;
    }
    void load();
  }, [user, loading, load, router, tempBypass]);

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

  async function seedLfgDemos() {
    if (!user) return;
    setLfgSeedMsg(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/seed-lfg", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      if (!res.ok) {
        setLfgSeedMsg(j.error ?? "Selhalo.");
        return;
      }
      setLfgSeedMsg(j.message ?? "OK");
    } catch (e) {
      setLfgSeedMsg(e instanceof Error ? e.message : "Chyba sítě");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Načítání…
      </div>
    );
  }

  if (
    !tempBypass &&
    (!user || !isClientAdminEmail(user.email))
  ) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Načítání…
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-12">
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-white">
        Administrace
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Schvalování a zamítání týmů, oznámení a úpravy textů stránek (
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

      <section
        id="turnaje"
        className="mb-10 scroll-mt-24 rounded-xl border border-white/10 bg-white/[0.03] p-6"
      >
        <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-[#39FF14]">
          Turnaje
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Vytvářej zveřejněné turnaje (hra, prize pool, pravidla, Faceit), kapitáni se
          k nim mohou přihlásit schváleným týmem.
        </p>
        <GlowButton href="/admin/turnaje" variant="ghost" className="mt-4">
          Správa turnajů
        </GlowButton>
      </section>

      <div id="sprava-oznameni" className="scroll-mt-24">
        <AdminAnnouncementsPanel />
      </div>

      <GlassCard className="mb-10">
        <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-[#39FF14]">
          LFG — ukázkové inzeráty
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Jednorázově přidá 2 testovací záznamy do{" "}
          <code className="text-slate-300">free_agents</code> (hledám tým + hledám
          hráče), pokud ještě neexistují.
        </p>
        <GlowButton
          type="button"
          variant="ghost"
          className="mt-4"
          onClick={() => void seedLfgDemos()}
        >
          Nahrát ukázky
        </GlowButton>
        {lfgSeedMsg ? (
          <p className="mt-3 text-sm text-slate-300">{lfgSeedMsg}</p>
        ) : null}
      </GlassCard>

      <h2
        id="tymy"
        className="scroll-mt-24 font-[family-name:var(--font-bebas)] text-3xl text-white"
      >
        Čekající týmy
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Schválením u CS2 můžeš doplnit Faceit hub; u ostatních her další kroky na
        Discordu. Kapitánovi odejde e-mail přes Resend (nutný{" "}
        <code className="text-slate-300">RESEND_API_KEY</code> a ověřená doména
        odesílatele).
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
        {pendingTeams.length === 0 ? (
          <GlassCard>
            <p className="text-slate-400">Žádné týmy ve stavu „čeká na schválení“.</p>
          </GlassCard>
        ) : (
          pendingTeams.map((t) => (
            <GlassCard key={t.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {t.teamName ?? "Bez názvu"}
                  </h2>
                  <p className="text-sm font-medium text-[#39FF14]">
                    {t.gameId ? gameLabel(t.gameId) : "CS2 (starý záznam)"}
                  </p>
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
