"use client";

import { useState, useEffect, useRef } from "react";
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

type QuizAnswer = {
    text: string;
    correct: boolean;
};

type QuizContent = {
    question: string;
    answers: QuizAnswer[];
};

export function LessonEditor({
    lesson,
    courseId,
    updateLessonAction,
}: LessonEditorProps) {
    const [contentType, setContentType] = useState<LessonContentType>(
        lesson.contentType
    );

    // We keep a local string for the content to be submitted
    const [contentValue, setContentValue] = useState(lesson.content ?? "");

    // Quiz specific state
    const [quizState, setQuizState] = useState<QuizContent>({
        question: "",
        answers: [],
    });

    // Image specific state
    const [isImageExpanded, setIsImageExpanded] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync local state when the selected lesson changes
    useEffect(() => {
        setContentType(lesson.contentType);
        const newContent = lesson.content ?? "";
        setContentValue(newContent);
        setIsImageExpanded(false);

        // Parse quiz data immediately if it's a quiz
        if (lesson.contentType === "MULTIPLE_CHOICE") {
            try {
                const parsed = newContent ? JSON.parse(newContent) : { question: "", answers: [] };
                if (typeof parsed === 'object' && parsed !== null) {
                    setQuizState({
                        question: parsed.question || "",
                        answers: Array.isArray(parsed.answers) ? parsed.answers : []
                    });
                }
            } catch (e) {
                setQuizState({ question: "", answers: [] });
            }
        }
    }, [lesson]);

    // Update content string when quiz state changes
    const updateQuizContent = (newState: QuizContent) => {
        setQuizState(newState);
        setContentValue(JSON.stringify(newState));
    };

    const handleQuizQuestionChange = (question: string) => {
        updateQuizContent({ ...quizState, question });
    };

    const handleAnswerChange = (index: number, field: keyof QuizAnswer, value: any) => {
        const newAnswers = [...quizState.answers];
        newAnswers[index] = { ...newAnswers[index], [field]: value };
        updateQuizContent({ ...quizState, answers: newAnswers });
    };

    const addAnswer = () => {
        updateQuizContent({
            ...quizState,
            answers: [...quizState.answers, { text: "", correct: false }],
        });
    };

    const removeAnswer = (index: number) => {
        const newAnswers = quizState.answers.filter((_, i) => i !== index);
        updateQuizContent({ ...quizState, answers: newAnswers });
    };

    const setCorrectAnswer = (index: number) => {
        const newAnswers = quizState.answers.map((a, i) => ({
            ...a,
            correct: i === index
        }));
        updateQuizContent({ ...quizState, answers: newAnswers });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setIsUploading(true);

        try {
            // Dynamically import to avoid SSR issues if any, though client component is fine
            const { upload } = await import("@vercel/blob/client");

            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/edpak/upload',
            });

            setContentValue(newBlob.url);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <form action={updateLessonAction} className="flex flex-1 flex-col gap-2">
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="lessonId" value={lesson.id} />

            {/* Header Inputs */}
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
                {/* Type Selector */}
                <div>
                    <label className="mb-1 block text-[11px] font-semibold text-gray-700">
                        Content Type
                    </label>
                    <select
                        name="contentType"
                        value={contentType}
                        onChange={(e) => {
                            const newType = e.target.value as LessonContentType;
                            setContentType(newType);
                            // If switching to quiz, try to parse existing content if it looks like JSON
                            if (newType === "MULTIPLE_CHOICE") {
                                try {
                                    const parsed = contentValue ? JSON.parse(contentValue) : { question: "", answers: [] };
                                    if (typeof parsed === 'object' && parsed !== null) {
                                        setQuizState({
                                            question: parsed.question || "",
                                            answers: Array.isArray(parsed.answers) ? parsed.answers : []
                                        });
                                    }
                                } catch {
                                    setQuizState({ question: "", answers: [] });
                                }
                            }
                        }}
                        className="w-full rounded border px-2 py-1 text-xs text-gray-900"
                    >
                        <option value="NONE">None</option>
                        <option value="TEXT">Text</option>
                        <option value="IMAGE">Image</option>
                        <option value="VIDEO">Video URL</option>
                        <option value="HTML">HTML Content</option>
                        <option value="MULTIPLE_CHOICE">Quiz (JSON)</option>
                    </select>
                </div>

                {/* Dynamic Content Editor */}
                {contentType !== "NONE" && (
                    <div className="flex flex-col gap-2">
                        <label className="block text-[11px] font-semibold text-gray-700">
                            {contentType === "IMAGE" && "Image"}
                            {contentType === "VIDEO" && "Video URL"}
                            {contentType === "MULTIPLE_CHOICE" && "Quiz Editor"}
                            {(contentType === "TEXT" || contentType === "HTML") && "Content"}
                        </label>

                        {/* QUIZ EDITOR */}
                        {contentType === "MULTIPLE_CHOICE" ? (
                            <div className="rounded border border-gray-200 bg-gray-50 p-3 space-y-3">
                                <input type="hidden" name="content" value={contentValue} />
                                <div>
                                    <label className="mb-1 block text-[10px] font-medium text-gray-500 uppercase">Question</label>
                                    <input
                                        type="text"
                                        value={quizState.question}
                                        onChange={(e) => handleQuizQuestionChange(e.target.value)}
                                        className="w-full rounded border px-2 py-1 text-xs text-gray-900"
                                        placeholder="Enter the question..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-medium text-gray-500 uppercase">Answers</label>
                                    {quizState.answers.map((answer, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setCorrectAnswer(idx)}
                                                className={`h-4 w-4 rounded-full border flex items-center justify-center ${answer.correct ? 'bg-green-500 border-green-600' : 'bg-white border-gray-300'}`}
                                                title="Mark as correct answer"
                                            >
                                                {answer.correct && <span className="text-white text-[10px]">✓</span>}
                                            </button>
                                            <input
                                                type="text"
                                                value={answer.text}
                                                onChange={(e) => handleAnswerChange(idx, 'text', e.target.value)}
                                                className="flex-1 rounded border px-2 py-1 text-xs text-gray-900"
                                                placeholder={`Answer ${idx + 1}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeAnswer(idx)}
                                                className="text-gray-400 hover:text-red-500"
                                                title="Remove answer"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addAnswer}
                                        className="text-[10px] text-leyline-primary font-semibold hover:underline"
                                    >
                                        + Add Answer
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* STANDARD EDITOR (TEXT, IMAGE, VIDEO, HTML) */
                            <div className="relative">
                                {contentType === "IMAGE" ? (
                                    <div className="space-y-2">
                                        {contentValue && (
                                            <div className="flex items-center gap-3 rounded border border-gray-200 bg-gray-50 p-2">
                                                <div
                                                    className="relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded border border-gray-200 bg-white hover:opacity-90"
                                                    onClick={() => setIsImageExpanded(true)}
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={contentValue} alt="Preview" className="h-full w-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="truncate text-[10px] text-gray-500" title={contentValue}>
                                                        {contentValue}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">
                                                        Click thumbnail to expand
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="lesson-image-upload"
                                                disabled={isUploading}
                                            />
                                            <label
                                                htmlFor="lesson-image-upload"
                                                className={`cursor-pointer rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {isUploading ? 'Uploading...' : 'Choose Image...'}
                                            </label>
                                            <span className="text-[10px] text-gray-500">
                                                {isUploading ? 'Please wait...' : 'Upload a new image to replace the current one.'}
                                            </span>
                                        </div>

                                        {/* Hidden input to submit the URL */}
                                        <input type="hidden" name="content" value={contentValue} />
                                    </div>
                                ) : (
                                    <textarea
                                        name="content"
                                        value={contentValue}
                                        onChange={(e) => setContentValue(e.target.value)}
                                        placeholder={
                                            contentType === "VIDEO"
                                                ? "https://example.com/video.mp4"
                                                : "Enter content here..."
                                        }
                                        rows={contentType === "TEXT" || contentType === "HTML" ? 4 : 2}
                                        className="w-full rounded border px-2 py-1 text-xs text-gray-900 font-mono"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <button
                type="submit"
                className="self-start rounded border border-gray-300 px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                disabled={isUploading}
            >
                Save Lesson
            </button>

            {/* Image Lightbox */}
            {isImageExpanded && contentType === "IMAGE" && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setIsImageExpanded(false)}
                >
                    <div className="relative max-h-full max-w-full overflow-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={contentValue} alt="Expanded Preview" className="max-h-[90vh] rounded shadow-2xl" />
                        <button
                            type="button"
                            className="absolute top-2 right-2 rounded-full bg-white/20 p-1 text-white hover:bg-white/40"
                            onClick={() => setIsImageExpanded(false)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
}
