"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import ClassBottomNav from "@/components/explorer/ClassBottomNav";
import { clearStudentSession, getClassCode, getStudentSessionId } from "@/lib/session";
import { getClassRoute } from "@/lib/explorer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [classCode, setClassCode] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = getStudentSessionId();
    const storedClassCode = getClassCode();

    if (!sessionId && !pathname?.includes("/teacher")) {
      router.push("/student/join");
    } else {
      setIsAuthenticated(true);
      setClassCode(storedClassCode);

      if (storedClassCode && (pathname === "/map" || pathname === "/create" || pathname === "/list")) {
        const nextTab = pathname === "/create" ? "create" : pathname === "/list" ? "gallery" : "map";
        router.replace(getClassRoute(storedClassCode, nextTab));
      }
    }
  }, [router, pathname]);

  const handleLogout = () => {
    clearStudentSession();
    router.push("/");
  };

  if (!isAuthenticated && !pathname?.includes("/teacher")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-600 font-medium">입장 확인 중...</p>
        </div>
      </div>
    );
  }

  if (pathname?.includes("/teacher")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f3f8ff]">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
              <Image src="/logo.png" alt="SAFE" width={34} height={34} className="object-contain" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">SAFE Explorer</p>
              <p className="text-sm font-bold text-slate-800">안전 탐사 지도</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            나가기
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-32 pt-4">{children}</main>
      {classCode && <ClassBottomNav classCode={classCode} />}
    </div>
  );
}
