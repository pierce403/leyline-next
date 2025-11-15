import { getMissingAuth0EnvVars, isAuth0Configured } from "@/lib/auth0";

export default function LoginPage() {
  const authConfigured = isAuth0Configured();
  const missingEnv = getMissingAuth0EnvVars();

  const googleConnection =
    process.env.AUTH0_GOOGLE_CONNECTION ?? "google-oauth2";
  const appleConnection = process.env.AUTH0_APPLE_CONNECTION ?? "apple";
  const ethereumConnection = process.env.AUTH0_ETHEREUM_CONNECTION;
  const showEthereum = Boolean(ethereumConnection);

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h1 className="heading-leyline text-sm text-gray-800">
          Login to Your Account
        </h1>
      </div>

      {!authConfigured ? (
        <div className="rounded border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
          <p className="mb-2">
            Auth0 is not fully configured for this environment. Before users
            can sign in, ensure the following environment variables are set in
            Vercel for this project:
          </p>
          <ul className="mb-2 list-disc pl-5">
            {missingEnv.map((name) => (
              <li key={name}>
                <code>{name}</code>
              </li>
            ))}
          </ul>
          <p>
            After updating the variables, redeploy the application and return to
            this page to sign in using your existing identity provider.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-gray-700">
            Sign in to Leyline using an existing account. No Leyline-specific
            passwords are stored.
          </p>
          <div className="space-y-3">
            <a
              href={`/auth/login?connection=${encodeURIComponent(
                googleConnection,
              )}`}
              className="flex w-full items-center justify-center rounded border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Continue with Google
            </a>
            <a
              href={`/auth/login?connection=${encodeURIComponent(
                appleConnection,
              )}`}
              className="flex w-full items-center justify-center rounded border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Continue with Apple
            </a>
            {showEthereum && (
              <a
                href={`/auth/login?connection=${encodeURIComponent(
                  ethereumConnection as string,
                )}`}
                className="flex w-full items-center justify-center rounded border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                Continue with Ethereum
              </a>
            )}
          </div>
          <p className="text-center text-xs text-gray-500">
            Account creation and password management are handled entirely by
            your chosen provider (Google, Apple, or Ethereum wallet). Leyline
            never stores your password.
          </p>
        </div>
      )}
    </div>
  );
}
