
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileLines, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { getAuth0Session } from "@/lib/auth0";
import { getUserPortfolio, PortfolioInvestment } from "@/app/db/portfolio";
import { getCompanies } from "@/app/db/companies";
import NewInvestmentButton from "@/components/portfolio/new-investment-button";

// Mock Fallback Data
const MOCK_INVESTMENTS: PortfolioInvestment[] = [
  { id: '1', companyName: 'Maxar Technologies', type: 'Preferred Stock', owned: 0, value: 0, mock: false },
  { id: '2', companyName: 'Polaris', type: 'Preferred Stock', owned: 0, value: 0, mock: false },
  { id: '3', companyName: 'Microsoft', type: 'Preferred Stock', owned: 0, value: 0, mock: false },
  { id: '4', companyName: 'Alibaba', type: 'Preferred Stock', owned: 0, value: 0, mock: false },
  { id: '5', companyName: 'Baker Hughes', type: 'Preferred Stock', owned: -1, value: -21.20, mock: false },
  { id: '6', companyName: 'Tencent', type: 'Preferred Stock', owned: 1000, value: 5000000.00, mock: true },
  { id: '7', companyName: 'Volcon / Epowersports', type: 'Preferred Stock', owned: 200, value: 125000.00, mock: true },
];

export default async function PortfolioPage() {
  const session = await getAuth0Session();
  const userId = session?.user?.sub ? (session.user.sub as string) : null;
  const companies = await getCompanies();

  let investments: PortfolioInvestment[] = [];

  if (userId) {
    const dbInvestments = await getUserPortfolio(userId);
    if (dbInvestments.length > 0) {
      investments = dbInvestments;
    } else {
      investments = MOCK_INVESTMENTS;
    }
  } else {
    investments = MOCK_INVESTMENTS;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8 bg-gray-50/10 min-h-screen">
      {/* Header - Centered Title and Button */}
      <div className="mb-12 text-center">
        <h1 className="text-2xl font-normal text-gray-700 uppercase tracking-wide mb-4">
          Portfolio
        </h1>
        <div className="flex justify-center">
          <NewInvestmentButton companies={companies} />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100">
        {/* Table Header */}
        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex text-sm font-bold text-gray-600">
          <div className="w-[35%] pl-4">Company</div>
          <div className="w-[25%]">Type</div>
          <div className="w-[20%] text-center">Owned</div>
          <div className="w-[20%] text-right pr-4">Value</div>
        </div>

        <div className="divide-y divide-gray-50">
          {investments.map((inv) => (
            <div key={inv.id} className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors group text-sm">
              {/* Company Column */}
              <div className="w-[35%] flex items-center gap-4">
                {/* Actions - Visible on hover or default opacity logic */}
                <div className="flex gap-2">
                  <Link
                    href={`/portfolio/${inv.id}`}
                    className="flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-100 active:scale-95 transition-transform"
                  >
                    <FontAwesomeIcon icon={faFileLines} className="h-3 w-3" />
                    Details
                  </Link>
                  <button className="flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-100 active:scale-95 transition-transform">
                    <FontAwesomeIcon icon={faPlusCircle} className="h-3 w-3" />
                    New Transaction
                  </button>
                </div>

                <div className="font-medium text-gray-700 truncate flex items-center gap-2">
                  {inv.companyName}
                  {inv.mock && (
                    <span className="rounded bg-sky-400 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white shrink-0">
                      Mock
                    </span>
                  )}
                </div>
              </div>

              {/* Type Column */}
              <div className="w-[25%] text-gray-500">
                {inv.type}
              </div>

              {/* Owned Column */}
              <div className="w-[20%] text-center text-gray-600">
                {inv.owned !== 0 ? `${inv.owned} shares` : '0 shares'}
              </div>

              {/* Value Column */}
              <div className="w-[20%] text-right font-medium text-gray-700 pr-4">
                {inv.value < 0 ? `($${Math.abs(inv.value).toFixed(2)})` : `$${inv.value.toFixed(2)}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

