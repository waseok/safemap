"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import NaverMap from "@/components/Map/NaverMap";
import EducationLinks from "@/components/EducationLinks";
import { getStudentSessionId } from "@/lib/session";
import type { SafetyPin, SafetyCategory } from "@/types";

interface FeedbackData {
  id: string;
  feedback: string;
  created_at: string;
}

export default function PinDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pinId = params.id as string;
  const [pin, setPin] = useState<(SafetyPin & { students: { name: string } }) | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);

  // 수정 모드
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStudentName, setEditStudentName] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sessionId = getStudentSessionId();
    if (!sessionId) {
      router.push("/student/join");
      return;
    }
    loadPin();
    loadFeedbacks();
  }, [pinId, router]);

  const loadPin = async () => {
    try {
      const res = await fetch(`/api/pins/${pinId}`);
      if (!res.ok) throw new Error("핀 로드 실패");
      const data = await res.json();
      setPin(data.pin);
    } catch (err) {
      console.error("핀 로드 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadFeedbacks = async () => {
    try {
      const res = await fetch(`/api/feedback?safety_pin_id=${pinId}`);
      if (!res.ok) return;
      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
    } catch (err) {
      console.error("피드백 로드 오류:", err);
    }
  };

  const startEditing = () => {
    if (!pin) return;
    setEditTitle(pin.title);
    setEditDescription(pin.description || "");
    setEditStudentName(pin.students?.name || "");
    setEditImageUrl(pin.image_url || "");
    setImagePreview(pin.image_url || "");
    setEditing(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 미리보기
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // 업로드
    const formData = new FormData();
    formData.append("file", file);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
    if (uploadRes.ok) {
      const uploadData = await uploadRes.json();
      setEditImageUrl(uploadData.url);
    } else {
      alert("이미지 업로드에 실패했습니다.");
    }
  };

  const handleSave = async () => {
    if (!editTitle.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/pins/${pinId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          image_url: editImageUrl,
          student_name: editStudentName.trim(),
        }),
      });
      if (!res.ok) throw new Error("수정 실패");
      await loadPin();
      setEditing(false);
    } catch {
      alert("수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("이 핀을 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/pins/${pinId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제 실패");
      router.back();
    } catch {
      alert("삭제에 실패했습니다.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>로딩 중...</div>
      </div>
    );
  }

  if (!pin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">핀을 찾을 수 없습니다.</p>
          <button onClick={() => router.back()} className="text-blue-600 underline text-sm">
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      생활안전: "⚠️",
      교통안전: "🚦",
      응급처치: "🩹",
      "폭력예방 및 신변보호": "🛡️",
      "약물 및 사이버 중독 예방": "📵",
      재난안전: "🌪️",
      직업안전: "👷",
    };
    return icons[category] || "📍";
  };

  const getLocationIcon = (locationType: string) => {
    const icons: Record<string, string> = {
      학교: "🏫",
      집: "🏠",
      마을: "🗺️",
    };
    return icons[locationType] || "📍";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">

          {editing ? (
            /* ── 수정 모드 ── */
            <div className="space-y-4">
              <h1 className="text-xl font-bold mb-4">핀 수정</h1>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">올린이 이름</label>
                <input
                  type="text"
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">사진</label>
                {imagePreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview}
                    alt="미리보기"
                    className="w-full max-h-48 object-cover rounded-lg mb-2"
                  />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  {imagePreview ? "사진 변경" : "사진 추가"}
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImagePreview(""); setEditImageUrl(""); }}
                    className="ml-2 px-3 py-2 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50"
                  >
                    사진 제거
                  </button>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 text-sm"
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            /* ── 보기 모드 ── */
            <>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getCategoryIcon(pin.category)}</span>
                  <div>
                    <h1 className="text-2xl font-bold">{pin.title}</h1>
                    <p className="text-sm text-gray-600">
                      {getLocationIcon(pin.location_type)} {pin.location_type}
                      {pin.location_type === "마을" && pin.address && ` - ${pin.address}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={startEditing}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-1.5 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200 disabled:opacity-50"
                  >
                    {deleting ? "삭제 중..." : "삭제"}
                  </button>
                </div>
              </div>

              {pin.image_url && (
                <div className="mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pin.image_url}
                    alt={pin.title}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              )}

              {pin.description && (
                <div className="mb-4">
                  <h2 className="font-semibold mb-2">설명</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{pin.description}</p>
                </div>
              )}

              {pin.location_type === "마을" && pin.latitude && pin.longitude && (
                <div className="mb-4">
                  <h2 className="font-semibold mb-2">위치</h2>
                  <div className="h-64 rounded-lg overflow-hidden">
                    <NaverMap
                      center={{ lat: pin.latitude, lng: pin.longitude }}
                      markers={[
                        {
                          id: pin.id,
                          lat: pin.latitude,
                          lng: pin.longitude,
                          title: pin.title,
                          category: pin.category,
                        },
                      ]}
                      height="100%"
                    />
                  </div>
                </div>
              )}

              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <EducationLinks category={pin.category as SafetyCategory} />
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>올린이: {pin.students?.name || "알 수 없음"}</span>
                  <span>{new Date(pin.created_at).toLocaleString("ko-KR")}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => router.push(`/solutions?pin_id=${pin.id}`)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  해결방법 고민·제안하기
                </button>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  뒤로 가기
                </button>
              </div>

              <div className="mt-8 border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">교사 피드백</h2>
                {feedbacks.length === 0 ? (
                  <p className="text-sm text-gray-500">아직 교사 피드백이 없습니다.</p>
                ) : (
                  <div className="space-y-3">
                    {feedbacks.map((fb) => (
                      <div key={fb.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-gray-800 whitespace-pre-wrap">{fb.feedback}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(fb.created_at).toLocaleString("ko-KR")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
