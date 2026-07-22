import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CaptainShell } from "./captain-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <CaptainShell>{children}</CaptainShell>;
}
