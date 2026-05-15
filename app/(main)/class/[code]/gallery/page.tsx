"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ExplorerGallery from "@/components/explorer/ExplorerGallery";
import { SAFE_CLASS_CODE, getClassRoute } from "@/lib/explorer";
import { getClassCode, getStudentSessionId } from "@/lib/session";
import { useClassPins } from "@/lib/use-class-pins";

interface Participant {
  studentId: string;
  name: string;
  pinCount: number;
}

export default function ClassGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const classCode = String(params?.code || SAFE_CLASS_CODE);
  const { pins, loading, error } = useClassPins();
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    const sessionId = getStudentSessionId();
    const storedClassCode = getClassCode();

    if (!sessionId) {
      router.replace("/student/join");
      return;
    }

    if (storedClassCode && storedClassCode !== classCode) {
      router.replace(getClassRoute(storedClassCode, "gallery"));
    }
  }, [classCode, router]);

  const explorerCount = useMemo(() => {
    return new Set(pins.map((pin) => pin.student_id)).size;
  }, [pins]);

  const participants = useMemo<Participant[]>(() => {
    const byStudent = new Map<string, Participant>();

    pins.forEach((pin) => {
      const existing = byStudent.get(pin.student_id);
      if (existing) {
        existing.pinCount += 1;
        return;
      }

      byStudent.set(pin.student_id, {
        studentId: pin.student_id,
        name: pin.students?.name || "이름 없음",
        pinCount: 1,
      });
    });

    return Array.from(byStudent.values()).sort(
      (a, b) => b.pinCount - a.pinCount || a.name.localeCompare(b.name, "ko")
    );
  }, [pins]);

  return (
    <div className="space-y-4">
      <section className="rounded-panel border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--color-safe)]">안전 탐사 기록</p>
            <h1 className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">친구들이 남긴 안전 탐사 내용</h1>
            <p className="mt-2 text-base text-[var(--color-text-secondary)]">
              사진, 위험도, 해결 아이디어를 한눈에 모아 보며 우리 동네를 더 안전하게 바꿔 보세요.
            </p>
          </div>
          <div className="grid min-w-[120px] grid-cols-1 gap-2 text-center">
            <div className="rounded-card bg-[var(--color-info-soft)] px-3 py-2.5">
              <div className="text-sm text-[var(--color-info)]">전체 핀</div>
              <div className="mt-1 text-2xl font-bold text-[var(--color-info)]">{pins.length}</div>
            </div>
            <button
              type="button"
              onClick={() => setShowParticipants(true)}
              disabled={explorerCount === 0}
              className="rounded-card bg-[var(--color-safe-soft)] px-3 py-2.5 transition-colors hover:bg-green-100 disabled:cursor-default disabled:opacity-60"
              aria-label="참여 친구 목록 보기"
            >
              <div className="text-sm text-[var(--color-safe)]">참여 친구</div>
              <div className="mt-1 text-2xl font-bold text-[var(--color-safe)]">{explorerCount}</div>
              <div className="mt-1 text-xs text-[var(--color-safe)]">눌러서 확인</div>
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-panel bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-safe-soft)] border-t-[var(--color-safe)]" />
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">친구들의 기록을 불러오는 중이에요.</p>
        </div>
      ) : error ? (
        <div className="rounded-panel bg-[var(--color-danger-soft)] p-5 text-base text-[var(--color-danger)]">
          {error}
        </div>
      ) : (
        <ExplorerGallery pins={pins} />
      )}

      {showParticipants && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
          onClick={() => setShowParticipants(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-panel bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="participants-title"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="participants-title" className="text-xl font-bold text-[var(--color-text-primary)]">
                  참여 친구
                </h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  기록을 올린 친구 {participants.length}명
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowParticipants(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-slate-50"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <ul className="max-h-[50vh] space-y-2 overflow-y-auto">
              {participants.map((participant) => (
                <li
                  key={participant.studentId}
                  className="flex items-center justify-between rounded-card border border-[var(--color-border)] bg-slate-50 px-4 py-3"
                >
                  <span className="font-medium text-[var(--color-text-primary)]">{participant.name}</span>
                  <span className="text-sm text-[var(--color-text-secondary)]">기록 {participant.pinCount}개</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
