"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ExplorerCelebration from "@/components/explorer/ExplorerCelebration";
import ExplorerMapSection from "@/components/explorer/ExplorerMapSection";
import ExplorerPinWizard from "@/components/explorer/ExplorerPinWizard";
import { SAFE_CLASS_CODE, getClassRoute } from "@/lib/explorer";
import { getClassCode, getStudentSessionId } from "@/lib/session";
import { useClassPins } from "@/lib/use-class-pins";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export default function ClassMapPage() {
  const params = useParams();
  const router = useRouter();
  const classCode = String(params?.code || SAFE_CLASS_CODE);
  const { pins, loading, error, reload } = useClassPins({ locationType: "마을" });
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [isCenterInitialized, setIsCenterInitialized] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [draftLocation, setDraftLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [celebration, setCelebration] = useState("");

  useEffect(() => {
    const sessionId = getStudentSessionId();
    const storedClassCode = getClassCode();

    if (!sessionId) {
      router.replace("/student/join");
      return;
    }

    if (storedClassCode && storedClassCode !== classCode) {
      router.replace(getClassRoute(storedClassCode, "map"));
    }
  }, [classCode, router]);

  useEffect(() => {
    if (!isCenterInitialized && pins.length > 0 && pins[0].latitude && pins[0].longitude) {
      setMapCenter({ lat: pins[0].latitude, lng: pins[0].longitude });
      setIsCenterInitialized(true);
    }
  }, [isCenterInitialized, pins]);

  useEffect(() => {
    const timer = celebration
      ? window.setTimeout(() => {
          setCelebration("");
        }, 1800)
      : null;

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [celebration]);

  const summary = useMemo(() => {
    if (loading) {
      return "지도를 준비하는 중이에요...";
    }
    if (error) {
      return error;
    }
    return `${pins.length}개의 위험 핀이 우리 반 지도에 표시되고 있어요.`;
  }, [error, loading, pins.length]);

  return (
    <div className="space-y-4">
      <div className="rounded-[1.8rem] border border-blue-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm tracking-[0.2em] text-blue-600">Map View</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">우리반 안전 탐사 상태</h2>
            <p className="mt-2 text-sm text-slate-500">{summary}</p>
          </div>
          <div className="rounded-[1.4rem] bg-emerald-50 px-4 py-3 text-center">
            <p className="text-xs font-bold text-emerald-700">탐사 상태</p>
            <p className="mt-1 text-lg font-bold text-emerald-600">실시간 공유</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">탐사 지도를 불러오는 중이에요.</p>
        </div>
      ) : (
        <ExplorerMapSection
          pins={pins}
          mapCenter={mapCenter}
          onCenterChange={(lat, lng) => setMapCenter({ lat, lng })}
          onMarkerClick={(pinId) => router.push(`/pin/${pinId}`)}
          createMode={createMode}
          onToggleCreateMode={() => setCreateMode((prev) => !prev)}
          onMapSelect={(lat, lng) => {
            setCreateMode(false);
            setDraftLocation({ lat, lng });
          }}
        />
      )}

      {draftLocation && (
        <ExplorerPinWizard
          location={draftLocation}
          onClose={() => setDraftLocation(null)}
          onSuccess={(message) => {
            setDraftLocation(null);
            reload();
            setCelebration(message);
          }}
        />
      )}

      {celebration && <ExplorerCelebration message={celebration} />}
    </div>
  );
}
