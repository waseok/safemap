"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getClassRoute } from "@/lib/explorer";

interface ClassBottomNavProps {
  classCode: string;
}

const NAV_ITEMS = [
  { key: "map", label: "탐사 지도", icon: "🗺️" },
  { key: "create", label: "위험 기록", icon: "🧭" },
  { key: "gallery", label: "탐사 기록", icon: "📚" },
] as const;

export default function ClassBottomNav({ classCode }: ClassBottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
      <nav className="mx-auto flex max-w-xl items-center justify-between rounded-panel border border-[var(--color-border)] bg-white/95 p-1.5 shadow-lg backdrop-blur-sm">
        {NAV_ITEMS.map((item) => {
          const href = getClassRoute(classCode, item.key);
          const active = pathname === href;

          return (
            <Link
              key={item.key}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-card px-2 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-[var(--color-info)] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-slate-50"
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
