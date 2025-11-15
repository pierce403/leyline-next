import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="w-full max-w-xl rounded-lg border bg-white p-8 shadow-sm">
      <h1 className="mb-3 text-center text-2xl font-semibold text-gray-800">
        Welcome to Leyline
      </h1>
      <p className="mb-4 text-sm text-gray-700">
        Your account has been created. Explore investor education, companies,
        and your portfolio in the Leyline application.
      </p>
      <div className="flex justify-center">
        <Link
          href="/"
          className="rounded bg-leyline-primary px-4 py-2 text-sm font-semibold text-white hover:bg-lime-600"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

