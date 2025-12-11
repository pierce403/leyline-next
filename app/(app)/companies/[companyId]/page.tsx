import Link from "next/link";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faCloudUploadAlt,
  faStickyNote,
  faFilePdf,
  faTimesCircle,
  faPlusCircle,
  faFileLines
} from "@fortawesome/free-solid-svg-icons";
import { getCompanyDetails, CompanyDetail } from "@/app/db/companies";
import { FormattedDate } from "@/components/ui/formatted-date";
import DeleteCompanyButton from "@/components/companies/delete-company-button";

// Mock Fallback Data (for demo IDs 1-7)
const MOCK_DETAILS: Record<string, CompanyDetail> = {
  '1': {
    id: '1',
    name: 'ABB',
    location: 'Zurich, Switzerland',
    type: null,
    investments: [
      { id: 'inv1', investmentType: 'SAFE Note', owned: 0, value: 0 }
    ],
    documents: [
      { id: 'doc1', title: 'Upcounsel__LLC_12-31-2020_FS.pdf', url: '#', createdAt: new Date() },
      { id: 'doc2', title: 'SAFE (Simple Agreement for Future Equity).pdf', url: '#', createdAt: new Date() },
    ],
    companyNotes: [
      { id: 'note1', content: '28mil Val Cap Post Money', createdAt: new Date('2021-08-09T15:47:00') },
      { id: 'note2', content: '~1.4mil revenue', createdAt: new Date('2021-08-09T15:47:00') },
    ]
  }
};

