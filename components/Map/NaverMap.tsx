"use client";

import { useEffect, useRef, useState } from "react";
import { loadNaverMapScript, getGeocode } from "@/lib/naver-map";

const STORAGE_RECENT_KEY = "safety-map-recent-search";
const STORAGE_FAVORITES_KEY = "safety-map-favorites";
const MAX_RECENT = 10;

export interface MapFavoriteItem {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

interface NaverMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  onCenterChange?: (lat: number, lng: number) => void;
  markers?: Array<{
    id: string;
    lat: number;
    lng: number;
    title?: string;
    category?: string;
    onClick?: () => void;
  }>;
  height?: string;
  selectable?: boolean;
  showMyLocationButton?: boolean;
  showSearchButton?: boolean;
  /** 지도에 +/- 줌 컨트롤 표시 */
  showZoomControl?: boolean;
}

const MAP_DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_RECENT_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(items: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_RECENT_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
  } catch {}
}

function loadFavorites(): MapFavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_FAVORITES_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveFavorites(items: MapFavoriteItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(items));
  } catch {}
}

export default function NaverMap({
  center = MAP_DEFAULT_CENTER,
  zoom = 15,
  onMapClick,
  onCenterChange,
  markers = [],
  height = "400px",
  selectable = false,
  showMyLocationButton = false,
  showSearchButton = false,
  showZoomControl = true,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const [map, setMap] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<MapFavoriteItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      if (!mapRef.current) return;

      setLoadError(null);
      try {
        await loadNaverMapScript();
        if (cancelled) return;

        if (!window.naver?.maps) {
          setLoadError("네이버 지도 API를 로드할 수 없습니다.");
          return;
        }

        const mapInstance = new window.naver.maps.Map(mapRef.current, {
          center: new window.naver.maps.LatLng(center.lat, center.lng),
          zoom,
        });
        if (cancelled) return;

        setMap(mapInstance);
        setIsLoaded(true);
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "지도 로드 실패";
          setLoadError(message);
        }
      }
    };

    initMap();
    return () => {
      cancelled = true;
    };
  }, [center.lat, center.lng, showZoomControl, zoom]);

  useEffect(() => {
    if (!map || !center || typeof window === "undefined" || !window.naver?.maps) return;
    map.setCenter(new window.naver.maps.LatLng(center.lat, center.lng));
  }, [map, center]);

  useEffect(() => {
    if (!map) return;
    map.setZoom(zoom);
  }, [map, zoom]);

  useEffect(() => {
    if (searchOpen && typeof window !== "undefined") {
      setRecentSearches(loadRecentSearches());
      setFavorites(loadFavorites());
    }
  }, [searchOpen]);

  // selectable/onMapClick 변경 시 클릭 리스너 동적 추가/제거
  useEffect(() => {
    if (!map || !selectable || !onMapClick) return;
    const listener = window.naver.maps.Event.addListener(map, "click", (e: any) => {
      const lat = e.coord.lat();
      const lng = e.coord.lng();
      onMapClick(lat, lng);
    });
    return () => {
      window.naver.maps.Event.removeListener(listener);
    };
  }, [map, selectable, onMapClick]);

  useEffect(() => {
    if (!map || !isLoaded || typeof window === "undefined" || !window.naver?.maps) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const categoryColors: Record<string, string> = {
      생활안전: "#FF9800",
      교통안전: "#E53935",
      응급처치: "#E91E63",
      "폭력예방 및 신변보호": "#9C27B0",
      "약물 및 사이버 중독 예방": "#673AB7",
      재난안전: "#2196F3",
      직업안전: "#009688",
    };

    markers.forEach((marker) => {
      const markerInstance = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(marker.lat, marker.lng),
        map,
        title: marker.title,
      });

      const color = categoryColors[marker.category || "생활안전"] ?? "#757575";
      markerInstance.setIcon({
        content: `<div style="width:24px;height:24px;background:${color};border:2px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3);"></div>`,
        anchor: new window.naver.maps.Point(12, 12),
      });

      if (marker.onClick) {
        window.naver.maps.Event.addListener(markerInstance, "click", marker.onClick);
      }
      markersRef.current.push(markerInstance);
    });
  }, [map, isLoaded, markers]);

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const noKey = !clientId || clientId === "placeholder_client_id";

  if (noKey) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 bg-gray-100 rounded-lg border border-gray-200"
        style={{ minHeight: height }}
      >
        <p className="text-gray-600 font-medium">네이버 지도 API 키가 필요합니다</p>
        <p className="text-sm text-gray-500 text-center px-4">
          배포한 뒤 Vercel 등에 NEXT_PUBLIC_NAVER_MAP_CLIENT_ID를 설정하고,
          <br />
          네이버 클라우드 플랫폼 Maps에서 사용 URL에 배포 주소를 등록하세요.
        </p>
        <a
          href="https://console.ncloud.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline mt-1"
        >
          네이버 클라우드 플랫폼 →
        </a>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 bg-red-50 rounded-lg border border-red-200"
        style={{ minHeight: height }}
      >
        <p className="text-red-700 font-medium">지도를 불러올 수 없습니다</p>
        <p className="text-sm text-red-600 text-center px-4">{loadError}</p>
        <p className="text-xs text-gray-500 mt-1">
          네이버 콘솔에서 사용 URL에 배포 주소가 등록되어 있는지 확인하세요.
        </p>
      </div>
    );
  }

  const handleMyLocation = () => {
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (window.naver?.maps) {
          map.setCenter(new window.naver.maps.LatLng(lat, lng));
          map.setZoom(16);
          onCenterChange?.(lat, lng);
        }
      },
      (err) => {
        alert("위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.");
        console.warn("Geolocation error:", err);
      }
    );
  };

  const handleZoomIn = () => {
    if (!map || !window.naver?.maps) return;
    const currentZoom = map.getZoom ? map.getZoom() : zoom;
    map.setZoom(currentZoom + 1);
  };

  const handleZoomOut = () => {
    if (!map || !window.naver?.maps) return;
    const currentZoom = map.getZoom ? map.getZoom() : zoom;
    map.setZoom(currentZoom - 1);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !map || !window.naver?.maps) return;
    const query = searchQuery.trim();
    setSearching(true);
    try {
      const coords = await getGeocode(query);
      if (coords) {
        map.setCenter(new window.naver.maps.LatLng(coords.lat, coords.lng));
        map.setZoom(16);
        onCenterChange?.(coords.lat, coords.lng);
        const next = [query, ...loadRecentSearches().filter((s) => s !== query)];
        saveRecentSearches(next);
        setRecentSearches(next.slice(0, MAX_RECENT));
        setSearchOpen(false);
        setSearchQuery("");
      } else {
        alert("검색 결과를 찾을 수 없습니다.");
      }
    } catch (err) {
      alert("검색에 실패했습니다.");
    } finally {
      setSearching(false);
    }
  };

  const moveToFavorite = (fav: MapFavoriteItem) => {
    if (!map || !window.naver?.maps) return;
    map.setCenter(new window.naver.maps.LatLng(fav.lat, fav.lng));
    map.setZoom(16);
    onCenterChange?.(fav.lat, fav.lng);
    setSearchOpen(false);
  };

  const addCurrentToFavorites = () => {
    if (!map || !window.naver?.maps) return;
    const center = map.getCenter();
    const lat = center.lat();
    const lng = center.lng();
    const label = window.prompt("이 위치의 이름을 입력하세요 (예: 우리 학교)", "");
    if (label === null || !label.trim()) return;
    const next: MapFavoriteItem[] = [
      ...loadFavorites(),
      { id: `fav-${Date.now()}`, label: label.trim(), lat, lng },
    ];
    saveFavorites(next);
    setFavorites(next);
  };

  const removeFavorite = (id: string) => {
    const next = loadFavorites().filter((f) => f.id !== id);
    saveFavorites(next);
    setFavorites(next);
  };

  return (
    <div className="relative" style={{ width: "100%", height }}>
      {!isLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10"
          style={{ height }}
        >
          <span className="text-gray-500">지도 로딩 중...</span>
        </div>
      )}
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height,
          cursor: selectable ? "crosshair" : "",
        }}
      />
      {/* 지도 버튼 오버레이 */}
      {(showMyLocationButton || showSearchButton) && isLoaded && (
        <div className="absolute top-3 right-3 flex flex-col gap-3 z-20">
          {showSearchButton && (
            <div className="flex flex-col items-center">
              {searchOpen ? (
                <div className="flex flex-col gap-2 bg-white rounded-lg shadow-md p-2 min-w-[220px] max-h-[70vh] overflow-y-auto">
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="주소 또는 장소 검색"
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSearch}
                      disabled={searching}
                      className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {searching ? "검색중" : "이동"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="px-2 py-2 text-gray-600 hover:text-gray-800"
                    >
                      ✕
                    </button>
                  </div>
                  {/* 최근 검색 */}
                  {recentSearches.length > 0 && (
                    <div className="border-t pt-2">
                      <p className="text-xs font-medium text-gray-500 mb-1">최근 검색</p>
                      <ul className="space-y-0.5">
                        {recentSearches.slice(0, 5).map((s, i) => (
                          <li key={i}>
                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery(s);
                                getGeocode(s).then((coords) => {
                                  if (coords && map && window.naver?.maps) {
                                    map.setCenter(new window.naver.maps.LatLng(coords.lat, coords.lng));
                                    map.setZoom(16);
                                    onCenterChange?.(coords.lat, coords.lng);
                                  }
                                });
                              }}
                              className="text-left w-full text-sm text-blue-600 hover:underline truncate"
                            >
                              {s}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* 즐겨찾기 */}
                  <div className="border-t pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-gray-500">즐겨찾기</p>
                      <button
                        type="button"
                        onClick={addCurrentToFavorites}
                        className="text-xs text-green-600 hover:underline"
                      >
                        + 현재 위치 저장
                      </button>
                    </div>
                    {favorites.length === 0 ? (
                      <p className="text-xs text-gray-400">저장된 장소가 없습니다.</p>
                    ) : (
                      <ul className="space-y-0.5">
                        {favorites.map((fav) => (
                          <li key={fav.id} className="flex items-center gap-1 group">
                            <button
                              type="button"
                              onClick={() => moveToFavorite(fav)}
                              className="flex-1 text-left text-sm text-blue-600 hover:underline truncate"
                            >
                              ⭐ {fav.label}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFavorite(fav.id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs p-0.5"
                              title="삭제"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex flex-col items-center gap-0.5 w-12 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
                  title="장소 검색"
                >
                  <span className="text-lg">🔍</span>
                  <span className="text-xs text-gray-700">검색</span>
                </button>
              )}
            </div>
          )}
          {showMyLocationButton && (
            <button
              type="button"
              onClick={handleMyLocation}
              className="flex flex-col items-center gap-0.5 w-12 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
              title="내 위치로 이동"
            >
              <span className="text-lg">📍</span>
              <span className="text-xs text-gray-700">내 위치</span>
            </button>
          )}
          {showZoomControl && (
            <div className="flex flex-col items-center bg-white rounded-lg shadow-md overflow-hidden">
              <button
                type="button"
                onClick={handleZoomIn}
                className="w-10 h-8 flex items-center justify-center text-lg hover:bg-gray-50 border-b border-gray-200"
                title="확대"
              >
                +
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="w-10 h-8 flex items-center justify-center text-lg hover:bg-gray-50"
                title="축소"
              >
                −
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
