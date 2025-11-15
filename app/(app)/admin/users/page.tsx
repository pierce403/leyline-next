import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        Users
      </h1>
      <p className="text-sm text-gray-600">
        Manage Leyline users and their access. This view currently reflects
        users stored in the Leyline database; synchronization with Auth0 will
        be added in a later iteration.
      </p>
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
                Access Type
              </th>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Status
              </th>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-4 text-center text-xs text-gray-500"
                >
                  No users found in the Leyline database yet.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="odd:bg-white even:bg-gray-50">
                  <td className="border-t px-3 py-2">
                    {user.firstName || user.lastName
                      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                      : "—"}
                  </td>
                  <td className="border-t px-3 py-2">{user.email ?? "—"}</td>
                  <td className="border-t px-3 py-2">{user.alias ?? "—"}</td>
                  <td className="border-t px-3 py-2">{user.accessType}</td>
                  <td className="border-t px-3 py-2">{user.status}</td>
                  <td className="border-t px-3 py-2">
                    {user.createdAt.toISOString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
