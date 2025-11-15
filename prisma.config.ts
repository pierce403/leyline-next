import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Use the Supabase Prisma URL for migrations and the client.
    url: env("POSTGRES_PRISMA_URL"),
  },
});
