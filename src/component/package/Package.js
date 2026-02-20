import React, { useState, useRef, useEffect } from 'react'
import '../../css/package.css'
import { useNavigate } from 'react-router-dom';
import { Cookies } from 'react-cookie';
import CalendarModal from '../CalendarModal';
import { useSelector } from 'react-redux';


function Package() {
    const [keyword, setKeyword] = useState('');
    const [start, setStart] = useState('');
    const [map, setMap] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const mapRef = useRef(null);
    
    const navigate = useNavigate();
    const cookies = new Cookies();
    const loginUser = useSelector(state=>state.user);

    useEffect(
        ()=>{
            if (!mapRef.current) return;

            const kakaoMap = new window.kakao.maps.Map(mapRef.current, {
            center: new window.kakao.maps.LatLng(37.5665, 126.978), // 초기 중심 좌표
            level: 3, // 확대 레벨
            });
            setMap(kakaoMap);
        },[]
    )

    function goNext(){
        if (!start || !keyword) {
            alert('출발지와 목적지를 입력해주세요');
            return;
        }

        if (!keyword.trim() || !map) return;

        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(keyword, (data, status) => {
            if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
            const place = data[0];

            // JSON으로 안전하게 저장
            const placeFilter = {
                address_name: place.address_name,
                category_group_name: place.category_group_name,
                category_name: place.category_name,
                place_name: place.place_name,
                x: place.x,
                y: place.y,
                id: place.id,
                road_address_name: place.road_address_name,
                start: start,
                keyword: keyword,
                startdate: startDate,
                enddate: endDate
            };

            cookies.set('endplace', JSON.stringify(placeFilter), { path: '/' });

            navigate('/selectTranse');
            } else {
            alert("검색 결과가 없습니다.");
            }
        });

        ps.keywordSearch(start, (data, status) => {
            if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
            const place = data[0];

            // JSON으로 안전하게 저장
            const placeFilter = {
                address_name: place.address_name,
                category_group_name: place.category_group_name,
                category_name: place.category_name,
                place_name: place.place_name,
                x: place.x,
                y: place.y,
                id: place.id,
                road_address_name: place.road_address_name,
                start: start,
                keyword: keyword,
                startdate: startDate,
                enddate: endDate
            };

            cookies.set('startplace', JSON.stringify(placeFilter), { path: '/' });

            navigate('/selectTranse');
            } else {
            alert("검색 결과가 없습니다.");
            }
        });
        
    }

    function onSubmitWithoutTs(){
        if(window.confirm('체험을 선택하지 않고 진행하시겠습니까?')){
            navigate('/selectTranse')
        }else{
            return
        }
    }

    return (
        <div className='package-page-wrapper'>
            {/* 배경 이미지 */}
            <div 
                className='package-page-bg'
                style={{
                    backgroundImage: `url('/images/main_1.jpg')`
                }}
            >
                <div className='package-page-overlay'></div>
            </div>

            {/* 상단 헤더 */}
            <div className='package-page-header'>
                <div className='package-page-logo'>
                    <img src='/images/logo.png' alt='로고' onClick={() => navigate('/')} style={{cursor: 'pointer'}} />
                </div>
                <div className='package-page-nav'>
                    <button className='package-page-nav-btn' onClick={() => navigate('/main')}>
                        메인페이지
                    </button>
                    {
                        (loginUser.userid)?
                        (null):
                        (
                            <button className='package-page-nav-btn' onClick={() => navigate('/login')}>
                                로그인/회원가입
                            </button>
                        )
                    }
                    
                </div>
            </div>

            {/* 메인 컨텐츠 */}
            <div className='package-page-content'>
                <div className='package-page-title-area'>
                    <h1 className='package-page-main-title'>
                        한번에 계획하는 국내여행
                    </h1>
                    <p className='package-page-subtitle'>
                        어디로 떠나고 싶으신가요?
                    </p>
                </div>

                <div className='package-page-form-area'>
                    {/* 기간 입력 */}
                    <div className='package-page-input-group' style={{zIndex:"9"}}>
                        <CalendarModal
                            mode="range"
                            startDate={startDate} 
                            endDate={endDate} 
                            setStartDate={setStartDate}
                            setEndDate={setEndDate}
                        />
                    </div>

                    {/* 출발지 입력 */}
                    <div className='package-page-input-group'>
                        <input
                            type='text'
                            value={start}
                            onChange={(e) => setStart(e.currentTarget.value)}
                            placeholder='출발지를 입력해주세요'
                            className='package-page-input'
                        />
                    </div>

                    {/* 목적지 입력 */}
                    <div className='package-page-input-group'>
                        <input
                            type='text'
                            value={keyword}
                            onChange={(e) => setKeyword(e.currentTarget.value)}
                            placeholder='목적지를 입력해주세요'
                            className='package-page-input'
                        />
                    </div>

                    

                    {/* 다음 버튼 */}
                    <button 
                        className='package-page-submit-btn'
                        onClick={goNext}
                    >
                        다음으로
                    </button>
                </div>

                {/* 하단 안내 문구 */}
                <div className='package-page-desc-area'>
                    <div className='package-page-desc-text'>숙소, 교통, 체험까지</div>
                    <div className='package-page-desc-text'>방문하시는 지역에 맞춰 골라보세요</div>
                </div>
            </div>

            {/* 지도 (숨김 처리) */}
            <div ref={mapRef} style={{ display: 'none' }}></div>
        </div>
    )
}

export default Package