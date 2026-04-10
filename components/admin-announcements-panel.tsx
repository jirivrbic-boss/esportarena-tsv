"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";

type Row = {
  id: string;
  content?: string;
  imageUrl?: string | null;
  authorName?: string;
  createdAt?: { toMillis?: () => number };
};

export function AdminAnnouncementsPanel() {
  const { user } = useAuth();
  const [items, setItems] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newAuthor, setNewAuthor] = useState("Administrace");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setErr(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/announcements", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      if (!res.ok) {
        setErr(j.error ?? "Nelze načíst oznámení.");
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

  async function createAnnouncement() {
    if (!user || !newContent.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newContent.trim(),
          imageUrl: newImage.trim() || null,
          authorName: newAuthor.trim() || "Administrace",
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        setErr(j.error ?? "Uložení selhalo.");
        return;
      }
      setNewContent("");
      setNewImage("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit(id: string) {
    if (!user) return;
    setBusy(true);
    setErr(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
      });
      const j = await res.json();
      if (!res.ok) {
        setErr(j.error ?? "Úprava selhala.");
        return;
      }
      setEditingId(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!user || !window.confirm("Smazat toto oznámení?")) return;
    setBusy(true);
    setErr(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      if (!res.ok) {
        setErr(j.error ?? "Smazání selhalo.");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  function startEdit(row: Row) {
    setEditingId(row.id);
    setEditContent(row.content ?? "");
  }

  return (
    <GlassCard className="mb-10">
      <h2 className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-[#39FF14]">
        Oznámení / novinky
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Příspěvky se ukládají do kolekce <code className="text-slate-300">announcements</code>{" "}
        a zobrazí se na stránce Oznámení i v přehledu kapitána.
      </p>

      {err ? (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {err}
        </p>
      ) : null}

      <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Nové oznámení
        </label>
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600"
          placeholder="Text oznámení…"
        />
        <input
          value={newImage}
          onChange={(e) => setNewImage(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600"
          placeholder="URL obrázku (https://, volitelné)"
        />
        <input
          value={newAuthor}
          onChange={(e) => setNewAuthor(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
          placeholder="Jméno autora"
        />
        <GlowButton
          type="button"
          disabled={busy || !newContent.trim()}
          onClick={() => void createAnnouncement()}
        >
          Publikovat
        </GlowButton>
      </div>

      <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Poslední záznamy
        </p>
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">Zatím nic v databázi.</p>
        ) : (
          items.map((row) => (
            <div
              key={row.id}
              className="rounded-lg border border-white/10 bg-black/30 p-4 text-sm"
            >
              {editingId === row.id ? (
                <>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={5}
                    className="w-full rounded-md border border-white/15 bg-black/50 px-2 py-2 text-slate-200"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <GlowButton
                      type="button"
                      className="!px-4 !py-2 !text-xs"
                      disabled={busy}
                      onClick={() => void saveEdit(row.id)}
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
                </>
              ) : (
                <>
                  <p className="text-xs text-[#39FF14]">{row.authorName}</p>
                  <p className="mt-2 whitespace-pre-wrap text-slate-300">{row.content}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <GlowButton
                      type="button"
                      variant="ghost"
                      className="!text-xs"
                      disabled={busy}
                      onClick={() => startEdit(row)}
                    >
                      Upravit
                    </GlowButton>
                    <GlowButton
                      type="button"
                      variant="ghost"
                      className="!text-xs text-red-300"
                      disabled={busy}
                      onClick={() => void remove(row.id)}
                    >
                      Smazat
                    </GlowButton>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
