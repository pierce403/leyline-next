// The Auth0 SDK exposes shared types via the `types` export.
import type { SessionData } from "@auth0/nextjs-auth0/types";
import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const REQUIRED_AUTH0_ENV_VARS = [
  "AUTH0_DOMAIN",
  "AUTH0_CLIENT_ID",
  "AUTH0_CLIENT_SECRET",
  "AUTH0_SECRET",
  "APP_BASE_URL",
] as const;

export function getMissingAuth0EnvVars(): string[] {
  return REQUIRED_AUTH0_ENV_VARS.filter((name) => {
    const value = process.env[name];
    return typeof value !== "string" || value.length === 0;
  });
}

export function isAuth0Configured(): boolean {
  return getMissingAuth0EnvVars().length === 0;
}

let auth0Client: Auth0Client | null = null;

export function getAuth0Client(): Auth0Client {
  if (!isAuth0Configured()) {
    const missing = getMissingAuth0EnvVars();
    throw new Error(
      missing.length === 0
        ? "Auth0 is not configured. Required environment variables are missing."
        : `Auth0 is not configured. Missing environment variables: ${missing.join(
            ", ",
          )}`,
    );
  }

  if (!auth0Client) {
    auth0Client = new Auth0Client();
  }

  return auth0Client;
}

export async function getAuth0Session(): Promise<SessionData | null> {
  if (!isAuth0Configured()) {
    return null;
  }

  const client = getAuth0Client();
  return client.getSession();
}
