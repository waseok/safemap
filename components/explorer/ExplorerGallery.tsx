"use client";

import { useRouter } from "next/navigation";
import type { SafetyPin } from "@/types";
import { getDangerMeta, getExplorerCategoryByDb } from "@/lib/explorer";

interface ExplorerGalleryProps {
  pins: (SafetyPin & { students?: { name: string } | null })[];
}

export default function ExplorerGallery({ pins }: ExplorerGalleryProps) {
  const router = useRouter();

  if (pins.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="text-5xl">🧭</div>
        <p className="mt-4 text-lg font-bold text-slate-900">아직 탐사 기록이 없어요</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          첫 번째 위험 요소를 등록해서 우리 반 안전 지도를 채워 보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {pins.map((pin) => {
        const category = getExplorerCategoryByDb(pin.category);
        const danger = getDangerMeta(pin.danger_level);

        return (
          <button
            key={pin.id}
            type="button"
            onClick={() => router.push(`/pin/${pin.id}`)}
            className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {pin.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pin.image_url} alt={pin.title} className="h-48 w-full object-cover" />
            ) : (
              <div
                className="flex h-40 items-center justify-center text-5xl text-white"
                style={{ backgroundColor: category.accentColor }}
              >
                {category.mapIcon}
              </div>
            )}

            <div className="space-y-3 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${category.surfaceClassName} ${category.textClassName}`}
                >
                  {category.badgeIcon} {category.label}
                </span>
                {danger && (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                    {danger.emoji} {danger.value}단계
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">{pin.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {pin.description || "탐사 기록을 눌러 자세한 내용을 확인해 보세요."}
                </p>
              </div>

              <div className="rounded-[1.4rem] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">해결 아이디어</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {pin.cause || "아직 해결 아이디어를 적지 않았어요."}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>기록자: {pin.students?.name || "우리 반 친구"}</span>
                <span>{new Date(pin.created_at).toLocaleDateString("ko-KR")}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
