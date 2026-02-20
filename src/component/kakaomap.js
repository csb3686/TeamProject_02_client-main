import React, { useState, useEffect, useRef } from "react";

const KakaoMapSearch = () => {
  const [keyword, setKeyword] = useState(""); // 검색어
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const mapRef = useRef(null);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current) return;

    const kakaoMap = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(37.5665, 126.978), // 초기 중심 좌표
      level: 3, // 확대 레벨
    });
    setMap(kakaoMap);
  }, []);

  const handleSearch = () => {
    if (!keyword.trim() || !map) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(keyword, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        const place = data[0]; // 첫 번째 검색 결과
        const position = new window.kakao.maps.LatLng(place.y, place.x);

        // 기존 마커 제거
        if (marker) marker.setMap(null);

        // 새로운 마커 생성
        const newMarker = new window.kakao.maps.Marker({
          map: map,
          position: position,
        });
        setMarker(newMarker);

        // 지도 중심 이동
        map.setCenter(position);
        console.log(place)
      } else {
        alert("검색 결과가 없습니다.");
      }
    });
  };

  return (
    <div>
      <input
        type="text"
        placeholder="지역명 입력"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <button onClick={handleSearch}>검색</button>

      <div
        ref={mapRef}
        style={{ width: "100%", height: "500px", marginTop: "20px" }}
      ></div>
    </div>
  );
};

export default KakaoMapSearch;
