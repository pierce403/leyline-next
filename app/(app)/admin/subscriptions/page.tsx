import {
  isPayPalConfigured,
  listRecentPayPalTransactions,
  summarizeSubscriptionsFromTransactions,
  type PayPalSubscriptionSummary,
} from "@/lib/paypal";

export default async function AdminSubscriptionsPage() {
  let subscriptions: PayPalSubscriptionSummary[] | null = null;
  let loadError: Error | null = null;

  if (isPayPalConfigured()) {
    try {
      const transactions = await listRecentPayPalTransactions(180);
      subscriptions = summarizeSubscriptionsFromTransactions(transactions);
    } catch (error) {
      loadError = error as Error;
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        Subscriptions
      </h1>
      <p className="text-sm text-gray-600">
        Read-only view of recent PayPal-derived subscriptions. Stripe-backed
        Leyline subscriptions will be added later.
      </p>
      {!isPayPalConfigured() && (
        <div className="rounded border border-yellow-300 bg-yellow-50 p-3 text-xs text-yellow-900">
          <div className="mb-1 font-semibold">PayPal not configured</div>
          <p>
            To enable PayPal subscription summaries, set{" "}
            <code>PAYPAL_CLIENT_ID</code>, <code>PAYPAL_CLIENT_SECRET</code>,
            and optionally <code>PAYPAL_ENV</code> (either{" "}
            <code>live</code> or <code>sandbox</code>) in your environment and
            redeploy.
          </p>
        </div>
      )}
      {loadError && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-xs text-red-800">
          <div className="mb-1 font-semibold">PayPal error</div>
          <div className="mb-2 whitespace-pre-wrap break-all">
            {loadError.message}
          </div>
          {loadError.stack && (
            <details className="mt-1">
              <summary className="cursor-pointer text-[11px] font-semibold">
                Show stack trace
              </summary>
              <pre className="mt-1 whitespace-pre-wrap break-all text-[11px]">
                {loadError.stack}
              </pre>
            </details>
          )}
        </div>
      )}
      <div className="overflow-x-auto rounded border bg-white text-xs shadow-sm">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Subscription ID
              </th>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Payer Email
              </th>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Last Transaction
              </th>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Last Amount
              </th>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Payments
              </th>
            </tr>
          </thead>
          <tbody>
            {!subscriptions || subscriptions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-xs text-gray-500"
                >
                  {subscriptions
                    ? "No PayPal-derived subscriptions detected in the recent transaction history."
                    : "PayPal is not configured or an error occurred while loading subscription data."}
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr
                  key={sub.subscriptionId}
                  className="odd:bg-white even:bg-gray-50 align-top"
                >
                  <td className="border-t px-3 py-2">
                    {sub.subscriptionId}
                  </td>
                  <td className="border-t px-3 py-2">
                    {sub.payerEmail ?? "—"}
                  </td>
                  <td className="border-t px-3 py-2">
                    {sub.lastTransactionTime
                      ? new Date(sub.lastTransactionTime).toISOString()
                      : "Unknown"}
                  </td>
                  <td className="border-t px-3 py-2">
                    {sub.lastTransactionAmount
                      ? `${sub.lastTransactionAmount.value} ${sub.lastTransactionAmount.currencyCode}`
                      : "—"}
                  </td>
                  <td className="border-t px-3 py-2">
                    {sub.transactionCount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

