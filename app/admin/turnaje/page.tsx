"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useAdminTempBypass } from "@/contexts/admin-temp-context";
import { isClientAdminEmail } from "@/lib/admin-client";
import { GAMES, type GameId } from "@/lib/games";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";

type Row = {
  id: string;
  name: string;
  gameId: GameId;
  prizePoolText: string;
  rulesText: string;
  faceitUrl: string;
  published: boolean;
};

function TournamentEditor({
  mode,
  initial,
  getToken,
  onChanged,
}: {
  mode: "create" | "edit";
  initial: Row;
  getToken: () => Promise<string>;
  onChanged: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [gameId, setGameId] = useState<GameId>(initial.gameId);
  const [prizePoolText, setPrizePoolText] = useState(initial.prizePoolText);
  const [rulesText, setRulesText] = useState(initial.rulesText);
  const [faceitUrl, setFaceitUrl] = useState(initial.faceitUrl);
  const [published, setPublished] = useState(initial.published);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setName(initial.name);
    setGameId(initial.gameId);
    setPrizePoolText(initial.prizePoolText);
    setRulesText(initial.rulesText);
    setFaceitUrl(initial.faceitUrl);
    setPublished(initial.published);
  }, [initial]);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const token = await getToken();
      if (mode === "create") {
        const res = await fetch("/api/admin/tournaments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            gameId,
            prizePoolText,
            rulesText,
            faceitUrl,
            published,
          }),
        });
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setMsg(j.error ?? "Uložení selhalo");
          return;
        }
        setMsg("Turnaj vytvořen.");
        onChanged();
      } else {
        const res = await fetch(`/api/admin/tournaments/${initial.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            gameId,
            prizePoolText,
            rulesText,
            faceitUrl,
            published,
          }),
        });
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          setMsg(j.error ?? "Uložení selhalo");
          return;
        }
        setMsg("Uloženo.");
        onChanged();
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (mode !== "edit") return;
    if (!window.confirm("Opravdu smazat turnaj včetně přihlášených týmů?")) return;
    setBusy(true);
    setMsg(null);
    try {
      const token = await getToken();
      const res = await fetch(`/api/admin/tournaments/${initial.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMsg(j.error ?? "Smazání selhalo");
        return;
      }
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm text-slate-400">Název turnaje</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1"
          placeholder="např. Kvalifikace S4 — CS2"
        />
      </div>
      <div>
        <label className="text-sm text-slate-400">Hra</label>
        <select
          value={gameId}
          onChange={(e) => setGameId(e.target.value as GameId)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        >
          {GAMES.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm text-slate-400">Prize pool (text)</label>
        <input
          value={prizePoolText}
          onChange={(e) => setPrizePoolText(e.target.value)}
          className="mt-1"
          placeholder="např. 20 000 Kč"
        />
      </div>
      <div>
        <label className="text-sm text-slate-400">Faceit URL</label>
        <input
          value={faceitUrl}
          onChange={(e) => setFaceitUrl(e.target.value)}
          className="mt-1"
          placeholder="https://…"
        />
      </div>
      <div>
        <label className="text-sm text-slate-400">Pravidla</label>
        <textarea
          value={rulesText}
          onChange={(e) => setRulesText(e.target.value)}
          className="mt-1 min-h-[140px] font-mono text-xs"
          placeholder="Formát, mapy, termíny…"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        Zveřejnit (viditelné na webu a pro kapitány)
      </label>
      {msg ? (
        <p className="text-sm text-slate-400" role="status">
          {msg}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <GlowButton type="button" disabled={busy} onClick={() => void save()}>
          {mode === "create" ? "Vytvořit turnaj" : "Uložit změny"}
        </GlowButton>
        {mode === "edit" ? (
          <GlowButton
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => void remove()}
          >
            Smazat
          </GlowButton>
        ) : null}
      </div>
    </div>
  );
}

const emptyRow = (): Row => ({
  id: "",
  name: "",
  gameId: "cs2",
  prizePoolText: "",
  rulesText: "",
  faceitUrl: "",
  published: false,
});

export default function AdminTurnajePage() {
  const { user, loading } = useAuth();
  const tempBypass = useAdminTempBypass();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loadTick, setLoadTick] = useState(0);

  const getToken = useCallback(() => {
    if (!user) throw new Error("Nepřihlášen");
    return user.getIdToken();
  }, [user]);

  const load = useCallback(async () => {
    if (!user) {
      if (tempBypass) {
        setErr(
          "Přihlas se administrátorským účtem (ADMIN_EMAILS / super admin), aby se turnaje načetly a šly upravovat."
        );
        setRows([]);
      }
      return;
    }
    setErr(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/tournaments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = (await res.json()) as {
        ok?: boolean;
        tournaments?: Row[];
        error?: string;
      };
      if (res.status === 401 || res.status === 403) {
        if (tempBypass) {
          setErr(
            j.error ??
              "API odmítlo přístup — účet není v seznamu administrátorů."
          );
          setRows([]);
          return;
        }
        router.replace("/");
        return;
      }
      if (!res.ok) {
        setErr(j.error ?? "Nelze načíst turnaje");
        setRows([]);
        return;
      }
      setRows(j.tournaments ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Chyba sítě");
    }
  }, [user, router, tempBypass]);

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
  }, [user, loading, load, router, loadTick, tempBypass]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Načítání…
      </div>
    );
  }

  if (!tempBypass && (!user || !isClientAdminEmail(user.email))) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Načítání…
      </div>
    );
  }

  const canUseApi = Boolean(user && isClientAdminEmail(user.email));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-12">
      <p className="text-xs text-slate-500">
        <Link href="/admin" className="text-[#39FF14] hover:underline">
          ← Administrace
        </Link>
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-bebas)] text-4xl text-white">
        Správa turnajů
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Vytvořené turnaje se zobrazí kapitánům a na{" "}
        <Link href="/turnaje" className="text-[#39FF14] hover:underline">
          /turnaje
        </Link>
        , pokud jsou zveřejněné.
      </p>

      {err ? (
        <p className="mt-6 text-sm text-red-400" role="alert">
          {err}
        </p>
      ) : null}

      {canUseApi ? (
        <>
          <GlassCard className="mt-8">
            <h2 className="font-[family-name:var(--font-bebas)] text-xl text-[#39FF14]">
              Nový turnaj
            </h2>
            <div className="mt-4">
              <TournamentEditor
                key={`new-${loadTick}`}
                mode="create"
                initial={emptyRow()}
                getToken={getToken}
                onChanged={() => setLoadTick((t) => t + 1)}
              />
            </div>
          </GlassCard>

          <h2 className="mt-12 font-[family-name:var(--font-bebas)] text-2xl text-white">
            Existující turnaje
          </h2>
          <div className="mt-6 space-y-6">
            {rows.length === 0 ? (
              <p className="text-sm text-slate-500">Zatím žádné záznamy.</p>
            ) : (
              rows.map((r) => (
                <GlassCard key={r.id}>
                  <p className="text-xs font-mono text-slate-600">ID: {r.id}</p>
                  <div className="mt-4">
                    <TournamentEditor
                      mode="edit"
                      initial={r}
                      getToken={getToken}
                      onChanged={() => setLoadTick((x) => x + 1)}
                    />
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </>
      ) : (
        <GlassCard className="mt-8">
          <p className="text-sm text-slate-300">
            Úpravy turnajů vyžadují přihlášení{" "}
            <strong className="text-white">administrátorským</strong> účtem (stejný
            e-mail jako v <code className="text-slate-500">ADMIN_EMAILS</code> na
            serveru a v <code className="text-slate-500">NEXT_PUBLIC_ADMIN_EMAILS</code>{" "}
            u buildu, případně super admin v{" "}
            <code className="text-slate-500">lib/super-admin.ts</code>).
          </p>
          <GlowButton href="/prihlaseni" className="mt-4 !justify-center">
            Přihlásit se
          </GlowButton>
        </GlassCard>
      )}
    </main>
  );
}
