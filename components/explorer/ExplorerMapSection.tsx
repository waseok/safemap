"use client";

import NaverMap from "@/components/Map/NaverMap";
import type { SafetyPin } from "@/types";
import { EXPLORER_CATEGORIES } from "@/lib/explorer";

interface ExplorerMapSectionProps {
  pins: (SafetyPin & { students?: { name: string } | null })[];
  mapCenter: { lat: number; lng: number };
  onCenterChange: (lat: number, lng: number) => void;
  onMarkerClick: (pinId: string) => void;
  onCreateClick: () => void;
}

export default function ExplorerMapSection({
  pins,
  mapCenter,
  onCenterChange,
  onMarkerClick,
  onCreateClick,
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
      <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-emerald-950 p-5 text-white shadow-[0_20px_40px_rgba(15,23,42,0.25)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-blue-100">
              FIND · SAFE 탐사 단계
            </span>
            <h1 className="mt-3 text-2xl font-black">우리 동네 안전 탐사 지도</h1>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              친구들이 남긴 위험 핀을 보며, 지금 서 있는 자리도 바로 기록해 보세요.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-white/10 px-4 py-3 text-right backdrop-blur">
            <div className="text-xs text-blue-100">우리 반 기록</div>
            <div className="mt-1 text-3xl font-black">{pins.length}</div>
            <div className="text-xs text-blue-100">개의 발견</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {EXPLORER_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white"
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
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-4 z-10 px-4">
            <button
              type="button"
              onClick={onCreateClick}
              className="mx-auto flex w-full max-w-sm items-center justify-center gap-3 rounded-[1.6rem] bg-gradient-to-r from-blue-600 to-emerald-500 px-6 py-4 text-base font-black text-white shadow-[0_16px_30px_rgba(37,99,235,0.35)] transition hover:scale-[1.01]"
            >
              <span className="text-xl">📍</span>
              지금 위치로 위험 핀 등록하기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
