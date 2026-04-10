"use client";

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
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading || !user || !isClientAdminEmail(user.email)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        Ověřování přístupu…
      </div>
    );
  }

  return <>{children}</>;
}
