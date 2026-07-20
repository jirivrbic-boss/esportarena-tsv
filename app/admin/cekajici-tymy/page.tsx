"use client";

import { PortalPageHeader } from "@/components/portal-page-header";
import { AdminPendingTeamsPanel } from "@/components/admin-pending-teams-panel";

export default function AdminPendingTeamsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-12">
      <PortalPageHeader
        backHref="/admin"
        backLabel="Přehled administrace"
        title="Čekající týmy"
        description="Schvalování a zamítání nově registrovaných týmů."
      />
      <AdminPendingTeamsPanel />
    </main>
  );
}
