interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

interface KakaoMap {
  setCenter(position: KakaoLatLng): void;
  relayout(): void;
}

interface KakaoMarker {
  setMap(map: KakaoMap | null): void;
  setPosition(position: KakaoLatLng): void;
}

interface KakaoAddressResult {
  address?: { address_name?: string };
  road_address?: { address_name?: string };
}

interface KakaoMapsNamespace {
  load(callback: () => void): void;
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number },
  ) => KakaoMap;
  Marker: new (options?: { position?: KakaoLatLng }) => KakaoMarker;
  event: {
    addListener(
      target: KakaoMap,
      type: "click",
      handler: (event: { latLng: KakaoLatLng }) => void,
    ): void;
    removeListener(
      target: KakaoMap,
      type: "click",
      handler: (event: { latLng: KakaoLatLng }) => void,
    ): void;
  };
  services: {
    Status: { OK: string };
    Geocoder: new () => {
      coord2Address(
        longitude: number,
        latitude: number,
        callback: (result: KakaoAddressResult[], status: string) => void,
      ): void;
    };
  };
}

interface Window {
  kakao?: { maps: KakaoMapsNamespace };
}
