import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#edf6ff] px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[size:26px_26px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl flex-col items-center justify-center rounded-[2rem] border border-blue-100 bg-white px-7 py-10 text-center shadow-sm">
        <div className="flex h-36 w-36 items-center justify-center rounded-full bg-[#f5faff]">
          <Image
            src="/logo.png"
            alt="SAFE 프로젝트 로고"
            width={118}
            height={118}
            className="object-contain"
            priority
          />
        </div>

        <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
          안전 탐사 지도
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600 md:text-lg">
          우리 동네 위험 요소를 찾아 기록하고
          <br />
          함께 해결 방법을 제안해요.
        </p>

        <div className="mt-10 w-full space-y-3">
          <Link
            href="/student/join"
            className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-blue-500 px-6 py-4 text-base font-black text-white transition hover:bg-blue-600"
          >
            <span className="text-xl">🎒</span>
            학급 입장
          </Link>

          <Link
            href="/teacher/login"
            className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-[#e7f1ff] px-6 py-4 text-base font-bold text-blue-700 transition hover:bg-[#d8e8ff]"
          >
            <span className="text-xl">👩‍🏫</span>
            교사 로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
