'use client';

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";

type RawQuizOption = {
  Text?: string;
  text?: string;
  IsCorrect?: boolean;
  isCorrect?: boolean;
  Explanation?: string;
  explanation?: string;
};

type RawQuiz = {
  Question?: string;
  question?: string;
  Options?: RawQuizOption[];
  options?: RawQuizOption[];
  Explanation?: string;
  explanation?: string;
};

type QuizOption = {
  text: string;
  isCorrect: boolean;
  explanation?: string;
};

type QuizPayload = {
  question: string;
  options: QuizOption[];
  explanation?: string;
};

type QuizLessonProps = {
  content: string;
};

function normalizeQuizOption(raw: RawQuizOption): QuizOption | null {
  const text = raw.Text ?? raw.text ?? "";
  const isCorrect = raw.IsCorrect ?? raw.isCorrect ?? false;
  const explanation = raw.Explanation ?? raw.explanation ?? "";

  if (!text || text.trim().length === 0) return null;

  return {
    text: text.trim(),
    isCorrect,
    explanation: explanation && explanation.trim().length > 0 ? explanation.trim() : undefined,
  };
}

function parseQuiz(content: string): QuizPayload | null {
  let parsed: RawQuiz;

  try {
    parsed = JSON.parse(content) as RawQuiz;
  } catch (error) {
    console.error("[QuizLesson] Failed to parse quiz JSON", error);
    return null;
  }

  const question = (parsed.Question ?? parsed.question ?? "").trim();
  const rawOptions = parsed.Options ?? parsed.options ?? [];
  const options = rawOptions
    .map((opt) => normalizeQuizOption(opt))
    .filter((opt): opt is QuizOption => opt !== null);

  if (!question || options.length === 0) {
    return null;
  }

  const explanation = (parsed.Explanation ?? parsed.explanation ?? "").trim();

  return {
    question,
    options,
    explanation: explanation.length > 0 ? explanation : undefined,
  };
}

export function QuizLesson({ content }: QuizLessonProps) {
  const quiz = useMemo(() => parseQuiz(content), [content]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!quiz) {
    return (
      <pre className="max-h-[560px] overflow-auto rounded bg-white p-3 text-xs text-gray-700">
        {content}
      </pre>
    );
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10);
    if (Number.isNaN(value)) return;
    setSelectedIndex(value);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const anyCorrect = quiz.options.some((opt) => opt.isCorrect);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">{quiz.question}</h3>
      <form
        className="space-y-2 text-sm text-gray-800"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <div className="space-y-1">
          {quiz.options.map((option, index) => {
            const isSelected = selectedIndex === index;
            const isCorrect = option.isCorrect;
            const showCorrect =
              submitted && anyCorrect && isCorrect;
            const showIncorrect =
              submitted && isSelected && !isCorrect && anyCorrect;

            return (
              <label
                key={index}
                className={`flex items-start gap-2 rounded px-2 py-1 ${
                  showCorrect
                    ? "bg-emerald-50 text-emerald-800"
                    : showIncorrect
                      ? "bg-red-50 text-red-800"
                      : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="quiz-option"
                  value={index}
                  className="mt-1 h-3 w-3"
                  checked={isSelected}
                  onChange={handleChange}
                />
                <span className="flex-1">{option.text}</span>
              </label>
            );
          })}
        </div>
        <button
          type="submit"
          className="mt-2 rounded bg-leyline-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-lime-600"
        >
          Submit
        </button>
      </form>
      {submitted && quiz.explanation && (
        <div className="rounded border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700">
          <div className="font-semibold">Explanation</div>
          <p className="mt-1 whitespace-pre-wrap">{quiz.explanation}</p>
        </div>
      )}
    </div>
  );
}

