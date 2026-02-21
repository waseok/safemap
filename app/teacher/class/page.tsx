"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 과거 로컬 테스트용 경로.
// 실제 학급 생성/실제 PIN 발급은 teacher/dashboard에서만 수행합니다.
export default function TeacherClassPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/teacher/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-md p-6 text-center max-w-md">
        <p className="text-gray-700 mb-2">교사 페이지로 이동 중입니다...</p>
        <p className="text-sm text-gray-500">
          실제 학급 PIN은 <span className="font-mono">/teacher/dashboard</span> 에서 생성됩니다.
        </p>
      </div>
    </div>
  );
}

