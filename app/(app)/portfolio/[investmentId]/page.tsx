type InvestmentDetailPageProps = {
  params: {
    investmentId: string;
  };
};

export default function InvestmentDetailPage({
  params,
}: InvestmentDetailPageProps) {
  return (
    <div className="space-y-4">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        Investment Detail
      </h1>
      <p className="text-sm text-gray-600">
        Detail view for investment{" "}
        <span className="font-mono text-xs">{params.investmentId}</span> will
        show summary information and historical transactions.
      </p>
    </div>
  );
}

