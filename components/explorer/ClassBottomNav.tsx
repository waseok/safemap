"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getClassRoute } from "@/lib/explorer";

interface ClassBottomNavProps {
  classCode: string;
}

const NAV_ITEMS = [
  { key: "map", label: "지도 보기", icon: "🗺️" },
  { key: "create", label: "핀 등록", icon: "➕" },
  { key: "gallery", label: "우리반 갤러리", icon: "🖼️" },
] as const;

export default function ClassBottomNav({ classCode }: ClassBottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+0.9rem)]">
      <nav className="mx-auto flex max-w-xl items-center justify-between rounded-[2rem] border border-slate-200 bg-white/95 p-2 shadow-[0_12px_40px_rgba(15,23,42,0.18)] backdrop-blur">
        {NAV_ITEMS.map((item) => {
          const href = getClassRoute(classCode, item.key);
          const active = pathname === href;

          return (
            <Link
              key={item.key}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[1.3rem] px-2 py-3 text-[11px] font-bold transition ${
                active
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
