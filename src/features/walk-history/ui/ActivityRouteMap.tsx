import { useEffect, useRef, useState } from 'react';

import { loadNaverMap } from '@/shared/lib/naver-map/loadNaverMap';

import type { RoutePoint } from '../model/types';

interface ActivityRouteMapProps {
  /** 시간순 정렬된 이동 좌표 리스트 (최소 2개는 있어야 선이 그려짐) */
  routePoints: RoutePoint[];
  /** 경로가 없을 때 중심으로 삼을 시작 위치 (지도 최초 표시용) */
  fallbackCenter: { lat: number; lng: number };
}

// 시작/종료 지점 마커 (초록=시작, 빨강=종료)
function endpointMarkerContent(color: string): string {
  return `<div style="transform:translate(-50%,-50%);width:14px;height:14px;border-radius:9999px;background:${color};border:3px solid #fff;box-shadow:0 0 0 4px ${color}33"></div>`;
}

export function ActivityRouteMap({ routePoints, fallbackCenter }: ActivityRouteMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const polylineRef = useRef<naver.maps.Polyline | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. 지도 생성 (최초 1회)
  useEffect(() => {
    let canceled = false;

    loadNaverMap()
      .then(() => {
        if (canceled || !mapElementRef.current) return;

        const map = new naver.maps.Map(mapElementRef.current, {
          center: new naver.maps.LatLng(fallbackCenter.lat, fallbackCenter.lng),
          zoom: 15,
        });

        mapInstanceRef.current = map;
        setIsMapReady(true);
      })
      .catch((e: unknown) => {
        if (!canceled) setError(e instanceof Error ? e.message : '지도를 불러오지 못했습니다.');
      });

    return () => {
      canceled = true;
      mapInstanceRef.current?.destroy();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 최초 표시 중심일 뿐, 갱신마다 지도를 새로 만들 필요는 없음
  }, []);

  // 2. 경로 선 + 시작/종료 마커 그리기
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isMapReady || !map) return;

    polylineRef.current?.setMap(null);
    polylineRef.current = null;
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (routePoints.length === 0) return;

    const path = routePoints.map((point) => new naver.maps.LatLng(point.latitude, point.longitude));

    if (path.length >= 2) {
      polylineRef.current = new naver.maps.Polyline({
        map,
        path,
        strokeColor: '#5347AA',
        strokeWeight: 4,
        strokeOpacity: 0.9,
      });
    }

    const startMarker = new naver.maps.Marker({
      map,
      position: path[0],
      icon: { content: endpointMarkerContent('#22c55e'), anchor: new naver.maps.Point(0, 0) },
    });
    markersRef.current.push(startMarker);

    if (path.length > 1) {
      const endMarker = new naver.maps.Marker({
        map,
        position: path[path.length - 1],
        icon: { content: endpointMarkerContent('#ef4444'), anchor: new naver.maps.Point(0, 0) },
      });
      markersRef.current.push(endMarker);
    }

    const bounds = path.reduce((acc, latlng) => acc.extend(latlng), new naver.maps.LatLngBounds(path[0], path[0]));
    map.fitBounds(bounds, 40);
  }, [isMapReady, routePoints]);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-red-50 p-4 text-sm text-red-500">{error}</div>
    );
  }

  return <div ref={mapElementRef} className="h-full w-full" />;
}
