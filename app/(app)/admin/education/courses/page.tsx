import type { EducationStatus, MembershipLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EdpakImportForm } from "./EdpakImportForm";
import { CourseEditLink } from "./CourseEditLink";

export const dynamic = "force-dynamic";

async function deleteCourseAction(formData: FormData) {
  "use server";

  const courseId = formData.get("courseId");
  if (typeof courseId !== "string" || courseId.length === 0) {
    return;
  }

  await prisma.educationCourse.delete({
    where: { id: courseId },
  });

  revalidatePath("/admin/education/courses");
  revalidatePath("/education");
}

async function createCourseAction() {
  "use server";
  const course = await prisma.educationCourse.create({
    data: {
      name: "New Course",
      description: null,
      status: "DEVELOPMENT",
      coverImageUrl: null,
      requiredLevel: "FREE",
    },
  });

  revalidatePath("/admin/education/courses");
  revalidatePath("/education");
  redirect(`/admin/education/courses?courseId=${course.id}`);
}

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

  await prisma.educationCourse.update({
    where: { id: courseId },
    data: {
      name,
      description,
      status:
        typeof statusRaw === "string"
          ? (statusRaw as EducationStatus)
          : undefined,
      requiredLevel:
        typeof requiredLevelRaw === "string"
          ? (requiredLevelRaw as MembershipLevel)
          : undefined,
    },
  });

  revalidatePath("/admin/education/courses");
  revalidatePath("/education");
  redirect("/admin/education/courses");
}

async function updateModuleAction(formData: FormData) {
  "use server";

  const moduleId = formData.get("moduleId");
  const courseId = formData.get("courseId");

  if (typeof moduleId !== "string" || moduleId.length === 0) {
    throw new Error("Missing moduleId");
  }

  const name = (formData.get("name") ?? "").toString().trim();
  const descriptionRaw = formData.get("description");

  if (!name) {
    throw new Error("Module name is required");
  }

  const description =
    typeof descriptionRaw === "string" && descriptionRaw.trim().length > 0
      ? descriptionRaw.trim()
      : null;

  await prisma.educationModule.update({
    where: { id: moduleId },
    data: {
      name,
      description,
    },
  });

  if (typeof courseId === "string" && courseId.length > 0) {
    revalidatePath(`/admin/education/courses?courseId=${courseId}`);
  }
  revalidatePath("/admin/education/courses");
  revalidatePath("/education");
}

async function updateLessonAction(formData: FormData) {
  "use server";

  const lessonId = formData.get("lessonId");
  const courseId = formData.get("courseId");

  if (typeof lessonId !== "string" || lessonId.length === 0) {
    throw new Error("Missing lessonId");
  }

  const name = (formData.get("name") ?? "").toString().trim();
  const descriptionRaw = formData.get("description");

  if (!name) {
    throw new Error("Lesson name is required");
  }

  const description =
    typeof descriptionRaw === "string" && descriptionRaw.trim().length > 0
      ? descriptionRaw.trim()
      : null;

  await prisma.educationLesson.update({
    where: { id: lessonId },
    data: {
      name,
      description,
    },
  });

  if (typeof courseId === "string" && courseId.length > 0) {
    revalidatePath(`/admin/education/courses?courseId=${courseId}`);
  }
  revalidatePath("/admin/education/courses");
  revalidatePath("/education");
}

type AdminCourseWithRelations = Awaited<
  ReturnType<typeof prisma.educationCourse.findMany>
>[number] & {
  modules: { id: string }[];
  lessons: { id: string }[];
};

type CourseModuleWithLessons = {
  id: string;
  moduleId: string;
  courseId: string;
  sortOrder: number;
  module: {
    id: string;
    name: string;
    description: string | null;
    lessons: {
      id: string;
      lessonId: string;
      sortOrder: number;
      lesson: {
        id: string;
        name: string;
        description: string | null;
      };
    }[];
  };
};

type AdminCoursesPageProps = {
  searchParams?: {
    courseId?: string;
  };
};

