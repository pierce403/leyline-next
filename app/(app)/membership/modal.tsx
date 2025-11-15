"use client";

export function MembershipModalPlaceholder() {
  return (
    <div className="rounded-lg border bg-white p-4 text-sm text-gray-700 shadow-lg">
      <h2 className="heading-leyline mb-2 text-xs text-gray-800">
        Choose Your Leyline Membership
      </h2>
      <p>
        The membership comparison and upgrade/downgrade actions will be
        implemented here with Stripe and Auth0 integration.
      </p>
    </div>
  );
}

