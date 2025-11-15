import { getSystemHealth } from "@/lib/health";

export default async function AdminDashboardPage() {
  const health = await getSystemHealth();

  return (
    <div className="space-y-6">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        Admin Dashboard
      </h1>
      <div className="grid gap-4 md:grid-cols-3">
        {health.map((service) => (
          <div
            key={service.name}
            className="rounded border bg-white p-4 text-sm shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="font-semibold text-gray-800">{service.name}</div>
              <span
                className={
                  service.status === "ok"
                    ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
                    : service.status === "warning"
                      ? "rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-700"
                      : "rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700"
                }
              >
                {service.status === "ok"
                  ? "Healthy"
                  : service.status === "warning"
                    ? "Warning"
                    : "Error"}
              </span>
            </div>
            <div className="text-xs text-gray-700">{service.details}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Health checks are evaluated on each page load. For more detailed logs,
        use the underlying services&apos; dashboards.
      </p>
    </div>
  );
}
