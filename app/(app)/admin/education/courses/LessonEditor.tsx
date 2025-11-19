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

    // Initialize quiz state if needed when switching to quiz type
    useEffect(() => {
        if (contentType === "MULTIPLE_CHOICE") {
            try {
                const parsed = contentValue ? JSON.parse(contentValue) : { question: "", answers: [] };
                // Basic validation
                if (typeof parsed === 'object' && parsed !== null) {
                    setQuizState({
                        question: parsed.question || "",
                        answers: Array.isArray(parsed.answers) ? parsed.answers : []
                    });
                }
            } catch (e) {
                // If parse fails, just reset to empty
                setQuizState({ question: "", answers: [] });
            }
        }
    }, [contentType]);

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
        // If we want single choice, we uncheck others. 
        // Assuming multiple choice could have multiple correct answers? 
        // Usually "Multiple Choice" implies one correct answer in simple systems, 
        // but let's support single selection for "correct" for now to be safe, or toggle.
        // Let's assume single correct answer for simplicity unless specified otherwise.
        // The prompt didn't specify, but standard quizzes usually have one correct answer.
        // However, the data structure `correct: boolean` on each answer allows multiple.
        // I'll implement it as a radio-like behavior (click to set this one as correct, others false)
        // but allow toggling if needed? Let's stick to radio behavior for "Correct Answer".

        const newAnswers = quizState.answers.map((a, i) => ({
            ...a,
            correct: i === index
        }));
        updateQuizContent({ ...quizState, answers: newAnswers });
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

                {/* Dynamic Content Editor */}
                {contentType !== "NONE" && (
                    <div className="flex flex-col gap-2">
                        <label className="block text-[11px] font-semibold text-gray-700">
                            {contentType === "IMAGE" && "Image URL"}
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
                                {contentType === "IMAGE" && contentValue && (
                                    <div className="mb-2 flex items-center gap-3">
                                        <div
                                            className="relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded border border-gray-200 bg-gray-100 hover:opacity-90"
                                            onClick={() => setIsImageExpanded(true)}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={contentValue} alt="Preview" className="h-full w-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                                        </div>
                                        <p className="text-[10px] text-gray-500">
                                            Click thumbnail to expand.
                                        </p>
                                    </div>
                                )}

                                <textarea
                                    name="content"
                                    value={contentValue}
                                    onChange={(e) => setContentValue(e.target.value)}
                                    placeholder={
                                        contentType === "IMAGE"
                                            ? "https://example.com/image.jpg"
                                            : contentType === "VIDEO"
                                                ? "https://example.com/video.mp4"
                                                : "Enter content here..."
                                    }
                                    rows={contentType === "TEXT" || contentType === "HTML" ? 4 : 2}
                                    className="w-full rounded border px-2 py-1 text-xs text-gray-900 font-mono"
                                />
                            </div>
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

            {/* Image Lightbox */}
            {isImageExpanded && contentType === "IMAGE" && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setIsImageExpanded(false)}
                >
                    <div className="relative max-h-full max-w-full overflow-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={contentValue} alt="Expanded Preview" className="max-h-[90vh] rounded shadow-2xl" />
                        <button className="absolute top-2 right-2 rounded-full bg-white/20 p-1 text-white hover:bg-white/40">
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
}
