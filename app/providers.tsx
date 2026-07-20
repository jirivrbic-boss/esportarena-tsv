"use client";

import { type ReactNode } from "react";
import dynamic from "next/dynamic";

const AuthProvider = dynamic(
  () => import("@/contexts/auth-context").then((m) => ({ default: m.AuthProvider })),
  { ssr: false }
);

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
