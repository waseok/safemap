"use client";

import { useState } from "react";
import quizzes from "@/data/safety-quizzes";
import type { SafetyCategory } from "@/types";

interface SafetyQuizProps {
  category: SafetyCategory;
}

export default function SafetyQuiz({ category }: SafetyQuizProps) {
  const questions = quizzes[category];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );
  const [finished, setFinished] = useState(false);
  const [open, setOpen] = useState(false);

  if (!questions || questions.length === 0) return null;

  const q = questions[current];
  const isAnswered = selected !== null;
  const score = answers.filter((a, i) => a === questions[i].answer).length;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const next = [...answers];
    next[current] = idx;
    setAnswers(next);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(answers[current + 1]);
    } else {
      setFinished(true);
    }
  };

  const handleRetry = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers(Array(questions.length).fill(null));
    setFinished(false);
  };

  return (
    <div className="mt-4 border border-yellow-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-yellow-50 text-left"
      >
        <span className="font-medium text-yellow-800">
          🧠 안전 퀴즈 — {category} ({questions.length}문제)
        </span>
        <span className="text-yellow-600 text-sm">{open ? "▲ 접기" : "▼ 풀어보기"}</span>
      </button>

      {open && (
        <div className="p-4 bg-white">
          {finished ? (
            /* 결과 화면 */
            <div className="text-center py-4">
              <p className="text-4xl mb-2">
                {score === questions.length ? "🏆" : score >= questions.length / 2 ? "👍" : "📚"}
              </p>
              <p className="text-lg font-bold mb-1">
                {questions.length}문제 중 {score}개 정답!
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {score === questions.length
                  ? "완벽해요! 안전 지식이 훌륭합니다."
                  : score >= questions.length / 2
                  ? "잘 했어요! 조금 더 공부해 보세요."
                  : "다시 한번 도전해 보세요!"}
              </p>
              {/* 오답 복습 */}
              <div className="text-left space-y-3 mb-4">
                {questions.map((q, i) => {
                  const userAns = answers[i];
                  const correct = userAns === q.answer;
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-lg text-sm ${
                        correct ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <p className="font-medium mb-1">
                        {correct ? "✅" : "❌"} {q.question}
                      </p>
                      {!correct && (
                        <p className="text-gray-600">
                          정답: {q.options[q.answer]}
                        </p>
                      )}
                      <p className="text-gray-500 mt-1">💡 {q.explanation}</p>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 text-sm"
              >
                다시 풀기
              </button>
            </div>
          ) : (
            /* 문제 화면 */
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">
                  {current + 1} / {questions.length}
                </span>
                <div className="flex gap-1">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < current
                          ? answers[i] === questions[i].answer
                            ? "bg-green-400"
                            : "bg-red-400"
                          : i === current
                          ? "bg-yellow-400"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="font-semibold mb-4 text-gray-800">{q.question}</p>

              <div className="space-y-2 mb-4">
                {q.options.map((opt, idx) => {
                  let style =
                    "w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ";
                  if (!isAnswered) {
                    style += "border-gray-200 hover:border-yellow-400 hover:bg-yellow-50";
                  } else if (idx === q.answer) {
                    style += "border-green-400 bg-green-50 text-green-800 font-medium";
                  } else if (idx === selected) {
                    style += "border-red-400 bg-red-50 text-red-800";
                  } else {
                    style += "border-gray-200 text-gray-400";
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(idx)}
                      className={style}
                    >
                      <span className="mr-2 font-medium">
                        {["①", "②", "③", "④"][idx]}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  💡 {q.explanation}
                </div>
              )}

              {isAnswered && (
                <button
                  onClick={handleNext}
                  className="w-full py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 text-sm font-medium"
                >
                  {current < questions.length - 1 ? "다음 문제 →" : "결과 보기"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
