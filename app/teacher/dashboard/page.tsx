"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Class, SafetyPin } from "@/types";

interface PinWithStudent extends SafetyPin {
  students: { name: string } | null;
}

interface FeedbackData {
  id: string;
  feedback: string;
  created_at: string;
}

export default function TeacherDashboardPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [className, setClassName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classPins, setClassPins] = useState<PinWithStudent[]>([]);
  const [pinsLoading, setPinsLoading] = useState(false);

  const [selectedPin, setSelectedPin] = useState<PinWithStudent | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [existingFeedback, setExistingFeedback] = useState<FeedbackData | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSaving, setFeedbackSaving] = useState(false);

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "학급을 불러올 수 없습니다.";
      setError(msg);
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
      if (!res.ok) throw new Error(data.error || "학급 생성 실패");

      setClasses([data.class, ...classes]);
      setClassName("");
      setShowCreateForm(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "학급 생성에 실패했습니다.";
      setError(msg);
    } finally {
      setCreating(false);
    }
  };

  const loadClassPins = async (classItem: Class) => {
    setSelectedClass(classItem);
    setSelectedPin(null);
    setPinsLoading(true);
    try {
      const res = await fetch(`/api/pins?class_id=${classItem.id}`);
      if (!res.ok) throw new Error("핀 조회 실패");
      const data = await res.json();
      setClassPins(data.pins || []);
    } catch (err) {
      console.error("핀 로드 오류:", err);
      setClassPins([]);
    } finally {
      setPinsLoading(false);
    }
  };

  const openFeedback = async (pin: PinWithStudent) => {
    setSelectedPin(pin);
    setFeedbackText("");
    setExistingFeedback(null);
    setFeedbackLoading(true);
    try {
      const res = await fetch(`/api/feedback?safety_pin_id=${pin.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.feedback) {
          setExistingFeedback(data.feedback);
          setFeedbackText(data.feedback.feedback);
        }
      }
    } catch (err) {
      console.error("피드백 로드 오류:", err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const saveFeedback = async () => {
    if (!selectedPin || !feedbackText.trim()) return;
    setFeedbackSaving(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          safety_pin_id: selectedPin.id,
          feedback: feedbackText.trim(),
          class_id: selectedClass?.id,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "피드백 저장 실패");
      }
      const data = await res.json();
      setExistingFeedback(data.feedback);
      alert("피드백이 저장되었습니다!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "피드백 저장 실패";
      alert(msg);
    } finally {
      setFeedbackSaving(false);
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
      <div className="max-w-5xl mx-auto">
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

        {/* 학급 관리 섹션 */}
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
                  className={`p-4 border rounded-md cursor-pointer transition-colors ${
                    selectedClass?.id === classItem.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => loadClassPins(classItem)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{classItem.name}</h3>
                      <p className="text-sm text-gray-500">
                        PIN: <span className="font-mono font-bold text-blue-600 text-xl">{classItem.pin}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(classItem.pin);
                          alert(`PIN ${classItem.pin}이 복사되었습니다!`);
                        }}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                      >
                        PIN 복사
                      </button>
                      <span className="px-3 py-1 text-blue-600 text-sm">
                        {selectedClass?.id === classItem.id ? "선택됨" : "클릭하여 핀 보기"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 선택된 학급의 핀 목록 */}
        {selectedClass && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {selectedClass.name} - 학생 핀 목록
            </h2>

            {pinsLoading ? (
              <div className="text-center py-8 text-gray-500">핀 불러오는 중...</div>
            ) : classPins.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                아직 등록된 핀이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {classPins.map((pin) => (
                  <div
                    key={pin.id}
                    className={`p-4 border rounded-md cursor-pointer transition-colors ${
                      selectedPin?.id === pin.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => openFeedback(pin)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                            {pin.category}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {pin.location_type}
                          </span>
                        </div>
                        <h3 className="font-semibold">{pin.title}</h3>
                        {pin.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{pin.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          작성자: {pin.students?.name || "알 수 없음"} | {new Date(pin.created_at).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      {pin.image_url && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={pin.image_url}
                          alt={pin.title}
                          className="w-16 h-16 object-cover rounded ml-3 flex-shrink-0"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 선택된 핀에 피드백 작성 */}
        {selectedPin && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">피드백 작성</h2>
            <p className="text-sm text-gray-500 mb-4">
              <strong>{selectedPin.title}</strong> (작성자: {selectedPin.students?.name || "알 수 없음"})
            </p>

            {selectedPin.description && (
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-sm text-gray-700">{selectedPin.description}</p>
              </div>
            )}

            {selectedPin.image_url && (
              <div className="mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPin.image_url}
                  alt={selectedPin.title}
                  className="max-w-full h-48 object-cover rounded-md"
                />
              </div>
            )}

            {feedbackLoading ? (
              <div className="text-center py-4 text-gray-500">피드백 로딩 중...</div>
            ) : (
              <div className="space-y-3">
                {existingFeedback && (
                  <p className="text-xs text-green-600">
                    기존 피드백이 있습니다 (수정 가능)
                  </p>
                )}
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="이 안전 문제에 대한 피드백을 작성해주세요. 예: 잘 발견했어요! 이 문제는 시청에 민원을 넣어볼 수 있겠네요."
                />
                <button
                  onClick={saveFeedback}
                  disabled={feedbackSaving || !feedbackText.trim()}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {feedbackSaving ? "저장 중..." : existingFeedback ? "피드백 수정" : "피드백 저장"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* 사용 방법 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">사용 방법</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>위에서 학급을 생성하면 4자리 PIN이 자동 발급됩니다.</li>
            <li>학생들에게 PIN을 알려주세요.</li>
            <li>학생은 홈 → &quot;학급 입장&quot; → PIN 입력 → 이름 입력으로 들어옵니다.</li>
            <li>학급을 클릭하면 학생들이 등록한 핀 목록을 볼 수 있습니다.</li>
            <li>핀을 클릭하면 피드백을 작성할 수 있습니다.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
