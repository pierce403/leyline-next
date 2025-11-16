import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { EducationStatus, MembershipLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type AdminCourseEditPageProps = {
  params: {
    courseId: string;
  };
};

async function updateCourseAction(formData: FormData) {
  "use server";

  const courseId = formData.get("courseId");
  if (typeof courseId !== "string" || courseId.length === 0) {
    throw new Error("Missing courseId");
  }

  const name = (formData.get("name") ?? "").toString().trim();
  const descriptionRaw = formData.get("description");
  const statusRaw = formData.get("status");
  const requiredLevelRaw = formData.get("requiredLevel");

  if (!name) {
    throw new Error("Course name is required");
  }

  const description =
    typeof descriptionRaw === "string" && descriptionRaw.trim().length > 0
      ? descriptionRaw.trim()
      : null;

  const status = statusRaw as EducationStatus;
  const requiredLevel = requiredLevelRaw as MembershipLevel;

  await prisma.educationCourse.update({
    where: { id: courseId },
    data: {
      name,
      description,
      status,
      requiredLevel,
    },
  });

  revalidatePath("/admin/education/courses");
  revalidatePath("/education");
  redirect("/admin/education/courses");
}

export default async function AdminCourseEditPage({
  params,
}: AdminCourseEditPageProps) {
  const courseId = params?.courseId;

  if (typeof courseId !== "string" || courseId.length === 0) {
    // Log for debugging; treat as a 404 to avoid Prisma errors.
    console.error(
      "AdminCourseEditPage: missing or invalid courseId route param",
      params,
    );
    notFound();
  }

  const course = await prisma.educationCourse.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    notFound();
  }

  const statusOptions: EducationStatus[] = [
    "DEVELOPMENT",
    "FREE",
    "BASIC",
    "PRO",
    "DELETED",
  ];

  const levelOptions: MembershipLevel[] = ["FREE", "BASIC", "PRO"];

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

  let latestImportSummary: {
    message: string;
    detailsJson?: unknown;
    hasMissingComponents: boolean;
  } | null = null;

  try {
    const latestImportLog = await prisma.educationImportLog.findFirst({
      where: { courseId: course.id },
      orderBy: { createdAt: "desc" },
    });

    if (latestImportLog) {
      let parsedDetails:
        | {
            modules?: number;
            lessons?: number;
            quizzes?: number;
            files?: number;
            images?: number;
            videos?: number;
            missingFiles?: number;
            coverImageFilePath?: string | null;
            coverImageImported?: boolean;
            coverImageUrl?: string | null;
          }
        | undefined;

      if (latestImportLog.details) {
        try {
          parsedDetails = JSON.parse(latestImportLog.details) as typeof parsedDetails;
        } catch (error) {
          console.error(
            "Failed to parse EducationImportLog.details JSON",
            error,
          );
        }
      }

      const totalLessons =
        modulesWithLessons.reduce(
          (acc, cm) => acc + cm.module.lessons.length,
          0,
        ) ?? 0;

      const placeholderLessonCount = modulesWithLessons.reduce(
        (acc, cm) =>
          acc +
          cm.module.lessons.filter((ml) =>
            ml.lesson.content?.startsWith('Content file "'),
          ).length,
        0,
      );

      const expectedModules = parsedDetails?.modules ?? null;
      const expectedLessons = parsedDetails?.lessons ?? null;
      const missingFiles = parsedDetails?.missingFiles ?? 0;
      const coverImageFilePath = parsedDetails?.coverImageFilePath ?? null;
      const coverImageImported = parsedDetails?.coverImageImported ?? false;

      const missingComponents: string[] = [];

      if (
        typeof expectedModules === "number" &&
        expectedModules > modulesWithLessons.length
      ) {
        missingComponents.push(
          `Imported manifest listed ${expectedModules} modules, but only ${modulesWithLessons.length} were created.`,
        );
      }

      if (
        typeof expectedLessons === "number" &&
        expectedLessons > totalLessons
      ) {
        missingComponents.push(
          `Imported manifest listed ${expectedLessons} lessons, but only ${totalLessons} were created.`,
        );
      }

      if (missingFiles > 0) {
        missingComponents.push(
          `${missingFiles} file(s) were reported missing during import (for example, images or videos).`,
        );
      }

      if (placeholderLessonCount > 0) {
        missingComponents.push(
          `${placeholderLessonCount} lesson(s) are using placeholder content because their HTML could not be loaded from the edpak archive.`,
        );
      }

      if (coverImageFilePath && (!coverImageImported || !course.coverImageUrl)) {
        missingComponents.push(
          "The course cover image defined in the manifest could not be imported. The card view may be missing its cover artwork.",
        );
      }

      const hasMissingComponents = missingComponents.length > 0;

      const message =
        latestImportLog.summary ||
        `Course imported from edpak on ${latestImportLog.createdAt.toISOString()}`;

      latestImportSummary = {
        message,
        detailsJson: parsedDetails ?? latestImportLog.details,
        hasMissingComponents,
      };
    }
  } catch (error) {
    console.error(
      "AdminCourseEditPage: failed to load EducationImportLog",
      error,
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        Edit Course
      </h1>
      {latestImportSummary && latestImportSummary.hasMissingComponents && (
        <section className="rounded border border-red-300 bg-red-50 p-4 text-xs text-red-800">
          <h2 className="mb-1 text-sm font-semibold">Import Issues Detected</h2>
          <p className="mb-2">
            This course was imported from an edpak file, and some components
            appear to be missing or incomplete. You may need to re-import the
            course or add the missing content manually.
          </p>
          <ul className="list-disc space-y-1 pl-4">
            <li>{latestImportSummary.message}</li>
          </ul>
        </section>
      )}
      <section className="rounded border bg-white p-4 text-sm shadow-sm">
        <form action={updateCourseAction} className="space-y-4">
          <input type="hidden" name="courseId" value={course.id} />
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={course.name}
              className="w-full rounded border px-2 py-1 text-sm text-gray-900"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={course.description ?? ""}
              rows={4}
              className="w-full rounded border px-2 py-1 text-sm text-gray-900"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Status
              </label>
              <select
                name="status"
                defaultValue={course.status}
                className="w-full rounded border px-2 py-1 text-sm text-gray-900"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Required Level
              </label>
              <select
                name="requiredLevel"
                defaultValue={course.requiredLevel}
                className="w-full rounded border px-2 py-1 text-sm text-gray-900"
              >
                {levelOptions.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded bg-leyline-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-lime-600"
            >
              Save Changes
            </button>
            <Link
              href="/admin/education/courses"
              className="text-xs font-semibold text-gray-600 hover:underline"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
      <section className="rounded border bg-white p-4 text-sm shadow-sm">
        <h2 className="mb-2 font-semibold text-gray-800">
          Modules and Lessons
        </h2>
        {modulesWithLessons.length === 0 ? (
          <p className="text-xs text-gray-500">
            No modules have been created for this course yet.
          </p>
        ) : (
          <div className="space-y-3">
            {modulesWithLessons.map((cm, index) => (
              <article
                key={cm.id}
                className="rounded border border-gray-200 bg-gray-50"
              >
                <header className="flex items-center gap-3 border-b bg-white px-3 py-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-leyline-primary text-[11px] font-semibold text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-gray-900">
                      {cm.module.name}
                    </div>
                    {cm.module.description && (
                      <div className="text-[11px] text-gray-600">
                        {cm.module.description}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {cm.module.lessons.length} lesson
                    {cm.module.lessons.length === 1 ? "" : "s"}
                  </div>
                </header>
                {cm.module.lessons.length > 0 && (
                  <ul className="divide-y border-t text-xs">
                    {cm.module.lessons.map((ml, lessonIndex) => (
                      <li
                        key={ml.id}
                        className="flex items-start gap-3 bg-white px-3 py-2"
                      >
                        <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded bg-sky-500 text-[11px] font-semibold text-white">
                          {lessonIndex + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {ml.lesson.name}
                          </div>
                          {ml.lesson.description && (
                            <div className="text-[11px] text-gray-600">
                              {ml.lesson.description}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        )}
        {latestImportSummary && !latestImportSummary.hasMissingComponents && (
          <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-3 text-[11px] text-gray-700">
            <div className="font-semibold">Import summary</div>
            <p className="mt-1">{latestImportSummary.message}</p>
          </div>
        )}
      </section>
    </div>
  );
}
