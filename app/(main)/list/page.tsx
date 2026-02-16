"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PinList from "@/components/PinList";
import { getStudentSessionId, getClassId } from "@/lib/session";
import type { SafetyPin } from "@/types";

export default function ListPage() {
  const router = useRouter();
  const [pins, setPins] = useState<(SafetyPin & { students: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const sessionId = getStudentSessionId();
    if (!sessionId) {
      router.push("/student/join");
      return;
    }

    loadPins();
  }, [router, filter]);

  const loadPins = async () => {
    try {
      // 테스트 모드 체크
      const isTestMode = getStudentSessionId() === "test-session-id";
      
      if (isTestMode) {
        // 테스트 모드: 더미 데이터 표시
        const allTestPins: (SafetyPin & { students: { name: string } })[] = [
          {
            id: "test-pin-1",
            class_id: "test-class-id",
            student_id: "test-student-id",
            location_type: "마을",
            category: "교통",
            title: "횡단보도 신호등 고장",
            description: "신호등이 작동하지 않아 위험합니다.",
            latitude: 37.5665,
            longitude: 126.978,
            address: "서울특별시 중구 세종대로",
            image_url: "",
            created_at: new Date().toISOString(),
            students: { name: "테스트 학생" },
          },
          {
            id: "test-pin-2",
            class_id: "test-class-id",
            student_id: "test-student-id",
            location_type: "학교",
            category: "생활안전",
            title: "계단 난간 파손",
            description: "3층 계단 난간이 느슨해져 있습니다.",
            latitude: null,
            longitude: null,
            address: null,
            image_url: "",
            created_at: new Date().toISOString(),
            students: { name: "테스트 학생" },
          },
          {
            id: "test-pin-3",
            class_id: "test-class-id",
            student_id: "test-student-id",
            location_type: "집",
            category: "환경",
            title: "배수구 막힘",
            description: "아파트 앞 배수구가 막혀 있습니다.",
            latitude: null,
            longitude: null,
            address: null,
            image_url: "",
            created_at: new Date().toISOString(),
            students: { name: "테스트 학생" },
          },
        ];
        
        const filteredPins = filter === "all" 
          ? allTestPins 
          : allTestPins.filter(pin => pin.location_type === filter);
        
        setPins(filteredPins);
        setLoading(false);
        return;
      }

      const classId = getClassId();
      if (!classId) return;

      let url = `/api/pins?class_id=${classId}`;
      if (filter !== "all") {
        url += `&location_type=${filter}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("핀 로드 실패");

      const data = await res.json();
      setPins(data.pins || []);
    } catch (err) {
      console.error("핀 로드 오류:", err);
    } finally {
      setLoading(false);
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h1 className="text-2xl font-bold mb-4">리스트 보기</h1>
          
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter("학교")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === "학교"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🏫 학교
            </button>
            <button
              onClick={() => setFilter("집")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === "집"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🏠 집
            </button>
            <button
              onClick={() => setFilter("마을")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === "마을"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🗺️ 마을
            </button>
          </div>

          <PinList pins={pins} />
        </div>
      </div>
    </div>
  );
}
