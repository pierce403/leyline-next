'use client';

import { useEffect, useMemo } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

function detectSupabaseError(error: Error): {
  isSupabase: boolean;
  reason: string | null;
} {
  const message = error.message || "";
  const stack = error.stack || "";
  const combined = `${message} ${stack}`.toLowerCase();

  if (combined.includes("tenant or user not found")) {
    return {
      isSupabase: true,
      reason: "paused",
    };
  }

  if (
    combined.includes("connection refused") ||
    combined.includes("econnrefused") ||
    combined.includes("connection timed out") ||
    combined.includes("etimedout")
  ) {
    return {
      isSupabase: true,
      reason: "connection",
    };
  }

  if (
    combined.includes("password authentication failed") ||
    combined.includes("authentication failed")
  ) {
    return {
      isSupabase: true,
      reason: "auth",
    };
  }

  return { isSupabase: false, reason: null };
}

function SupabaseErrorBanner({ reason }: { reason: string | null }) {
  return (
    <section className="rounded-lg border-2 border-orange-400 bg-orange-50 p-5 shadow-md">
      <div className="mb-3 flex items-center gap-2">
        <svg
          className="h-6 w-6 text-orange-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
        <h2 className="text-lg font-bold text-orange-800">
          Supabase Database Connection Error
        </h2>
      </div>

      {reason === "paused" && (
        <div className="space-y-3 text-sm text-orange-900">
          <p className="font-medium">
            Your Supabase project appears to be <strong>paused</strong>.
          </p>
          <p>
            Supabase free-tier projects are automatically paused after 1 week of
            inactivity to save resources.
          </p>
          <div className="rounded bg-orange-100 p-3">
            <p className="mb-2 font-semibold">To fix this:</p>
            <ol className="list-inside list-decimal space-y-1">
              <li>
                Go to your{" "}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-orange-700 underline hover:text-orange-900"
                >
                  Supabase Dashboard
                </a>
              </li>
              <li>Find your project and click &quot;Restore project&quot;</li>
              <li>Wait a few minutes for the database to resume</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      )}

      {reason === "connection" && (
        <div className="space-y-3 text-sm text-orange-900">
          <p className="font-medium">
            Unable to connect to the Supabase database.
          </p>
          <div className="rounded bg-orange-100 p-3">
            <p className="mb-2 font-semibold">Possible causes:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>The Supabase project may be paused or deleted</li>
              <li>Network connectivity issues</li>
              <li>Incorrect database host in POSTGRES_PRISMA_URL</li>
            </ul>
          </div>
        </div>
      )}

      {reason === "auth" && (
        <div className="space-y-3 text-sm text-orange-900">
          <p className="font-medium">
            Database authentication failed.
          </p>
          <div className="rounded bg-orange-100 p-3">
            <p className="mb-2 font-semibold">To fix this:</p>
            <ol className="list-inside list-decimal space-y-1">
              <li>
                Go to your{" "}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-orange-700 underline hover:text-orange-900"
                >
                  Supabase Dashboard
                </a>
              </li>
              <li>Navigate to Project Settings → Database</li>
              <li>Copy the new connection string</li>
              <li>Update POSTGRES_PRISMA_URL in your .env file</li>
              <li>Restart the dev server</li>
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const supabaseError = useMemo(() => detectSupabaseError(error), [error]);

  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-4 py-10">
          <h1 className="heading-leyline text-center text-sm text-gray-700">
            Application Error
          </h1>

          {supabaseError.isSupabase ? (
            <SupabaseErrorBanner reason={supabaseError.reason} />
          ) : (
            <p className="text-sm text-gray-700">
              An unexpected error occurred while rendering this page. The details
              below are shown to help with debugging.
            </p>
          )}

          {error.digest && (
            <p className="text-xs text-gray-500">
              Digest: <code>{error.digest}</code>
            </p>
          )}
          <details className="group">
            <summary className="cursor-pointer text-xs font-medium text-gray-600 hover:text-gray-800">
              {supabaseError.isSupabase ? "Show technical details" : "Error details"}
            </summary>
            <div className="mt-2 space-y-4">
              <section className="rounded border bg-white p-4 text-xs shadow-sm">
                <h2 className="mb-2 font-semibold text-gray-800">Message</h2>
                <pre className="whitespace-pre-wrap break-all text-red-700">
                  {error.message}
                </pre>
              </section>
              {error.stack && (
                <section className="rounded border bg-white p-4 text-xs shadow-sm">
                  <h2 className="mb-2 font-semibold text-gray-800">Stack Trace</h2>
                  <pre className="whitespace-pre-wrap break-all text-gray-800">
                    {error.stack}
                  </pre>
                </section>
              )}
            </div>
          </details>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-2 self-start rounded bg-leyline-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-lime-600"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
