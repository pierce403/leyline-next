import { prisma } from "@/lib/prisma";

const MEMBERSHIP_LEVELS = ["FREE", "BASIC", "PRO"] as const;
type MembershipLevel = (typeof MEMBERSHIP_LEVELS)[number];

async function updateMembership(formData: FormData) {
  "use server";

  const userId = formData.get("userId");
  const plan = formData.get("membership") as MembershipLevel | null;

  if (!userId || typeof userId !== "string") {
    return;
  }
  if (!plan || !MEMBERSHIP_LEVELS.includes(plan)) {
    return;
  }

  await prisma.subscription.updateMany({
    where: { userId },
    data: { status: "CANCELED" },
  });

  await prisma.subscription.create({
    data: {
      userId,
      plan,
      status: "ACTIVE",
    },
  });
}

type UserWithMemberships = Awaited<
  ReturnType<typeof prisma.user.findMany>
>[number] & {
  memberships: Awaited<
    ReturnType<typeof prisma.subscription.findMany>
  >;
};

export default async function AdminUsersPage() {
  let users: UserWithMemberships[] | null = null;
  let loadError: Error | null = null;

  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        memberships: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  } catch (error) {
    loadError = error as Error;
  }

  return (
    <div className="space-y-4">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        Users
      </h1>
      <p className="text-sm text-gray-600">
        Manage Leyline users, their membership level, and access. This view
        currently reflects users stored in the Leyline database; synchronization
        with Auth0 and Stripe will be added in a later iteration.
      </p>
      {loadError && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-xs text-red-800">
          <div className="mb-1 font-semibold">Database error</div>
          <div className="mb-2 whitespace-pre-wrap break-all">
            {loadError.message}
          </div>
          {loadError.stack && (
            <details className="mt-1">
              <summary className="cursor-pointer text-[11px] font-semibold">
                Show stack trace
              </summary>
              <pre className="mt-1 whitespace-pre-wrap break-all text-[11px]">
                {loadError.stack}
              </pre>
            </details>
          )}
        </div>
      )}
      <div className="overflow-x-auto rounded border bg-white shadow-sm">
        <table className="min-w-full border-collapse text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Name
              </th>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Email
              </th>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Alias
              </th>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Membership
              </th>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Status
              </th>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Created
              </th>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {!users || users.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-4 text-center text-xs text-gray-500"
                >
                  {users
                    ? "No users found in the Leyline database yet."
                    : "Unable to load users due to a database error."}
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const membership = user.memberships[0];
                const currentPlan: MembershipLevel =
                  (membership?.plan as MembershipLevel | undefined) ?? "FREE";

                return (
                  <tr
                    key={user.id}
                    className="odd:bg-white even:bg-gray-50 align-top"
                  >
                    <td className="border-t px-3 py-2">
                      {user.firstName || user.lastName
                        ? `${user.firstName ?? ""} ${
                            user.lastName ?? ""
                          }`.trim()
                        : "—"}
                    </td>
                    <td className="border-t px-3 py-2">
                      {user.email ?? "—"}
                    </td>
                    <td className="border-t px-3 py-2">
                      {user.alias ?? "—"}
                    </td>
                    <td className="border-t px-3 py-2">
                      {currentPlan === "FREE"
                        ? "Free"
                        : currentPlan === "BASIC"
                          ? "Basic"
                          : "Pro"}
                    </td>
                    <td className="border-t px-3 py-2">{user.status}</td>
                    <td className="border-t px-3 py-2">
                      {user.createdAt.toISOString()}
                    </td>
                    <td className="border-t px-3 py-2">
                      <form action={updateMembership} className="space-y-1">
                        <input type="hidden" name="userId" value={user.id} />
                        <select
                          name="membership"
                          defaultValue={currentPlan}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-[11px]"
                        >
                          <option value="FREE">Free</option>
                          <option value="BASIC">Basic</option>
                          <option value="PRO">Pro</option>
                        </select>
                        <button
                          type="submit"
                          className="w-full rounded bg-leyline-primary px-2 py-1 text-[11px] font-semibold text-white hover:bg-lime-600"
                        >
                          Update
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
