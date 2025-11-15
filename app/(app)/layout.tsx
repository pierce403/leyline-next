import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { MainNavbar } from "@/components/layout/main-navbar";
import { getAuth0Session, isAuth0Configured } from "@/lib/auth0";
import { userHasAdminAccess } from "@/lib/authz";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAuth0Session();

  if (isAuth0Configured() && !session) {
    redirect("/login");
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

  const showAdminLink = !!(session && userHasAdminAccess(session));

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <MainNavbar
        userName={userName}
        userEmail={userEmail}
        userPictureUrl={userPictureUrl}
        membershipLabel="Leyline Free"
        showAdminLink={showAdminLink}
      />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">
        {children}
      </main>
    </div>
  );
}
