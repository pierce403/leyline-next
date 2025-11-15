import { prisma } from "@/lib/prisma";
import { EdpakImportForm } from "./EdpakImportForm";

export default async function AdminCoursesPage() {
  let courses: Awaited<
    ReturnType<typeof prisma.educationCourse.findMany>
  > = [];
  let loadError: Error | null = null;

  try {
    courses = await prisma.educationCourse.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (error) {
    // Log full error so we can inspect it in Vercel logs.
    console.error("AdminCoursesPage: failed to load courses", error);
    loadError = error instanceof Error ? error : new Error(String(error));
  }

  return (
    <div className="space-y-6">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        Courses
      </h1>
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
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
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
                    <td className="border-t px-3 py-2">{course.name}</td>
                    <td className="border-t px-3 py-2">{course.status}</td>
                    <td className="border-t px-3 py-2">
                      {course.requiredLevel}
                    </td>
                    <td className="border-t px-3 py-2">
                      {course.createdAt.toISOString()}
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
