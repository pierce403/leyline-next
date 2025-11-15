import {
  fetchAuth0Users,
  updateAuth0UserMembership,
  type Auth0User,
} from "@/lib/auth0-management";

const MEMBERSHIP_LEVELS = ["free", "basic", "pro"] as const;
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

  await updateAuth0UserMembership(userId, plan);
}

export default async function AdminUsersPage() {
  let users: Auth0User[] | null = null;
  let loadError: Error | null = null;

  try {
    users = await fetchAuth0Users(50);
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
                    ? "No Auth0 users found for this tenant yet."
                    : "Unable to load users due to an Auth0 Management API error."}
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const rawMembership =
                  user.app_metadata?.membership?.toString().toLowerCase() ??
                  "free";
                const currentPlan: MembershipLevel = MEMBERSHIP_LEVELS.includes(
                  rawMembership as MembershipLevel,
                )
                  ? (rawMembership as MembershipLevel)
                  : "free";

                return (
                  <tr
                    key={user.user_id}
                    className="odd:bg-white even:bg-gray-50 align-top"
                  >
                    <td className="border-t px-3 py-2">
                      {user.name ?? "—"}
                    </td>
                    <td className="border-t px-3 py-2">
                      {user.email ?? "—"}
                    </td>
                    <td className="border-t px-3 py-2">
                      {user.user_id ?? "—"}
                    </td>
                    <td className="border-t px-3 py-2">
                      {currentPlan === "free"
                        ? "Free"
                        : currentPlan === "basic"
                          ? "Basic"
                          : "Pro"}
                    </td>
                    <td className="border-t px-3 py-2">
                      <form action={updateMembership} className="space-y-1">
                        <input
                          type="hidden"
                          name="userId"
                          value={user.user_id}
                        />
                        <select
                          name="membership"
                          defaultValue={currentPlan}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-[11px]"
                        >
                          <option value="free">Free</option>
                          <option value="basic">Basic</option>
                          <option value="pro">Pro</option>
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
