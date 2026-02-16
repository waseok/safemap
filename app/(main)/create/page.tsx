"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PinForm from "@/components/PinForm";
import { getStudentSessionId } from "@/lib/session";

export default function CreatePinPage() {
  const router = useRouter();

  useEffect(() => {
    const sessionId = getStudentSessionId();
    if (!sessionId) {
      router.push("/student/join");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">안전 문제 발견하기</h1>
          <PinForm />
        </div>
      </div>
    </div>
  );
}
