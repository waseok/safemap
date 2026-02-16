"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import NaverMap from "@/components/Map/NaverMap";
import FeedbackForm from "@/components/FeedbackForm";
import { getStudentSessionId } from "@/lib/session";
import type { SafetyPin } from "@/types";

export default function PinDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pinId = params.id as string;
  const [pin, setPin] = useState<(SafetyPin & { students: { name: string } }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = getStudentSessionId();
    if (!sessionId) {
      router.push("/student/join");
      return;
    }

    loadPin();
  }, [pinId, router]);

  const loadPin = async () => {
    try {
      // 테스트 모드: API 대신 더미 데이터 사용
      const sessionId = getStudentSessionId();
      if (sessionId === "test-session-id") {
        const testPins: (SafetyPin & { students: { name: string } })[] = [
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

        const found = testPins.find((p) => p.id === pinId);
        setPin(found || null);
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/pins/${pinId}`);
      if (!res.ok) throw new Error("핀 로드 실패");

      const data = await res.json();
      setPin(data.pin);
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

  if (!pin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>핀을 찾을 수 없습니다.</div>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      교통: "🚦",
      생활안전: "⚠️",
      환경: "🌱",
      기타: "📍",
    };
    return icons[category] || "📍";
  };

  const getLocationIcon = (locationType: string) => {
    const icons: Record<string, string> = {
      학교: "🏫",
      집: "🏠",
      마을: "🗺️",
    };
    return icons[locationType] || "📍";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{getCategoryIcon(pin.category)}</span>
            <div>
              <h1 className="text-2xl font-bold">{pin.title}</h1>
              <p className="text-sm text-gray-600">
                {getLocationIcon(pin.location_type)} {pin.location_type}
                {pin.location_type === "마을" && pin.address && ` - ${pin.address}`}
              </p>
            </div>
          </div>

          {pin.image_url && (
            <div className="mb-4">
              <img
                src={pin.image_url}
                alt={pin.title}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}

          {pin.description && (
            <div className="mb-4">
              <h2 className="font-semibold mb-2">설명</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{pin.description}</p>
            </div>
          )}

          {pin.location_type === "마을" && pin.latitude && pin.longitude && (
            <div className="mb-4">
              <h2 className="font-semibold mb-2">위치</h2>
              <div className="h-64 rounded-lg overflow-hidden">
                <NaverMap
                  center={{ lat: pin.latitude, lng: pin.longitude }}
                  markers={[
                    {
                      id: pin.id,
                      lat: pin.latitude,
                      lng: pin.longitude,
                      title: pin.title,
                      category: pin.category,
                    },
                  ]}
                  height="100%"
                />
              </div>
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>올린이: {pin.students?.name || "알 수 없음"}</span>
              <span>{new Date(pin.created_at).toLocaleString("ko-KR")}</span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => router.push(`/solutions?pin_id=${pin.id}`)}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              해결방법 고민·제안하기
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              뒤로 가기
            </button>
          </div>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">교사 피드백</h2>
            <FeedbackForm safetyPinId={pin.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
