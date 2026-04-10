"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearStudentSession, setStudentSession } from "@/lib/session";
import { getClassRoute, SAFE_CLASS_CODE } from "@/lib/explorer";

export default function StudentJoinPage() {
  const [step, setStep] = useState<"pin" | "name">("pin");
  const [pin, setPin] = useState(SAFE_CLASS_CODE);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [classId, setClassId] = useState<string | null>(null);
  const [classCode, setClassCode] = useState<string>(SAFE_CLASS_CODE);
  const [className, setClassName] = useState("SAFE 탐험반");
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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(34,197,94,0.18),transparent_30%),linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:auto,auto,28px_28px,28px_28px] opacity-80" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-[2rem] border border-white/15 bg-white/92 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="mb-6">
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              SAFE 탐사 지도
            </span>
            <h1 className="mt-3 text-3xl font-black text-slate-900">학급 입장</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              우리 반 코드 <span className="font-black text-blue-700">{SAFE_CLASS_CODE}</span> 를 입력하고
              친구들과 같은 지도를 함께 탐험해 보세요.
            </p>
          </div>

        {step === "pin" ? (
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-emerald-50 p-5">
              <p className="text-sm font-semibold text-slate-700">추천 입장 코드</p>
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                <span className="text-sm text-slate-500">SAFE 탐험반</span>
                <span className="text-2xl font-black tracking-[0.35em] text-blue-700">{SAFE_CLASS_CODE}</span>
              </div>
              <button
                type="button"
                onClick={() => setPin(SAFE_CLASS_CODE)}
                className="mt-3 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
              >
                5670 코드로 바로 입장 준비
              </button>
            </div>

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
              className="w-full rounded-3xl bg-gradient-to-r from-blue-600 to-emerald-500 py-4 text-base font-bold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "확인 중..." : "다음"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700">{className}</p>
              <p className="mt-1 text-xs text-emerald-600">
                코드 <span className="font-black">{classCode}</span> 전용 지도에 입장할 준비가 되었어요.
              </p>
            </div>
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
                className="flex-1 rounded-3xl bg-gradient-to-r from-blue-600 to-emerald-500 py-4 font-bold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
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