export default async function AdminCoursesPage({
  searchParams,
}: AdminCoursesPageProps) {
  let courses: AdminCourseWithRelations[] = [];
  let loadError: Error | null = null;

  try {
    courses = await prisma.educationCourse.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        modules: true,
        lessons: true,
      },
    });
  } catch (error) {
    // Log full error so we can inspect it in Vercel logs.
    console.error("AdminCoursesPage: failed to load courses", error);
    loadError = error instanceof Error ? error : new Error(String(error));
  }

  const selectedCourseId =
    typeof searchParams?.courseId === "string" &&
    searchParams.courseId.trim().length > 0
      ? searchParams.courseId
      : null;

  let selectedCourse:
    | ({
        id: string;
        name: string;
        description: string | null;
        status: EducationStatus;
        requiredLevel: MembershipLevel;
      } & {
        importSummary?: {
          message: string;
          hasMissingComponents: boolean;
        } | null;
        modulesWithLessons: CourseModuleWithLessons[];
      })
    | null = null;

  if (selectedCourseId) {
    console.log("[AdminCoursesPage] courseId search param detected", {
      selectedCourseId,
    });

    try {
      const course = await prisma.educationCourse.findUnique({
        where: { id: selectedCourseId },
      });

      if (course) {
        console.log("[AdminCoursesPage] Loaded course for modal edit", {
          courseId: course.id,
          name: course.name,
        });

        const modulesWithLessons =
          (await prisma.courseModule.findMany({
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
          })) as unknown as CourseModuleWithLessons[];

        let importSummary: {
          message: string;
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
                }
              | undefined;

            if (latestImportLog.details) {
              try {
                parsedDetails = JSON.parse(
                  latestImportLog.details,
                ) as typeof parsedDetails;
              } catch (parseError) {
                console.error(
                  "AdminCoursesPage: failed to parse EducationImportLog.details",
                  parseError,
                );
              }
            }

            const expectedModules = parsedDetails?.modules;
            const expectedLessons = parsedDetails?.lessons;
            const expectedMissingFiles = parsedDetails?.missingFiles ?? 0;
            const coverImageFilePath =
              parsedDetails?.coverImageFilePath ?? null;
            const coverImageImported =
              parsedDetails?.coverImageImported ?? false;

            const actualModules = modulesWithLessons.length;
            const actualLessons = modulesWithLessons.reduce(
              (sum, cm) => sum + cm.module.lessons.length,
              0,
            );

            const missingComponents: string[] = [];

            if (
              typeof expectedModules === "number" &&
              expectedModules !== actualModules
            ) {
              missingComponents.push(
                `Expected ${expectedModules} modules from the import manifest but found ${actualModules} in the database.`,
              );
            }

            if (
              typeof expectedLessons === "number" &&
              expectedLessons !== actualLessons
            ) {
              missingComponents.push(
                `Expected ${expectedLessons} lessons from the import manifest but found ${actualLessons} in the database.`,
              );
            }

            if (expectedMissingFiles > 0) {
              missingComponents.push(
                `The import manifest reported ${expectedMissingFiles} missing file(s). Some media may not be available.`,
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

            importSummary = {
              message: hasMissingComponents
                ? `${message} – some components appear to be missing or incomplete.`
                : message,
              hasMissingComponents,
            };
          }
        } catch (error) {
          console.error(
            "AdminCoursesPage: failed to load EducationImportLog for modal",
            error,
          );
        }

        selectedCourse = {
          id: course.id,
          name: course.name,
          description: course.description,
          status: course.status,
          requiredLevel: course.requiredLevel,
          modulesWithLessons,
          importSummary,
        };
      } else {
        console.warn(
          "[AdminCoursesPage] No course found for courseId search param",
          {
            selectedCourseId,
          },
        );
      }
    } catch (error) {
      console.error(
        "AdminCoursesPage: failed to load selected course for modal",
        error,
      );
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="heading-leyline text-sm text-gray-700">Courses</h1>
          <form action={createCourseAction}>
            <button
              type="submit"
              className="rounded bg-leyline-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-lime-600"
            >
              New Course
            </button>
          </form>
        </div>
        <section className="rounded border bg-white p-4 text-sm shadow-sm">
          <h2 className="mb-2 font-semibold text-gray-800">
            Import Edpak Course
          </h2>
          <p className="mb-3 text-xs text-gray-600">
            Upload an <code>.edpak</code> file (ZIP archive with a manifest.json)
            to create a new course, modules, and lessons in Leyline.
          </p>
          <EdpakImportForm />
        </section>
        <section className="rounded border bg-white p-4 text-sm shadow-sm">
          <h2 className="mb-2 font-semibold text-gray-800">
            Existing Courses
          </h2>
          {loadError && (
            <div className="mb-3 rounded border border-red-300 bg-red-50 p-3 text-xs text-red-800">
              <p className="font-semibold">Database error</p>
              <pre className="mt-1 whitespace-pre-wrap break-all">
                {`${loadError.message}\n\n${loadError.stack ?? ""}`}
              </pre>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                    Required Level
                  </th>
                  <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                    Created
                  </th>
                  <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                    Modules
                  </th>
                  <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                    Lessons
                  </th>
                  <th className="border-b px-3 py-2 text-left font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-4 text-center text-xs text-gray-500"
                    >
                      No courses have been created yet.
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr
                      key={course.id}
                      className="odd:bg-white even:bg-gray-50 align-top"
                    >
                      <td className="border-t px-3 py-2 align-middle">
                        {course.name}
                      </td>
                      <td className="border-t px-3 py-2 align-middle">
                        {course.status}
                      </td>
                      <td className="border-t px-3 py-2 align-middle">
                        {course.requiredLevel}
                      </td>
                      <td className="border-t px-3 py-2 align-middle">
                        {course.createdAt.toISOString()}
                      </td>
                      <td className="border-t px-3 py-2 align-middle">
                        {course.modules.length}
                      </td>
                      <td className="border-t px-3 py-2 align-middle">
                        {course.lessons.length}
                      </td>
                      <td className="border-t px-3 py-2 align-middle">
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <CourseEditLink courseId={course.id} />
                          <form action={deleteCourseAction}>
                            <input
                              type="hidden"
                              name="courseId"
                              value={course.id}
                            />
                            <button
                              type="submit"
                              className="rounded border border-red-300 px-2 py-0.5 font-semibold text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {selectedCourse && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded bg-white p-6 text-sm shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {selectedCourse.name}
                </h2>
                <p className="text-xs text-gray-500">Edit course.</p>
              </div>
              <Link
                href="/admin/education/courses"
                className="text-xs font-semibold text-gray-500 hover:text-gray-800"
              >
                ✕ Close
              </Link>
            </div>

            {selectedCourse.importSummary?.hasMissingComponents && (
              <section className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-xs text-red-800">
                <h3 className="mb-1 text-xs font-semibold">
                  Import Issues Detected
                </h3>
                <p>{selectedCourse.importSummary.message}</p>
              </section>
            )}

            <div className="grid gap-6 md:grid-cols-[1.1fr,1.3fr]">
              <section className="rounded border bg-gray-50 p-4">
                <h3 className="mb-3 text-xs font-semibold text-gray-700">
                  Course Details
                </h3>
                <form action={updateCourseAction} className="space-y-3">
                  <input
                    type="hidden"
                    name="courseId"
                    value={selectedCourse.id}
                  />
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Course Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={selectedCourse.name}
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
                      defaultValue={selectedCourse.description ?? ""}
                      rows={4}
                      className="w-full rounded border px-2 py-1 text-sm text-gray-900"
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Status
                      </label>
                      <select
                        name="status"
                        defaultValue={selectedCourse.status}
                        className="w-full rounded border px-2 py-1 text-sm text-gray-900"
                      >
                        <option value="DEVELOPMENT">DEVELOPMENT</option>
                        <option value="FREE">FREE</option>
                        <option value="BASIC">BASIC</option>
                        <option value="PRO">PRO</option>
                        <option value="DELETED">DELETED</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Required Level
                      </label>
                      <select
                        name="requiredLevel"
                        defaultValue={selectedCourse.requiredLevel}
                        className="w-full rounded border px-2 py-1 text-sm text-gray-900"
                      >
                        <option value="FREE">FREE</option>
                        <option value="BASIC">BASIC</option>
                        <option value="PRO">PRO</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="submit"
                      className="rounded bg-leyline-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-lime-600"
                    >
                      Save
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

              <section className="rounded border bg-gray-50 p-4">
                <h3 className="mb-3 text-xs font-semibold text-gray-700">
                  Modules and Lessons
                </h3>
                {selectedCourse.modulesWithLessons.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    No modules have been created for this course yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedCourse.modulesWithLessons.map((cm, index) => (
                      <article
                        key={cm.id}
                        className="rounded border border-gray-200 bg-white"
                      >
                        <header className="flex items-center gap-3 border-b bg-gray-50 px-3 py-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded bg-leyline-primary text-[11px] font-semibold text-white">
                            {index + 1}
                          </div>
                          <form
                            action={updateModuleAction}
                            className="flex flex-1 flex-col gap-1 text-xs"
                          >
                            <input
                              type="hidden"
                              name="courseId"
                              value={selectedCourse.id}
                            />
                            <input
                              type="hidden"
                              name="moduleId"
                              value={cm.module.id}
                            />
                            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
                              <input
                                type="text"
                                name="name"
                                defaultValue={cm.module.name}
                                className="w-full rounded border px-2 py-1 text-xs text-gray-900 md:max-w-xs"
                              />
                              <input
                                type="text"
                                name="description"
                                defaultValue={cm.module.description ?? ""}
                                placeholder="Module description"
                                className="w-full rounded border px-2 py-1 text-xs text-gray-900"
                              />
                              <button
                                type="submit"
                                className="mt-1 rounded border border-gray-300 px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 md:mt-0"
                              >
                                Save
                              </button>
                            </div>
                          </form>
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
                                <form
                                  action={updateLessonAction}
                                  className="flex flex-1 flex-col gap-1"
                                >
                                  <input
                                    type="hidden"
                                    name="courseId"
                                    value={selectedCourse.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="lessonId"
                                    value={ml.lesson.id}
                                  />
                                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
                                    <input
                                      type="text"
                                      name="name"
                                      defaultValue={ml.lesson.name}
                                      className="w-full rounded border px-2 py-1 text-xs text-gray-900 md:max-w-xs"
                                    />
                                    <input
                                      type="text"
                                      name="description"
                                      defaultValue={
                                        ml.lesson.description ?? ""
                                      }
                                      placeholder="Lesson description"
                                      className="w-full rounded border px-2 py-1 text-xs text-gray-900"
                                    />
                                    <button
                                      type="submit"
                                      className="mt-1 rounded border border-gray-300 px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 md:mt-0"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </form>
                              </li>
                            ))}
                          </ul>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
