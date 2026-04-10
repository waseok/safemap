import Link from "next/link";
import Image from "next/image";
import { SAFE_CLASS_CODE } from "@/lib/explorer";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(59,130,246,0.22),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(34,197,94,0.2),transparent_28%),linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:auto,auto,28px_28px,28px_28px]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,transparent_0,transparent_62%,rgba(255,255,255,0.08)_62%,rgba(255,255,255,0.08)_64%,transparent_64%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-center gap-10 lg:flex-row lg:items-center">
        <section className="flex-1 text-white">
          <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-blue-100">
            SAFE Project · Find
          </span>
          <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
            초등학생을 위한
            <br />
            <span className="bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent">
              안전 탐사 지도
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 md:text-lg">
            위험한 곳을 발견하고, 사진으로 기록하고, 해결 방법까지 제안하는 모바일 우선 SAFE 탐험 웹앱입니다.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-200">
            <span className="rounded-full bg-white/10 px-4 py-2">🗺️ 지도 기반 탐사</span>
            <span className="rounded-full bg-white/10 px-4 py-2">📍 GPS 자동 위치</span>
            <span className="rounded-full bg-white/10 px-4 py-2">🖼️ 우리반 갤러리</span>
          </div>
        </section>

        <section className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white/92 p-7 shadow-[0_24px_60px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-blue-100">
              <Image
                src="/logo.png"
                alt="SAFE 프로젝트 로고"
                width={60}
                height={60}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-sm font-bold text-blue-600">SAFE 탐험 시작</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">우리 반 코드 {SAFE_CLASS_CODE}</h2>
            </div>
          </div>

          <div className="mt-6 rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-emerald-50 p-4">
            <p className="text-sm font-semibold text-slate-700">오늘의 미션</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              스마트폰으로 현장을 탐사하고, 위험한 곳을 발견하면 바로 핀으로 남겨 보세요.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/student/join"
              className="flex w-full items-center justify-center gap-3 rounded-[1.6rem] bg-gradient-to-r from-blue-600 to-emerald-500 px-6 py-4 text-base font-black text-white shadow-lg transition hover:scale-[1.01]"
            >
              <span className="text-xl">🎒</span>
              학급 입장
            </Link>

            <Link
              href="/teacher/login"
              className="flex w-full items-center justify-center gap-3 rounded-[1.6rem] bg-slate-100 px-6 py-4 text-base font-bold text-slate-700 transition hover:bg-slate-200"
            >
              <span className="text-xl">👩‍🏫</span>
              교사 로그인
            </Link>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            SAFE 프로젝트 · 신뢰의 파란색과 탐사의 초록색으로 만든 안전 탐사 경험
          </p>
        </section>
      </div>
    </div>
  );
}
