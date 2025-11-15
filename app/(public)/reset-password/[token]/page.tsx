type ResetPasswordPageProps = {
  params: {
    token: string;
  };
};

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = params;

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h1 className="heading-leyline text-sm text-gray-800">
          Choose a New Password
        </h1>
      </div>
      <form className="space-y-4">
        <div className="space-y-1 text-sm">
          <label className="text-gray-700">New password</label>
          <input
            type="password"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-leyline-blue focus:outline-none focus:ring-1 focus:ring-leyline-blue"
          />
        </div>
        <div className="space-y-1 text-sm">
          <label className="text-gray-700">Confirm new password</label>
          <input
            type="password"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-leyline-blue focus:outline-none focus:ring-1 focus:ring-leyline-blue"
          />
        </div>
        <input type="hidden" value={token} readOnly />
        <button
          type="submit"
          className="mt-2 w-full rounded bg-leyline-primary px-3 py-2 text-sm font-semibold text-white hover:bg-lime-600"
        >
          Update Password
        </button>
      </form>
    </div>
  );
}

