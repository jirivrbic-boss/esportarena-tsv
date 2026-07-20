"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { PortalPageHeader } from "@/components/portal-page-header";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";
import {
  SUPPORT_CATEGORIES,
  type SupportCategoryId,
} from "@/lib/support-data";
import type { SupportFaqRow, SupportTicketRow } from "@/lib/support-firestore";

export default function AdminPodporaPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"tickets" | "faq">("tickets");

  const [tickets, setTickets] = useState<SupportTicketRow[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsErr, setTicketsErr] = useState<string | null>(null);

  const [faqItems, setFaqItems] = useState<SupportFaqRow[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [faqErr, setFaqErr] = useState<string | null>(null);

  const [faqCategory, setFaqCategory] = useState<SupportCategoryId>("popular");
  const [faqTag, setFaqTag] = useState("");
  const [faqTitle, setFaqTitle] = useState("");
  const [faqBody, setFaqBody] = useState("");
  const [faqOrder, setFaqOrder] = useState(0);
  const [faqEditingId, setFaqEditingId] = useState<string | null>(null);
  const [faqBusy, setFaqBusy] = useState(false);

  const [replyByTicket, setReplyByTicket] = useState<Record<string, string>>({});
  const [replyBusy, setReplyBusy] = useState<string | null>(null);

  const authHeader = useCallback(async () => {
    const u = user;
    if (!u) return null;
    const token = await u.getIdToken(true);
    return { Authorization: `Bearer ${token}` } as Record<string, string>;
  }, [user]);

  const loadTickets = useCallback(async () => {
    const h = await authHeader();
    if (!h) return;
    setTicketsLoading(true);
    setTicketsErr(null);
    try {
      const res = await fetch("/api/admin/support/tickets", { headers: h });
      const j = (await res.json()) as {
        ok?: boolean;
        tickets?: SupportTicketRow[];
        error?: string;
      };
      if (!res.ok || !j.ok) {
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      setTickets(j.tickets ?? []);
    } catch (e) {
      setTicketsErr(e instanceof Error ? e.message : "Chyba načtení");
    } finally {
      setTicketsLoading(false);
    }
  }, [authHeader]);

  const loadFaq = useCallback(async () => {
    const h = await authHeader();
    if (!h) return;
    setFaqLoading(true);
    setFaqErr(null);
    try {
      const res = await fetch("/api/admin/support/faq", { headers: h });
      const j = (await res.json()) as {
        ok?: boolean;
        items?: SupportFaqRow[];
        error?: string;
      };
      if (!res.ok || !j.ok) {
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      setFaqItems(j.items ?? []);
    } catch (e) {
      setFaqErr(e instanceof Error ? e.message : "Chyba načtení");
    } finally {
      setFaqLoading(false);
    }
  }, [authHeader]);

  useEffect(() => {
    void loadTickets();
    void loadFaq();
  }, [loadTickets, loadFaq]);

  async function submitFaq(e: React.FormEvent) {
    e.preventDefault();
    const h = await authHeader();
    if (!h) return;
    setFaqBusy(true);
    try {
      if (faqEditingId) {
        const res = await fetch(`/api/admin/support/faq/${faqEditingId}`, {
          method: "PATCH",
          headers: { ...h, "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryId: faqCategory,
            tag: faqTag || null,
            title: faqTitle,
            body: faqBody,
            sortOrder: faqOrder,
          }),
        });
        const j = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      } else {
        const res = await fetch("/api/admin/support/faq", {
          method: "POST",
          headers: { ...h, "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryId: faqCategory,
            tag: faqTag || undefined,
            title: faqTitle,
            body: faqBody,
            sortOrder: faqOrder,
          }),
        });
        const j = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      setFaqTitle("");
      setFaqBody("");
      setFaqTag("");
      setFaqOrder(0);
      setFaqEditingId(null);
      await loadFaq();
    } finally {
      setFaqBusy(false);
    }
  }

  async function deleteFaq(id: string) {
    if (!window.confirm("Smazat tuto položku z FAQ?")) return;
    const h = await authHeader();
    if (!h) return;
    const res = await fetch(`/api/admin/support/faq/${id}`, {
      method: "DELETE",
      headers: h,
    });
    if (res.ok) await loadFaq();
  }

  function startEdit(item: SupportFaqRow) {
    setFaqEditingId(item.id);
    setFaqCategory(item.categoryId);
    setFaqTag(item.tag ?? "");
    setFaqTitle(item.title);
    setFaqBody(item.body);
    setFaqOrder(item.sortOrder ?? 0);
    setTab("faq");
  }

  async function sendReply(ticket: SupportTicketRow) {
    const text = (
      replyByTicket[ticket.id] ??
      ticket.adminReply ??
      ""
    ).trim();
    if (!text) return;
    const h = await authHeader();
    if (!h) return;
    setReplyBusy(ticket.id);
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { ...h, "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: text }),
      });
      const j = (await res.json()) as {
        error?: string;
        mailSent?: boolean;
        skippedEmail?: boolean;
      };
      if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
      setReplyByTicket((prev) => ({ ...prev, [ticket.id]: "" }));
      await loadTickets();
      if (!j.skippedEmail && j.mailSent === false) {
        window.alert(
          "Odpověď uložena, ale e-mail uživateli se nepodařilo odeslat (zkontroluj Resend)."
        );
      }
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Chyba");
    } finally {
      setReplyBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <PortalPageHeader
        backHref="/admin"
        backLabel="Přehled administrace"
        title="Centrum podpory"
        description="Žádosti z webu (/podpora) a doplňkové FAQ položky (základní články zůstávají v kódu)."
      />

      <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setTab("tickets")}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium touch-manipulation ${
            tab === "tickets"
              ? "bg-[#39FF14]/15 text-[#39FF14]"
              : "text-slate-400 hover:bg-white/5"
          }`}
        >
          Dotazy návštěvníků
        </button>
        <button
          type="button"
          onClick={() => setTab("faq")}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium touch-manipulation ${
            tab === "faq"
              ? "bg-[#39FF14]/15 text-[#39FF14]"
              : "text-slate-400 hover:bg-white/5"
          }`}
        >
          Doplňkové FAQ
        </button>
      </div>

      {tab === "tickets" ? (
        <section className="mt-8 space-y-6">
          <GlowButton type="button" variant="ghost" onClick={() => void loadTickets()}>
            Obnovit seznam
          </GlowButton>
          {ticketsLoading ? (
            <p className="text-slate-500">Načítání…</p>
          ) : ticketsErr ? (
            <p className="text-red-400">{ticketsErr}</p>
          ) : tickets.length === 0 ? (
            <p className="text-slate-500">Zatím žádné dotazy.</p>
          ) : (
            <ul className="space-y-6">
              {tickets.map((t) => (
                <GlassCard key={t.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {new Date(t.createdAt).toLocaleString("cs-CZ")} ·{" "}
                        <span
                          className={
                            t.status === "answered" ? "text-[#39FF14]" : "text-amber-200"
                          }
                        >
                          {t.status === "answered" ? "Odpovězeno" : "Otevřeno"}
                        </span>
                      </p>
                      <p className="mt-2 font-semibold text-white">{t.subject}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {t.visitorEmail}
                        {t.visitorName ? ` · ${t.visitorName}` : ""}
                      </p>
                    </div>
                    <code className="text-[10px] text-slate-600">{t.id}</code>
                  </div>
                  <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-slate-300 whitespace-pre-wrap">
                    {t.message}
                  </div>
                  {t.adminReply ? (
                    <div className="mt-4 rounded-lg border border-[#39FF14]/25 bg-[#39FF14]/5 p-3 text-sm text-slate-200 whitespace-pre-wrap">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#39FF14]">
                        Tvoje odpověď
                      </p>
                      <p className="mt-2">{t.adminReply}</p>
                      {t.repliedAt ? (
                        <p className="mt-2 text-[10px] text-slate-500">
                          {new Date(t.repliedAt).toLocaleString("cs-CZ")}
                          {t.repliedByEmail ? ` · ${t.repliedByEmail}` : ""}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="mt-4 space-y-2">
                    <label className="text-xs font-medium text-slate-500">
                      {t.adminReply ? "Upravit odpověď (e-mail se znovu neposílá)" : "Odpověď uživateli e-mailem"}
                    </label>
                    <textarea
                      value={replyByTicket[t.id] ?? (t.adminReply ?? "")}
                      onChange={(e) =>
                        setReplyByTicket((prev) => ({
                          ...prev,
                          [t.id]: e.target.value,
                        }))
                      }
                      rows={5}
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600"
                      placeholder="Text odpovědi…"
                    />
                    <GlowButton
                      type="button"
                      disabled={replyBusy === t.id}
                      onClick={() => void sendReply(t)}
                    >
                      {replyBusy === t.id
                        ? "Odesílám…"
                        : t.adminReply
                          ? "Uložit úpravu"
                          : "Odeslat odpověď"}
                    </GlowButton>
                  </div>
                </GlassCard>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="mt-8 space-y-8">
          <GlassCard>
            <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-white">
              {faqEditingId ? "Upravit položku" : "Nová položka FAQ"}
            </h2>
            <form onSubmit={(e) => void submitFaq(e)} className="mt-6 space-y-4">
              <div>
                <label className="text-xs text-slate-500">Kategorie</label>
                <select
                  value={faqCategory}
                  onChange={(e) => setFaqCategory(e.target.value as SupportCategoryId)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                >
                  {SUPPORT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Štítek (volitelně)</label>
                <input
                  value={faqTag}
                  onChange={(e) => setFaqTag(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                  placeholder="např. CS2"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Nadpis</label>
                <input
                  value={faqTitle}
                  onChange={(e) => setFaqTitle(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Text</label>
                <textarea
                  value={faqBody}
                  onChange={(e) => setFaqBody(e.target.value)}
                  required
                  rows={6}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Pořadí (číslo, volitelné)</label>
                <input
                  type="number"
                  value={faqOrder}
                  onChange={(e) => setFaqOrder(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <GlowButton type="submit" disabled={faqBusy}>
                  {faqBusy ? "Ukládám…" : faqEditingId ? "Uložit změny" : "Přidat položku"}
                </GlowButton>
                {faqEditingId ? (
                  <GlowButton
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setFaqEditingId(null);
                      setFaqTitle("");
                      setFaqBody("");
                      setFaqTag("");
                      setFaqOrder(0);
                    }}
                  >
                    Zrušit úpravu
                  </GlowButton>
                ) : null}
              </div>
            </form>
          </GlassCard>

          <div>
            <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-white">
              Vaše položky ve Firestore
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Základní články z kódu se na webu zobrazují vždy; zde jsou jen doplňky.
            </p>
            {faqLoading ? (
              <p className="mt-4 text-slate-500">Načítání…</p>
            ) : faqErr ? (
              <p className="mt-4 text-red-400">{faqErr}</p>
            ) : faqItems.length === 0 ? (
              <p className="mt-4 text-slate-500">Zatím žádné vlastní položky.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {faqItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/30 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        {
                          SUPPORT_CATEGORIES.find((c) => c.id === item.categoryId)
                            ?.label
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <GlowButton
                        type="button"
                        variant="ghost"
                        className="!px-3 !py-1.5 !text-xs"
                        onClick={() => startEdit(item)}
                      >
                        Upravit
                      </GlowButton>
                      <GlowButton
                        type="button"
                        variant="ghost"
                        className="!border-red-500/40 !px-3 !py-1.5 !text-xs text-red-300"
                        onClick={() => void deleteFaq(item.id)}
                      >
                        Smazat
                      </GlowButton>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
