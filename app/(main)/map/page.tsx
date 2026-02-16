"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NaverMap from "@/components/Map/NaverMap";
import { getStudentSessionId, getClassId } from "@/lib/session";
import type { SafetyPin } from "@/types";

export default function MapPage() {
  const router = useRouter();
  const [pins, setPins] = useState<SafetyPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 });

  useEffect(() => {
    const sessionId = getStudentSessionId();
    if (!sessionId) {
      router.push("/student/join");
      return;
    }

    loadPins();
  }, [router]);

  const loadPins = async () => {
    try {
      // 테스트 모드 체크
      const isTestMode = getStudentSessionId() === "test-session-id";
      
      if (isTestMode) {
        // 테스트 모드: 더미 데이터 표시
        const testPins: SafetyPin[] = [
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
          },
          {
            id: "test-pin-2",
            class_id: "test-class-id",
            student_id: "test-student-id",
            location_type: "마을",
            category: "생활안전",
            title: "깨진 유리창",
            description: "공원 화장실 유리창이 깨져있어 위험합니다.",
            latitude: 37.5700,
            longitude: 126.9800,
            address: "서울특별시 중구 명동",
            image_url: "",
            created_at: new Date().toISOString(),
          },
        ];
        setPins(testPins);
        if (testPins[0].latitude && testPins[0].longitude) {
          setMapCenter({
            lat: testPins[0].latitude,
            lng: testPins[0].longitude,
          });
        }
        setLoading(false);
        return;
      }

      const classId = getClassId();
      if (!classId) return;

      const res = await fetch(`/api/pins?class_id=${classId}&location_type=마을`);
      if (!res.ok) throw new Error("핀 로드 실패");

      const data = await res.json();
      setPins(data.pins || []);

      // 첫 번째 핀을 중심으로 설정
      if (data.pins && data.pins.length > 0 && data.pins[0].latitude && data.pins[0].longitude) {
        setMapCenter({
          lat: data.pins[0].latitude,
          lng: data.pins[0].longitude,
        });
      }
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

  const markers = pins
    .filter((pin) => pin.latitude && pin.longitude)
    .map((pin) => ({
      id: pin.id,
      lat: pin.latitude!,
      lng: pin.longitude!,
      title: pin.title,
      category: pin.category,
      onClick: () => {
        router.push(`/pin/${pin.id}`);
      },
    }));

  return (
    <div className="min-h-screen">
      <div className="bg-white shadow-md p-4 mb-4">
        <h1 className="text-2xl font-bold">지도 보기</h1>
        <p className="text-sm text-gray-600 mt-1">
          마을에서 발견한 안전 문제를 지도에서 확인하세요
        </p>
      </div>
      <div className="h-[calc(100vh-200px)] min-h-[400px]">
        <NaverMap
          center={mapCenter}
          markers={markers}
          height="100%"
        />
      </div>
    </div>
  );
}
