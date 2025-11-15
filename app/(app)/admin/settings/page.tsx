import { isAuth0Configured } from "@/lib/auth0";
import { serverConfig } from "@/lib/config";

export default function AdminSettingsPage() {
  const authConfigured = isAuth0Configured();
  const hasBlobToken = Boolean(serverConfig.blobReadWriteToken);

  return (
    <div className="space-y-6">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        App Settings
      </h1>

      <section className="rounded border bg-white p-4 text-sm shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-800">Auth0 Setup</h2>
        <p className="mb-2 text-gray-700">
          Configure a Regular Web Application in Auth0 and add the following
          environment variables to your Vercel project:
        </p>
        <ul className="mb-3 list-disc space-y-1 pl-5 text-gray-700">
          <li>`AUTH0_DOMAIN`</li>
          <li>`AUTH0_CLIENT_ID`</li>
          <li>`AUTH0_CLIENT_SECRET`</li>
          <li>`AUTH0_SECRET` (32-byte hex string)</li>
          <li>`APP_BASE_URL` (e.g. `http://localhost:3000` or production URL)</li>
        </ul>
        <p className="mb-2 text-gray-700">
          In the Auth0 dashboard, register these URLs:
        </p>
        <ul className="mb-3 list-disc space-y-1 pl-5 text-gray-700">
          <li>
            Allowed Callback URLs: <code>/auth/callback</code> under your base
            URL.
          </li>
          <li>
            Allowed Logout URLs: your app base URL (e.g.{" "}
            <code>http://localhost:3000</code>).
          </li>
        </ul>
        <p className="text-gray-700">
          Current status:{" "}
          <span
            className={
              authConfigured ? "font-semibold text-emerald-600" : "font-semibold text-red-600"
            }
          >
            {authConfigured ? "Configured" : "Not Configured"}
          </span>
        </p>
      </section>

      <section className="rounded border bg-white p-4 text-sm shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-800">
          Roles &amp; Admin Access
        </h2>
        <p className="mb-2 text-gray-700">
          Leyline maps Auth0 roles to admin access using a configurable roles
          claim and role list:
        </p>
        <ul className="mb-3 list-disc space-y-1 pl-5 text-gray-700">
          <li>
            `AUTH0_ROLES_CLAIM` – claim key that contains user roles (default:{" "}
            <code>https://leyline.app/roles</code>).
          </li>
          <li>
            `AUTH0_ADMIN_ROLES` – comma-separated list of roles that grant
            access to the admin area (default:{" "}
            <code>Sales,Owner,ContentAdmin,Admin,SuperAdmin,Master</code>).
          </li>
        </ul>
        <p className="text-gray-700">
          Ensure your Auth0 rules or actions populate this claim for each user.
        </p>
      </section>

      <section className="rounded border bg-white p-4 text-sm shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-800">Storage (Blob)</h2>
        <p className="mb-2 text-gray-700">
          Course media (images/videos) are stored in Vercel Blob storage.
          Configure:
        </p>
        <ul className="mb-3 list-disc space-y-1 pl-5 text-gray-700">
          <li>`BLOB_READ_WRITE_TOKEN` – read/write token for the Leyline Blob store.</li>
          <li>
            `BLOB_READ_ONLY_TOKEN` – optional read-only token for restricted
            contexts.
          </li>
        </ul>
        <p className="text-gray-700">
          Current Blob status:{" "}
          <span
            className={
              hasBlobToken ? "font-semibold text-emerald-600" : "font-semibold text-red-600"
            }
          >
            {hasBlobToken ? "Write token configured" : "Token missing"}
          </span>
        </p>
      </section>
    </div>
  );
}

