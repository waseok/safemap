"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { setTestStudentSession } from "@/lib/session";

export default function Home() {
  const router = useRouter();

  const handleTestTeacher = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("test_teacher_mode", "true");
    }
    router.push("/teacher/dashboard");
  };

  const handleTestStudent = () => {
    setTestStudentSession();
    // 세션이 저장된 뒤 이동 (테스트 입장이 확실히 인식되도록)
    requestAnimationFrame(() => {
      router.push("/check");
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 bg-gray-50">
      <h1 className="text-4xl font-bold">안전지도 웹앱</h1>
      
      <div className="w-full max-w-md space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-center">일반 모드</h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/teacher/dashboard"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-center"
            >
              교사 입장 (학급 만들기)
            </Link>
            <Link
              href="/student/join"
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-center"
            >
              학급 입장
            </Link>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-center">🧪 테스트 모드</h2>
          <p className="text-sm text-gray-600 mb-4 text-center">
            PIN 번호 없이 바로 확인할 수 있습니다
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleTestTeacher}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
            >
              교사 테스트
            </button>
            <button
              onClick={handleTestStudent}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              학생 테스트
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
