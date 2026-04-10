import { cookies } from "next/headers";
import { AdminShell } from "@/components/admin-shell";
import { AdminTempProvider } from "@/contexts/admin-temp-context";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const adminTempBypass = jar.get("admin_temp")?.value === "1";

  return (
    <AdminTempProvider value={adminTempBypass}>
      <AdminShell>{children}</AdminShell>
    </AdminTempProvider>
  );
}
