import type { ReactNode } from "react";
import { MainNavbar } from "@/components/layout/main-navbar";
import { AdminSidenav } from "@/components/layout/admin-sidenav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <MainNavbar />
      <div className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-6">
        <AdminSidenav />
        <main className="flex-1 pl-6">{children}</main>
      </div>
    </div>
  );
}

