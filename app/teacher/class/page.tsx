"use client";

import { useEffect, useState } from "react";

interface LocalClass {
  id: string;
  name: string;
  pin: string;
  createdAt: string;
}

// 교사용 테스트/로컬 학급 생성 페이지
// 실제 서버 연동 전, UI 흐름을 보기 위한 용도입니다.
export default function TeacherClassPage() {
  const [classes, setClasses] = useState<LocalClass[]>([]);
  const [className, setClassName] = useState("");

  useEffect(() => {
    // localStorage에 저장된 학급 불러오기
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("local_classes");
    if (saved) {
      try {
        setClasses(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  const saveClasses = (next: LocalClass[]) => {
    setClasses(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("local_classes", JSON.stringify(next));
    }
  };

  const generatePin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    const newClass: LocalClass = {
      id: `local-${Date.now()}`,
      name: className.trim(),
      pin: generatePin(),
      createdAt: new Date().toISOString(),
    };

    saveClasses([newClass, ...classes]);
    setClassName("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">교사 입장 - 학급 만들기</h1>
          <p className="text-sm text-gray-600 mb-4">
            서버 연결 전, 학급 생성과 PIN 발급 흐름을 테스트하기 위한 화면입니다.
          </p>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label
                htmlFor="className"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                학급명
              </label>
              <input
                id="className"
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="예: 3학년 1반"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              학급 생성 및 PIN 만들기
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">내가 만든 학급</h2>
          {classes.length === 0 ? (
            <p className="text-gray-500 text-sm">
              아직 생성한 학급이 없습니다. 위에서 학급을 만들어 보세요.
            </p>
          ) : (
            <div className="space-y-3">
              {classes.map((c) => (
                <div
                  key={c.id}
                  className="p-4 border border-gray-200 rounded-md flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      생성일:{" "}
                      {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">
                      학생들이 학급 입장할 때 사용할 PIN
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(c.pin);
                        alert("PIN이 클립보드에 복사되었습니다.");
                      }}
                      className="px-3 py-1 bg-gray-800 text-white rounded text-sm font-mono"
                    >
                      {c.pin}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

