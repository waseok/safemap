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
    mapIcon: "🛞",
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
    mapIcon: "🔎",
    badgeIcon: "🏫",
    accentColor: "#16a34a",
    surfaceClassName: "bg-green-50",
    borderClassName: "border-green-200",
    textClassName: "text-green-700",
  },
  {
    id: "people",
    label: "사람",
    description: "도움이 필요한 상황, 불안한 행동, 위험한 접촉",
    dbCategory: "폭력예방 및 신변보호",
    mapIcon: "🔥",
    badgeIcon: "🧍",
    accentColor: "#f97316",
    surfaceClassName: "bg-orange-50",
    borderClassName: "border-orange-200",
    textClassName: "text-orange-700",
  },
  {
    id: "structure",
    label: "구조물",
    description: "깨진 난간, 흔들리는 표지판, 무너질 수 있는 곳",
    dbCategory: "재난안전",
    mapIcon: "🧱",
    badgeIcon: "🏗️",
    accentColor: "#0f766e",
    surfaceClassName: "bg-teal-50",
    borderClassName: "border-teal-200",
    textClassName: "text-teal-700",
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

export function getExplorerCategoryByDb(category: string | null | undefined) {
  return EXPLORER_CATEGORIES.find((item) => item.dbCategory === category) ?? EXPLORER_CATEGORIES[1];
}

export function getExplorerCategoryById(id: ExplorerCategoryOption["id"]) {
  return EXPLORER_CATEGORIES.find((item) => item.id === id) ?? EXPLORER_CATEGORIES[0];
}

export function getDangerMeta(level: number | null | undefined) {
  return DANGER_LEVELS.find((item) => item.value === level) ?? null;
}
