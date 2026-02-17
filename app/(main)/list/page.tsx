"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PinList from "@/components/PinList";
import EducationLinks from "@/components/EducationLinks";
import { getStudentSessionId, getClassId } from "@/lib/session";
import type { SafetyPin, SafetyCategory } from "@/types";
import { SAFETY_CATEGORIES } from "@/types";

const CATEGORY_SHORT_LABELS: Record<string, string> = {
  생활안전: "생활",
  교통안전: "교통",
  응급처치: "응급처치",
  "폭력예방 및 신변보호": "폭력·신변",
  "약물 및 사이버 중독 예방": "약물·사이버",
  재난안전: "재난",
  직업안전: "직업",
};

export default function ListPage() {
  const router = useRouter();
  const [pins, setPins] = useState<(SafetyPin & { students: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    const sessionId = getStudentSessionId();
    if (!sessionId) {
      router.push("/student/join");
      return;
    }

    loadPins();
  }, [router, locationFilter, categoryFilter]);

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
          {
            id: "test-pin-3",
            class_id: "test-class-id",
            student_id: "test-student-id",
            location_type: "집",
            category: "재난안전",
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
        
        let filtered = allTestPins;
        if (locationFilter !== "all") {
          filtered = filtered.filter((pin) => pin.location_type === locationFilter);
        }
        if (categoryFilter !== "all") {
          filtered = filtered.filter((pin) => pin.category === categoryFilter);
        }
        setPins(filtered);
        setLoading(false);
        return;
      }

      const classId = getClassId();
      if (!classId) return;

      let url = `/api/pins?class_id=${classId}`;
      if (locationFilter !== "all") {
        url += `&location_type=${locationFilter}`;
      }
      if (categoryFilter !== "all") {
        url += `&category=${encodeURIComponent(categoryFilter)}`;
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

          {/* 장소 유형 필터 */}
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-600 mr-2">장소</span>
            <div className="flex flex-wrap gap-2">
              {["all", "학교", "집", "마을"].map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocationFilter(loc)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    locationFilter === loc
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {loc === "all" ? "전체" : loc === "학교" ? "🏫 학교" : loc === "집" ? "🏠 집" : "🗺️ 마을"}
                </button>
              ))}
            </div>
          </div>

          {/* 7대 안전 필터 */}
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-600 mr-2">7대 안전</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  categoryFilter === "all"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                전체
              </button>
              {SAFETY_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                    categoryFilter === cat
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  title={cat}
                >
                  {CATEGORY_SHORT_LABELS[cat] ?? cat}
                </button>
              ))}
            </div>
          </div>

          {categoryFilter !== "all" && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <EducationLinks category={categoryFilter as SafetyCategory} />
            </div>
          )}

          <PinList pins={pins} />
        </div>
      </div>
    </div>
  );
}
