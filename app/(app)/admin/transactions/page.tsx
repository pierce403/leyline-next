export default function AdminTransactionsPage() {
  return (
    <div className="space-y-4">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        Transactions
      </h1>
      <p className="text-sm text-gray-600">
        Subscription and billing transaction history, driven by Stripe events,
        will be surfaced here.
      </p>
    </div>
  );
}

