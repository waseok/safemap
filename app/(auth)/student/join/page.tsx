"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentJoinPage() {
  const [step, setStep] = useState<"pin" | "name">("pin");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [classId, setClassId] = useState<string | null>(null);
  const router = useRouter();

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">학급 입장</h1>

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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-mono tracking-widest"
                placeholder="0000"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || pin.length !== 4}
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "확인 중..." : "다음"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleNameSubmit} className="space-y-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
              >
                이전
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}
