import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-[var(--color-bg)] px-5 py-10">
      <div className="relative mx-auto w-full max-w-md rounded-panel border border-[var(--color-border)] bg-white px-8 py-12 text-center shadow-sm">
        <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full bg-slate-50 md:h-52 md:w-52">
          <Image
            src="/logo.png"
            alt="SAFE 프로젝트 로고"
            width={160}
            height={160}
            className="object-contain"
            priority
          />
        </div>

        <h1 className="mt-8 text-3xl font-bold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
          안전 탐사 지도
        </h1>
        <p className="mt-3 text-lg leading-8 text-[var(--color-text-secondary)] md:text-xl">
          우리 동네 위험 요소를 찾아 기록하고
          <br />
          함께 해결 방법을 제안해요.
        </p>

        <div className="mt-10 space-y-3">
          <Link
            href="/student/join"
            className="flex w-full items-center justify-center gap-3 rounded-card bg-[var(--color-info)] px-6 py-4 text-lg text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="text-2xl">🎒</span>
            학급 입장
          </Link>

          <Link
            href="/teacher/login"
            className="flex w-full items-center justify-center gap-3 rounded-card border border-[var(--color-border)] bg-white px-6 py-4 text-lg text-[var(--color-text-primary)] transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="text-2xl">👩‍🏫</span>
            교사 로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
