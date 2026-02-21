"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PinList from "@/components/PinList";
import { getStudentSessionId, getStudentId, getClassId } from "@/lib/session";
import type { SafetyPin } from "@/types";

export default function MyPinsPage() {
  const router = useRouter();
  const [pins, setPins] = useState<(SafetyPin & { students: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMyPins = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const classId = getClassId();
      const studentId = getStudentId();

      if (!classId || !studentId) {
        setError("세션 정보가 없습니다. 다시 입장해주세요.");
        return;
      }

      const res = await fetch(`/api/pins?class_id=${classId}&student_id=${studentId}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `핀 로드 실패 (${res.status})`);
      }

      const data = await res.json();
      setPins(data.pins || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "핀을 불러올 수 없습니다.";
      console.error("핀 로드 오류:", err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sessionId = getStudentSessionId();
    if (!sessionId) {
      router.push("/student/join");
      return;
    }
    loadMyPins();
  }, [router, loadMyPins]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">내가 저장한 핀</h1>
            <button
              onClick={loadMyPins}
              disabled={loading}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 disabled:opacity-50"
            >
              {loading ? "로딩 중..." : "새로고침"}
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            내가 발견하고 등록한 안전 문제들을 확인하세요
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={() => router.push("/student/join")}
                className="mt-2 text-sm text-blue-600 underline"
              >
                다시 입장하기
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-500">로딩 중...</div>
          ) : pins.length === 0 && !error ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">아직 등록한 핀이 없습니다.</p>
              <button
                onClick={() => router.push("/create")}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                안전 문제 발견하기
              </button>
            </div>
          ) : (
            <PinList pins={pins} />
          )}
        </div>
      </div>
    </div>
  );
}
