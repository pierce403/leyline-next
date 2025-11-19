"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { LessonContentType, LessonProgressStatus } from "@prisma/client";
import { LessonContentViewer } from "./LessonContentViewer";

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
                contentType: LessonContentType;
                content: string | null;
            };
        }[];
    };
};

type CourseViewerProps = {
    course: {
        id: string;
        name: string;
        description: string | null;
    };
    modulesWithLessons: CourseModuleWithLessons[];
    lessonProgressById: Map<
        string,
        { status: LessonProgressStatus; lastViewedTimestamp: Date | null }
    >;
    activeLessonId: string | null;
    percentCompleted: number;
    user: any; // Using any for simplicity, but should be typed properly if possible
};

export function CourseViewer({
    course,
    modulesWithLessons,
    lessonProgressById,
    activeLessonId,
    percentCompleted,
    user,
}: CourseViewerProps) {
    const [flashNext, setFlashNext] = useState(false);
    const nextButtonRef = useRef<HTMLAnchorElement>(null);

    // Flatten lessons for easier navigation logic
    const allLessons = modulesWithLessons.flatMap((cm) =>
        cm.module.lessons.map((ml) => ({
            ...ml,
            moduleId: cm.module.id,
        }))
    );

    const activeLesson =
        (activeLessonId &&
            allLessons.find((item) => item.lesson.id === activeLessonId)) ??
        allLessons[0] ??
        null;

    const activeLessonIndex = activeLesson
        ? allLessons.findIndex((item) => item.lesson.id === activeLesson.lesson.id)
        : -1;

    const previousLesson =
        activeLessonIndex > 0 ? allLessons[activeLessonIndex - 1] : null;
    const nextLesson =
        activeLessonIndex >= 0 && activeLessonIndex < allLessons.length - 1
            ? allLessons[activeLessonIndex + 1]
            : null;

    const coursePath = `/education/course/${course.id}`;

    // Determine max unlocked index
    // A lesson is unlocked if all previous lessons have been visited (status exists)
    // Or simpler: find the first lesson that is NOT visited. That is the last accessible lesson.
    // Actually, if I visit lesson 0, lesson 1 becomes accessible.
    // If I visit lesson 1, lesson 2 becomes accessible.
    // So maxUnlockedIndex is the index of the first unvisited lesson.
    // If all are visited, maxUnlockedIndex is allLessons.length - 1.

    let maxUnlockedIndex = 0;
    for (let i = 0; i < allLessons.length; i++) {
        const lessonId = allLessons[i].lesson.id;
        const progress = lessonProgressById.get(lessonId);
        if (progress && progress.lastViewedTimestamp) {
            // This lesson is visited, so the NEXT one is unlocked.
            maxUnlockedIndex = i + 1;
        } else {
            // This lesson is NOT visited. It is the furthest we can go.
            // We can go to this lesson, but not the next one.
            maxUnlockedIndex = i;
            break;
        }
    }

    // Ensure we don't go out of bounds
    if (maxUnlockedIndex >= allLessons.length) {
        maxUnlockedIndex = allLessons.length - 1;
    }

    // If no user, maybe unlock everything? Or lock everything?
    // Assuming if no user, they can view everything (preview mode) or nothing.
    // The server side handles access control usually.
    // Let's assume if !user, we don't enforce locking visually, or we lock all.
    // But the prompt implies a user flow.
    const isLocked = (index: number) => {
        if (!user) return false; // Or true? Let's assume open for guests if they got here.
        return index > maxUnlockedIndex;
    };

    const handleLessonClick = (e: React.MouseEvent, index: number) => {
        if (isLocked(index)) {
            e.preventDefault();
            triggerFlash();
        }
    };

    const triggerFlash = () => {
        setFlashNext(true);
        setTimeout(() => setFlashNext(false), 600); // Duration of animation

        // Also scroll next button into view if needed
        nextButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

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

            <div className="flex gap-4 relative items-start">
                {/* Sidebar */}
                <aside
                    className="w-64 shrink-0 rounded border bg-white p-3 text-xs shadow-sm sticky top-20 overflow-y-auto"
                    style={{ maxHeight: "calc(100vh - 6rem)" }}
                >
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
                                            // Find global index for locking logic
                                            const globalIndex = allLessons.findIndex(l => l.lesson.id === ml.lesson.id);
                                            const locked = isLocked(globalIndex);

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
                                                        href={locked ? "#" : `${coursePath}?lessonId=${ml.lesson.id}`}
                                                        onClick={(e) => handleLessonClick(e, globalIndex)}
                                                        className={`flex items-center justify-between rounded px-2 py-1 transition-colors ${isActive
                                                                ? "bg-leyline-primary/10 text-leyline-primary"
                                                                : locked
                                                                    ? "text-gray-400 cursor-not-allowed"
                                                                    : "text-gray-700 hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        <span className="truncate flex items-center gap-2">
                                                            {locked && <span className="text-[10px]">🔒</span>}
                                                            {ml.lesson.name}
                                                        </span>
                                                        {isVisited && !locked && (
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

                {/* Main Content */}
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
                                    {nextLesson ? (
                                        <Link
                                            ref={nextButtonRef}
                                            href={`${coursePath}?lessonId=${nextLesson.lesson.id}`}
                                            className={`rounded border border-gray-300 px-2 py-1 text-gray-700 hover:bg-gray-50 transition-all duration-200 ${flashNext ? "ring-2 ring-leyline-primary ring-offset-1 bg-leyline-primary/10 scale-105" : ""
                                                }`}
                                        >
                                            Next →
                                        </Link>
                                    ) : (
                                        <span className="rounded border border-gray-200 px-2 py-1 text-gray-400 cursor-not-allowed">
                                            Next →
                                        </span>
                                    )}
                                </div>
                            </div>
                            {activeLesson.lesson.description && (
                                <p className="mb-3 text-xs text-gray-600">
                                    {activeLesson.lesson.description}
                                </p>
                            )}
                            <LessonContentViewer
                                contentType={activeLesson.lesson.contentType}
                                content={activeLesson.lesson.content}
                            />
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
