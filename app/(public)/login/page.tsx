import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h1 className="heading-leyline text-sm text-gray-800">
          Login to Your Account
        </h1>
      </div>
      <form className="space-y-4">
        <div className="space-y-1 text-sm">
          <label className="flex items-center justify-between text-gray-700">
            <span>Email</span>
          </label>
          <input
            type="email"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-leyline-blue focus:outline-none focus:ring-1 focus:ring-leyline-blue"
          />
        </div>
        <div className="space-y-1 text-sm">
          <label className="flex items-center justify-between text-gray-700">
            <span>Password</span>
            <Link
              href="/forgot-password"
              className="text-xs text-leyline-blue hover:underline"
            >
              Forgot password?
            </Link>
          </label>
          <input
            type="password"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-leyline-blue focus:outline-none focus:ring-1 focus:ring-leyline-blue"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <input
            id="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-leyline-primary focus:ring-leyline-primary"
          />
          <label htmlFor="remember" className="text-gray-700">
            Remember me
          </label>
        </div>
        <button
          type="submit"
          className="mt-2 w-full rounded bg-leyline-primary px-3 py-2 text-sm font-semibold text-white hover:bg-lime-600"
        >
          Sign In
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Don&apos;t have an account yet?{" "}
        <Link href="/register" className="text-leyline-blue hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}

