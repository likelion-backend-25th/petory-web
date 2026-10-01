import { useEffect, useRef, useState } from "react";

interface KakaoMapPickerProps {
  latitude?: number;
  longitude?: number;
  readOnly?: boolean;
  onLocationChange?(latitude: number, longitude: number, address?: string): void;
}

let kakaoLoader: Promise<KakaoMapsNamespace> | null = null;

function loadKakaoMaps(apiKey: string): Promise<KakaoMapsNamespace> {
  if (window.kakao?.maps) {
    return new Promise((resolve) => {
      window.kakao?.maps.load(() => resolve(window.kakao!.maps));
    });
  }

  if (kakaoLoader !== null) {
    return kakaoLoader;
  }

  const loader = new Promise<KakaoMapsNamespace>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(apiKey)}&autoload=false&libraries=services`;
    script.async = true;
    script.addEventListener("load", () => {
      if (!window.kakao?.maps) {
        reject(new Error("카카오 지도 SDK를 불러오지 못했습니다."));
        return;
      }
      window.kakao.maps.load(() => resolve(window.kakao!.maps));
    });
    script.addEventListener("error", () => {
      reject(new Error("카카오 지도 SDK를 불러오지 못했습니다."));
    });
    document.head.append(script);
  }).catch((error: unknown) => {
    kakaoLoader = null;
    throw error;
  });
  kakaoLoader = loader;
  return loader;
}

export function KakaoMapPicker({
  latitude,
  longitude,
  readOnly = false,
  onLocationChange,
}: KakaoMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markerRef = useRef<KakaoMarker | null>(null);
  const mapsRef = useRef<KakaoMapsNamespace | null>(null);
  const onLocationChangeRef = useRef(onLocationChange);
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY?.trim() ?? "";

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || apiKey === "") {
      return;
    }

    let disposed = false;
    let map: KakaoMap | null = null;
    let clickHandler: ((event: { latLng: KakaoLatLng }) => void) | null = null;

    void loadKakaoMaps(apiKey)
      .then((maps) => {
        if (disposed) {
          return;
        }
        const initialPosition = new maps.LatLng(
          latitude ?? 37.5665,
          longitude ?? 126.978,
        );
        map = new maps.Map(container, { center: initialPosition, level: 4 });
        const marker = new maps.Marker();
        if (latitude !== undefined && longitude !== undefined) {
          marker.setPosition(initialPosition);
          marker.setMap(map);
        }

        if (!readOnly) {
          clickHandler = ({ latLng }) => {
            const nextLatitude = latLng.getLat();
            const nextLongitude = latLng.getLng();
            marker.setPosition(latLng);
            marker.setMap(map);

            const geocoder = new maps.services.Geocoder();
            geocoder.coord2Address(nextLongitude, nextLatitude, (result, status) => {
              const address =
                status === maps.services.Status.OK
                  ? result[0]?.road_address?.address_name ??
                    result[0]?.address?.address_name
                  : undefined;
              onLocationChangeRef.current?.(
                nextLatitude,
                nextLongitude,
                address,
              );
            });
          };

          maps.event.addListener(map, "click", clickHandler);
        }
        mapsRef.current = maps;
        mapRef.current = map;
        markerRef.current = marker;
        setIsReady(true);
      })
      .catch((error: unknown) => {
        if (!disposed) {
          setErrorMessage(
            error instanceof Error ? error.message : "카카오 지도를 불러오지 못했습니다.",
          );
        }
      });

    return () => {
      disposed = true;
      if (map && clickHandler && mapsRef.current) {
        mapsRef.current.event.removeListener(map, "click", clickHandler);
      }
      mapRef.current = null;
      markerRef.current = null;
      mapsRef.current = null;
    };
    // 지도 인스턴스는 한 번 만들고, 좌표 변경은 아래 effect에서 반영한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, readOnly]);

  useEffect(() => {
    const maps = mapsRef.current;
    const map = mapRef.current;
    const marker = markerRef.current;
    if (
      !isReady ||
      !maps ||
      !map ||
      !marker ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return;
    }

    const position = new maps.LatLng(latitude, longitude);
    marker.setPosition(position);
    marker.setMap(map);
    map.setCenter(position);
    map.relayout();
  }, [isReady, latitude, longitude]);

  if (apiKey === "") {
    return (
      <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
        지도를 사용하려면 VITE_KAKAO_MAP_KEY를 설정해 주세요.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="h-80 w-full rounded-md border-2 border-neutral-900 bg-neutral-100"
        aria-label={readOnly ? "실종 위치 지도" : "실종 위치 선택 지도"}
      />
      {!readOnly ? (
        <p className="text-xs text-neutral-500">
          지도를 클릭하면 위치가 저장되고, 주소 변환이 가능하면 실종 장소도
          갱신됩니다.
        </p>
      ) : null}
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
    </div>
  );
}
