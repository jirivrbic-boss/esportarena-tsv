import Link from "next/link";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";

export default function ZakazanoPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <GlassCard>
        <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-white">
          Přístup zamítnut
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          Tato sekce je dostupná jen pro administrátory. Pokud přístup potřebuješ,
          přihlas se účtem se správnou rolí.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <GlowButton href="/prihlaseni">Přihlásit se</GlowButton>
          <GlowButton href="/" variant="ghost">
            Zpět na úvod
          </GlowButton>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Potřebuješ-li roli admina, kontaktuj organizátora turnaje.
        </p>
      </GlassCard>
    </main>
  );
}
