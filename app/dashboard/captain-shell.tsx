"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { CaptainSidebar } from "@/components/captain-sidebar";

export function CaptainShell({ children }: { children: ReactNode }) {
  const { user, loading, firebaseReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!firebaseReady || loading) return;
    if (!user) {
      router.replace("/prihlaseni");
    }
  }, [user, loading, firebaseReady, router]);

  if (!firebaseReady) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-slate-500">
        Nakonfiguruj Firebase v .env.local.
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-slate-500">
        Načítání…
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-0px)] flex-1 flex-col md:flex-row">
      <CaptainSidebar />
      <div className="min-w-0 flex-1 overflow-auto">{children}</div>
    </div>
  );
}
