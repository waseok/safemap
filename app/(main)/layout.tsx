"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
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
    // 테스트 세션 포함해서 세션이 있으면 입장 처리
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

  // 세션 확인 중일 때 잠깐 로딩 표시 (테스트 입장 시 빈 화면 방지)
  if (!isAuthenticated && !pathname?.includes("/teacher")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">입장 확인 중...</p>
      </div>
    );
  }

  if (pathname?.includes("/teacher")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/map"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/map"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                지도 보기
              </Link>
              <Link
                href="/list"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/list"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                리스트 보기
              </Link>
              <Link
                href="/check"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/check"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                안전점검
              </Link>
              <Link
                href="/my-pins"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/my-pins"
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                내 핀
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
