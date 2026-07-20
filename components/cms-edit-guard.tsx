"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { isClientAdminEmail } from "@/lib/admin-client";

/** Ochrana CMS stránek bez Edge middleware (stačí Firebase + admin e-mail). */
export function CmsEditGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/prihlaseni");
      return;
    }
    if (!isClientAdminEmail(user.email)) {
      router.replace("/zakazano");
    }
  }, [loading, user, router]);

  if (loading || !user || !isClientAdminEmail(user.email)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        Ověřování přístupu…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <Link
        href="/admin/edit"
        className="text-sm text-slate-500 transition hover:text-[#39FF14]"
      >
        ← Úpravy stránek
      </Link>
      <div className="mt-4">{children}</div>
    </div>
  );
}
