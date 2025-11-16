import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { revalidatePath } from "next/cache";
import { getSystemHealth } from "@/lib/health";
import {
  RunMigrationsControl,
  runMigrationsInitialState,
  type MigrationActionState,
} from "@/components/admin/run-migrations-control";

const execFileAsync = promisify(execFile);

async function runMigrationsAction(
  _prevState: MigrationActionState,
  _formData: FormData,
): Promise<MigrationActionState> {
  "use server";

  void _prevState;
  void _formData;

  const isWindows = process.platform === "win32";
  const prismaBinary = path.join(
    process.cwd(),
    "node_modules",
    ".bin",
    `prisma${isWindows ? ".cmd" : ""}`,
  );

  try {
    const { stdout, stderr } = await execFileAsync(prismaBinary, [
      "migrate",
      "deploy",
      "--schema",
      path.join(process.cwd(), "prisma", "schema.prisma"),
    ]);

    const output = [stdout, stderr].filter(Boolean).join("\n").trim();
    revalidatePath("/admin");
    return {
      ok: true,
      message:
        output.length > 0
          ? output
          : "Prisma migrations ran successfully. Check logs for more detail.",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to run migrations";
    console.error("[AdminDashboard] Failed to run prisma migrate deploy", error);
    return {
      ok: false,
      message,
    };
  }
}

export default async function AdminDashboardPage() {
  const health = await getSystemHealth();

  return (
    <div className="space-y-6">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        Admin Dashboard
      </h1>
      <div className="grid gap-4 md:grid-cols-3">
        {health.map((service) => (
          <div
            key={service.name}
            className="rounded border bg-white p-4 text-sm shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="font-semibold text-gray-800">{service.name}</div>
              <span
                className={
                  service.status === "ok"
                    ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
                    : service.status === "warning"
                      ? "rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-700"
                      : "rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700"
                }
              >
                {service.status === "ok"
                  ? "Healthy"
                  : service.status === "warning"
                    ? "Warning"
                    : "Error"}
              </span>
            </div>
            <div className="text-xs text-gray-700">{service.details}</div>
            {service.name === "Database" && service.migrationStatus && (
              <div className="mt-3 space-y-2 border-t pt-3 text-[11px] text-gray-700">
                <div>
                  <span className="font-semibold">Applied:</span>{" "}
                  {service.migrationStatus.applied.length}
                </div>
                <div>
                  <span className="font-semibold">Pending:</span>{" "}
                  {service.migrationStatus.pending.length}
                </div>
                {service.migrationStatus.lastAppliedAt && (
                  <div>
                    <span className="font-semibold">Last applied:</span>{" "}
                    {new Date(
                      service.migrationStatus.lastAppliedAt,
                    ).toLocaleString()}
                  </div>
                )}
                {service.migrationStatus.pending.length > 0 && (
                  <div>
                    <div className="font-semibold">Pending migrations:</div>
                    <ul className="list-disc space-y-0.5 pl-4">
                      {service.migrationStatus.pending
                        .slice(0, 5)
                        .map((migration) => (
                          <li key={migration}>{migration}</li>
                        ))}
                      {service.migrationStatus.pending.length > 5 && (
                        <li>
                          …and{" "}
                          {service.migrationStatus.pending.length - 5} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                {service.migrationStatus.error && (
                  <div className="rounded border border-yellow-200 bg-yellow-50 px-2 py-1 text-[10px] text-yellow-800">
                    {service.migrationStatus.error}
                  </div>
                )}
                <RunMigrationsControl
                  action={runMigrationsAction}
                  initialState={runMigrationsInitialState}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Health checks are evaluated on each page load. For more detailed logs,
        use the underlying services&apos; dashboards.
      </p>
    </div>
  );
}
