import type { SessionData } from "@auth0/nextjs-auth0/types";

const DEFAULT_ROLES_CLAIM =
  process.env.AUTH0_ROLES_CLAIM || "https://leyline.app/roles";

const ADMIN_ROLES: string[] = (
  process.env.AUTH0_ADMIN_ROLES ??
  "Sales,Owner,ContentAdmin,Admin,SuperAdmin,Master"
)
  .split(",")
  .map((role) => role.trim())
  .filter(Boolean);

export function getUserRolesFromSession(session: SessionData): string[] {
  const claimValue = (session.user as Record<string, unknown>)[
    DEFAULT_ROLES_CLAIM
  ];

  if (Array.isArray(claimValue)) {
    return claimValue.map((value) => String(value));
  }

  if (typeof claimValue === "string" && claimValue.length > 0) {
    return claimValue.split(",").map((role) => role.trim());
  }

  // Fallback: some setups may use the standard `roles` claim.
  const fallback = (session.user as Record<string, unknown>).roles;
  if (Array.isArray(fallback)) {
    return fallback.map((value) => String(value));
  }

  return [];
}

export function userHasAdminAccess(session: SessionData): boolean {
  const roles = getUserRolesFromSession(session);
  if (roles.length === 0) {
    return false;
  }

  return roles.some((role) => ADMIN_ROLES.includes(role));
}
