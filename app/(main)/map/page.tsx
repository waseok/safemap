"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NaverMap from "@/components/Map/NaverMap";
import { getStudentSessionId, getClassId, getStudentId } from "@/lib/session";
import { getReverseGeocode } from "@/lib/naver-map";
import type { SafetyPin, SafetyCategory } from "@/types";

export default function MapPage() {
  const router = useRouter();
  const [pins, setPins] = useState<SafetyPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 });
  const [addPinMode, setAddPinMode] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [selectedPinLocation, setSelectedPinLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const sessionId = getStudentSessionId();
    if (!sessionId) {
      router.push("/student/join");
      return;
    }

    loadPins();
  }, [router]);

  const loadPins = async () => {
    try {
      // 테스트 모드 체크
      const isTestMode = getStudentSessionId() === "test-session-id";
      
      if (isTestMode) {
        // 테스트 모드: 더미 데이터 표시
        const testPins: SafetyPin[] = [
          {
            id: "test-pin-1",
            class_id: "test-class-id",
            student_id: "test-student-id",
            location_type: "마을",
            category: "교통",
            title: "횡단보도 신호등 고장",
            description: "신호등이 작동하지 않아 위험합니다.",
            latitude: 37.5665,
            longitude: 126.978,
            address: "서울특별시 중구 세종대로",
            image_url: "",
            created_at: new Date().toISOString(),
          },
          {
            id: "test-pin-2",
            class_id: "test-class-id",
            student_id: "test-student-id",
            location_type: "마을",
            category: "생활안전",
            title: "깨진 유리창",
            description: "공원 화장실 유리창이 깨져있어 위험합니다.",
            latitude: 37.5700,
            longitude: 126.9800,
            address: "서울특별시 중구 명동",
            image_url: "",
            created_at: new Date().toISOString(),
          },
        ];
        setPins(testPins);
        if (testPins[0].latitude && testPins[0].longitude) {
          setMapCenter({
            lat: testPins[0].latitude,
            lng: testPins[0].longitude,
          });
        }
        setLoading(false);
        return;
      }

      const classId = getClassId();
      if (!classId) return;

      const res = await fetch(`/api/pins?class_id=${classId}&location_type=마을`);
      if (!res.ok) throw new Error("핀 로드 실패");

      const data = await res.json();
      setPins(data.pins || []);

      // 첫 번째 핀을 중심으로 설정
      if (data.pins && data.pins.length > 0 && data.pins[0].latitude && data.pins[0].longitude) {
        setMapCenter({
          lat: data.pins[0].latitude,
          lng: data.pins[0].longitude,
        });
      }
    } catch (err) {
      console.error("핀 로드 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>로딩 중...</div>
      </div>
    );
  }

  const handleMapClickForPin = async (lat: number, lng: number) => {
    setSelectedPinLocation({ lat, lng });
    setPinModalOpen(true);
    setAddPinMode(false);
  };

  const markers = pins
    .filter((pin) => pin.latitude && pin.longitude)
    .map((pin) => ({
      id: pin.id,
      lat: pin.latitude!,
      lng: pin.longitude!,
      title: pin.title,
      category: pin.category,
      onClick: () => {
        router.push(`/pin/${pin.id}`);
      },
    }));

  return (
    <div className="min-h-screen">
      <div className="bg-white shadow-md p-4 mb-4">
        <h1 className="text-2xl font-bold">지도 보기</h1>
        <p className="text-sm text-gray-600 mt-1">
          마을에서 발견한 안전 문제를 지도에서 확인하세요
        </p>
      </div>
      <div className="h-[calc(100vh-200px)] min-h-[400px] relative">
        <NaverMap
          center={mapCenter}
          markers={markers}
          height="100%"
          showMyLocationButton
          showSearchButton
          onCenterChange={(lat, lng) => setMapCenter({ lat, lng })}
          selectable={addPinMode}
          onMapClick={addPinMode ? handleMapClickForPin : undefined}
        />
        <button
          type="button"
          onClick={() => setAddPinMode(!addPinMode)}
          className={`absolute bottom-4 left-4 z-20 px-4 py-2 rounded-lg shadow-md font-medium ${
            addPinMode ? "bg-orange-500 text-white" : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {addPinMode ? "핀 추가 모드 (지도를 클릭하세요)" : "📍 핀 추가"}
        </button>
      </div>

      {pinModalOpen && selectedPinLocation && (
        <AddPinModal
          location={selectedPinLocation}
          onClose={() => {
            setPinModalOpen(false);
            setSelectedPinLocation(null);
          }}
          onSuccess={() => {
            setPinModalOpen(false);
            setSelectedPinLocation(null);
            loadPins();
          }}
        />
      )}
    </div>
  );
}

function AddPinModal({
  location,
  onClose,
  onSuccess,
}: {
  location: { lat: number; lng: number };
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [category, setCategory] = useState<SafetyCategory>("교통");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getReverseGeocode(location.lat, location.lng).then(setAddress);
  }, [location.lat, location.lng]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const studentId = getStudentId();
    const classId = getClassId();
    if (!studentId || !classId) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      setLoading(false);
      return;
    }

    try {
      let imageUrl = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("이미지 업로드 실패");
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const res = await fetch("/api/pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: classId,
          student_id: studentId,
          location_type: "마을",
          category,
          title: title.trim(),
          description: description.trim(),
          latitude: location.lat,
          longitude: location.lng,
          address: address || null,
          image_url: imageUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "핀 생성 실패");
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">안전점검 핀 추가</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-sm text-gray-600">
            위치: {address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
          </p>
          <div>
            <label className="block text-sm font-medium mb-1">카테고리 *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SafetyCategory)}
              className="w-full px-3 py-2 border rounded-md"
            >
              {(["교통", "생활안전", "환경", "기타"] as SafetyCategory[]).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 횡단보도 신호등 고장"
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="자세한 설명"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">사진</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm" />
            {imagePreview && (
              <img src={imagePreview} alt="미리보기" className="mt-2 h-24 object-cover rounded" />
            )}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-md">
              취소
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50">
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
