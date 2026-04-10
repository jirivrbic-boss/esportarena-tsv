import type { ReactNode } from "react";
import { CaptainShell } from "./captain-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <CaptainShell>{children}</CaptainShell>;
}
