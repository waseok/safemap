"use client";

import { useState } from "react";
import MapPage from "../map/page";
import PinForm from "@/components/PinForm";
import SafetyChecklist from "@/components/SafetyChecklist";

type Tab = "map" | "create" | "checklist";

export default function CheckPage() {
  const [tab, setTab] = useState<Tab>("map");

  const tabs: { key: Tab; label: string }[] = [
    { key: "map", label: "지도 보기" },
    { key: "create", label: "안전점검하기 (사진과 내용 쓰기)" },
    { key: "checklist", label: "✅ 안전 체크리스트" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h1 className="text-2xl font-bold mb-2">안전점검</h1>
          <p className="text-sm text-gray-600 mb-4">
            우리 집·학교·마을 주변을 살펴보고, 안전에 위험한 장소를 찾아보세요.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  tab === key
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {tab === "map" && <MapPage />}

        {tab === "create" && (
          <div className="bg-white rounded-lg shadow-md">
            <PinForm />
          </div>
        )}

        {tab === "checklist" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-1">안전 체크리스트</h2>
            <p className="text-sm text-gray-500 mb-4">
              장소를 선택하고 항목을 하나씩 확인해보세요. 체크한 내용은 자동으로 저장됩니다.
            </p>
            <SafetyChecklist />
          </div>
        )}
      </div>
    </div>
  );
}
