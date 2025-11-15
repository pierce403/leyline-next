// The Auth0 SDK exposes shared types via the `types` export.
import type { SessionData } from "@auth0/nextjs-auth0/types";
import { Auth0Client } from "@auth0/nextjs-auth0/server";

const REQUIRED_AUTH0_ENV_VARS = [
  "AUTH0_DOMAIN",
  "AUTH0_CLIENT_ID",
  "AUTH0_CLIENT_SECRET",
  "AUTH0_SECRET",
  "APP_BASE_URL",
] as const;

export function isAuth0Configured(): boolean {
  return REQUIRED_AUTH0_ENV_VARS.every((name) => {
    const value = process.env[name];
    return typeof value === "string" && value.length > 0;
  });
}

let auth0Client: Auth0Client | null = null;

export function getAuth0Client(): Auth0Client {
  if (!isAuth0Configured()) {
    throw new Error(
      "Auth0 is not configured. Set AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_SECRET, and APP_BASE_URL, then retry.",
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
