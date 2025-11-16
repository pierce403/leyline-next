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
    include: {
      modules: true,
      lessons: true,
    },
  });

  type CourseProgressMeta = {
    percentCompleted: number;
    latestActionTimestamp?: Date | null;
  };

  let progressByCourseId = new Map<string, CourseProgressMeta>();

  if (user) {
    const progressList = await prisma.userEducationCourse.findMany({
      where: { userId: user.id },
      select: {
        courseId: true,
        percentCompleted: true,
        latestActionTimestamp: true,
      },
    });

    progressByCourseId = new Map(
      progressList.map((p) => [
        p.courseId,
        {
          percentCompleted: p.percentCompleted,
          latestActionTimestamp: p.latestActionTimestamp,
        },
      ]),
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => {
            const progress = progressByCourseId.get(course.id);
            const percentCompleted = progress?.percentCompleted ?? 0;
            const lastUpdated =
              progress?.latestActionTimestamp ?? course.createdAt;
            const hasStarted = percentCompleted > 0;

            let primaryLabel = "Start Course";
            if (percentCompleted >= 100) {
              primaryLabel = "Review Course";
            } else if (hasStarted) {
              primaryLabel = "Resume Course";
            }

            const percentLabel = `${percentCompleted.toFixed(0)}% Completed`;
            const lastUpdatedLabel = lastUpdated
              ? new Date(lastUpdated).toLocaleString()
              : "";
            const moduleCount = course.modules.length;
            const lessonCount = course.lessons.length;

            return (
              <article
                key={course.id}
                className="flex flex-col overflow-hidden rounded border bg-white text-sm shadow-sm"
              >
                <div className="h-32 w-full overflow-hidden bg-gray-200">
                  {course.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.coverImageUrl}
                      alt={course.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-lime-100 via-emerald-100 to-lime-200" />
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
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
                    <p className="text-[11px] text-gray-500">
                      {moduleCount} module{moduleCount === 1 ? "" : "s"},{" "}
                      {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
                    </p>
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
                  {user && (
                    <div className="mt-3 border-t pt-2 text-[11px] text-gray-500">
                      <div>{percentLabel}</div>
                      {lastUpdatedLabel && (
                        <div>Updated {lastUpdatedLabel}</div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
