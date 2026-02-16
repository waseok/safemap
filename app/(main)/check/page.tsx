"use client";

import { useState } from "react";
import MapPage from "../map/page";
import PinForm from "@/components/PinForm";

// 안전점검 페이지
// - 지도 보기
// - 안전점검하기(새 핀 만들기)
export default function CheckPage() {
  const [tab, setTab] = useState<"map" | "create">("map");

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h1 className="text-2xl font-bold mb-2">안전점검</h1>
          <p className="text-sm text-gray-600 mb-4">
            우리 집·학교·마을 주변을 살펴보고, 안전에 위험한 장소를 찾아보세요.
          </p>

          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setTab("map")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                tab === "map"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              지도 보기
            </button>
            <button
              type="button"
              onClick={() => setTab("create")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                tab === "create"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              안전점검하기 (사진과 내용 쓰기)
            </button>
          </div>
        </div>

        {tab === "map" ? (
          // 기존 지도 보기 페이지를 그대로 사용
          <MapPage />
        ) : (
          <div className="bg-white rounded-lg shadow-md">
            <PinForm />
          </div>
        )}
      </div>
    </div>
  );
}

