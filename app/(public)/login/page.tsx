import { isAuth0Configured } from "@/lib/auth0";

export default function LoginPage() {
  const authConfigured = isAuth0Configured();

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
          Auth0 has not been configured yet. Once configuration is complete, you
          will be able to sign in securely from this page using your existing
          identity provider.
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
