import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/current-user";

type CoursePageProps = {
  params: {
    courseSlug: string;
  };
};

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const courseId = params.courseSlug;

  const course = await prisma.educationCourse.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    notFound();
  }

  const user = await getOrCreateCurrentUser();

  if (user) {
    await prisma.userEducationCourse.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
      update: {
        latestActionTimestamp: new Date(),
      },
      create: {
        userId: user.id,
        courseId: course.id,
        percentCompleted: 0,
        latestActionTimestamp: new Date(),
      },
    });
  }

  const progress =
    user &&
    (await prisma.userEducationCourse.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
      select: {
        percentCompleted: true,
      },
    }));

  const percentCompleted = progress?.percentCompleted ?? 0;

  return (
    <div className="space-y-4">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        {course.name}
      </h1>
      {course.description && (
        <p className="text-sm text-gray-600">{course.description}</p>
      )}
      {user && (
        <p className="text-xs text-gray-500">
          Progress: {percentCompleted.toFixed(0)}%
        </p>
      )}
      <p className="text-xs text-gray-500">
        Course ID:{" "}
        <span className="font-mono text-[11px]">{course.id}</span>
      </p>
      <p className="text-xs text-gray-500">
        Additional modules and lessons will be rendered here in a later
        iteration.
      </p>
    </div>
  );
}
