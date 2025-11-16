import type { ReactElement } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { LessonContentType, LessonProgressStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentUser } from "@/lib/current-user";

type CoursePageRouteParams = {
  courseSlug: string;
};

type CourseSearchParams = {
  lessonId?: string;
};

type CoursePageProps = {
  params: CoursePageRouteParams | Promise<CoursePageRouteParams>;
  searchParams?: CourseSearchParams | Promise<CourseSearchParams>;
};

export default async function CourseDetailPage({
  params,
  searchParams,
}: CoursePageProps) {
  const resolvedParams = await params;
  const resolvedSearch = (await searchParams) ?? {};
  const courseId = resolvedParams?.courseSlug;

  if (typeof courseId !== "string" || courseId.length === 0) {
    console.error(
      "CourseDetailPage: missing or invalid courseSlug route param",
      resolvedParams,
    );
    notFound();
  }

  const course = await prisma.educationCourse.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    notFound();
  }

  const modulesWithLessons = await prisma.courseModule.findMany({
    where: { courseId: course.id },
    orderBy: { sortOrder: "asc" },
    include: {
      module: {
        include: {
          lessons: {
            orderBy: { sortOrder: "asc" },
            include: {
              lesson: true,
            },
          },
        },
      },
    },
  });

  const allLessons = modulesWithLessons.flatMap((cm) =>
    cm.module.lessons.map((ml) => ({
      courseModuleId: cm.id,
      moduleSortOrder: cm.sortOrder,
      module: cm.module,
      moduleLesson: ml,
      lesson: ml.lesson,
    })),
  );

  const totalLessons = allLessons.length;

  const user = await getOrCreateCurrentUser();

  let lessonProgressById = new Map<
    string,
    { status: LessonProgressStatus; lastViewedTimestamp: Date | null }
  >();

  if (user && totalLessons > 0) {
    const lessonIds = allLessons.map((item) => item.lesson.id);

    const [courseProgress, lessonProgressList] = await Promise.all([
      prisma.userEducationCourse.upsert({
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
      }),
      prisma.userEducationLesson.findMany({
        where: {
          userId: user.id,
          lessonId: {
            in: lessonIds,
          },
        },
        select: {
          lessonId: true,
          status: true,
          lastViewedTimestamp: true,
        },
      }),
    ]);

    void courseProgress;

    lessonProgressById = new Map(
      lessonProgressList.map((lp) => [
        lp.lessonId,
        {
          status: lp.status,
          lastViewedTimestamp: lp.lastViewedTimestamp,
        },
      ]),
    );
  }

  const requestedLessonId =
    typeof resolvedSearch.lessonId === "string" &&
    resolvedSearch.lessonId.length > 0
      ? resolvedSearch.lessonId
      : null;

  const activeLesson =
    (requestedLessonId &&
      allLessons.find((item) => item.lesson.id === requestedLessonId)) ??
    allLessons[0] ??
    null;

  if (!activeLesson && totalLessons === 0) {
    return (
      <div className="space-y-4">
        <h1 className="heading-leyline text-center text-sm text-gray-700">
          {course.name}
        </h1>
        {course.description && (
          <p className="text-sm text-gray-600">{course.description}</p>
        )}
        <p className="text-xs text-gray-500">
          This course does not have any modules or lessons yet.
        </p>
      </div>
    );
  }

  if (user && activeLesson) {
    await prisma.userEducationLesson.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: activeLesson.lesson.id,
        },
      },
      update: {
        status: "IN_PROGRESS",
        lastViewedTimestamp: new Date(),
      },
      create: {
        userId: user.id,
        lessonId: activeLesson.lesson.id,
        status: "IN_PROGRESS",
        lastViewedTimestamp: new Date(),
      },
    });

    lessonProgressById.set(activeLesson.lesson.id, {
      status: "IN_PROGRESS",
      lastViewedTimestamp: new Date(),
    });
  }

  const visitedLessons = Array.from(lessonProgressById.values());
  const visitedCount = visitedLessons.length;
  const percentCompleted =
    totalLessons > 0 ? (visitedCount / totalLessons) * 100 : 0;

  if (user && totalLessons > 0) {
    try {
      await prisma.userEducationCourse.update({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: course.id,
          },
        },
        data: {
          percentCompleted,
          latestActionTimestamp: new Date(),
        },
      });
    } catch (error) {
      console.error(
        "CourseDetailPage: failed to update course progress percent",
        error,
      );
    }
  }

  const coursePath = `/education/course/${course.id}`;

  const activeLessonIndex = activeLesson
    ? allLessons.findIndex((item) => item.lesson.id === activeLesson.lesson.id)
    : -1;
  const previousLesson =
    activeLessonIndex > 0 ? allLessons[activeLessonIndex - 1] : null;
  const nextLesson =
    activeLessonIndex >= 0 && activeLessonIndex < allLessons.length - 1
      ? allLessons[activeLessonIndex + 1]
      : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 border-b pb-3">
        <div className="text-[11px] font-semibold uppercase text-leyline-primary">
          Course
        </div>
        <h1 className="heading-leyline text-sm text-gray-800">
          {course.name}
        </h1>
        {course.description && (
          <p className="text-xs text-gray-600">{course.description}</p>
        )}
        {user && (
          <p className="text-[11px] text-gray-500">
            Progress: {percentCompleted.toFixed(0)}%
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <aside className="w-64 shrink-0 rounded border bg-white p-3 text-xs shadow-sm">
          <div className="mb-2 text-[11px] font-semibold uppercase text-gray-500">
            Lessons
          </div>
          {modulesWithLessons.length === 0 ? (
            <p className="text-[11px] text-gray-500">
              This course does not have any lessons yet.
            </p>
          ) : (
            <div className="space-y-3">
              {modulesWithLessons.map((cm, moduleIndex) => (
                <div key={cm.id} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-gray-800">
                    <span>
                      {moduleIndex + 1}. {cm.module.name}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {cm.module.lessons.length} lesson
                      {cm.module.lessons.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <ul className="space-y-0.5 border-l border-gray-200 pl-2">
                    {cm.module.lessons.map((ml) => {
                      const isActive =
                        activeLesson &&
                        activeLesson.lesson.id === ml.lesson.id;
                      const progress = lessonProgressById.get(ml.lesson.id);
                      const isVisited =
                        progress != null &&
                        progress.lastViewedTimestamp !== null;

                      return (
                        <li key={ml.id}>
                          <Link
                            href={`${coursePath}?lessonId=${ml.lesson.id}`}
                            className={`flex items-center justify-between rounded px-2 py-1 ${
                              isActive
                                ? "bg-leyline-primary/10 text-leyline-primary"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span className="truncate">
                              {ml.lesson.name}
                            </span>
                            {isVisited && (
                              <span
                                className="ml-2 text-[11px] text-emerald-600"
                                aria-label="Completed lesson"
                              >
                                ✓
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </aside>

        <section className="min-w-0 flex-1 rounded border bg-white p-4 text-sm shadow-sm">
          {activeLesson && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase text-gray-500">
                    {course.name}
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {activeLesson.lesson.name}
                  </h2>
                </div>
                <div className="flex gap-2 text-[11px]">
                  {previousLesson && (
                    <Link
                      href={`${coursePath}?lessonId=${previousLesson.lesson.id}`}
                      className="rounded border border-gray-300 px-2 py-1 text-gray-700 hover:bg-gray-50"
                    >
                      ← Previous
                    </Link>
                  )}
                  {nextLesson && (
                    <Link
                      href={`${coursePath}?lessonId=${nextLesson.lesson.id}`}
                      className="rounded border border-gray-300 px-2 py-1 text-gray-700 hover:bg-gray-50"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              </div>
              {activeLesson.lesson.description && (
                <p className="mb-3 text-xs text-gray-600">
                  {activeLesson.lesson.description}
                </p>
              )}
              <div className="rounded border bg-gray-50 p-2 text-sm text-gray-800">
                {renderLessonContent(activeLesson.lesson.contentType, activeLesson.lesson.content)}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function renderLessonContent(
  contentType: LessonContentType,
  content: string | null,
): ReactElement {
  if (!content || content.length === 0) {
    return (
      <p className="text-xs text-gray-500">
        This lesson does not have any content yet.
      </p>
    );
  }

  if (contentType === "IMAGE") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={content}
        alt=""
        className="mx-auto max-h-[560px] w-auto max-w-full rounded bg-white object-contain"
      />
    );
  }

  if (contentType === "VIDEO") {
    return (
      <video
        src={content}
        controls
        className="mx-auto max-h-[560px] w-auto max-w-full rounded bg-black"
      />
    );
  }

  return <p className="whitespace-pre-wrap text-sm text-gray-800">{content}</p>;
}
