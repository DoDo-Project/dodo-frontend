// 네이버 지도(NCP Maps) 전역 타입 — 우선 지도 표시에 필요한 최소만 선언
declare namespace naver.maps {
  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  interface MapOptions {
    center: LatLng;
    zoom?: number;
  }

  /** 지도 이벤트 핸들 (해제 시 사용) */
  type MapEventListener = object;

  /** 클릭 등 포인터 이벤트 — coord에 클릭 좌표가 담김 */
  interface PointerEvent {
    coord: LatLng;
  }

  class LatLngBounds {
    constructor(sw: LatLng, ne: LatLng);
    extend(latlng: LatLng): LatLngBounds;
  }

  class Map {
    constructor(element: string | HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    setZoom(zoom: number): void;
    /** 주어진 영역이 모두 보이도록 지도 범위를 맞춤 (margin: 픽셀 단위 여백) */
    fitBounds(bounds: LatLngBounds, margin?: number): void;
    addListener(eventName: string, listener: (event: PointerEvent) => void): MapEventListener;
    destroy(): void;
  }

  interface CircleOptions {
    map?: Map;
    center: LatLng;
    /** 반경(미터) */
    radius: number;
    strokeColor?: string;
    strokeWeight?: number;
    strokeOpacity?: number;
    /** 'solid' | 'shortdash' | 'dash' 등 */
    strokeStyle?: string;
    fillColor?: string;
    fillOpacity?: number;
  }

  class Circle {
    constructor(options: CircleOptions);
    setMap(map: Map | null): void;
    setCenter(center: LatLng): void;
    setRadius(radius: number): void;
  }

  class Point {
    constructor(x: number, y: number);
  }

  interface MarkerIcon {
    content: string;
    anchor?: Point;
  }

  interface MarkerOptions {
    map?: Map;
    position: LatLng;
    icon?: MarkerIcon | string;
    title?: string;
    clickable?: boolean;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(position: LatLng): void;
  }

  interface PolylineOptions {
    map?: Map;
    path: LatLng[];
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
    /** 'solid' | 'shortdash' | 'dash' 등 */
    strokeStyle?: string;
  }

  class Polyline {
    constructor(options: PolylineOptions);
    setMap(map: Map | null): void;
    setPath(path: LatLng[]): void;
  }
}

// window.naver 로 접근할 수 있게 augment
interface Window {
  naver: typeof naver;
}
