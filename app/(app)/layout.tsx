import type { ReactNode } from "react";
import { MainNavbar } from "@/components/layout/main-navbar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <MainNavbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">
        {children}
      </main>
    </div>
  );
}

