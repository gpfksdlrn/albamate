'use client';
import { useEffect, useState } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

import {
  Coordinates,
  getCoordsByAddress,
} from '@/shared/utils/getCoordsByAddress';

/**
 * KakaoMap 컴포넌트
 *
 * - 카카오맵을 렌더링하고 지정된 위치에 마커를 표시합니다.
 * - 추후 실제 API 데이터 필요합니다.
 *
 * @author sumin
 * @date 2025-07-13
 *
 * @component
 * @example
 * <KakaoMap location="서울특별시 중구 세종대로 110" />
 *
 * @param {Object} props
 * @param {string} props.location - 마커를 표시할 주소 문자열
 * @returns {JSX.Element} 카카오맵과 마커를 렌더링하는 컴포넌트
 */

interface KakaoMaps {
  load: (callback: () => void) => void;
  Map: unknown;
  Marker: unknown;
  services: unknown;
}

interface KakaoSDK {
  maps: KakaoMaps;
}
declare global {
  interface Window {
    kakao: KakaoSDK;
  }
}

interface KakaoMapProps {
  location: string;
}

export default function KakaoMap({ location }: KakaoMapProps) {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [coords, setCoords] = useState<Coordinates | null>(null);

  useEffect(() => {
    // 이미 로드된 경우 중복 로드 방지
    if (window.kakao && window.kakao.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY}&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          setIsLoaded(true);
        });
      }
    };

    script.onerror = () => {
      const errorMessage = 'Failed to load Kakao Maps SDK';
      console.error(errorMessage);
      setLoadError(errorMessage);
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // 주소 → 좌표 변환
  useEffect(() => {
    if (!isLoaded) return;

    getCoordsByAddress(location)
      .then(result => {
        if (result) setCoords(result);
        else setLoadError('해당 주소의 좌표를 찾을 수 없습니다.');
      })
      .catch(err => {
        console.error(err);
        setLoadError('좌표 변환 중 오류가 발생했습니다.');
      });
  }, [isLoaded, location]);

  // 에러 상태 처리
  if (loadError) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg bg-gray-100">
        <p className="text-error">지도를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  // 로딩 상태 처리
  if (!isLoaded || !coords) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg bg-gray-100">
        <p className="text-gray-600">지도를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <Map
      center={{
        lat: coords.lat,
        lng: coords.lng,
      }}
      className="h-210 w-full rounded-lg lg:h-380"
      level={3}
    >
      <MapMarker
        position={{
          lat: coords.lat,
          lng: coords.lng,
        }}
        title={location}
      />
    </Map>
  );
}
