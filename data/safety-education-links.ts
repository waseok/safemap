/**
 * 7대 안전별 교육자료 링크
 * - 안전교육 관련 링크를 검색해서 아래 배열에 추가하면 됩니다.
 * - title: 링크 제목, url: 링크 주소 (https 포함)
 */
import type { SafetyCategory } from "@/types";

export interface EducationLinkItem {
  title: string;
  url: string;
}

export type SafetyEducationLinks = Partial<Record<SafetyCategory, EducationLinkItem[]>>;

const links: SafetyEducationLinks = {
  생활안전: [
    // 예: { title: "생활안전 교육자료", url: "https://..." },
  ],
  교통안전: [
    // 예: { title: "교통안전 교육자료", url: "https://..." },
  ],
  응급처치: [],
  "폭력예방 및 신변보호": [],
  "약물 및 사이버 중독 예방": [],
  재난안전: [],
  직업안전: [],
};

export default links;
