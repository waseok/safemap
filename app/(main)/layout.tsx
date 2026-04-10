"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getStudentSessionId, clearStudentSession } from "@/lib/session";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const sessionId = getStudentSessionId();
    if (!sessionId && !pathname?.includes("/teacher")) {
      router.push("/student/join");
    } else {
      setIsAuthenticated(true);
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

  const navItems = [
    { href: "/map",     label: "안전 지도",    emoji: "🗺️" },
    { href: "/list",    label: "발견 목록",    emoji: "📋" },
    { href: "/check",   label: "탐험 활동",    emoji: "🔍" },
    { href: "/my-pins", label: "내 기록",      emoji: "📌" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-900 shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center h-14 gap-2 sm:gap-3">
            {/* Logo + title */}
            <Link href="/map" className="flex items-center gap-2 shrink-0 mr-1 sm:mr-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow">
                <Image src="/logo.png" alt="SAFE" width={26} height={26} className="object-contain" />
              </div>
              <span className="text-white font-bold text-sm hidden sm:block tracking-tight whitespace-nowrap">
                안전 탐사 지도
              </span>
            </Link>

            {/* Nav items — left-aligned after logo */}
            <div className="flex gap-0.5 sm:gap-1">
              {navItems.map(({ href, label, emoji }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    pathname === href
                      ? "bg-blue-500 text-white shadow-inner"
                      : "text-blue-200 hover:bg-blue-800 hover:text-white"
                  }`}
                >
                  <span className="text-sm sm:text-base">{emoji}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="text-blue-300 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg hover:bg-blue-800 transition-colors shrink-0"
            >
              나가기
            </button>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
