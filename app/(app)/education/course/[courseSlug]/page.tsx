type CoursePageProps = {
  params: {
    courseSlug: string;
  };
};

export default function CourseDetailPage({ params }: CoursePageProps) {
  return (
    <div className="space-y-4">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        Course Detail
      </h1>
      <p className="text-sm text-gray-600">
        Course view for{" "}
        <span className="font-mono text-xs">{params.courseSlug}</span> will
        show modules, lessons, and progress tracking per the legacy Leyline
        experience.
      </p>
    </div>
  );
}

