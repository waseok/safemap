export const SAFE_CLASS_CODE = "5670";

export type ExplorerTab = "map" | "create" | "gallery";

export interface ExplorerCategoryOption {
  id: "traffic" | "facility" | "people" | "structure";
  label: string;
  description: string;
  dbCategory: string;
  mapIcon: string;
  badgeIcon: string;
  accentColor: string;
  surfaceClassName: string;
  borderClassName: string;
  textClassName: string;
}

export const EXPLORER_CATEGORIES: ExplorerCategoryOption[] = [
  {
    id: "traffic",
    label: "교통",
    description: "자동차, 자전거, 횡단보도처럼 길에서 만나는 위험",
    dbCategory: "교통안전",
    mapIcon: "🚗",
    badgeIcon: "🚸",
    accentColor: "#2563eb",
    surfaceClassName: "bg-blue-50",
    borderClassName: "border-blue-200",
    textClassName: "text-blue-700",
  },
  {
    id: "facility",
    label: "시설",
    description: "미끄러운 바닥, 어두운 골목, 정리되지 않은 공간",
    dbCategory: "생활안전",
    mapIcon: "🏠",
    badgeIcon: "🧹",
    accentColor: "#0ea5e9",
    surfaceClassName: "bg-sky-50",
    borderClassName: "border-sky-200",
    textClassName: "text-sky-700",
  },
  {
    id: "people",
    label: "사람",
    description: "도움이 필요한 상황, 불안한 행동, 위험한 접촉",
    dbCategory: "폭력예방 및 신변보호",
    mapIcon: "🧍",
    badgeIcon: "🛡️",
    accentColor: "#2563eb",
    surfaceClassName: "bg-blue-50",
    borderClassName: "border-blue-200",
    textClassName: "text-blue-700",
  },
  {
    id: "structure",
    label: "구조물",
    description: "깨진 난간, 흔들리는 표지판, 무너질 수 있는 곳",
    dbCategory: "재난안전",
    mapIcon: "🏗️",
    badgeIcon: "🧱",
    accentColor: "#2563eb",
    surfaceClassName: "bg-blue-50",
    borderClassName: "border-blue-200",
    textClassName: "text-blue-700",
  },
];

export const DANGER_LEVELS = [
  { value: 1, emoji: "🙂", label: "조금 조심하면 괜찮아요" },
  { value: 2, emoji: "😐", label: "위험할 수 있어요" },
  { value: 3, emoji: "😟", label: "빨리 살펴봐야 해요" },
  { value: 4, emoji: "😰", label: "꽤 위험해 보여요" },
  { value: 5, emoji: "🚨", label: "바로 알려야 해요" },
] as const;

export function getClassRoute(classCode: string, tab: ExplorerTab) {
  return `/class/${classCode}/${tab}`;
}

export interface SafetyAreaVisual {
  areaName: string;
  label: string;
  mapIcon: string;
  badgeIcon: string;
  accentColor: string;
  surfaceClassName: string;
  borderClassName: string;
  textClassName: string;
}

const SAFETY_AREA_VISUALS: Record<string, SafetyAreaVisual> = {
  교통안전: {
    areaName: "교통안전",
    label: "교통",
    mapIcon: "🚗",
    badgeIcon: "🚸",
    accentColor: "#2563eb",
    surfaceClassName: "bg-blue-50",
    borderClassName: "border-blue-200",
    textClassName: "text-blue-700",
  },
  생활안전: {
    areaName: "생활안전",
    label: "생활",
    mapIcon: "🏠",
    badgeIcon: "🧹",
    accentColor: "#2563eb",
    surfaceClassName: "bg-blue-50",
    borderClassName: "border-blue-200",
    textClassName: "text-blue-700",
  },
  응급처치: {
    areaName: "응급처치",
    label: "응급",
    mapIcon: "🩹",
    badgeIcon: "⛑️",
    accentColor: "#2563eb",
    surfaceClassName: "bg-blue-50",
    borderClassName: "border-blue-200",
    textClassName: "text-blue-700",
  },
  "폭력예방 및 신변보호": {
    areaName: "폭력예방 및 신변보호",
    label: "신변",
    mapIcon: "🛡️",
    badgeIcon: "🧍",
    accentColor: "#2563eb",
    surfaceClassName: "bg-blue-50",
    borderClassName: "border-blue-200",
    textClassName: "text-blue-700",
  },
  "약물 및 사이버 중독 예방": {
    areaName: "약물 및 사이버 중독 예방",
    label: "사이버",
    mapIcon: "💻",
    badgeIcon: "🚫",
    accentColor: "#2563eb",
    surfaceClassName: "bg-blue-50",
    borderClassName: "border-blue-200",
    textClassName: "text-blue-700",
  },
  재난안전: {
    areaName: "재난안전",
    label: "재난",
    mapIcon: "🌪️",
    badgeIcon: "🚨",
    accentColor: "#2563eb",
    surfaceClassName: "bg-blue-50",
    borderClassName: "border-blue-200",
    textClassName: "text-blue-700",
  },
  직업안전: {
    areaName: "직업안전",
    label: "직업",
    mapIcon: "👷",
    badgeIcon: "🦺",
    accentColor: "#2563eb",
    surfaceClassName: "bg-blue-50",
    borderClassName: "border-blue-200",
    textClassName: "text-blue-700",
  },
};

export const SAFETY_AREA_ORDER = [
  "생활안전",
  "교통안전",
  "응급처치",
  "폭력예방 및 신변보호",
  "약물 및 사이버 중독 예방",
  "재난안전",
  "직업안전",
] as const;

export function getExplorerCategoryByDb(category: string | null | undefined): SafetyAreaVisual {
  if (!category) return SAFETY_AREA_VISUALS["생활안전"];
  return SAFETY_AREA_VISUALS[category] ?? SAFETY_AREA_VISUALS["생활안전"];
}

export function getExplorerCategoryById(id: ExplorerCategoryOption["id"]) {
  return EXPLORER_CATEGORIES.find((item) => item.id === id) ?? EXPLORER_CATEGORIES[0];
}

export function getDangerMeta(level: number | null | undefined) {
  return DANGER_LEVELS.find((item) => item.value === level) ?? null;
}
