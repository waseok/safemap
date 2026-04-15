"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClientComponentClient } from "@/lib/supabase/client";

export default function TeacherLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError("Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          router.push("/teacher/dashboard");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          router.push("/teacher/dashboard");
        }
      }
    } catch (err: any) {
      console.error("로그인 오류:", err);
      setError(err.message || "오류가 발생했습니다. Supabase 설정을 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="w-full max-w-md rounded-panel border border-[var(--color-border)] bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-50">
            <Image src="/logo.png" alt="SAFE 로고" width={96} height={96} className="object-contain" />
          </div>
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold text-[var(--color-text-primary)]">교사 로그인</h1>
        <p className="mb-6 text-center text-base text-[var(--color-text-secondary)]">SAFE 탐사 지도 운영 페이지</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-base text-[var(--color-text-secondary)]">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-card border border-[var(--color-border)] px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-info)]"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-base text-[var(--color-text-secondary)]">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-card border border-[var(--color-border)] px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-info)]"
            />
          </div>

          {error && (
            <div className="rounded-card bg-[var(--color-danger-soft)] px-4 py-3 text-base text-[var(--color-danger)]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-card bg-[var(--color-info)] py-4 text-lg text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "처리 중..." : isSignUp ? "회원가입" : "로그인"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-base text-[var(--color-info)] hover:underline"
          >
            {isSignUp ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-base text-[var(--color-text-secondary)] hover:text-[var(--color-info)]">
            홈으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
