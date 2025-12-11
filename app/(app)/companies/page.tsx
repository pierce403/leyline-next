import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { getCompanies } from "@/app/db/companies";
import AddCompanyButton from "@/components/companies/add-company-button";

// Mock data to ensure it looks like the screenshot if DB is empty
const MOCK_COMPANIES = [
  { id: '1', name: 'ABB', location: 'Zurich, Switzerland', type: null },
  { id: '2', name: 'Akemona, Inc', location: 'Fremont, Ca', type: null },
  { id: '3', name: 'Alibaba', location: 'Hangzhou, Zhejiang', type: null },
  { id: '4', name: 'Allocations.com', location: 'Internet', type: null },
  { id: '5', name: 'ANGEL STUDIOS', location: 'Provo, UT', type: null },
  { id: '6', name: 'Aya', location: 'Ghana', type: null },
  { id: '7', name: 'Badger Balm', location: '768 Route 10 Gilsum, NH 03448', type: null },
];

export default async function CompaniesPage() {
  const dbCompanies = await getCompanies();
  const companies = dbCompanies.length > 0 ? dbCompanies : MOCK_COMPANIES;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-2xl font-normal text-gray-600 uppercase tracking-wide">
          Companies
        </h1>
        <AddCompanyButton />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Left Column: Company List */}
        <div className="lg:col-span-2 space-y-8">
          {companies.map((company) => (
            <div key={company.id} className="group">
              <Link
                href={`/companies/${company.id}`}
                className="block font-bold text-leyline-blue hover:underline text-base mb-1"
              >
                {company.name}
              </Link>
              <div className="text-sm text-gray-500">
                {company.location || company.type || 'No location set'}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Cards */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-gray-600">Pitch Deck Analysis</h3>
            <button className="mb-3 rounded bg-slate-500 text-white text-xs font-semibold px-3 py-1.5 hover:bg-slate-600">
              Review Course
            </button>
            <div className="text-[10px] text-gray-400">
              Completed (Aug 18, 2021 20:46 EDT)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

