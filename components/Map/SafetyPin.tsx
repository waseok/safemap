"use client";

// 안전 핀 마커 컴포넌트 (NaverMap 컴포넌트 내부에서 사용)
// 실제로는 NaverMap 컴포넌트에서 직접 처리하므로 이 파일은 참고용입니다.

export interface SafetyPinMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category: string;
  locationType: string;
}
