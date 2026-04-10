"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearStudentSession } from "@/lib/session";

export default function StudentJoinPage() {
  const [step, setStep] = useState<"pin" | "name">("pin");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [classId, setClassId] = useState<string | null>(null);
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
          name: name.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "입장에 실패했습니다.");
      }

      // 세션 ID를 localStorage에 저장
      localStorage.setItem("student_session_id", data.sessionId);
      localStorage.setItem("student_id", data.studentId);
      localStorage.setItem("class_id", data.classId);

      router.push("/map");
    } catch (err: any) {
      setError(err.message || "입장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-400 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎒</div>
          <h1 className="text-2xl font-extrabold text-blue-700">학급 입장</h1>
          <p className="text-sm text-blue-400 mt-1">선생님께 받은 PIN 번호를 입력하세요</p>
        </div>

        {step === "pin" ? (
          <form onSubmit={handlePinSubmit} className="space-y-5">
            <div>
              <label htmlFor="pin" className="block text-sm font-semibold text-gray-600 mb-2">
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
                className="w-full px-4 py-4 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-3xl font-mono tracking-[0.5em] text-blue-800"
                placeholder="0000"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || pin.length !== 4}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              {loading ? "확인 중..." : "다음 →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleNameSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-600 mb-2">
                이름
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-4 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-blue-800"
                placeholder="이름을 입력하세요"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("pin");
                  setName("");
                  setError("");
                }}
                className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                ← 이전
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-2 flex-grow bg-blue-500 hover:bg-blue-400 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                {loading ? "입장 중..." : "입장하기 🚀"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-blue-400 hover:text-blue-600 font-medium">
            ← 홈으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
