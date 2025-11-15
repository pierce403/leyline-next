type ProfilePageProps = {
  params: {
    alias: string;
  };
};

export default function ProfilePage({ params }: ProfilePageProps) {
  return (
    <div className="space-y-4">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        Profile
      </h1>
      <p className="text-sm text-gray-600">
        Public profile for{" "}
        <span className="font-mono text-xs">@{params.alias}</span> will display
        investment interests, experience, education, and accreditation status.
      </p>
    </div>
  );
}

