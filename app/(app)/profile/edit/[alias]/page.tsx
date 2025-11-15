type EditProfilePageProps = {
  params: {
    alias: string;
  };
};

export default function EditProfilePage({ params }: EditProfilePageProps) {
  return (
    <div className="space-y-4">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        Edit Profile
      </h1>
      <p className="text-sm text-gray-600">
        Profile edit form for{" "}
        <span className="font-mono text-xs">@{params.alias}</span> will live
        here, mirroring the legacy profile editor.
      </p>
    </div>
  );
}

