import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileLines } from "@fortawesome/free-solid-svg-icons";
import { getAuth0Session } from "@/lib/auth0";
import { getUserDashboardEducationProgress } from "@/app/db/education";

import { FormattedDate } from "@/components/ui/formatted-date";

// Mock Data
const investments = [
  {
    id: 1,
    name: "Maxar Technologies",
    type: "Preferred Stock",
    owned: "0 shares",
    value: "$0.00",
    isMock: false,
  },
  {
    id: 2,
    name: "Polaris",
    type: "Preferred Stock",
    owned: "0 shares",
    value: "$0.00",
    isMock: false,
  },
  {
    id: 3,
    name: "Microsoft",
    type: "Preferred Stock",
    owned: "0 shares",
    value: "$0.00",
    isMock: false,
  },
  {
    id: 4,
    name: "Alibaba",
    type: "Preferred Stock",
    owned: "0 shares",
    value: "$0.00",
    isMock: false,
  },
  {
    id: 5,
    name: "Baker Hughes",
    type: "Preferred Stock",
    owned: "-1 shares",
    value: "($21.20)",
    isMock: false,
  },
];

const mockInvestments = [
  {
    id: 6,
    name: "Tencent",
    type: "Preferred Stock",
    owned: "1000 shares",
    value: "$5,000,000.00",
    isMock: true,
  },
  {
    id: 7,
    name: "Volcon / Epowersports",
    type: "Preferred Stock",
    owned: "200 shares",
    value: "$125,000.00",
    isMock: true,
  },
  {
    id: 8,
    name: "ABB",
    type: "Convertible Note",
    owned: "0%",
    value: "$0.00",
    isMock: true,
  },
  {
    id: 9,
    name: "ABB",
    type: "Simple Agreement for Future Equity",
    owned: "0%",
    value: "$0.00",
    isMock: true,
  },
];

const reminders = [
  {
    id: 1,
    text: "Review Quarterly, check NPI, acquisitions, and watch the investor meeting.",
    date: "Aug 15, 2021",
    link: "#",
  },
  {
    id: 2,
    text: "Upload some links to analyst reports on SA and other related documents",
    date: "Aug 3, 2021",
    link: "#",
  },
];

