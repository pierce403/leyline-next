import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h1 className="heading-leyline text-sm text-gray-800">
          Create Your Account
        </h1>
      </div>
      <form className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1 text-sm">
            <label className="text-gray-700">First name</label>
            <input
              type="text"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-leyline-blue focus:outline-none focus:ring-1 focus:ring-leyline-blue"
            />
          </div>
          <div className="space-y-1 text-sm">
            <label className="text-gray-700">Last name</label>
            <input
              type="text"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-leyline-blue focus:outline-none focus:ring-1 focus:ring-leyline-blue"
            />
          </div>
        </div>

        <div className="space-y-1 text-sm">
          <label className="text-gray-700">Email</label>
          <input
            type="email"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-leyline-blue focus:outline-none focus:ring-1 focus:ring-leyline-blue"
          />
        </div>

        <div className="space-y-1 text-sm">
          <label className="text-gray-700">Password</label>
          <input
            type="password"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-leyline-blue focus:outline-none focus:ring-1 focus:ring-leyline-blue"
          />
        </div>

        <div className="space-y-1 text-sm">
          <label className="text-gray-700">Confirm password</label>
          <input
            type="password"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-leyline-blue focus:outline-none focus:ring-1 focus:ring-leyline-blue"
          />
        </div>

        <div className="flex items-start gap-2 text-xs text-gray-700">
          <input
            id="accept"
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-leyline-primary focus:ring-leyline-primary"
          />
          <label htmlFor="accept">
            I agree to the{" "}
            <Link
              href="/terms"
              className="text-leyline-blue hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-leyline-blue hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </label>
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded bg-leyline-primary px-3 py-2 text-sm font-semibold text-white hover:bg-lime-600"
        >
          Sign Up
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-leyline-blue hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}

