"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import ExplorerGallery from "@/components/explorer/ExplorerGallery";
import { SAFE_CLASS_CODE, getClassRoute } from "@/lib/explorer";
import { getClassCode, getStudentSessionId } from "@/lib/session";
import { useClassPins } from "@/lib/use-class-pins";

export default function ClassGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const classCode = String(params?.code || SAFE_CLASS_CODE);
  const { pins, loading, error } = useClassPins();

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
            <div className="rounded-card bg-[var(--color-safe-soft)] px-3 py-2.5">
              <div className="text-sm text-[var(--color-safe)]">참여 친구</div>
              <div className="mt-1 text-2xl font-bold text-[var(--color-safe)]">{explorerCount}</div>
            </div>
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
    </div>
  );
}
