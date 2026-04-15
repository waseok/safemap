"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NaverMap from "@/components/Map/NaverMap";
import ExplorerCelebration from "@/components/explorer/ExplorerCelebration";
import ExplorerPinWizard from "@/components/explorer/ExplorerPinWizard";
import { SAFE_CLASS_CODE, getClassRoute } from "@/lib/explorer";
import { getClassCode, getStudentSessionId } from "@/lib/session";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export default function ClassCreatePage() {
  const params = useParams();
  const router = useRouter();
  const classCode = String(params?.code || SAFE_CLASS_CODE);
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_CENTER);
  const [locating, setLocating] = useState(true);
  const [locationError, setLocationError] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [celebration, setCelebration] = useState("");

  const locateCurrentPosition = useCallback(() => {
    setLocating(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocating(false);
      setLocationError("이 기기에서는 GPS를 사용할 수 없어요.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setLocationError("현재 위치를 가져오지 못했어요. 위치 권한을 확인해 주세요.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    const sessionId = getStudentSessionId();
    const storedClassCode = getClassCode();

    if (!sessionId) {
      router.replace("/student/join");
      return;
    }

    if (storedClassCode && storedClassCode !== classCode) {
      router.replace(getClassRoute(storedClassCode, "create"));
      return;
    }

    locateCurrentPosition();
  }, [classCode, locateCurrentPosition, router]);

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

  return (
    <div className="space-y-4">
      <section className="rounded-panel border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <p className="text-sm text-[var(--color-info)]">안전 탐사 기록</p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">지금 서 있는 자리에서 바로 기록하기</h1>
        <p className="mt-2 text-base leading-7 text-[var(--color-text-secondary)]">
          GPS로 현재 위치를 가져와 자동으로 핀을 준비했어요. 사진과 해결 아이디어만 채우면 끝이에요.
        </p>
      </section>

      <section className="rounded-panel border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-base text-[var(--color-text-primary)]">현재 위치 미리보기</p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              GPS가 잡히지 않으면 서울 시청 기준 위치가 보일 수 있어요.
            </p>
          </div>
          <button
            type="button"
            onClick={locateCurrentPosition}
            className="rounded-card border border-[var(--color-border)] bg-white px-4 py-2 text-base text-[var(--color-text-secondary)] transition-colors hover:bg-slate-50"
          >
            다시 찾기
          </button>
        </div>

        <div className="relative overflow-hidden rounded-panel border border-[var(--color-border)]">
          <NaverMap
            center={currentLocation}
            height="360px"
            markers={[]}
            showMyLocationButton
            showSearchButton
            onCenterChange={(lat, lng) => setCurrentLocation({ lat, lng })}
          />
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-[var(--color-danger)]/40" />
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white p-1 shadow-md">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--color-danger)] text-2xl text-white">
                    📍
                  </div>
                </div>
              </div>
              <p className="rounded-md bg-white/90 px-3 py-1 text-sm text-[var(--color-danger)] shadow-sm">
                이 위치에 기록됩니다
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-card bg-slate-50 p-4 text-base text-[var(--color-text-secondary)]">
          {locating
            ? "📡 현재 위치를 찾는 중이에요..."
            : locationError ||
              `📍 이 위치(${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)})에 탐사 기록이 남습니다.`}
        </div>

        <button
          type="button"
          onClick={() => setShowWizard(true)}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-card bg-[var(--color-info)] px-6 py-5 text-xl text-white transition-colors hover:bg-blue-700"
        >
          <span className="text-2xl">📝</span>
          이 위치로 안전 탐사 기록 시작
        </button>
      </section>

      {showWizard && (
        <ExplorerPinWizard
          location={currentLocation}
          onClose={() => setShowWizard(false)}
          onSuccess={(message) => {
            setShowWizard(false);
            setCelebration(message);
            window.setTimeout(() => {
              router.push(getClassRoute(classCode, "gallery"));
            }, 900);
          }}
        />
      )}

      {celebration && <ExplorerCelebration message={celebration} />}
    </div>
  );
}
