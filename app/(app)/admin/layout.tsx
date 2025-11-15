import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { MainNavbar } from "@/components/layout/main-navbar";
import { AdminSidenav } from "@/components/layout/admin-sidenav";
import { getAuth0Session, isAuth0Configured } from "@/lib/auth0";
import { getUserRolesFromSession, userHasAdminAccess } from "@/lib/authz";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAuth0Session();

  if (isAuth0Configured() && !session) {
    redirect("/login");
  }

  if (isAuth0Configured() && session && !userHasAdminAccess(session)) {
    redirect("/");
  }

  const user = session?.user as
    | {
        name?: string;
        email?: string;
        picture?: string;
      }
    | undefined;

  const userName = user?.name ?? user?.email ?? undefined;
  const userEmail = user?.email ?? undefined;
  const userPictureUrl =
    typeof user?.picture === "string" && user.picture.length > 0
      ? user.picture
      : undefined;
  const userRoles = session ? getUserRolesFromSession(session) : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <MainNavbar
        userName={userName}
        userEmail={userEmail}
        userPictureUrl={userPictureUrl}
        userRoles={userRoles}
        membershipLabel="Leyline Free"
        showAdminLink
      />
      <div className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-6">
        <AdminSidenav />
        <main className="flex-1 pl-6">{children}</main>
      </div>
    </div>
  );
}
