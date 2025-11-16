import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { MainNavbar } from "@/components/layout/main-navbar";
import { getAuth0Session, isAuth0Configured } from "@/lib/auth0";
import { getUserRolesFromSession, userHasAdminAccess } from "@/lib/authz";
import { fetchAuth0UserById } from "@/lib/auth0-management";

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

  const userRoles = session ? getUserRolesFromSession(session) : undefined;
  const showAdminLink = !!(session && userHasAdminAccess(session));

  let membershipLabel = "Leyline Free";

  const auth0UserId =
    typeof (session?.user as { sub?: string } | undefined)?.sub === "string"
      ? (session?.user as { sub?: string }).sub
      : undefined;

  if (auth0UserId) {
    try {
      const auth0User = await fetchAuth0UserById(auth0UserId);
      const membership =
        auth0User?.app_metadata?.membership &&
        typeof auth0User.app_metadata.membership === "string"
          ? auth0User.app_metadata.membership.toLowerCase()
          : "free";

      if (membership === "pro") {
        membershipLabel = "Leyline Pro";
      } else if (membership === "basic") {
        membershipLabel = "Leyline Basic";
      } else {
        membershipLabel = "Leyline Free";
      }
    } catch (error) {
      console.error(
        "[AppLayout] Failed to fetch Auth0 membership from Management API",
        error,
      );
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <MainNavbar
        userName={userName}
        userEmail={userEmail}
        userPictureUrl={userPictureUrl}
        userRoles={userRoles}
        membershipLabel={membershipLabel}
        showAdminLink={showAdminLink}
      />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">
        {children}
      </main>
    </div>
  );
}
