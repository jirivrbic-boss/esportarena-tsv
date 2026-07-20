"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useAdminTempBypass } from "@/contexts/admin-temp-context";
import { isClientAdminEmail } from "@/lib/admin-client";
import { AdminAnnouncementsPanel } from "@/components/admin-announcements-panel";
import { PortalPageHeader } from "@/components/portal-page-header";

export default function AdminAnnouncementsPage() {
  const { user, loading } = useAuth();
  const tempBypass = useAdminTempBypass();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (tempBypass) return;
    if (!user) {
      router.replace("/prihlaseni");
      return;
    }
    if (!isClientAdminEmail(user.email)) {
      router.replace("/zakazano");
    }
  }, [user, loading, router, tempBypass]);

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

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-12">
      <PortalPageHeader
        backHref="/admin"
        backLabel="Přehled administrace"
        title="Oznámení"
        description="Vytváření a úprava novinek zveřejněných na webu."
      />
      <AdminAnnouncementsPanel />
    </main>
  );
}
