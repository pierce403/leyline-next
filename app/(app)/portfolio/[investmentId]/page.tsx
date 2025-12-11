
import { notFound } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBuilding } from "@fortawesome/free-solid-svg-icons";
import { getInvestmentDetails } from "@/app/db/portfolio";
import { FormattedDate } from "@/components/ui/formatted-date";
import AddTransactionModal from "@/components/portfolio/add-transaction-modal";
import DeleteInvestmentButton from "@/components/portfolio/delete-investment-button";

type InvestmentDetailPageProps = {
  params: Promise<{
    investmentId: string;
  }>;
};

export const dynamic = 'force-dynamic';

export default async function InvestmentDetailPage({ params }: InvestmentDetailPageProps) {
  const { investmentId } = await params;
  const investment = await getInvestmentDetails(investmentId);

  if (!investment) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      {/* Back Link */}
      <div className="mb-6">
        <Link href="/portfolio" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2">
          <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" />
          Back to Portfolio
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Link href={`/companies/${investment.companyId}`} className="hover:underline decoration-gray-300">
              {investment.companyName}
            </Link>
            {investment.mock && (
              <span className="rounded bg-sky-400 px-2 py-0.5 text-xs font-bold uppercase text-white">
                Mock
              </span>
            )}
          </h1>
          <div className="text-gray-500 mt-1 flex items-center gap-2">
            <FontAwesomeIcon icon={faBuilding} className="h-3 w-3" />
            {investment.type}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AddTransactionModal investmentId={investment.id} />
          <DeleteInvestmentButton investmentId={investment.id} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">Total Shares Owned</div>
          <div className="text-3xl font-bold text-gray-800">
            {investment.owned.toLocaleString()} <span className="text-base font-normal text-gray-400">shares</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">Total Value</div>
          <div className="text-3xl font-bold text-gray-800">
            ${investment.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">Transaction History</h3>
        </div>

        {investment.transactions.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {investment.transactions.map((tx) => (
              <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <div className="font-bold text-gray-700">{tx.transactionType}</div>
                  <div className="text-xs text-gray-500">
                    <FormattedDate date={tx.occurredAt} options={{ year: 'numeric', month: 'short', day: 'numeric' }} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-800">
                    ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  {tx.quantity && (
                    <div className="text-xs text-gray-500">
                      {tx.quantity} shares
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400 italic text-sm">
            No transactions recorded.
          </div>
        )}
      </div>
    </div>
  );
}
