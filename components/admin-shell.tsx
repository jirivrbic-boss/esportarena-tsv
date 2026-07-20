"use client";

import { useRouter } from "next/navigation";
import { useAdminTempBypass } from "@/contexts/admin-temp-context";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const adminTemp = useAdminTempBypass();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      {adminTemp ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/35 bg-amber-950/55 px-4 py-2 text-xs text-amber-100">
          <span>
            <strong className="text-amber-50">Dočasný náhled</strong> — menu a
            stránky bez role admina. Zápis dat přes API funguje až po přihlášení
            účtem z ADMIN_EMAILS / super admin.
          </span>
          <button
            type="button"
            className="shrink-0 rounded-md border border-amber-400/40 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-50 hover:bg-amber-900/50"
            onClick={() =>
              void (async () => {
                await fetch("/api/auth/admin-temp-revoke", { method: "POST" });
                router.refresh();
                window.location.assign("/");
              })()
            }
          >
            Zrušit náhled
          </button>
        </div>
      ) : null}
      <div className="min-w-0 flex-1 overflow-auto">{children}</div>
    </div>
  );
}
