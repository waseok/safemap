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
      <section className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">핀 등록</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">지금 서 있는 자리에서 바로 기록하기</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          GPS로 현재 위치를 가져와 자동으로 핀을 준비했어요. 사진과 해결 아이디어만 채우면 끝이에요.
        </p>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-800">현재 위치 미리보기</p>
            <p className="mt-1 text-xs text-slate-500">
              GPS가 잡히지 않으면 서울 시청 기준 위치가 보일 수 있어요.
            </p>
          </div>
          <button
            type="button"
            onClick={locateCurrentPosition}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            다시 찾기
          </button>
        </div>

        <div className="overflow-hidden rounded-[1.6rem] border border-slate-200">
          <NaverMap
            center={currentLocation}
            height="360px"
            markers={[
              {
                id: "draft-location",
                lat: currentLocation.lat,
                lng: currentLocation.lng,
                title: "현재 기록할 위치",
                category: "생활안전",
                description: "여기에 새 탐사 핀이 등록됩니다.",
              },
            ]}
            showMyLocationButton
            showSearchButton
            onCenterChange={(lat, lng) => setCurrentLocation({ lat, lng })}
          />
        </div>

        <div className="mt-4 rounded-[1.5rem] bg-slate-50 p-4 text-sm text-slate-600">
          {locating
            ? "현재 위치를 찾는 중이에요..."
            : locationError || "위치를 확인했다면 아래 버튼으로 탐사 기록을 시작하세요."}
        </div>

        <button
          type="button"
          onClick={() => setShowWizard(true)}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-[1.6rem] bg-blue-500 px-6 py-4 text-base font-black text-white hover:bg-blue-600"
        >
          <span className="text-xl">📝</span>
          이 위치로 탐사 기록 시작
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
