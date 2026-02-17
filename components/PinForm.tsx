"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NaverMap from "./Map/NaverMap";
import { getReverseGeocode } from "@/lib/naver-map";
import type { LocationType, SafetyCategory } from "@/types";
import { SAFETY_CATEGORIES } from "@/types";
import { getStudentId, getClassId } from "@/lib/session";

interface PinFormProps {
  onSuccess?: () => void;
}

export default function PinForm({ onSuccess }: PinFormProps) {
  const router = useRouter();
  const [locationType, setLocationType] = useState<LocationType | "">("");
  const [category, setCategory] = useState<SafetyCategory | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [address, setAddress] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLocationSelect = async (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    try {
      const addr = await getReverseGeocode(lat, lng);
      setAddress(addr || "");
    } catch (err) {
      console.error("주소 변환 오류:", err);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const studentId = getStudentId();
      const classId = getClassId();

      if (!studentId || !classId) {
        throw new Error("로그인이 필요합니다.");
      }

      if (!locationType || !category || !title.trim()) {
        throw new Error("필수 항목을 모두 입력해주세요.");
      }

      if (locationType === "마을" && !selectedLocation) {
        throw new Error("마을 장소는 지도에서 위치를 선택해주세요.");
      }

      // 이미지 업로드
      let imageUrl = "";
      if (imageFile) {
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
        imageUrl = uploadData.url;
      }

      // 핀 생성
      const res = await fetch("/api/pins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_id: classId,
          student_id: studentId,
          location_type: locationType,
          category,
          title: title.trim(),
          description: description.trim(),
          latitude: locationType === "마을" ? selectedLocation?.lat : null,
          longitude: locationType === "마을" ? selectedLocation?.lng : null,
          address: locationType === "마을" ? address : null,
          image_url: imageUrl,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "핀 생성에 실패했습니다.");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/list");
      }
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          장소 유형 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          {(["학교", "집", "마을"] as LocationType[]).map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="radio"
                name="locationType"
                value={type}
                checked={locationType === type}
                onChange={(e) => {
                  setLocationType(e.target.value as LocationType);
                  if (e.target.value !== "마을") {
                    setSelectedLocation(null);
                    setAddress("");
                  }
                }}
                className="mr-2"
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {locationType === "마을" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            지도에서 위치 선택 <span className="text-red-500">*</span>
          </label>
          <NaverMap
            height="300px"
            selectable
            onMapClick={handleLocationSelect}
            center={selectedLocation || undefined}
            showMyLocationButton
            showSearchButton
          />
          {selectedLocation && (
            <p className="mt-2 text-sm text-gray-600">
              선택된 위치: {address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          안전 문제 카테고리 <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as SafetyCategory)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">선택하세요</option>
          {SAFETY_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="예: 횡단보도 신호등 고장"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          설명
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="안전 문제에 대한 자세한 설명을 입력하세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          사진
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {imagePreview && (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="미리보기"
              className="max-w-full h-48 object-cover rounded-md"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "저장 중..." : "핀 생성"}
      </button>
    </form>
  );
}
