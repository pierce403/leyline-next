type ProgramPageProps = {
  params: {
    programSlug: string;
  };
};

export default function ProgramDetailPage({ params }: ProgramPageProps) {
  return (
    <div className="space-y-4">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        Program Detail
      </h1>
      <p className="text-sm text-gray-600">
        Program view for{" "}
        <span className="font-mono text-xs">{params.programSlug}</span> will
        list associated courses and completion status.
      </p>
    </div>
  );
}

