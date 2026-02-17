"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PinList from "@/components/PinList";
import { getStudentSessionId, getStudentId, getClassId } from "@/lib/session";
import type { SafetyPin } from "@/types";

export default function MyPinsPage() {
  const router = useRouter();
  const [pins, setPins] = useState<(SafetyPin & { students: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = getStudentSessionId();
    if (!sessionId) {
      router.push("/student/join");
      return;
    }

    loadMyPins();
  }, [router]);

  const loadMyPins = async () => {
    try {
      // 테스트 모드 체크
      const isTestMode = getStudentSessionId() === "test-session-id";
      
      if (isTestMode) {
        // 테스트 모드: 더미 데이터 표시
        const testPins: (SafetyPin & { students: { name: string } })[] = [
          {
            id: "test-pin-1",
            class_id: "test-class-id",
            student_id: "test-student-id",
            location_type: "마을",
            category: "교통안전",
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
        ];
        setPins(testPins);
        setLoading(false);
        return;
      }

      const classId = getClassId();
      const studentId = getStudentId();
      
      if (!classId || !studentId) return;

      const res = await fetch(`/api/pins?class_id=${classId}&student_id=${studentId}`);
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">내가 저장한 핀</h1>
          <p className="text-sm text-gray-600 mb-6">
            내가 발견하고 등록한 안전 문제들을 확인하세요
          </p>
          <PinList pins={pins} />
        </div>
      </div>
    </div>
  );
}
