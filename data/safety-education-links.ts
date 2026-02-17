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
    {
      title: "모두가 함께하는 나침반 안전교육 시리즈 1. 화재안전편",
      url: "https://www.youtube.com/watch?v=Y6BvFIYYRo4",
    },
    {
      title: "경기도교육청 나침반 안전교육 화재편",
      url: "https://www.youtube.com/watch?v=5vRGFeNmuPY",
    },
  ],
  교통안전: [
    {
      title: "모두가 함께하는 나침반 안전교육 시리즈 8. 교통안전-스쿨존편",
      url: "https://www.youtube.com/watch?v=wGvgcVTutew",
    },
    {
      title: "[어린이 교통안전편] 교통안전 수칙을 잘 지켜요",
      url: "https://www.youtube.com/watch?v=zmYrseYHrqk",
    },
  ],
  응급처치: [
    {
      title: "모두가 함께하는 나침반 안전교육 시리즈 (응급처치편 – 같은 시리즈 내 검색)",
      url: "https://www.youtube.com/results?search_query=%EB%82%98%EC%B9%A8%EB%B0%98+5%EB%B6%84+%EC%95%88%EC%A0%84%EA%B5%90%EC%9C%A1+%EC%9D%91%EA%B8%89%EC%B2%98%EC%B9%98",
    },
    {
      title: "[나침반5분안전교육] 감염병으로부터 나를 지켜요! (보건·감염병, 응급상황 연계 활용 가능)",
      url: "https://www.youtube.com/watch?v=0gJlY7Ekh-M",
    },
  ],
  "폭력예방 및 신변보호": [
    {
      title: "모두가 함께하는 나침반 안전교육 시리즈 3. 학교폭력예방-언어편",
      url: "https://www.youtube.com/watch?v=RyfXSBm4DUY",
    },
    {
      title: "[나침반5분안전교육] 안전보호선으로 나를 지켜요!",
      url: "https://www.youtube.com/watch?v=A3dGysylfB4",
    },
  ],
  "약물 및 사이버 중독 예방": [
    {
      title: "[나침반5분안전교육] 감염병으로부터 나를 지켜요! (보건·감염병, 약물·위생 연계 활용 가능)",
      url: "https://www.youtube.com/watch?v=0gJlY7Ekh-M",
    },
    {
      title: "[나침반5분안전교육] 통학버스를 안전하게 이용해요! (생활·교통·규칙 준수, 다른 위험과 묶어 설명 가능)",
      url: "https://www.youtube.com/watch?v=vzP1nlpiaWs",
    },
  ],
  재난안전: [
    {
      title: "모두가 함께하는 나침반 안전교육 시리즈 1. 화재안전편",
      url: "https://www.youtube.com/watch?v=Y6BvFIYYRo4",
    },
    {
      title: "경기도교육청 나침반 안전교육 화재편",
      url: "https://www.youtube.com/watch?v=5vRGFeNmuPY",
    },
  ],
  직업안전: [
    {
      title: "초등학생을 위한 산업안전보건 강의동영상",
      url: "https://www.youtube.com/watch?v=N5E6kFIolwU",
    },
    {
      title: "초등학생 산업안전보건 교육용 VR 애니메이션(저학년용)",
      url: "https://www.youtube.com/watch?v=JXkn4TF8zlk",
    },
  ],
};

export default links;
