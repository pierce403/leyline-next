type CompanyDetailPageProps = {
  params: {
    companyId: string;
  };
};

export default function CompanyDetailPage({ params }: CompanyDetailPageProps) {
  return (
    <div className="space-y-4">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        Company Detail
      </h1>
      <p className="text-sm text-gray-600">
        Detail view for company{" "}
        <span className="font-mono text-xs">{params.companyId}</span> will
        match the legacy Leyline layout for a single company.
      </p>
    </div>
  );
}

