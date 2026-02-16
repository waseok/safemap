"use client";

import { useEffect, useRef, useState } from "react";
import { loadNaverMapScript } from "@/lib/naver-map";

interface NaverMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
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
}

const MAP_DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

export default function NaverMap({
  center = MAP_DEFAULT_CENTER,
  zoom = 15,
  onMapClick,
  markers = [],
  height = "400px",
  selectable = false,
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const [map, setMap] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

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

        const mapOptions = {
          center: new window.naver.maps.LatLng(center.lat, center.lng),
          zoom,
        };

        const mapInstance = new window.naver.maps.Map(mapRef.current, mapOptions);
        if (cancelled) return;

        setMap(mapInstance);
        setIsLoaded(true);

        if (selectable && onMapClick) {
          window.naver.maps.Event.addListener(mapInstance, "click", (e: any) => {
            const lat = e.coord.lat();
            const lng = e.coord.lng();
            onMapClick(lat, lng);
          });
        }
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
  }, []);

  useEffect(() => {
    if (!map || !center || typeof window === "undefined" || !window.naver?.maps) return;
    map.setCenter(new window.naver.maps.LatLng(center.lat, center.lng));
  }, [map, center?.lat, center?.lng]);

  useEffect(() => {
    if (!map) return;
    map.setZoom(zoom);
  }, [map, zoom]);

  useEffect(() => {
    if (!map || !isLoaded || typeof window === "undefined" || !window.naver?.maps) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const categoryColors: Record<string, string> = {
      교통: "#E53935",
      생활안전: "#FF9800",
      환경: "#43A047",
      기타: "#757575",
    };

    markers.forEach((marker) => {
      const markerInstance = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(marker.lat, marker.lng),
        map,
        title: marker.title,
      });

      const color = categoryColors[marker.category || "기타"] ?? "#757575";
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
        style={{ width: "100%", height }}
        className={selectable ? "cursor-crosshair" : ""}
      />
    </div>
  );
}
