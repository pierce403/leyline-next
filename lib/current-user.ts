import "server-only";

import { prisma } from "@/lib/prisma";
import { getAuth0Session, isAuth0Configured } from "@/lib/auth0";

export async function getOrCreateCurrentUser() {
  if (!isAuth0Configured()) {
    return null;
  }

  const session = await getAuth0Session();
  const rawUser = session?.user as
    | {
        sub?: string;
        email?: string;
        nickname?: string;
        name?: string;
        given_name?: string;
        family_name?: string;
        picture?: string;
      }
    | undefined;

  const auth0UserId = rawUser?.sub;
  if (!auth0UserId) {
    return null;
  }

  const existing = await prisma.user.findUnique({
    where: { auth0UserId },
  });

  if (existing) {
    return existing;
  }

  const email =
    typeof rawUser?.email === "string" && rawUser.email.length > 0
      ? rawUser.email
      : `${auth0UserId}@example.invalid`;

  const baseAliasSource =
    rawUser?.nickname ??
    rawUser?.name ??
    (email.includes("@") ? email.split("@")[0] : "user");

  const baseAlias =
    baseAliasSource
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "-")
      .replace(/^-+|-+$/g, "") || "user";

  let alias = baseAlias;
  let suffix = 1;

  // Ensure the alias is unique. For the small expected user counts,
  // a simple loop is sufficient.
  let foundUniqueAlias = false;
  while (!foundUniqueAlias) {
    const conflict = await prisma.user.findUnique({
      where: { alias },
    });
    if (!conflict) {
      foundUniqueAlias = true;
      break;
    }
    suffix += 1;
    alias = `${baseAlias}-${suffix}`;
  }

  const firstName =
    typeof rawUser?.given_name === "string" ? rawUser.given_name : null;
  const lastName =
    typeof rawUser?.family_name === "string" ? rawUser.family_name : null;
  const photoUrl =
    typeof rawUser?.picture === "string" && rawUser.picture.length > 0
      ? rawUser.picture
      : null;

  return prisma.user.create({
    data: {
      auth0UserId,
      alias,
      email,
      firstName,
      lastName,
      photoUrl,
    },
  });
}
