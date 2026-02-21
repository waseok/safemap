"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import NaverMap from "@/components/Map/NaverMap";
import EducationLinks from "@/components/EducationLinks";
import { getStudentSessionId } from "@/lib/session";
import type { SafetyPin, SafetyCategory } from "@/types";

interface FeedbackData {
  id: string;
  feedback: string;
  created_at: string;
}

export default function PinDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pinId = params.id as string;
  const [pin, setPin] = useState<(SafetyPin & { students: { name: string } }) | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = getStudentSessionId();
    if (!sessionId) {
      router.push("/student/join");
      return;
    }
    loadPin();
    loadFeedbacks();
  }, [pinId, router]);

  const loadPin = async () => {
    try {
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

  const loadFeedbacks = async () => {
    try {
      const res = await fetch(`/api/feedback?safety_pin_id=${pinId}`);
      if (!res.ok) return;
      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
    } catch (err) {
      console.error("피드백 로드 오류:", err);
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
        <div className="text-center">
          <p className="text-gray-600 mb-2">핀을 찾을 수 없습니다.</p>
          <button onClick={() => router.back()} className="text-blue-600 underline text-sm">
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      생활안전: "⚠️",
      교통안전: "🚦",
      응급처치: "🩹",
      "폭력예방 및 신변보호": "🛡️",
      "약물 및 사이버 중독 예방": "📵",
      재난안전: "🌪️",
      직업안전: "👷",
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
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

          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <EducationLinks category={pin.category as SafetyCategory} />
          </div>

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

          {/* 교사 피드백 표시 (읽기 전용 - 학생이 볼 수 있음) */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">교사 피드백</h2>
            {feedbacks.length === 0 ? (
              <p className="text-sm text-gray-500">아직 교사 피드백이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {feedbacks.map((fb) => (
                  <div key={fb.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{fb.feedback}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(fb.created_at).toLocaleString("ko-KR")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
