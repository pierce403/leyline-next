import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getSystemHealth } from "@/lib/health";
import {
  RunMigrationsControl,
  runMigrationsInitialState,
  type MigrationActionState,
} from "@/components/admin/run-migrations-control";
import { FrontendTestModal } from "@/components/admin/frontend-test-modal";

const execFileAsync = promisify(execFile);

async function runMigrationsAction(
  _prevState: MigrationActionState,
  _formData: FormData,
): Promise<MigrationActionState> {
  "use server";

  void _prevState;
  void _formData;

  const isWindows = process.platform === "win32";
  const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
  const prismaBinary = path.join(
    process.cwd(),
    "node_modules",
    ".bin",
    `prisma${isWindows ? ".cmd" : ""}`,
  );
  const prismaVersion =
    Prisma?.prismaVersion?.client ??
    process.env.PRISMA_VERSION ??
    process.env.npm_package_dependencies_prisma ??
    "6.19.0";

  const baseArgs = ["migrate", "deploy", "--schema", schemaPath];
  const attempts = [
    {
      label: "local prisma CLI",
      cmd: prismaBinary,
      args: baseArgs,
    },
    {
      label: `npx prisma@${prismaVersion}`,
      cmd: "npx",
      args: ["--yes", `prisma@${prismaVersion}`, ...baseArgs],
    },
  ];

  const errorMessages: string[] = [];

  try {
    for (const attempt of attempts) {
      console.log("[AdminDashboard] Running migration command", {
        label: attempt.label,
        command: attempt.cmd,
        args: attempt.args,
      });

      try {
        const { stdout, stderr } = await execFileAsync(attempt.cmd, attempt.args, {
          env: {
            ...process.env,
          },
        });

        const output = [stdout, stderr]
          .filter(Boolean)
          .map((line) => line.trim())
          .filter(Boolean)
          .join("\n");

        console.log("[AdminDashboard] Migration command succeeded", {
          label: attempt.label,
          output,
        });
        revalidatePath("/admin");
        return {
          ok: true,
          message:
            output.length > 0
              ? output
              : "Prisma migrations ran successfully. Check logs for more detail.",
        };
      } catch (commandError) {
        console.error("[AdminDashboard] Migration command failed", {
          label: attempt.label,
          error: commandError,
        });

        const messageParts: string[] = [];
        if (
          commandError &&
          typeof commandError === "object" &&
          "stderr" in commandError &&
          typeof commandError.stderr === "string" &&
          commandError.stderr.trim().length > 0
        ) {
          messageParts.push(commandError.stderr.trim());
        }
        if (
          commandError &&
          typeof commandError === "object" &&
          "stdout" in commandError &&
          typeof commandError.stdout === "string" &&
          commandError.stdout.trim().length > 0
        ) {
          messageParts.push(commandError.stdout.trim());
        }
        if (commandError instanceof Error) {
          messageParts.push(commandError.message);
        }
        errorMessages.push(
          `[${attempt.label}] ${messageParts.join("\n") || "Command failed"}`,
        );
      }
    }
  } catch (error) {
    console.error("[AdminDashboard] Unexpected error running migrations", error);
    errorMessages.push(
      error instanceof Error ? error.message : "Unexpected failure",
    );
  }

  return {
    ok: false,
    message:
      errorMessages.join("\n\n") ||
      "Failed to execute Prisma migrations. Check server logs for details.",
  };
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
            {service.name === "Frontend" && (
              <div className="mt-3 border-t pt-3">
                <FrontendTestModal />
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
