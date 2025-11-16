import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EdpakImportForm } from "./EdpakImportForm";

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
  redirect(`/admin/education/courses/${course.id}`);
}

type AdminCourseWithRelations = Awaited<
  ReturnType<typeof prisma.educationCourse.findMany>
>[number] & {
  modules: { id: string }[];
  lessons: { id: string }[];
};

export default async function AdminCoursesPage() {
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

  return (
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
        <h2 className="mb-2 font-semibold text-gray-800">Import Edpak Course</h2>
        <p className="mb-3 text-xs text-gray-600">
          Upload an <code>.edpak</code> file (ZIP archive with a manifest.json)
          to create a new course, modules, and lessons in Leyline.
        </p>
        <EdpakImportForm />
      </section>
      <section className="rounded border bg-white p-4 text-sm shadow-sm">
        <h2 className="mb-2 font-semibold text-gray-800">Existing Courses</h2>
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
                        <a
                          href={`/admin/education/courses/${course.id}`}
                          className="rounded border border-gray-300 px-2 py-0.5 font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </a>
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
  );
}
