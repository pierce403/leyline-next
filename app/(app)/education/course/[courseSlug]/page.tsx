import type { ReactElement } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonContentViewer } from "../LessonContentViewer";
import { CourseViewer } from "../CourseViewer";
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
    <CourseViewer
      course={course}
      modulesWithLessons={modulesWithLessons as any}
      lessonProgressById={lessonProgressById}
      activeLessonId={typeof activeLesson === 'object' && activeLesson ? activeLesson.lesson.id : null}
      percentCompleted={percentCompleted}
      user={user}
    />
  );
}
