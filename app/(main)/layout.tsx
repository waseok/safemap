"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import ClassBottomNav from "@/components/explorer/ClassBottomNav";
import { clearStudentSession, getClassCode, getStudentSessionId, isReviewSession } from "@/lib/session";
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
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    const sessionId = getStudentSessionId();
    const storedClassCode = getClassCode();

    if (!sessionId && !pathname?.includes("/teacher")) {
      router.push("/student/join");
    } else {
      setIsAuthenticated(true);
      setClassCode(storedClassCode);
      setReviewMode(isReviewSession());

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
      <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-info)] border-t-transparent" />
          <p className="text-base text-[var(--color-text-secondary)]">입장 확인 중...</p>
        </div>
      </div>
    );
  }

  if (pathname?.includes("/teacher")) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-dvh bg-[var(--color-bg)]">
      <div
        className="pointer-events-none fixed inset-0 z-0 hidden bg-white bg-[url('/main-bg.png')] bg-cover bg-center bg-no-repeat md:block"
        aria-hidden
      />
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/90 backdrop-blur-sm md:border-transparent md:bg-white/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
              <Image src="/logo.png" alt="SAFE" width={32} height={32} className="object-contain" />
            </div>
            <div>
              <p className="text-xs tracking-[0.15em] text-[var(--color-info)]">SAFE Explorer</p>
              <p className="text-base text-[var(--color-text-primary)]">안전 탐사 지도</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-card border border-[var(--color-border)] bg-white px-4 py-2 text-base text-[var(--color-text-secondary)] transition-colors hover:bg-slate-50"
          >
            나가기
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-28 pt-5 md:max-w-3xl">
        {reviewMode && (
          <div
            className="mb-4 rounded-card border border-[var(--color-caution)] bg-[var(--color-caution-soft)] px-4 py-3 text-base text-[var(--color-text-primary)]"
            role="status"
          >
            <span className="font-bold">🔍 심사·체험 모드</span>
            <span className="mt-1 block text-sm text-[var(--color-text-secondary)]">
              PIN 없이 체험 학급에 입장했습니다. 지도·탐사 기록·갤러리를 자유롭게 둘러보세요.
            </span>
          </div>
        )}
        {children}
      </main>
      {classCode && <ClassBottomNav classCode={classCode} />}
    </div>
  );
}
