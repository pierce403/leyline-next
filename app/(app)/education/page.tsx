import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/current-user";

export default async function EducationOverviewPage() {
  const user = await getOrCreateCurrentUser();

  const courses = await prisma.educationCourse.findMany({
    where: {
      status: {
        not: "DELETED",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let progressByCourseId = new Map<string, number>();

  if (user) {
    const progressList = await prisma.userEducationCourse.findMany({
      where: { userId: user.id },
      select: {
        courseId: true,
        percentCompleted: true,
      },
    });

    progressByCourseId = new Map(
      progressList.map((p) => [p.courseId, p.percentCompleted]),
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        Education
      </h1>
      <p className="text-sm text-gray-600">
        Explore Leyline courses. Your progress is tracked per course so you can
        pick up where you left off.
      </p>
      {courses.length === 0 ? (
        <p className="text-xs text-gray-500">
          No courses are available yet. Admins can import courses via the
          admin panel.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((course) => {
            const percentCompleted =
              progressByCourseId.get(course.id) ?? 0;
            const hasStarted = percentCompleted > 0;
            const primaryLabel = hasStarted ? "Continue Course" : "Start Course";

            return (
              <article
                key={course.id}
                className="flex flex-col justify-between rounded border bg-white p-4 text-sm shadow-sm"
              >
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-gray-900">
                    {course.name}
                  </h2>
                  {course.description && (
                    <p className="text-xs text-gray-600">
                      {course.description}
                    </p>
                  )}
                  <p className="text-[11px] font-medium text-gray-500">
                    Required level:{" "}
                    <span className="uppercase">
                      {course.requiredLevel.toLowerCase()}
                    </span>
                  </p>
                  {user && (
                    <p className="text-[11px] text-gray-500">
                      Progress: {percentCompleted.toFixed(0)}%
                    </p>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Link
                    href={`/education/course/${course.id}`}
                    className="rounded bg-leyline-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-lime-600"
                  >
                    {primaryLabel}
                  </Link>
                  <Link
                    href={`/education/course/${course.id}`}
                    className="text-[11px] font-semibold text-leyline-primary hover:underline"
                  >
                    View details
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
