"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@/lib/supabase/client";

interface FeedbackFormProps {
  safetyPinId: string;
}

export default function FeedbackForm({ safetyPinId }: FeedbackFormProps) {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setLoading(true);
      try {
        // 교사 여부 확인
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (cancelled) return;
        setIsTeacher(!!user);

        // 기존 피드백 불러오기
        const res = await fetch(`/api/feedback?safety_pin_id=${safetyPinId}`);
        if (!res.ok || cancelled) return;

        const data = await res.json();
        if (data.feedback) {
          setFeedback(data.feedback.feedback);
        }
      } catch (err) {
        console.error("피드백 로드 오류:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [safetyPinId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setSaving(true);
    setError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          safety_pin_id: safetyPinId,
          feedback: feedback.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "피드백 저장에 실패했습니다.");
      }

      alert("피드백이 저장되었습니다.");
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">로딩 중...</div>;
  }

  if (!isTeacher) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          교사만 피드백을 작성할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          교사 피드백
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="이 안전 문제에 대한 피드백을 작성해주세요"
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={saving || !feedback.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "저장 중..." : "피드백 저장"}
      </button>
    </form>
  );
}
