import React, { useState, useEffect, useRef } from "react";

const KakaoMapSearch = ({x ,y}) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const mapRef = useRef(null);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current) return;
    if (!window.kakao || !window.kakao.maps) return;

    const kakaoMap = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(37.5665, 126.978), // 초기 중심 좌표
      level: 3, // 확대 레벨
    });
    setMap(kakaoMap);
  }, []);

   // ✅ 좌표 바뀔 때마다 지도 업데이트
  useEffect(() => {
    if (!map || !x || !y) return;

    const position = new window.kakao.maps.LatLng(y, x);
    if (marker) marker.setMap(null);

    const newMarker = new window.kakao.maps.Marker({
      map,
      position,
    });
    setMarker(newMarker);
    map.setCenter(position);
  }, [map, x, y]);

  return (
    <div>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "500px" }}
      ></div>
    </div>
  );
};

export default KakaoMapSearch;
