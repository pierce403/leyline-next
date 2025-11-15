import "server-only";

type ManagementEnv = {
  domain: string;
  clientId: string;
  clientSecret: string;
};

export type Auth0User = {
  user_id: string;
  name?: string;
  email?: string;
  picture?: string;
  app_metadata?: {
    membership?: string;
    [key: string]: unknown;
  };
};

function getManagementEnv(): ManagementEnv {
  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_MGMT_CLIENT_ID;
  const clientSecret = process.env.AUTH0_MGMT_CLIENT_SECRET;

  if (!domain || !clientId || !clientSecret) {
    throw new Error(
      "Auth0 Management API is not configured. Set AUTH0_DOMAIN, AUTH0_MGMT_CLIENT_ID, and AUTH0_MGMT_CLIENT_SECRET.",
    );
  }

  return { domain, clientId, clientSecret };
}

async function getManagementToken(): Promise<string> {
  const { domain, clientId, clientSecret } = getManagementEnv();

  const res = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to obtain Auth0 management token: ${res.status} ${res.statusText} – ${text}`,
    );
  }

  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error("Auth0 management token response missing access_token");
  }

  return json.access_token;
}

export async function fetchAuth0Users(limit = 50): Promise<Auth0User[]> {
  const token = await getManagementToken();
  const { domain } = getManagementEnv();

  const res = await fetch(
    `https://${domain}/api/v2/users?per_page=${limit}&sort=-created_at`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to fetch Auth0 users: ${res.status} ${res.statusText} – ${text}`,
    );
  }

  const users = (await res.json()) as Auth0User[];
  return users;
}

export async function updateAuth0UserMembership(
  userId: string,
  membership: "free" | "basic" | "pro",
): Promise<void> {
  const token = await getManagementToken();
  const { domain } = getManagementEnv();

  const res = await fetch(`https://${domain}/api/v2/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      app_metadata: {
        membership,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to update Auth0 user membership: ${res.status} ${res.statusText} – ${text}`,
    );
  }
}

