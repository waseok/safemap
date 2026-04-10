"use client";

import NaverMap from "@/components/Map/NaverMap";
import type { SafetyPin } from "@/types";
import { EXPLORER_CATEGORIES } from "@/lib/explorer";

interface ExplorerMapSectionProps {
  pins: (SafetyPin & { students?: { name: string } | null })[];
  mapCenter: { lat: number; lng: number };
  onCenterChange: (lat: number, lng: number) => void;
  onMarkerClick: (pinId: string) => void;
  createMode: boolean;
  onToggleCreateMode: () => void;
  onMapSelect: (lat: number, lng: number) => void;
}

export default function ExplorerMapSection({
  pins,
  mapCenter,
  onCenterChange,
  onMarkerClick,
  createMode,
  onToggleCreateMode,
  onMapSelect,
}: ExplorerMapSectionProps) {
  const markers = pins
    .filter((pin) => pin.latitude && pin.longitude)
    .map((pin) => ({
      id: pin.id,
      lat: pin.latitude!,
      lng: pin.longitude!,
      title: pin.title,
      category: pin.category,
      description: pin.description,
      studentName: pin.students?.name ?? undefined,
      onClick: () => onMarkerClick(pin.id),
    }));

  return (
    <section className="space-y-4">
      <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              FIND · SAFE 탐사 단계
            </span>
            <h1 className="mt-3 text-2xl font-black text-slate-900">우리 동네 안전 탐사 지도</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              친구들이 남긴 위험 핀을 보며, 지금 서 있는 자리도 바로 기록해 보세요.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-blue-50 px-4 py-3 text-right">
            <div className="text-xs text-blue-700">우리 반 기록</div>
            <div className="mt-1 text-3xl font-black text-blue-700">{pins.length}</div>
            <div className="text-xs text-blue-700">개의 발견</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {EXPLORER_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="inline-flex items-center gap-2 rounded-full bg-[#eef5ff] px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <span>{category.mapIcon}</span>
              <span>{category.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="relative h-[calc(100vh-19rem)] min-h-[420px]">
          <NaverMap
            center={mapCenter}
            markers={markers}
            height="100%"
            showMyLocationButton
            showSearchButton
            onCenterChange={onCenterChange}
            selectable={createMode}
            onMapClick={createMode ? onMapSelect : undefined}
          />
          {createMode && (
            <div className="absolute inset-x-0 top-4 z-10 px-4">
              <div className="mx-auto max-w-sm rounded-2xl border border-blue-200 bg-white/95 px-4 py-3 text-center text-sm font-semibold text-blue-700 shadow-sm">
                핀 모양 커서로 바뀌었어요. 지도에서 위치를 한 번 눌러주세요.
              </div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-4 z-10 px-4">
            <button
              type="button"
              onClick={onToggleCreateMode}
              className={`mx-auto flex w-full max-w-sm items-center justify-center gap-3 rounded-[1.6rem] px-6 py-4 text-base font-black transition ${
                createMode
                  ? "bg-[#e7f0ff] text-blue-700 hover:bg-[#dce9ff]"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              <span className="text-xl">{createMode ? "✅" : "📍"}</span>
              {createMode ? "선택 모드 종료" : "안전 탐사 기록 시작하기"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
