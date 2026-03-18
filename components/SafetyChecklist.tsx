"use client";

import { useState, useEffect } from "react";
import checklists from "@/data/safety-checklists";
import type { LocationType } from "@/types";

const LOCATION_TYPES: LocationType[] = ["학교", "집", "마을"];
const STORAGE_KEY = "safety-checklist-checked";

function loadChecked(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveChecked(checked: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
}

export default function SafetyChecklist() {
  const [location, setLocation] = useState<LocationType>("학교");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setChecked(loadChecked());
  }, []);

  const items = checklists[location];
  const checkedCount = items.filter((item) => checked[item.id]).length;
  const allDone = checkedCount === items.length;

  const toggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    saveChecked(next);
  };

  const resetLocation = () => {
    const next = { ...checked };
    items.forEach((item) => {
      delete next[item.id];
    });
    setChecked(next);
    saveChecked(next);
  };

  return (
    <div className="space-y-4">
      {/* 장소 선택 */}
      <div className="flex gap-2">
        {LOCATION_TYPES.map((loc) => {
          const locItems = checklists[loc];
          const locChecked = locItems.filter((i) => checked[i.id]).length;
          return (
            <button
              key={loc}
              type="button"
              onClick={() => setLocation(loc)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                location === loc
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
              }`}
            >
              {loc === "학교" ? "🏫" : loc === "집" ? "🏠" : "🗺️"} {loc}
              <span className={`ml-1 text-xs ${location === loc ? "text-blue-100" : "text-gray-400"}`}>
                {locChecked}/{locItems.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* 진행률 */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">
            {allDone ? "🎉 모두 확인했어요!" : `${checkedCount}/${items.length} 확인 완료`}
          </span>
          <button
            type="button"
            onClick={resetLocation}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            초기화
          </button>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              allDone ? "bg-green-500" : "bg-blue-500"
            }`}
            style={{ width: `${(checkedCount / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 체크리스트 항목 */}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={!!checked[item.id]}
                onChange={() => toggle(item.id)}
                className="mt-0.5 w-4 h-4 accent-blue-500 shrink-0"
              />
              <div>
                <p
                  className={`text-sm ${
                    checked[item.id] ? "line-through text-gray-400" : "text-gray-800"
                  }`}
                >
                  {item.text}
                </p>
                {item.tip && !checked[item.id] && (
                  <p className="text-xs text-blue-600 mt-0.5">💡 {item.tip}</p>
                )}
              </div>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
