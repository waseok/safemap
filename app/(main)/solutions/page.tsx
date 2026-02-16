"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SolutionForm from "@/components/SolutionForm";
import { getStudentSessionId } from "@/lib/session";
import type { Solution } from "@/types";

export default function SolutionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pinId = searchParams.get("pin_id");
  const [solutions, setSolutions] = useState<(Solution & { students: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = getStudentSessionId();
    if (!sessionId) {
      router.push("/student/join");
      return;
    }

    if (pinId) {
      loadSolutions();
    }
  }, [pinId, router]);

  const loadSolutions = async () => {
    if (!pinId) return;

    try {
      const res = await fetch(`/api/solutions?safety_pin_id=${pinId}`);
      if (!res.ok) throw new Error("해결방법 로드 실패");

      const data = await res.json();
      setSolutions(data.solutions || []);
    } catch (err) {
      console.error("해결방법 로드 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    loadSolutions();
  };

  if (!pinId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">핀을 선택해주세요.</p>
          <button
            onClick={() => router.push("/list")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            리스트로 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">해결방법 고민하기</h1>
          <SolutionForm safetyPinId={pinId} onSuccess={handleSuccess} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">제안된 해결방법</h2>
          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : solutions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              아직 제안된 해결방법이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {solutions.map((solution) => (
                <div
                  key={solution.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      {solution.type === "text"
                        ? "📝 텍스트"
                        : solution.type === "image"
                        ? "📷 사진"
                        : "🎨 그림"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {solution.students?.name || "알 수 없음"} ·{" "}
                      {new Date(solution.created_at).toLocaleString("ko-KR")}
                    </span>
                  </div>
                  {solution.type === "text" ? (
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {solution.content}
                    </p>
                  ) : (
                    <div>
                      <img
                        src={solution.content}
                        alt="해결방법 이미지"
                        className="max-w-full h-auto rounded-md"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
