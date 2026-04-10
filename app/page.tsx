import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-800 to-blue-600 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 text-5xl opacity-10 select-none rotate-12">🗺️</div>
      <div className="absolute top-20 right-12 text-4xl opacity-10 select-none -rotate-6">📍</div>
      <div className="absolute bottom-16 left-16 text-4xl opacity-10 select-none rotate-6">🧭</div>
      <div className="absolute bottom-20 right-10 text-5xl opacity-10 select-none -rotate-12">🔍</div>

      {/* Logo */}
      <div className="mb-8 relative">
        <div className="w-44 h-44 md:w-52 md:h-52 bg-white rounded-full flex items-center justify-center shadow-2xl ring-4 ring-blue-300/40">
          <Image
            src="/logo.png"
            alt="SAFE 프로젝트 로고"
            width={160}
            height={160}
            className="object-contain p-2"
            priority
          />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-3 drop-shadow-lg tracking-tight">
        안전 탐사 웹페이지
      </h1>

      {/* Subtitle */}
      <p className="text-blue-200 text-base md:text-lg text-center mb-10 max-w-sm leading-relaxed">
        우리 동네 안전 위험을 직접 발견하고<br />
        함께 기록하는 안전 탐험가가 되어요!
      </p>

      {/* Entry buttons */}
      <div className="w-full max-w-xs space-y-4">
        <Link
          href="/teacher/dashboard"
          className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-white text-blue-900 rounded-2xl text-base font-bold shadow-xl hover:bg-blue-50 transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="text-xl">👩‍🏫</span>
          교사 입장
        </Link>

        <Link
          href="/student/join"
          className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-green-500 text-white rounded-2xl text-base font-bold shadow-xl hover:bg-green-400 transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="text-xl">🎒</span>
          학급 입장
        </Link>
      </div>

      {/* Footer */}
      <p className="mt-12 text-blue-300 text-xs text-center">
        SAFE 프로젝트 · 안전문해력 향상 프로그램
      </p>
    </div>
  );
}
