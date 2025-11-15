import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { MainNavbar } from "@/components/layout/main-navbar";
import { getAuth0Session, isAuth0Configured } from "@/lib/auth0";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAuth0Session();

  if (isAuth0Configured() && !session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <MainNavbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">
        {children}
      </main>
    </div>
  );
}

