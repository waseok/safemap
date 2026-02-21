"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Class } from "@/types";

export default function TeacherDashboardPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [className, setClassName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "학급 조회 실패");
      }
      const data = await res.json();
      setClasses(data.classes || []);
    } catch (err: any) {
      console.error("학급 로드 오류:", err);
      setError(err.message || "학급을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: className.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "학급 생성 실패");
      }

      setClasses([data.class, ...classes]);
      setClassName("");
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.message || "학급 생성에 실패했습니다.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">교사 대시보드</h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            홈으로
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">내 학급</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {showCreateForm ? "취소" : "+ 학급 생성"}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={createClass} className="mb-4 p-4 bg-gray-50 rounded-md">
              <div className="mb-3">
                <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
                  학급명
                </label>
                <input
                  id="className"
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 3학년 1반"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                {creating ? "생성 중..." : "학급 생성"}
              </button>
            </form>
          )}

          {classes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">생성된 학급이 없습니다.</p>
              <p className="text-sm text-gray-400">위의 &quot;+ 학급 생성&quot; 버튼으로 학급을 만들어 보세요.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{classItem.name}</h3>
                      <p className="text-sm text-gray-500">
                        PIN: <span className="font-mono font-bold text-blue-600 text-xl">{classItem.pin}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        생성일: {new Date(classItem.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(classItem.pin);
                        alert(`PIN ${classItem.pin} 이 복사되었습니다! 학생들에게 알려주세요.`);
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                    >
                      PIN 복사
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">사용 방법</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>위에서 학급을 생성하면 4자리 PIN이 자동 발급됩니다.</li>
            <li>학생들에게 PIN을 알려주세요.</li>
            <li>학생은 홈 → &quot;학급 입장&quot; → PIN 입력 → 이름 입력으로 들어옵니다.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