type CompanyDetailPageProps = {
  params: {
    companyId: string;
  };
};

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  let company = await getCompanyDetails(params.companyId);

  // Fallback for mocks
  if (!company && MOCK_DETAILS[params.companyId]) {
    company = MOCK_DETAILS[params.companyId];
  }

  if (!company) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 bg-white min-h-screen">
      {/* Header Section */}
      <div className="mb-8 text-center border-b border-gray-100 pb-8">
        <h1 className="mb-4 text-2xl font-normal text-gray-700 uppercase tracking-wide">
          {company.name}
        </h1>
        <div className="flex justify-center gap-3">
          <button className="flex items-center gap-2 rounded border border-sky-400 bg-white px-3 py-1.5 text-xs font-medium text-sky-500 hover:bg-sky-50 transition-colors">
            <FontAwesomeIcon icon={faEdit} className="h-3 w-3" />
            Edit Company
          </button>
          <button className="flex items-center gap-2 rounded border border-sky-400 bg-white px-3 py-1.5 text-xs font-medium text-sky-500 hover:bg-sky-50 transition-colors">
            <FontAwesomeIcon icon={faCloudUploadAlt} className="h-3 w-3" />
            Upload Document
          </button>
          <button className="flex items-center gap-2 rounded border border-sky-400 bg-white px-3 py-1.5 text-xs font-medium text-sky-500 hover:bg-sky-50 transition-colors">
            <FontAwesomeIcon icon={faStickyNote} className="h-3 w-3" />
            New Note
          </button>
          <DeleteCompanyButton companyId={company.id} />
        </div>
      </div>

      {/* Overview Section */}
      <div className="mb-12">
        <div className="mb-2 font-bold text-gray-700">{company.name}</div>
        <div className="text-sm text-gray-500 mb-6">
          {company.location || company.type || 'No location set'}
        </div>

        {/* Portfolio Value Box */}
        <div className="flex flex-col items-center">
          <div className="bg-[#2ecc71] text-white px-6 py-2 text-2xl font-bold rounded shadow-sm mb-4">
            $0.00
          </div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Portfolio Value
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-3 bg-[#2ecc71] rounded-sm"></div>
            <span className="text-xs text-gray-500">Investments</span>
          </div>

          {/* Chart Container - Very sparse chart from screenshot */}
          <div className="w-full h-64 border border-gray-100 rounded-lg relative bg-white">
            {/* Horizontal Grid Lines */}
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((val, i) => (
              <div key={i} className="absolute w-full border-t border-gray-100" style={{ bottom: `${val * 100}%` }}></div>
            ))}

            {/* Y Axis Labels */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between -translate-x-full pr-2 text-[10px] text-gray-400 text-right h-full">
              <span>$1</span>
              <span>$0.8</span>
              <span>$0.6</span>
              <span>$0.4</span>
              <span>$0.2</span>
              <span>$0</span>
              <span>$-0.2</span>
              <span>$-0.4</span>
              <span>$-0.6</span>
              <span>$-0.8</span>
              <span>$-1</span>
            </div>

            {/* Center Green Line */}
            <div className="absolute w-full top-1/2 border-t-2 border-[#2ecc71]"></div>
            {/* Dots on the line (one per month approx) */}
            <div className="absolute w-full top-1/2 flex justify-between px-4 -translate-y-[5px]">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-2.5 h-2.5 bg-[#2ecc71] rounded-full border-2 border-white box-content"></div>
              ))}
            </div>

            {/* X Axis Labels */}
            <div className="absolute w-full -bottom-6 flex justify-between px-2 text-[10px] text-gray-500">
              <span>Jan 2025</span>
              <span>Feb 2025</span>
              <span>Mar 2025</span>
              <span>Apr 2025</span>
              <span>May 2025</span>
              <span>Jun 2025</span>
              <span>Jul 2025</span>
              <span>Aug 2025</span>
              <span>Sept 2025</span>
              <span>Oct 2025</span>
              <span>Nov 2025</span>
              <span>Dec 2025</span>
            </div>

            {/* Axis Titles */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">Month</div>
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-gray-400">Value</div>
          </div>

          {/* Table Header like Labels below chart */}
          <div className="w-full mt-16 flex text-sm font-bold text-gray-600 border-b border-gray-100 pb-2">
            <div className="w-1/3 pl-4">Type</div>
            <div className="w-1/3 text-center">Owned</div>
            <div className="w-1/3 text-right pr-4">Value</div>
          </div>
        </div>
      </div>

      {/* Investments List */}
      <div className="mb-12 bg-gray-50/30">
        {company.investments.length > 0 ? (
          company.investments.map(inv => (
            <div key={inv.id} className="flex items-center py-4 border-b border-gray-100 hover:bg-gray-50">
              <div className="w-1/3 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <button className="flex items-center gap-1 bg-white border border-gray-200 shadow-sm rounded px-2 py-1 text-[10px] font-semibold text-gray-600">
                    <FontAwesomeIcon icon={faFileLines} className="w-2 h-2" /> Details
                  </button>
                  <button className="flex items-center gap-1 bg-white border border-gray-200 shadow-sm rounded px-2 py-1 text-[10px] font-semibold text-gray-600">
                    <FontAwesomeIcon icon={faPlusCircle} className="w-2 h-2" /> New Transaction
                  </button>
                </div>
                <div className="text-gray-700 text-sm">{inv.investmentType}</div>
              </div>
              <div className="w-1/3 text-center text-sm text-gray-600">{inv.owned ? inv.owned : ''}</div>
              <div className="w-1/3 text-right pr-4 text-sm text-gray-600">${inv.value.toFixed(2)}</div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm italic">No investments recorded</div>
        )}
      </div>

      {/* Documents Section */}
      <div className="mb-12">
        <h3 className="text-xl font-bold text-gray-600 mb-6">Documents</h3>
        <div className="space-y-3">
          {company.documents.length > 0 ? company.documents.map(doc => (
            <div key={doc.id} className="flex items-center gap-2 text-sm">
              <FontAwesomeIcon icon={faFilePdf} className="text-blue-500 h-4 w-4" />
              <a href={doc.url} className="text-blue-500 hover:underline">{doc.title}</a>
              <button className="text-red-400 hover:text-red-600 ml-1">
                <FontAwesomeIcon icon={faTimesCircle} className="h-3 w-3" />
              </button>
            </div>
          )) : (
            <p className="text-sm text-gray-400 italic">No documents uploaded.</p>
          )}
        </div>
      </div>

      {/* Notes Section */}
      <div className="mb-12">
        <h3 className="text-xl font-bold text-gray-600 mb-6">Notes</h3>
        <div className="space-y-6">
          {company.companyNotes.length > 0 ? company.companyNotes.map(note => (
            <div key={note.id} className="border-b border-gray-100 pb-4 last:border-0 relative">
              <p className="text-gray-700 text-sm mb-1">{note.content}</p>
              <div className="text-xs text-gray-400 italic flex items-center gap-2">
                <FormattedDate date={note.createdAt} options={{ year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }} />
                <button className="text-blue-400 hover:text-blue-600 ml-2">
                  <FontAwesomeIcon icon={faEdit} className="h-3 w-3" />
                </button>
                <button className="text-red-400 hover:text-red-600">
                  <FontAwesomeIcon icon={faTimesCircle} className="h-3 w-3" />
                </button>
              </div>
            </div>
          )) : (
            <p className="text-sm text-gray-400 italic">No notes added.</p>
          )}
        </div>
      </div>

      {/* Footer Copyright Mock from Screenshot */}
      <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between text-xs text-gray-500">
        <div>© 2025 Leyline Corporation. All rights reserved.</div>
        <div className="flex gap-4">
          <span>Leyline.io v1.2.11</span>
          <Link href="#" className="hover:underline">Terms & Conditions</Link>
          <Link href="#" className="hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}

