import { prisma } from "@/lib/prisma";
import { isAuth0Configured } from "@/lib/auth0";
import { serverConfig } from "@/lib/config";

export type ServiceHealthStatus = "ok" | "warning" | "error";

export type ServiceHealth = {
  name: string;
  status: ServiceHealthStatus;
  details?: string;
};

export async function getSystemHealth(): Promise<ServiceHealth[]> {
  const results: ServiceHealth[] = [];

  // Database (Supabase/Postgres)
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.push({
      name: "Database",
      status: "ok",
      details: "Supabase/Postgres reachable",
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