export default async function DashboardPage() {
  const session = await getAuth0Session();
  const auth0UserId = session?.user?.sub ? (session.user.sub as string) : undefined;

  let educationProgress: { id: string; name: string; percentCompleted: number; lastAccessed: Date | null }[] = [];

  if (auth0UserId) {
    try {
      educationProgress = await getUserDashboardEducationProgress(auth0UserId);
    } catch (e) {
      console.error("Failed to fetch education progress:", e);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8 bg-gray-50/50 min-h-screen">
      {/* Page Layout */}
      <div className="flex flex-col gap-10 lg:flex-row">
        {/* Left Column: Investments & Chart */}
        <div className="flex-1 space-y-10">
          {/* Investments Section */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-700">Investments</h2>
              <Link
                href="/portfolio"
                className="text-sm font-medium text-leyline-blue hover:underline"
              >
                View Portfolio
              </Link>
            </div>

            {/* Real Investments Table */}
            <div className="mb-8 overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500">
                    <td className="py-3 pl-4 w-24"></td>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Owned</th>
                    <th className="px-4 py-3 font-medium text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {investments.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50">
                      <td className="py-3 pl-4">
                        <button className="flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 active:scale-95 transition-transform">
                          <FontAwesomeIcon icon={faFileLines} className="h-3 w-3" />
                          Details
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-700">
                          {inv.name}
                        </div>
                        <div className="text-xs text-gray-500">{inv.type}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{inv.owned}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-700">
                        {inv.value}
                      </td>
                    </tr>
                  ))}

                  {/* Mock Investments - Rendered in same list style but separate block logically in data */}
                  {mockInvestments.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 bg-gray-50/30">
                      <td className="py-3 pl-4">
                        <button className="flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 active:scale-95 transition-transform">
                          <FontAwesomeIcon icon={faFileLines} className="h-3 w-3" />
                          Details
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">
                            {inv.name}
                          </span>
                          <span className="rounded bg-sky-400 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                            Mock
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{inv.type}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{inv.owned}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-700">
                        {inv.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Chart Section */}
            <div>
              <div className="mb-4 text-center text-sm font-semibold text-gray-600">
                Portfolio Value
              </div>
              <div className="mb-6 flex justify-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-8 bg-[#2ecc71] rounded-sm"></div>
                  <span className="text-gray-600">Investments</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-8 bg-[#3498db] rounded-sm"></div>
                  <span className="text-gray-600">Mock Investments</span>
                </div>
              </div>

              {/* Simulated Chart Container */}
              <div className="relative h-64 w-full rounded border border-gray-100 bg-white p-4 shadow-sm">
                {/* Y-Axis Labels */}
                <div className="absolute left-4 top-4 bottom-8 flex flex-col justify-between text-[10px] text-gray-400 font-medium text-right w-16">
                  <span>$30,000,000</span>
                  <span>$25,000,000</span>
                  <span>$20,000,000</span>
                  <span>$15,000,000</span>
                  <span>$10,000,000</span>
                  <span>$5,000,000</span>
                </div>

                {/* Chart Area */}
                <div className="absolute left-24 right-4 top-4 bottom-8 border-l border-b border-gray-100">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-px w-full bg-gray-50"></div>
                    ))}
                  </div>

                  {/* X-Axis Labels */}
                  <div className="absolute top-full left-0 right-0 flex justify-between pt-2 text-[10px] text-gray-400">
                    <span>Jun 2025</span>
                    <span>Jul 2025</span>
                    <span>Aug 2025</span>
                    <span>Sept 2025</span>
                    <span>Oct 2025</span>
                    <span>Nov 2025</span>
                    <span>Dec 2025</span>
                  </div>

                  {/* Trend Lines (SVG) - Approximating the screenshot */}
                  <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none">
                    {/* Green line - Flat at ~25M */}
                    <polyline
                      points="0,40 100,40 200,40 300,40 400,40 500,40 600,40"
                      fill="none"
                      stroke="#2ecc71"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                    {/* Points on Green Line */}
                    {[0, 100, 200, 300, 400, 500, 600].map(x => (
                      <circle key={`g-${x}`} cx={x} cy={40} r="3" fill="#2ecc71" />
                    ))}

                    {/* Blue line - Flat at ~5M */}
                    <polyline
                      points="0,200 100,200 200,200 300,200 400,200 500,200 600,200"
                      fill="none"
                      stroke="#3498db"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                    {/* Points on Blue Line */}
                    {[0, 100, 200, 300, 400, 500, 600].map(x => (
                      <circle key={`b-${x}`} cx={x} cy={200} r="3" fill="#3498db" />
                    ))}
                  </svg>
                </div>
                {/* Y Axis Title */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-400 font-medium">Value</div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Educational Progress & Reminders */}
        <div className="w-full lg:w-[45%] space-y-10">
          {/* Educational Progress */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-700">Educational Progress</h2>
              <Link
                href="/education"
                className="text-sm font-medium text-leyline-blue hover:underline"
              >
                View All Educational Programs
              </Link>
            </div>
            <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100 min-h-[100px]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-white">
                    <th className="py-3 px-4 font-medium text-gray-600 text-center">Program</th>
                    <th className="py-3 px-4 font-medium text-gray-600 text-right">Completed</th>
                    <th className="py-3 px-4 font-medium text-gray-600 text-right">Accessed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {educationProgress.length > 0 ? (
                    educationProgress.map((prog) => (
                      <tr key={prog.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-700">
                          {prog.name}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {prog.percentCompleted.toFixed(0)}%
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500 text-xs">
                          <FormattedDate
                            date={prog.lastAccessed}
                            options={{ year: 'numeric', month: 'short', day: 'numeric' }}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    /* Empty state or items */
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-400 text-xs italic">
                        No active programs
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Reminders */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-700">
              Reminders
            </h2>
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="group">
                  <Link href={reminder.link} className="block text-base text-leyline-blue hover:underline mb-1">
                    {reminder.text}
                  </Link>
                  <div className="text-sm italic text-gray-500">
                    {reminder.date}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
