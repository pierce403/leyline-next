"use client";

import Link from "next/link";
import type {
  CourseOutlineModal,
  SelectedCourseModalData,
} from "./types";
import { LessonEditor } from "./LessonEditor";

type CourseAction = (formData: FormData) => Promise<void>;

type CourseModalsClientProps = {
  selectedCourse: SelectedCourseModalData | null;
  infoCourse: CourseOutlineModal | null;
  updateCourseAction: CourseAction;
  updateModuleAction: CourseAction;
  updateLessonAction: CourseAction;
};

export function CourseModalsClient({
  selectedCourse,
  infoCourse,
  updateCourseAction,
  updateModuleAction,
  updateLessonAction,
}: CourseModalsClientProps) {
  if (!selectedCourse && !infoCourse) {
    return null;
  }

  const closeHref = "/admin/education/courses";

  return (
    <>
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
                href={closeHref}
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
                  <input type="hidden" name="courseId" value={selectedCourse.id} />
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Course Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={selectedCourse.name}
                      className="w-full rounded border px-2 py-1 text-xs text-gray-900"
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
                      className="w-full rounded border px-2 py-1 text-xs text-gray-900"
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
                        className="w-full rounded border px-2 py-1 text-xs text-gray-900"
                      >
                        <option value="DEVELOPMENT">Development</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Required Level
                      </label>
                      <select
                        name="requiredLevel"
                        defaultValue={selectedCourse.requiredLevel}
                        className="w-full rounded border px-2 py-1 text-xs text-gray-900"
                      >
                        <option value="FREE">Free</option>
                        <option value="BASIC">Basic</option>
                        <option value="PRO">Pro</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="rounded bg-leyline-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-lime-600"
                  >
                    Save Changes
                  </button>
                </form>
              </section>

              <section className="rounded border bg-gray-50 p-4">
                <h3 className="mb-3 text-xs font-semibold text-gray-700">
                  Modules & Lessons
                </h3>
                {selectedCourse.modulesWithLessons.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    No modules are associated with this course yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedCourse.modulesWithLessons.map((cm) => (
                      <article
                        key={cm.id}
                        className="rounded border border-gray-200 bg-white p-3"
                      >
                        <form
                          action={updateModuleAction}
                          className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:gap-2"
                        >
                          <input type="hidden" name="courseId" value={selectedCourse.id} />
                          <input type="hidden" name="moduleId" value={cm.module.id} />
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
                            className="rounded border border-gray-300 px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            Save Module
                          </button>
                        </form>
                        {cm.module.lessons.length === 0 ? (
                          <p className="text-[11px] text-gray-500">
                            No lessons are linked to this module yet.
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {cm.module.lessons.map((ml) => (
                              <li key={ml.id} className="rounded border border-gray-100 bg-gray-50 p-2">
                                <LessonEditor
                                  lesson={ml.lesson}
                                  courseId={selectedCourse.id}
                                  updateLessonAction={updateLessonAction}
                                />
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

      {infoCourse && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
          <div className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded bg-white p-6 text-sm shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {infoCourse.name}
                </h2>
                <p className="text-xs text-gray-500">Course summary</p>
              </div>
              <Link
                href={closeHref}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800"
              >
                ✕ Close
              </Link>
            </div>
            <div className="space-y-3 text-xs text-gray-700">
              {infoCourse.coverImageUrl && (
                <div className="overflow-hidden rounded border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={infoCourse.coverImageUrl}
                    alt={infoCourse.name}
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
              {infoCourse.description && (
                <p className="text-sm text-gray-600">{infoCourse.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-[11px] font-semibold">
                <span>
                  Required level:{" "}
                  <span className="uppercase text-gray-900">
                    {infoCourse.requiredLevel.toLowerCase()}
                  </span>
                </span>
                <span>
                  Modules: {infoCourse.modules.length} • Lessons:{" "}
                  {infoCourse.modules.reduce(
                    (sum, cm) => sum + cm.module.lessons.length,
                    0,
                  )}
                </span>
                <span>
                  Created: {new Date(infoCourse.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase text-gray-500">
                Course Outline
              </h3>
              {infoCourse.modules.length === 0 ? (
                <p className="text-xs text-gray-500">
                  No modules are associated with this course yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {infoCourse.modules.map((cm, idx) => (
                    <div
                      key={cm.id}
                      className="rounded border border-gray-200 bg-gray-50 p-3"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-leyline-primary text-[11px] text-white">
                            {idx + 1}
                          </span>
                          <span>{cm.module.name}</span>
                        </div>
                        <span className="text-[11px] text-gray-500">
                          {cm.module.lessons.length} lessons
                        </span>
                      </div>
                      {cm.module.description && (
                        <p className="mt-1 text-[11px] text-gray-600">
                          {cm.module.description}
                        </p>
                      )}
                      {cm.module.lessons.length > 0 && (
                        <ul className="mt-2 space-y-1 pl-0 text-[11px] text-gray-600">
                          {cm.module.lessons.map((lesson, lessonIdx) => (
                            <li key={lesson.id} className="flex items-start gap-2">
                              <span className="text-gray-400">
                                {lessonIdx + 1}.
                              </span>
                              <div>
                                <div className="font-semibold text-gray-800">
                                  {lesson.lesson.name}
                                </div>
                                {lesson.lesson.description && (
                                  <p className="text-gray-600">
                                    {lesson.lesson.description}
                                  </p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
