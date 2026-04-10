"use client";

import { createContext, useContext } from "react";

const AdminTempContext = createContext(false);

export function AdminTempProvider({
  value,
  children,
}: {
  value: boolean;
  children: React.ReactNode;
}) {
  return (
    <AdminTempContext.Provider value={value}>
      {children}
    </AdminTempContext.Provider>
  );
}

/** True po návštěvě /admin-docasny-pristup (cookie admin_temp). API adminu stáje vyžaduje přihlášení. */
export function useAdminTempBypass(): boolean {
  return useContext(AdminTempContext);
}
