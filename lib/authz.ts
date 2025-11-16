import type { SessionData } from "@auth0/nextjs-auth0/types";
import { Buffer } from "node:buffer";

const DEFAULT_ROLES_CLAIM =
  process.env.AUTH0_ROLES_CLAIM ||
  "https://leyline-next.vercel.app/claims/roles";

const rawAdminRoles = process.env.AUTH0_ADMIN_ROLES;

const ADMIN_ROLES: string[] = rawAdminRoles
  ? rawAdminRoles
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean)
  : ["admin"];

const HARD_CODED_ADMIN_EMAILS = ["dagan@leyline.io", "seth@leyline.io"];

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

  // If we didn't find roles on the user object, fall back to decoding them
  // directly from the idToken. Some Auth0 configurations do not copy custom
  // claims onto the session user object.
  const anySession = session as unknown as {
    tokenSet?: { idToken?: string };
  };
  const idToken = anySession.tokenSet?.idToken;
  if (!idToken) {
    return [];
  }

  try {
    const [, payloadB64] = idToken.split(".");
    const json = Buffer.from(payloadB64, "base64").toString("utf8");
    const payload = JSON.parse(json) as Record<string, unknown>;
    const tokenClaim = payload[DEFAULT_ROLES_CLAIM];

    if (Array.isArray(tokenClaim)) {
      return tokenClaim.map((value) => String(value));
    }

    if (typeof tokenClaim === "string" && tokenClaim.length > 0) {
      return tokenClaim.split(",").map((role) => role.trim());
    }
  } catch {
    // Ignore decode errors and fall through to no roles.
  }

  return [];
}

export function getUserRolesFromSession(session: SessionData): string[] {
  const roles = readRolesFromSession(session);
  const email =
    typeof (session.user as { email?: string } | undefined)?.email === "string"
      ? (session.user as { email?: string }).email
      : undefined;

  if (
    email &&
    HARD_CODED_ADMIN_EMAILS.some(
      (value) => value.toLowerCase() === email.toLowerCase(),
    ) &&
    !roles.map((role) => role.toLowerCase()).includes("admin")
  ) {
    return [...roles, "admin"];
  }

  return roles;
}

export function userHasAdminAccess(session: SessionData): boolean {
  const roles = readRolesFromSession(session);
  const email =
    typeof (session.user as { email?: string } | undefined)?.email === "string"
      ? (session.user as { email?: string }).email
      : undefined;

  const adminLower = ADMIN_ROLES.map((role) => role.toLowerCase());
  const hasRoleAdmin = roles
    .map((role) => role.toLowerCase())
    .some((role) => adminLower.includes(role));

  if (hasRoleAdmin) {
    return true;
  }

  if (
    email &&
    HARD_CODED_ADMIN_EMAILS.some(
      (value) => value.toLowerCase() === email.toLowerCase(),
    )
  ) {
    return true;
  }

  return false;
}
