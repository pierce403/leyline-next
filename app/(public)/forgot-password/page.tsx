export default function ForgotPasswordPage() {
  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h1 className="heading-leyline text-sm text-gray-800">
          Reset Your Password
        </h1>
      </div>
      <form className="space-y-4">
        <div className="space-y-1 text-sm">
          <label className="text-gray-700">Email</label>
          <input
            type="email"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-leyline-blue focus:outline-none focus:ring-1 focus:ring-leyline-blue"
          />
        </div>
        <button
          type="submit"
          className="mt-2 w-full rounded bg-leyline-primary px-3 py-2 text-sm font-semibold text-white hover:bg-lime-600"
        >
          Reset Password
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        You&apos;ll receive an email with instructions to reset your password.
      </p>
    </div>
  );
}

