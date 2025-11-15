type NodeEnv = "development" | "test" | "production";

const nodeEnv = (process.env.NODE_ENV as NodeEnv | undefined) ?? "development";
const isTestEnv = nodeEnv === "test";

function requireEnv(name: string): string {
  const value = process.env[name];

  if (value && value.length > 0) {
    return value;
  }

  if (isTestEnv) {
    return "";
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export type ServerConfig = {
  nodeEnv: NodeEnv;
  databaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  blobReadWriteToken?: string;
};

export const serverConfig: ServerConfig = {
  nodeEnv,
  // Prisma itself reads POSTGRES_URL_NON_POOLING, but we expose it here
  // for any direct DB tools that might need the connection string.
  databaseUrl: requireEnv("POSTGRES_URL_NON_POOLING"),
  supabaseUrl: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  blobReadWriteToken: optionalEnv("BLOB_READ_WRITE_TOKEN"),
};

