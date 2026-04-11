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
      <section className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm tracking-[0.2em] text-emerald-600">안전 탐사 기록</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">친구들이 남긴 안전 탐사 내용</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              사진, 위험도, 해결 아이디어를 한눈에 모아 보며 우리 동네를 더 안전하게 바꿔 보세요.
            </p>
          </div>
          <div className="grid min-w-[132px] grid-cols-1 gap-2 text-center">
            <div className="rounded-[1.4rem] bg-blue-50 px-3 py-3">
              <div className="text-xs font-bold text-blue-600">전체 핀</div>
              <div className="mt-1 text-2xl font-bold text-blue-700">{pins.length}</div>
            </div>
            <div className="rounded-[1.4rem] bg-emerald-50 px-3 py-3">
              <div className="text-xs font-bold text-emerald-600">참여 친구</div>
              <div className="mt-1 text-2xl font-bold text-emerald-700">{explorerCount}</div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">친구들의 기록을 불러오는 중이에요.</p>
        </div>
      ) : error ? (
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-600">
          {error}
        </div>
      ) : (
        <ExplorerGallery pins={pins} />
      )}
    </div>
  );
}
