"use client";

import { useState } from "react";
import type { LessonContentType } from "@prisma/client";
import { QuizLesson } from "./QuizLesson";

type LessonContentViewerProps = {
    contentType: LessonContentType;
    content: string | null;
};

export function LessonContentViewer({
    contentType,
    content,
}: LessonContentViewerProps) {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    if (!content || content.length === 0) {
        return (
            <p className="text-xs text-gray-500">
                This lesson does not have any content yet.
            </p>
        );
    }

    if (contentType === "IMAGE") {
        return (
            <>
                <div
                    className="cursor-zoom-in overflow-hidden rounded border bg-white"
                    onClick={() => setIsLightboxOpen(true)}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={content}
                        alt="Lesson content"
                        className="w-full h-auto object-contain"
                    />
                    <p className="py-2 text-center text-[10px] text-gray-400 bg-gray-50 border-t">
                        Click image to expand
                    </p>
                </div>

                {isLightboxOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <div className="relative max-h-full max-w-full overflow-auto">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={content}
                                alt="Lesson content expanded"
                                className="max-h-[95vh] w-auto max-w-[95vw] rounded shadow-2xl"
                            />
                            <button
                                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsLightboxOpen(false);
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    }

    if (contentType === "VIDEO") {
        return (
            <div className="overflow-hidden rounded border bg-black">
                <video
                    src={content}
                    controls
                    className="w-full max-h-[70vh]"
                />
            </div>
        );
    }

    // Container for text-based content
    const textContainerClass = "rounded border bg-gray-50 p-4 text-sm text-gray-800";

    if (contentType === "MULTIPLE_CHOICE") {
        return (
            <div className={textContainerClass}>
                <QuizLesson content={content} />
            </div>
        );
    }

    if (contentType === "HTML") {
        return (
            <div className={textContainerClass}>
                <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
        );
    }

    return (
        <div className={textContainerClass}>
            <p className="whitespace-pre-wrap">{content}</p>
        </div>
    );
}
