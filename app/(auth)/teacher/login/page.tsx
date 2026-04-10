"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

    // 환경 변수 체크
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError("Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // 회원가입
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          router.push("/teacher/dashboard");
        }
      } else {
        // 로그인
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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(34,197,94,0.18),transparent_28%),linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:auto,auto,28px_28px,28px_28px]" />
      <div className="relative flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white/92 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.35)] backdrop-blur">
        <h1 className="text-center text-3xl font-black text-slate-900 mb-2">교사 로그인</h1>
        <p className="mb-6 text-center text-sm text-slate-500">SAFE 탐사 지도 운영 페이지</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-3xl border border-gray-300 px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-3xl border border-gray-300 px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-3xl bg-gradient-to-r from-blue-600 to-emerald-500 py-4 font-bold text-white shadow-lg hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "처리 중..." : isSignUp ? "회원가입" : "로그인"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            {isSignUp ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
            홈으로 돌아가기
          </a>
        </div>
      </div>
      </div>
    </div>
  );
}
