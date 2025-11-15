'use client';

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Also log to the console so Vercel logs capture the stack.
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-4 py-10">
          <h1 className="heading-leyline text-center text-sm text-gray-700">
            Application Error
          </h1>
          <p className="text-sm text-gray-700">
            An unexpected error occurred while rendering this page. The details
            below are shown to help with debugging.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-500">
              Digest: <code>{error.digest}</code>
            </p>
          )}
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
