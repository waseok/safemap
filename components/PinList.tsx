"use client";

import { useRouter } from "next/navigation";
import type { SafetyPin } from "@/types";

interface PinListProps {
  pins: (SafetyPin & { students: { name: string } })[];
}

export default function PinList({ pins }: PinListProps) {
  const router = useRouter();

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

  const getLocationName = (pin: SafetyPin) => {
    if (pin.location_type === "마을" && pin.address) {
      return pin.address;
    }
    return pin.location_type;
  };

  if (pins.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        등록된 안전 핀이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pins.map((pin) => (
        <div
          key={pin.id}
          onClick={() => router.push(`/pin/${pin.id}`)}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md cursor-pointer transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl">
              {getCategoryIcon(pin.category)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{getLocationIcon(pin.location_type)}</span>
                <h3 className="font-semibold text-lg">{pin.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {getLocationName(pin)}
              </p>
              {pin.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                  {pin.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  올린이: {pin.students?.name || "알 수 없음"}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(pin.created_at).toLocaleDateString("ko-KR")}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
