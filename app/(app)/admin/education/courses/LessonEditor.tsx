"use client";

import { useState } from "react";
import type { LessonContentType } from "@prisma/client";

type LessonEditorProps = {
    lesson: {
        id: string;
        name: string;
        description: string | null;
        contentType: LessonContentType;
        content: string | null;
    };
    courseId: string;
    updateLessonAction: (formData: FormData) => Promise<void>;
};

export function LessonEditor({
    lesson,
    courseId,
    updateLessonAction,
}: LessonEditorProps) {
    const [contentType, setContentType] = useState<LessonContentType>(
        lesson.contentType
    );

    return (
        <form action={updateLessonAction} className="flex flex-1 flex-col gap-2">
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="lessonId" value={lesson.id} />
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
                <input
                    type="text"
                    name="name"
                    defaultValue={lesson.name}
                    className="w-full rounded border px-2 py-1 text-xs text-gray-900 md:max-w-xs"
                    placeholder="Lesson name"
                />
                <input
                    type="text"
                    name="description"
                    defaultValue={lesson.description ?? ""}
                    placeholder="Lesson description"
                    className="w-full rounded border px-2 py-1 text-xs text-gray-900"
                />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-[11px] font-semibold text-gray-700">
                        Content Type
                    </label>
                    <select
                        name="contentType"
                        value={contentType}
                        onChange={(e) => setContentType(e.target.value as LessonContentType)}
                        className="w-full rounded border px-2 py-1 text-xs text-gray-900"
                    >
                        <option value="NONE">None</option>
                        <option value="TEXT">Text</option>
                        <option value="IMAGE">Image URL</option>
                        <option value="VIDEO">Video URL</option>
                        <option value="HTML">HTML Content</option>
                        <option value="MULTIPLE_CHOICE">Quiz (JSON)</option>
                    </select>
                </div>
                {contentType !== "NONE" && (
                    <div>
                        <label className="mb-1 block text-[11px] font-semibold text-gray-700">
                            {contentType === "IMAGE" && "Image URL"}
                            {contentType === "VIDEO" && "Video URL"}
                            {contentType === "MULTIPLE_CHOICE" && "Quiz JSON"}
                            {(contentType === "TEXT" || contentType === "HTML") && "Content"}
                        </label>
                        <textarea
                            name="content"
                            defaultValue={lesson.content ?? ""}
                            key={contentType} // Force re-render when type changes to update placeholder
                            placeholder={
                                contentType === "IMAGE"
                                    ? "https://example.com/image.jpg"
                                    : contentType === "VIDEO"
                                        ? "https://example.com/video.mp4"
                                        : contentType === "MULTIPLE_CHOICE"
                                            ? '{"question":"...","answers":[...]}'
                                            : "Enter content here..."
                            }
                            rows={contentType === "MULTIPLE_CHOICE" ? 6 : 2}
                            className="w-full rounded border px-2 py-1 text-xs text-gray-900 font-mono"
                        />
                        {contentType === "MULTIPLE_CHOICE" && (
                            <p className="mt-1 text-[10px] text-gray-500">
                                Format: <code>{`{"question": "...", "answers": [{"text": "...", "correct": true}, ...]}`}</code>
                            </p>
                        )}
                    </div>
                )}
            </div>
            <button
                type="submit"
                className="self-start rounded border border-gray-300 px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
            >
                Save Lesson
            </button>
        </form>
    );
}
