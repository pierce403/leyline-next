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
  const course = await prisma.educationCourse.findUnique({
    where: { id: params.courseId },
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

  return (
    <div className="space-y-6">
      <h1 className="heading-leyline text-center text-sm text-gray-700">
        Edit Course
      </h1>
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
    </div>
  );
}
