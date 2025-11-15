import { isAuth0Configured } from "@/lib/auth0";

export default function LoginPage() {
  const authConfigured = isAuth0Configured();

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
          will be able to sign in securely from this page.
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Sign in to Leyline using secure Auth0 authentication.
          </p>
          <a
            href="/auth/login"
            className="flex w-full items-center justify-center rounded bg-leyline-primary px-3 py-2 text-sm font-semibold text-white hover:bg-lime-600"
          >
            Sign In
          </a>
          <div className="text-center text-sm text-gray-600">
            Don&apos;t have an account yet?{" "}
            <a
              href="/auth/login?screen_hint=signup"
              className="text-leyline-blue hover:underline"
            >
              Sign Up
            </a>
          </div>
          <div className="text-center text-xs text-gray-500">
            Forgot your password? Use the Auth0 password reset flow from the
            sign-in screen.
          </div>
        </div>
      )}
    </div>
  );
}
