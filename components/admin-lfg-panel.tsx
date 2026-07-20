"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { GAMES, gameLabel, type GameId } from "@/lib/games";
import { isSeasonActiveGame } from "@/lib/season-games";
import { lfgGameFields } from "@/lib/lfg-game-fields";
import type { FreeAgentType } from "@/lib/types";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";

type LfgRow = {
  id: string;
  type: FreeAgentType;
  gameId: GameId;
  discordUsername: string;
  hoursPlayed: number;
  faceitLevel: number;
  description: string;
  createdAt: string | null;
};

const ACTIVE_GAMES = GAMES.filter((g) => isSeasonActiveGame(g.id));

function typeLabel(t: FreeAgentType) {
  return t === "looking_team" ? "Hledám tým" : "Hledám hráče";
}

function formatCreatedAt(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("cs-CZ");
  } catch {
    return iso;
  }
}

const emptyForm = () => ({
  type: "looking_team" as FreeAgentType,
  gameId: "cs2" as GameId,
  discordUsername: "",
  hoursPlayed: 500,
  faceitLevel: 5,
  description: "",
});

export function AdminLfgPanel() {
  const { user } = useAuth();
  const [items, setItems] = useState<LfgRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [filterGame, setFilterGame] = useState<GameId | "all">("all");
  const [filterType, setFilterType] = useState<FreeAgentType | "all">("all");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState(emptyForm);

  const load = useCallback(async () => {
    if (!user) return;
    setErr(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/lfg", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = (await res.json()) as { items?: LfgRow[]; error?: string };
      if (!res.ok) {
        setErr(j.error ?? "Nelze načíst inzeráty.");
        setItems([]);
        return;
      }
      setItems(j.items ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Chyba sítě");
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = items.filter((row) => {
    if (filterGame !== "all" && row.gameId !== filterGame) return false;
    if (filterType !== "all" && row.type !== filterType) return false;
    return true;
  });

  async function createPost() {
    if (!user) return;
    if (!form.discordUsername.trim() || !form.description.trim()) {
      setErr("Vyplň Discord a popis.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const token = await user.getIdToken();
      const fields = lfgGameFields(form.gameId);
      const res = await fetch("/api/admin/lfg", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          faceitLevel: fields.showFaceit ? form.faceitLevel : 0,
        }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErr(j.error ?? "Vytvoření selhalo.");
        return;
      }
      setForm(emptyForm());
      await load();
    } finally {
      setBusy(false);
    }
  }

  function startEdit(row: LfgRow) {
    setEditingId(row.id);
    setEdit({
      type: row.type,
      gameId: row.gameId,
      discordUsername: row.discordUsername,
      hoursPlayed: row.hoursPlayed,
      faceitLevel: row.faceitLevel || 5,
      description: row.description,
    });
  }

  async function saveEdit() {
    if (!user || !editingId) return;
    if (!edit.discordUsername.trim() || !edit.description.trim()) {
      setErr("Vyplň Discord a popis.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const token = await user.getIdToken();
      const fields = lfgGameFields(edit.gameId);
      const res = await fetch(`/api/admin/lfg/${editingId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...edit,
          faceitLevel: fields.showFaceit ? edit.faceitLevel : 0,
        }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErr(j.error ?? "Uložení selhalo.");
        return;
      }
      setEditingId(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function removePost(id: string) {
    if (!user) return;
    if (!window.confirm("Opravdu smazat tento inzerát?")) return;
    setBusy(true);
    setErr(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/lfg/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErr(j.error ?? "Smazání selhalo.");
        return;
      }
      if (editingId === id) setEditingId(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      {err ? (
        <p className="text-sm text-red-400" role="alert">
          {err}
        </p>
      ) : null}

      <GlassCard>
        <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-white">
          Nový inzerát
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Zobrazí se veřejně na{" "}
          <Link href="/hledam" className="text-[#39FF14] hover:underline">
            /hledam
          </Link>
          .
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm text-slate-400">Typ</label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as FreeAgentType }))
              }
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            >
              <option value="looking_team">Hledám tým</option>
              <option value="looking_player">Hledám hráče</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-400">Hra</label>
            <select
              value={form.gameId}
              onChange={(e) =>
                setForm((f) => ({ ...f, gameId: e.target.value as GameId }))
              }
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            >
              {ACTIVE_GAMES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-400">Discord</label>
            <input
              value={form.discordUsername}
              onChange={(e) =>
                setForm((f) => ({ ...f, discordUsername: e.target.value }))
              }
              className="mt-1"
              placeholder="nick"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400">
              {lfgGameFields(form.gameId).hoursLabel}
            </label>
            <input
              type="number"
              min={0}
              max={50000}
              value={form.hoursPlayed}
              onChange={(e) =>
                setForm((f) => ({ ...f, hoursPlayed: Number(e.target.value) || 0 }))
              }
              className="mt-1"
            />
          </div>
          {lfgGameFields(form.gameId).showFaceit ? (
            <div>
              <label className="text-sm text-slate-400">Faceit level</label>
              <input
                type="number"
                min={0}
                max={10}
                value={form.faceitLevel}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    faceitLevel: Number(e.target.value) || 0,
                  }))
                }
                className="mt-1"
              />
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <label className="text-sm text-slate-400">Popis</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="mt-1 min-h-[100px]"
              placeholder={lfgGameFields(form.gameId).descriptionPlaceholder}
            />
          </div>
        </div>
        <GlowButton
          type="button"
          className="mt-4"
          disabled={busy}
          onClick={() => void createPost()}
        >
          {busy ? "Ukládám…" : "Přidat inzerát"}
        </GlowButton>
      </GlassCard>

      <div className="flex flex-wrap gap-2">
        <select
          value={filterGame}
          onChange={(e) => setFilterGame(e.target.value as GameId | "all")}
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        >
          <option value="all">Všechny hry</option>
          {ACTIVE_GAMES.map((g) => (
            <option key={g.id} value={g.id}>
              {g.shortLabel}
            </option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) =>
            setFilterType(e.target.value as FreeAgentType | "all")
          }
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        >
          <option value="all">Všechny typy</option>
          <option value="looking_team">Hledám tým</option>
          <option value="looking_player">Hledám hráče</option>
        </select>
        <p className="self-center text-xs text-slate-500">
          {filtered.length} / {items.length} inzerátů
        </p>
      </div>

      {filtered.length === 0 ? (
        <GlassCard>
          <p className="text-sm text-slate-500">Žádné inzeráty k zobrazení.</p>
        </GlassCard>
      ) : (
        <ul className="space-y-4">
          {filtered.map((row) => (
            <GlassCard key={row.id}>
              {editingId === row.id ? (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-400">Typ</label>
                      <select
                        value={edit.type}
                        onChange={(e) =>
                          setEdit((f) => ({
                            ...f,
                            type: e.target.value as FreeAgentType,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                      >
                        <option value="looking_team">Hledám tým</option>
                        <option value="looking_player">Hledám hráče</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Hra</label>
                      <select
                        value={edit.gameId}
                        onChange={(e) =>
                          setEdit((f) => ({
                            ...f,
                            gameId: e.target.value as GameId,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                      >
                        {ACTIVE_GAMES.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Discord</label>
                      <input
                        value={edit.discordUsername}
                        onChange={(e) =>
                          setEdit((f) => ({
                            ...f,
                            discordUsername: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Hodiny</label>
                      <input
                        type="number"
                        min={0}
                        max={50000}
                        value={edit.hoursPlayed}
                        onChange={(e) =>
                          setEdit((f) => ({
                            ...f,
                            hoursPlayed: Number(e.target.value) || 0,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    {lfgGameFields(edit.gameId).showFaceit ? (
                      <div>
                        <label className="text-sm text-slate-400">Faceit</label>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={edit.faceitLevel}
                          onChange={(e) =>
                            setEdit((f) => ({
                              ...f,
                              faceitLevel: Number(e.target.value) || 0,
                            }))
                          }
                          className="mt-1"
                        />
                      </div>
                    ) : null}
                    <div className="sm:col-span-2">
                      <label className="text-sm text-slate-400">Popis</label>
                      <textarea
                        value={edit.description}
                        onChange={(e) =>
                          setEdit((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <GlowButton
                      type="button"
                      disabled={busy}
                      onClick={() => void saveEdit()}
                    >
                      Uložit
                    </GlowButton>
                    <GlowButton
                      type="button"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => setEditingId(null)}
                    >
                      Zrušit
                    </GlowButton>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#39FF14]">
                      {typeLabel(row.type)} · {gameLabel(row.gameId)}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-white">
                      @{row.discordUsername}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {row.hoursPlayed > 0 ? `${row.hoursPlayed} h` : "hodiny —"}
                      {row.gameId === "cs2" && row.faceitLevel > 0
                        ? ` · Faceit L${row.faceitLevel}`
                        : ""}
                      {" · "}
                      {formatCreatedAt(row.createdAt)}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">
                      {row.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <GlowButton
                      type="button"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => startEdit(row)}
                    >
                      Upravit
                    </GlowButton>
                    <GlowButton
                      type="button"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => void removePost(row.id)}
                    >
                      Smazat
                    </GlowButton>
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
        </ul>
      )}
    </div>
  );
}
