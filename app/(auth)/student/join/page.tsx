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
    <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg)] px-4 py-8">
      <div className="w-full max-w-md rounded-panel border border-[var(--color-border)] bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">학급 입장</h1>
          <p className="mt-2 text-base text-[var(--color-text-secondary)]">
            선생님이 알려준 학급 코드와 이름을 입력해 주세요.
          </p>
        </div>

        {step === "pin" ? (
          <form onSubmit={handlePinSubmit} className="space-y-5">
            <div>
              <label htmlFor="pin" className="mb-2 block text-base text-[var(--color-text-secondary)]">
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
                className="w-full rounded-card border border-[var(--color-border)] px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-info)]"
                placeholder="0000"
              />
            </div>

            {error && (
              <div className="rounded-card bg-[var(--color-danger-soft)] px-4 py-3 text-base text-[var(--color-danger)]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || pin.length !== 4}
              className="w-full rounded-card bg-[var(--color-info)] py-4 text-lg text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "확인 중..." : "다음 →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            {className && (
              <p className="rounded-card bg-[var(--color-info-soft)] px-4 py-3 text-base text-[var(--color-info)]">
                {className}
              </p>
            )}
            <div>
              <label htmlFor="name" className="mb-2 block text-base text-[var(--color-text-secondary)]">
                이름
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-card border border-[var(--color-border)] px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-info)]"
                placeholder="이름을 입력하세요"
              />
            </div>

            {error && (
              <div className="rounded-card bg-[var(--color-danger-soft)] px-4 py-3 text-base text-[var(--color-danger)]">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("pin");
                  setName("");
                  setError("");
                }}
                className="flex-1 rounded-card border border-[var(--color-border)] bg-white py-4 text-lg text-[var(--color-text-secondary)] transition-colors hover:bg-slate-50"
              >
                ← 이전
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 rounded-card bg-[var(--color-info)] py-4 text-lg text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "입장 중..." : "입장하기 🚀"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-base text-[var(--color-text-secondary)] hover:text-[var(--color-info)]">
            ← 홈으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
