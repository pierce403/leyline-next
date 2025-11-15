import { NextResponse } from "next/server";
import { getAuth0Session, isAuth0Configured } from "@/lib/auth0";
import { getUserRolesFromSession } from "@/lib/authz";

export async function GET() {
  if (!isAuth0Configured()) {
    return NextResponse.json(
      { error: "Auth0 is not configured in this environment." },
      { status: 500 },
    );
  }

  const session = await getAuth0Session();

  if (!session) {
    return NextResponse.json({ session: null, roles: [], user: null });
  }

  const roles = getUserRolesFromSession(session);
  const rolesClaimKey =
    process.env.AUTH0_ROLES_CLAIM ||
    "https://leyline-next.vercel.app/claims/roles";

  return NextResponse.json({
    // WARNING: idToken is exposed here only for debugging.
    // Remove this field once you are done inspecting tokens.
    idToken: (session as unknown as { tokenSet?: { idToken?: string } })
      .tokenSet?.idToken,
    rolesClaimKey,
    roles,
    // Expose only non-sensitive user fields useful for debugging roles.
    user: {
      sub: (session.user as { sub?: string }).sub,
      name: (session.user as { name?: string }).name,
      email: (session.user as { email?: string }).email,
      picture: (session.user as { picture?: string }).picture,
      rawRolesClaim: (session.user as Record<string, unknown>)[rolesClaimKey],
    },
  });
}
