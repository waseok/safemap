"use client";

import { useState } from "react";
import DrawingCanvas from "./DrawingCanvas";
import { getStudentId } from "@/lib/session";
import type { SolutionType } from "@/types";

interface SolutionFormProps {
  safetyPinId: string;
  onSuccess?: () => void;
}

export default function SolutionForm({ safetyPinId, onSuccess }: SolutionFormProps) {
  const [type, setType] = useState<SolutionType>("text");
  const [textContent, setTextContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [drawingDataUrl, setDrawingDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrawingSave = (dataUrl: string) => {
    setDrawingDataUrl(dataUrl);
    alert("그림이 저장되었습니다. 제출 버튼을 눌러주세요.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const studentId = getStudentId();
      if (!studentId) {
        throw new Error("로그인이 필요합니다.");
      }

      let content = "";

      if (type === "text") {
        if (!textContent.trim()) {
          throw new Error("텍스트를 입력해주세요.");
        }
        content = textContent.trim();
      } else if (type === "image") {
        if (!imageFile) {
          throw new Error("사진을 선택해주세요.");
        }

        // 이미지 업로드
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("이미지 업로드에 실패했습니다.");
        }

        const uploadData = await uploadRes.json();
        content = uploadData.url;
      } else if (type === "drawing") {
        if (!drawingDataUrl) {
          throw new Error("그림을 그려주세요.");
        }

        // 그림을 Blob로 변환하여 업로드
        const response = await fetch(drawingDataUrl);
        const blob = await response.blob();
        const file = new File([blob], "drawing.png", { type: "image/png" });

        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("그림 업로드에 실패했습니다.");
        }

        const uploadData = await uploadRes.json();
        content = uploadData.url;
      }

      // 해결방법 저장
      const res = await fetch("/api/solutions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          safety_pin_id: safetyPinId,
          student_id: studentId,
          type,
          content,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "해결방법 저장에 실패했습니다.");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        alert("해결방법이 제출되었습니다!");
        // 폼 초기화
        setTextContent("");
        setImageFile(null);
        setImagePreview(null);
        setDrawingDataUrl(null);
      }
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제안 유형
        </label>
        <div className="flex gap-4">
          {(["text", "image", "drawing"] as SolutionType[]).map((t) => (
            <label key={t} className="flex items-center">
              <input
                type="radio"
                name="type"
                value={t}
                checked={type === t}
                onChange={(e) => {
                  setType(e.target.value as SolutionType);
                  setTextContent("");
                  setImageFile(null);
                  setImagePreview(null);
                  setDrawingDataUrl(null);
                }}
                className="mr-2"
              />
              {t === "text" ? "텍스트" : t === "image" ? "사진" : "그림 그리기"}
            </label>
          ))}
        </div>
      </div>

      {type === "text" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            해결방법 제안
          </label>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            rows={6}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="이 안전 문제를 해결하기 위한 방법을 제안해주세요"
          />
        </div>
      )}

      {type === "image" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            사진 업로드
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="미리보기"
                className="max-w-full h-48 object-cover rounded-md"
              />
            </div>
          )}
        </div>
      )}

      {type === "drawing" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            그림 그리기
          </label>
          <DrawingCanvas onSave={handleDrawingSave} />
          {drawingDataUrl && (
            <div className="mt-2">
              <p className="text-sm text-green-600">그림이 저장되었습니다.</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "제출 중..." : "해결방법 제출"}
      </button>
    </form>
  );
}
