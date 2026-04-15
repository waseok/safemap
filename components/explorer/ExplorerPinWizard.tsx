"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getReverseGeocode } from "@/lib/naver-map";
import { getClassId, getStudentId } from "@/lib/session";
import {
  DANGER_LEVELS,
  SAFETY_AREA_ORDER,
  getExplorerCategoryByDb,
} from "@/lib/explorer";

interface ExplorerPinWizardProps {
  location: { lat: number; lng: number };
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const STEP_TITLES = [
  "1단계 사진 기록",
  "2단계 7대 안전영역 선택",
  "3단계 위험도 평가",
  "4단계 해결 아이디어",
] as const;

const SAFETY_AREA_HELP_TEXT: Record<string, string> = {
  생활안전: "일상생활에서 다치기 쉬운 요소를 기록해요.",
  교통안전: "자동차, 오토바이, 횡단보도 등 교통 위험을 살펴요.",
  응급처치: "응급상황에서 도움이 필요한 요소를 찾아요.",
  "폭력예방 및 신변보호": "신변 보호가 필요한 위험 상황을 기록해요.",
  "약물 및 사이버 중독 예방": "약물, 스마트폰, 사이버 위험을 점검해요.",
  재난안전: "화재, 붕괴, 자연재해와 관련된 위험을 찾아요.",
  직업안전: "공사장, 작업 구역 등 직업 관련 위험을 살펴요.",
};

export default function ExplorerPinWizard({
  location,
  onClose,
  onSuccess,
}: ExplorerPinWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedSafetyArea, setSelectedSafetyArea] = useState<(typeof SAFETY_AREA_ORDER)[number]>("생활안전");
  const [dangerLevel, setDangerLevel] = useState<number>(3);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [proposal, setProposal] = useState("");
  const [question, setQuestion] = useState("");
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const selectedCategory = useMemo(
    () => getExplorerCategoryByDb(selectedSafetyArea),
    [selectedSafetyArea]
  );

  useEffect(() => {
    let mounted = true;
    getReverseGeocode(location.lat, location.lng)
      .then((value) => {
        if (mounted) setAddress(value ?? "");
      })
      .catch(() => {
        if (mounted) setAddress("");
      });
    return () => { mounted = false; };
  }, [location.lat, location.lng]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const goNext = () => {
    if (step === 3 && !title.trim()) {
      setError("친구들이 알아보기 쉬운 제목을 적어주세요.");
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, STEP_TITLES.length - 1));
  };

  const goPrev = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const studentId = getStudentId();
      const classId = getClassId();

      if (!studentId || !classId) {
        throw new Error("세션이 만료되었어요. 다시 입장해 주세요.");
      }

      let imageUrl = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("사진 업로드에 실패했어요.");
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const fullDescription = [
        description.trim(),
        question.trim() ? `\n\n🔍 탐구적 질문: ${question.trim()}` : "",
      ].join("");

      const finalAddress = locationName.trim()
        ? `${locationName.trim()} (${location.lat.toFixed(5)}, ${location.lng.toFixed(5)})`
        : address || null;

