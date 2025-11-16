import fs from "node:fs/promises";
import path from "node:path";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAuth0Configured } from "@/lib/auth0";
import { serverConfig } from "@/lib/config";

export type ServiceHealthStatus = "ok" | "warning" | "error";

export type MigrationStatus = {
  applied: string[];
  pending: string[];
  lastAppliedAt?: string;
  error?: string;
};

export type ServiceHealth = {
  name: string;
  status: ServiceHealthStatus;
  details?: string;
  migrationStatus?: MigrationStatus;
};

async function getLocalMigrationNames(): Promise<string[]> {
  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  try {
    const entries = await fs.readdir(migrationsDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    console.error(
      "[Health] Failed to read prisma/migrations directory",
      error,
    );
    return [];
  }
}

async function getPrismaMigrationStatus(): Promise<MigrationStatus> {
  const localMigrations = await getLocalMigrationNames();

  try {
    const rows = await prisma.$queryRaw<
      { migration_name: string; finished_at: Date | null }[]
    >`SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY finished_at ASC`;

    const applied = rows
      .filter((row) => row.finished_at)
      .map((row) => row.migration_name);

    const lastApplied = rows
      .filter((row) => row.finished_at)
      .map((row) => row.finished_at)
      .filter((date): date is Date => date !== null)
      .pop();

    const pending = localMigrations.filter(
      (migration) => !applied.includes(migration),
    );

    return {
      applied,
      pending,
      lastAppliedAt: lastApplied ? lastApplied.toISOString() : undefined,
    };
  } catch (error) {
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Unknown migration status error";

    return {
      applied: [],
      pending: localMigrations,
      error: message,
    };
  }
}

export async function getSystemHealth(): Promise<ServiceHealth[]> {
  const results: ServiceHealth[] = [];

  // Database (Supabase/Postgres)
  try {
    await prisma.$queryRaw`SELECT 1`;
    const migrationStatus = await getPrismaMigrationStatus();
    const hasPending = migrationStatus.pending.length > 0;
    const dbStatus: ServiceHealthStatus =
      migrationStatus.error || hasPending ? "warning" : "ok";
    const detail = migrationStatus.error
      ? `Supabase/Postgres reachable • Migration status unknown: ${migrationStatus.error}`
      : hasPending
        ? `Supabase/Postgres reachable • ${migrationStatus.pending.length} migration(s) pending`
        : `Supabase/Postgres reachable • ${migrationStatus.applied.length} migration(s) applied`;

    results.push({
      name: "Database",
      status: dbStatus,
      details: detail,
      migrationStatus,
    });
  } catch {
    results.push({
      name: "Database",
      status: "error",
      details: "Database check failed",
    });
  }

  // Auth0 configuration
  if (isAuth0Configured()) {
    results.push({
      name: "Auth0",
      status: "ok",
      details: "Auth0 environment variables configured",
    });
  } else {
    results.push({
      name: "Auth0",
      status: "warning",
      details: "Auth0 environment variables are incomplete",
    });
  }

  // Vercel Blob storage
  if (serverConfig.blobReadWriteToken) {
    results.push({
      name: "Blob Storage",
      status: "ok",
      details: "BLOB_READ_WRITE_TOKEN is configured",
    });
  } else {
    results.push({
      name: "Blob Storage",
      status: "warning",
      details: "BLOB_READ_WRITE_TOKEN is not configured",
    });
  }

  return results;
}
