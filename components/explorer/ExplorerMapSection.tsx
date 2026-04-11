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
  const visibleMarkers = createMode ? [] : markers;

  return (
    <section className="space-y-4">
      <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
              FIND · SAFE 탐사 단계
            </span>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">우리 동네 안전 탐사 지도</h1>
            <p className="mt-2 text-base leading-7 text-slate-500">
              친구들이 남긴 안전 탐사 내용을 보며, 위험한 곳을 바로 기록해 보세요.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-blue-50 px-4 py-3 text-right">
            <div className="text-sm text-blue-700">우리 반 기록</div>
            <div className="mt-1 text-3xl text-blue-700">{pins.length}</div>
            <div className="text-sm text-blue-700">개의 발견</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {EXPLORER_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="inline-flex items-center gap-2 rounded-full bg-[#eef5ff] px-3 py-2 text-sm text-slate-700"
            >
              <span>{category.mapIcon}</span>
              <span>{category.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={onToggleCreateMode}
            className={`mx-auto flex w-full max-w-sm items-center justify-center gap-3 rounded-[1.4rem] px-6 py-4 text-lg transition ${
              createMode
                ? "bg-[#e7f0ff] text-blue-700 hover:bg-[#dce9ff]"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            <span className="text-xl">{createMode ? "✅" : "📍"}</span>
            {createMode ? "탐사 위치 선택 종료" : "안전 탐사 기록 시작하기"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="relative h-[58dvh] min-h-[360px] max-h-[560px]">
          <NaverMap
            center={mapCenter}
            markers={visibleMarkers}
            height="100%"
            showMyLocationButton
            showSearchButton
            onCenterChange={onCenterChange}
            selectable={createMode}
            onMapClick={createMode ? onMapSelect : undefined}
          />
          {createMode && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-red-400/60" />
                  <div className="relative h-11 w-11 rounded-full bg-white p-1 shadow-md">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-red-500 text-2xl text-white">
                      📍
                    </div>
                  </div>
                </div>
                <p className="rounded-full bg-white/90 px-3 py-1 text-sm text-red-600 shadow-sm">
                  여기를 눌러 기록 시작
                </p>
              </div>
            </div>
          )}
          {createMode && (
            <div className="absolute inset-x-0 top-4 z-10 px-4">
              <div className="mx-auto max-w-sm rounded-2xl border border-blue-200 bg-white/95 px-4 py-3 text-center text-base text-blue-700 shadow-sm">
                지도에서 위치를 한 번 누르면 그 위치로 안전 탐사 기록을 시작합니다.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
