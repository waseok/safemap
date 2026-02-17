/**
 * 네이버 지도 API v3 유틸리티
 *
 * 사용 전 .env.local 에 다음 설정이 필요합니다:
 *   NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=발급받은_클라이언트_ID
 *
 * 클라이언트 ID 발급: https://console.ncloud.com/ → Application → Maps
 * (Web Dynamic Map 사용 시도메인에 localhost, 실제 도메인 등록)
 */

declare global {
  interface Window {
    naver: any;
  }
}

// 2024년 네이버 지도 API 업데이트: oapi + ncpKeyId 사용
// 주소/장소 검색(Geocoding)을 쓰려면 submodules=geocoder 필수
const NAVER_MAP_SCRIPT_URL =
  "https://oapi.map.naver.com/openapi/v3/maps.js";

export function getNaverMapScriptUrl(): string {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || "";
  return `${NAVER_MAP_SCRIPT_URL}?ncpKeyId=${clientId}&submodules=geocoder`;
}

export const loadNaverMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("브라우저 환경에서만 로드 가능합니다."));
      return;
    }
    if (window.naver?.maps) {
      resolve();
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
    if (!clientId) {
      reject(new Error("NEXT_PUBLIC_NAVER_MAP_CLIENT_ID가 설정되지 않았습니다."));
      return;
    }

    const script = document.createElement("script");
    script.src = getNaverMapScriptUrl();
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("네이버 지도 스크립트 로드 실패. 클라이언트 ID와 사용 URL을 확인하세요."));
    document.head.appendChild(script);
  });
};

export const getGeocode = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  if (!window.naver || !window.naver.maps) {
    await loadNaverMapScript();
  }

  return new Promise((resolve) => {
    window.naver.maps.Service.geocode(
      { address: address.trim() },
      (status: any, response: any) => {
        if (status !== window.naver.maps.Service.Status.OK) {
          resolve(null);
          return;
        }
        const items = response.result?.items;
        if (!items || items.length === 0) {
          resolve(null);
          return;
        }
        const point = items[0].point;
        if (!point) {
          resolve(null);
          return;
        }
        resolve({
          lat: typeof point.y === "number" ? point.y : parseFloat(point.y),
          lng: typeof point.x === "number" ? point.x : parseFloat(point.x),
        });
      }
    );
  });
};

export const getReverseGeocode = async (
  lat: number,
  lng: number
): Promise<string | null> => {
  if (!window.naver || !window.naver.maps) {
    await loadNaverMapScript();
  }

  return new Promise((resolve) => {
    window.naver.maps.Service.reverseGeocode(
      {
        location: new window.naver.maps.LatLng(lat, lng),
      },
      (status: any, response: any) => {
        if (status !== window.naver.maps.Service.Status.OK) {
          resolve(null);
          return;
        }
        const items = response.result?.items;
        if (!items || items.length === 0) {
          resolve(null);
          return;
        }
        resolve(items[0].address || null);
      }
    );
  });
};
