"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getClassRoute } from "@/lib/explorer";
import { clearStudentSession, setStudentSession } from "@/lib/session";

export default function ReviewEntryPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function enterReview() {
      clearStudentSession();

      try {
        const res = await fetch("/api/student/review-join", { method: "POST" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "심사용 입장에 실패했습니다.");
        }

        setStudentSession({
          sessionId: data.sessionId,
          studentId: data.studentId,
          classId: data.classId,
          classCode: data.classCode,
          studentName: data.studentName,
          isReview: true,
        });

        if (!cancelled) {
          router.replace(getClassRoute(data.classCode, "map"));
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setStatus("error");
          setError(err instanceof Error ? err.message : "심사용 입장에 실패했습니다.");
        }
      }
    }

    enterReview();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status === "error") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg)] px-4 py-8">
        <div className="w-full max-w-md rounded-panel border border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-bold text-[var(--color-danger)]">심사용 입장 실패</p>
          <p className="mt-3 text-base text-[var(--color-text-secondary)]">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-6 w-full rounded-card border border-[var(--color-border)] bg-white py-3 text-base text-[var(--color-text-secondary)] hover:bg-slate-50"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[var(--color-bg)] px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
        <Image src="/logo.png" alt="SAFE" width={48} height={48} className="object-contain" />
      </div>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-info)] border-t-transparent" />
      <p className="text-base text-[var(--color-text-secondary)]">심사용 체험 학급에 입장하는 중이에요…</p>
    </div>
  );
}
