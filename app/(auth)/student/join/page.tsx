"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearStudentSession, setStudentSession } from "@/lib/session";
import { getClassRoute } from "@/lib/explorer";

export default function StudentJoinPage() {
  const [step, setStep] = useState<"pin" | "name">("pin");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [classId, setClassId] = useState<string | null>(null);
  const [classCode, setClassCode] = useState<string>("");
  const [className, setClassName] = useState("");
  const router = useRouter();

  useEffect(() => {
    // 테스트/이전 세션이 남아 있으면 잘못된 student_id/class_id로 핀 생성이 실패할 수 있어
    // 입장 화면 진입 시 한 번 초기화합니다.
    clearStudentSession();
  }, []);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError("PIN은 4자리 숫자여야 합니다.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/student/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "pin", pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "PIN 확인에 실패했습니다.");
      }

      setClassId(data.classId);
      setClassCode(data.classCode);
      setClassName(data.className);
      setStep("name");
    } catch (err: any) {
      setError(err.message || "PIN 확인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !classId) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/student/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "name",
          classId,
          classCode,
          name: name.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "입장에 실패했습니다.");
      }

      setStudentSession({
        sessionId: data.sessionId,
        studentId: data.studentId,
        classId: data.classId,
        classCode: data.classCode,
        studentName: name.trim(),
      });

      router.push(getClassRoute(data.classCode, "map"));
    } catch (err: any) {
      setError(err.message || "입장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#edf6ff] px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[size:26px_26px]" />
      <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-[2rem] border border-blue-100 bg-white p-7 shadow-sm">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-slate-900">학급 입장</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">선생님이 알려준 학급 코드와 이름을 입력해 주세요.</p>
          </div>

        {step === "pin" ? (
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                PIN 번호 (4자리)
              </label>
              <input
                id="pin"
                type="text"
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setPin(value);
                }}
                required
                maxLength={4}
                className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-center text-3xl font-black tracking-[0.5em] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0000"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || pin.length !== 4}
              className="w-full rounded-3xl bg-blue-500 py-4 text-base font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "확인 중..." : "다음"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            {className && <p className="rounded-3xl bg-blue-50 px-4 py-3 text-sm text-blue-700">{className}</p>}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                이름 (핀을 올릴 때 표시됩니다)
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-3xl border border-slate-200 px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="이름을 입력하세요"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep("pin");
                  setName("");
                  setError("");
                }}
                className="flex-1 rounded-3xl bg-slate-100 py-4 font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                이전
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 rounded-3xl bg-blue-500 py-4 font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "입장 중..." : "입장"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
            홈으로 돌아가기
          </a>
        </div>
      </div>
      </div>
    </div>
  );
}
