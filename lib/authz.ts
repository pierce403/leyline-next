import type { SessionData } from "@auth0/nextjs-auth0/types";

const DEFAULT_ROLES_CLAIM =
  process.env.AUTH0_ROLES_CLAIM || "https://leyline.app/roles";

const rawAdminRoles = process.env.AUTH0_ADMIN_ROLES;

const ADMIN_ROLES: string[] = rawAdminRoles
  ? rawAdminRoles
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean)
  : ["admin"];

function readRolesFromSession(session: SessionData): string[] {
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

export function getUserRolesFromSession(session: SessionData): string[] {
  const roles = readRolesFromSession(session);
  return roles.length > 0 ? roles : ["free"];
}

export function userHasAdminAccess(session: SessionData): boolean {
  const roles = readRolesFromSession(session);
  if (roles.length === 0) {
    return false;
  }

  const adminLower = ADMIN_ROLES.map((role) => role.toLowerCase());
  return roles
    .map((role) => role.toLowerCase())
    .some((role) => adminLower.includes(role));
}
