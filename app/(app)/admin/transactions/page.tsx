import {
  isPayPalConfigured,
  listRecentPayPalTransactions,
  type PayPalTransaction,
} from "@/lib/paypal";

export default async function AdminTransactionsPage() {
  let transactions: PayPalTransaction[] | null = null;
  let loadError: Error | null = null;

  if (isPayPalConfigured()) {
    try {
      transactions = await listRecentPayPalTransactions(90);
    } catch (error) {
      loadError = error as Error;
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        Transactions
      </h1>
      <p className="text-sm text-gray-600">
        Read-only view of recent PayPal transactions for the connected account.
        Stripe-driven transaction history will be added later.
      </p>
      {!isPayPalConfigured() && (
        <div className="rounded border border-yellow-300 bg-yellow-50 p-3 text-xs text-yellow-900">
          <div className="mb-1 font-semibold">PayPal not configured</div>
          <p>
            To enable PayPal transaction history, set{" "}
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
                Time
              </th>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Event
              </th>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Status
              </th>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Amount
              </th>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Payer Email
              </th>
              <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                Subscription Ref
              </th>
            </tr>
          </thead>
          <tbody>
            {!transactions || transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-4 text-center text-xs text-gray-500"
                >
                  {transactions
                    ? "No recent PayPal transactions found for this account."
                    : "PayPal is not configured or an error occurred while loading transactions."}
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="odd:bg-white even:bg-gray-50 align-top"
                >
                  <td className="border-t px-3 py-2">
                    {tx.time
                      ? new Date(tx.time).toISOString()
                      : "Unknown time"}
                  </td>
                  <td className="border-t px-3 py-2">
                    {tx.eventCode ?? "—"}
                  </td>
                  <td className="border-t px-3 py-2">{tx.status}</td>
                  <td className="border-t px-3 py-2">
                    {tx.amount.value} {tx.amount.currencyCode}
                  </td>
                  <td className="border-t px-3 py-2">
                    {tx.payerEmail ?? "—"}
                  </td>
                  <td className="border-t px-3 py-2">
                    {tx.paypalReferenceId ?? "—"}
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