      const res = await fetch("/api/pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: classId,
          student_id: studentId,
          location_type: "마을",
          category: selectedSafetyArea,
          title: title.trim(),
          description: fullDescription,
          danger_level: dangerLevel,
          cause: proposal.trim() || null,
          predicted_accident: null,
          latitude: location.lat,
          longitude: location.lng,
          address: finalAddress,
          image_url: imageUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "위험 요소를 저장하지 못했어요.");
      }

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([80, 40, 120]);
      }

      onSuccess("안전 탐험가 뱃지를 획득했어요!");
    } catch (err: any) {
      setError(err.message || "저장 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm">
      <div className="flex h-full items-end justify-center p-0 sm:items-center sm:p-6">
        <div className="animate-sheet-up flex w-full max-w-lg flex-col rounded-t-panel bg-white shadow-xl sm:rounded-panel" style={{ maxHeight: "92dvh" }}>
          <div className="flex-shrink-0 border-b border-[var(--color-border)] px-5 pt-5 pb-4">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-[var(--color-info)]">탐사 기록</p>
                <h2 className="mt-1 text-xl font-bold text-[var(--color-text-primary)]">{STEP_TITLES[step]}</h2>
                <div className="mt-2 flex items-center gap-2">
                  <span className="whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </span>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(event) => setLocationName(event.target.value)}
                    placeholder="위치 이름 (예: 학교 앞)"
                    className="min-w-0 flex-1 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-base text-[var(--color-text-primary)] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--color-info)]"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors hover:bg-slate-50"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2">
              {STEP_TITLES.map((item, index) => (
                <div key={item} className="flex-1">
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      index <= step ? "bg-[var(--color-info)]" : "bg-slate-100"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">

          {step === 0 && (
            <div className="space-y-4">
              <div className="rounded-panel border border-dashed border-[var(--color-border)] bg-slate-50 p-4">
                {imagePreview ? (
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="현장 사진 미리보기"
                      className="h-48 w-full rounded-card object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="w-full rounded-card bg-[var(--color-danger-soft)] px-4 py-3 text-base text-[var(--color-danger)]"
                    >
                      사진 다시 고르기
                    </button>
                  </div>
                ) : (
                  <div className="flex min-h-48 flex-col items-center justify-center rounded-card bg-white text-center">
                    <span className="text-5xl">📸</span>
                    <p className="mt-3 text-xl text-[var(--color-text-primary)]">현장 사진을 올리면 더 좋아요</p>
                    <p className="mt-2 text-base text-[var(--color-text-secondary)]">
                      사진 없이 건너뛰고 다음 단계로 바로 넘어갈 수도 있어요.
                    </p>
                  </div>
                )}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => cameraInputRef.current?.click()} className="rounded-card bg-[var(--color-info)] px-4 py-4 text-lg text-white">
                  카메라로 찍기
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-card border border-[var(--color-border)] bg-white px-4 py-4 text-lg text-[var(--color-text-primary)]">
                  앨범에서 고르기
                </button>
              </div>
              {!imagePreview && (
                <button type="button" onClick={goNext} className="w-full rounded-card border border-[var(--color-border)] bg-white px-4 py-3 text-base text-[var(--color-text-secondary)]">
                  사진 건너뛰고 다음 단계로
                </button>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2.5">
              {SAFETY_AREA_ORDER.map((areaName) => {
                const area = getExplorerCategoryByDb(areaName);
                const active = areaName === selectedSafetyArea;
                return (
                  <button
                    key={areaName}
                    type="button"
                    onClick={() => setSelectedSafetyArea(areaName)}
                    className={`w-full rounded-card border p-4 text-left transition-colors ${
                      active
                        ? "border-[var(--color-info)] bg-[var(--color-info-soft)]"
                        : "border-[var(--color-border)] bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card text-2xl text-white"
                        style={{ backgroundColor: area.accentColor }}
                      >
                        {area.mapIcon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-lg text-[var(--color-text-primary)]">{areaName}</span>
                        <p className="mt-0.5 text-base text-[var(--color-text-secondary)]">
                          {SAFETY_AREA_HELP_TEXT[areaName]}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-panel border border-[var(--color-border)] bg-slate-50 p-4">
                <p className="text-base text-[var(--color-text-secondary)]">선택한 위험 종류</p>
                <div className="mt-3 flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-card text-2xl text-white"
                    style={{ backgroundColor: selectedCategory.accentColor }}
                  >
                    {selectedCategory.mapIcon}
                  </div>
                  <div>
                    <p className="text-xl text-[var(--color-text-primary)]">{selectedSafetyArea}</p>
                    <p className="text-base text-[var(--color-text-secondary)]">{SAFETY_AREA_HELP_TEXT[selectedSafetyArea]}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {DANGER_LEVELS.map((item) => {
                  const active = item.value === dangerLevel;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setDangerLevel(item.value)}
                      className={`rounded-card border px-2 py-3 text-center transition-colors ${
                        active
                          ? "border-[var(--color-danger)] bg-[var(--color-danger-soft)]"
                          : "border-[var(--color-border)] bg-white"
                      }`}
                    >
                      <div className="text-3xl">{item.emoji}</div>
                      <div className="mt-1 text-sm text-[var(--color-text-secondary)]">{item.value}단계</div>
                    </button>
                  );
                })}
              </div>
              <p className="rounded-card bg-slate-50 px-4 py-3 text-base text-[var(--color-text-secondary)]">
                {DANGER_LEVELS.find((item) => item.value === dangerLevel)?.label}
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-lg text-[var(--color-text-primary)]">한 줄 제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="예: 골목 입구의 신호등이 안 보여요"
                  className="w-full rounded-card border border-[var(--color-border)] px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-info)]"
                />
              </div>
              <div>
                <label className="mb-2 block text-lg text-[var(--color-text-primary)]">무엇을 발견했나요?</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  placeholder="친구들이 읽고 바로 이해할 수 있게 자세히 적어주세요."
                  className="w-full rounded-card border border-[var(--color-border)] px-4 py-4 text-lg leading-8 focus:outline-none focus:ring-2 focus:ring-[var(--color-info)]"
                />
              </div>
              <div>
                <label className="mb-2 block text-lg text-[var(--color-text-primary)]">해결 방법을 제안해 볼까요?</label>
                <textarea
                  value={proposal}
                  onChange={(event) => setProposal(event.target.value)}
                  rows={3}
                  placeholder="예: 안내 표지판을 더 크게 만들고, 선생님이나 구청에 알려서 빨리 고치면 좋아요."
                  className="w-full rounded-card border border-[var(--color-border)] px-4 py-4 text-lg leading-8 focus:outline-none focus:ring-2 focus:ring-[var(--color-info)]"
                />
              </div>
              <div>
                <label className="mb-2 block text-lg text-[var(--color-text-primary)]">
                  🔍 탐구적 질문 만들기
                </label>
                <p className="mb-3 text-base text-[var(--color-text-secondary)]">
                  이 위험에 대해 더 알아보고 싶은 것을 질문으로 만들어 보세요.
                </p>
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  rows={2}
                  placeholder="예: 이 횡단보도에서 사고가 자주 나는 이유는 무엇일까?"
                  className="w-full rounded-card border border-[var(--color-border)] px-4 py-4 text-lg leading-8 focus:outline-none focus:ring-2 focus:ring-[var(--color-info)]"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-card bg-[var(--color-danger-soft)] px-4 py-3 text-base text-[var(--color-danger)]">
              {error}
            </div>
          )}
          </div>

          <div className="flex-shrink-0 border-t border-[var(--color-border)] px-5 pb-5 pt-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={step === 0 ? onClose : goPrev}
                className="flex-1 rounded-card border border-[var(--color-border)] bg-white px-4 py-4 text-lg text-[var(--color-text-secondary)]"
              >
                {step === 0 ? "닫기" : "이전"}
              </button>
              {step < STEP_TITLES.length - 1 ? (
                <button type="button" onClick={goNext} className="flex-1 rounded-card bg-[var(--color-info)] px-4 py-4 text-lg text-white">
                  다음
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="flex-1 rounded-card bg-[var(--color-info)] px-4 py-4 text-lg text-white disabled:opacity-50"
                >
                  {loading ? "저장 중..." : "탐사 기록 완료"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
