import React, {useState, useEffect, useRef} from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { Cookies } from 'react-cookie';
import { useDispatch } from 'react-redux';
import Salecount from '../Salecount';

import '../../css/package.css'
import axios from 'axios';
import { setInfo } from '../../store/placeSlice';

function EnTransEditModal({onClose, oldtrans}) {
    const [transList, setTransList] = useState([]);
    const [transOne, setTransOne] = useState({});
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [place, setPlace] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const mapRef = useRef(null);
    const [count, setCount] = useState(1);

    const [order, setOrder] = useState({});

    // 이전에 선택한 정보들
    const cookies = new Cookies();

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    useEffect(
        ()=>{
            // 1. cookies 에서 place(카카오맵 검색결과) 꺼냄
            const place = cookies.get('startplace');
            if (!place) {
            return;
            }else{
                setPlace(place)
                setSelectedDate(place.startdate)
                
                
            }
            
            console.log(place)

            // 2. place 정보로 카카오맵 매핑                                                                     
            const kakaoMap = new window.kakao.maps.Map(mapRef.current, {
                center: new window.kakao.maps.LatLng(place.y, place.x),
                level: 8,
            });
            setMap(kakaoMap);

            if (marker) marker.setMap(null);

            const newMarker = new window.kakao.maps.Marker({
                map: kakaoMap,
                position: new window.kakao.maps.LatLng(place.y, place.x),
            });
            setMarker(newMarker);

            // 지도 중심 이동
            kakaoMap.setCenter(new window.kakao.maps.LatLng(place.y, place.x));

            const order = cookies.get('orderinfo');
            if (!order) {
            return;
            }else{
                setOrder(order);
            }
            console.log(order)

            async function fetchData(){
                try{
                    const result2 = await axios.get('/api/package/getTransList', {params:{place:place.start, start:place.keyword}})
                    setTransList(result2.data.transList)
                    // console.log(result2.data.transList)

                }catch(err){console.error(err)}
            }
            fetchData()
            
        },[]
    )

    // 5. 교통 하나 선택하면 옵션쪽에 교통 상세 내용 출력
    function showOptions(tid){
        const target = transList.find(item => item.tid === tid);

        if (!target) return;

        // target의 startTime 값을 formatTime 적용
        const formatted = {
            ...target,
            starttime: formatTime(target.starttime),
            endtime: formatTime(target.endtime)
        };

        setTransOne(formatted);

    }

    const formatTime = (timeValue) => {
        if (!timeValue && timeValue == 0) return '-';
        const hour = Math.floor(timeValue / 100);
        const minute = timeValue % 100;
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };
        
    // 6. 선택된 교통 tid 얻어 cookies 에 저장 후 다음 페이지로 이동
    function onSubmit(){
        const today = new Date().toISOString().slice(0, 10);;
        const select = new Date(selectedDate).toISOString().slice(0, 10);;

        if(!transOne.name){
            return alert('교통수단을 선택해주세요')
        }
        if(!count || count == 0){
            return alert('수량을 선택해주세요')
        }
        if(today == select){
            if(window.confirm('선택하신 날짜가 오늘 입니다. 계속 진행하시겠습니까?')){
                
            }else{return;}
        }

        const placeFilter = {
            ...order,
            entid:transOne.tid,
            entranscount:count,
            entransname:transOne.name,
            entransstart:transOne.start,
            entransend:transOne.end,
            entransselecteddate:selectedDate,
            enstarttime:transOne.starttime,
            enendtime:transOne.endtime,
            entransprice:transOne.price1,
        }
        cookies.set('orderinfo', placeFilter, {path:'/'});
        onClose();
    }

    

    return (
        <>
            <div className='pk_modal_background'>
            <div className='pk_modal'>
            <div className='pkgSelectWrapper'>
                {/* 메인 컨텐츠 영역 */}


                {/* 기존 교통수단 상세 정보 */}
                <div className='pkgSelectDetailSection' style={{marginBottom:'50px'}}>
                    <div className='pkgSelectDetailTitle'>기존 교통수단 정보</div>
                    <div className='pkgSelectDetailContent pkgSelectDetailRowSplit'>
                        <div className='pkgSelectDetailGroup'>
                            <span className='pkgSelectDetailLabel'>상품명</span>
                            <span className='pkgSelectDetailValue'>{oldtrans?.name || '-'}
                            </span>
                        </div>
                        <div className='pkgSelectDetailGroup'>
                            <span className='pkgSelectDetailLabel'>출발 / 도착</span>
                            <span className='pkgSelectDetailValue'>{ oldtrans?.start || '-' } / { oldtrans?.end || '-' }</span>
                        </div>
                    </div>
                    <div className='pkgSelectDetailContent pkgSelectDetailRowSplit pkgSelectDetailRowLast'>
                        <div className='pkgSelectDetailGroup'>
                            <span className='pkgSelectDetailLabel'>출발일</span>
                            <span className='pkgSelectDetailValue'>
                                {
                                    (place.startdate) ? (selectedDate.substring(0, 10)) : ('날짜를 선택해주세요')
                                }
                            </span>
                        </div>
                        <div className='pkgSelectDetailGroup'>
                            <span className='pkgSelectDetailLabel'>가격</span>
                            <span className='pkgSelectDetailValue pkgSelectDetailPrice'>
                                {`${new Intl.NumberFormat('ko-KR').format(Number(oldtrans?.price)* oldtrans?.count)}원` || '-'}
                            </span>
                        </div>
                    </div>
                </div>



                <div className='pkgSelectMain'>
                    {/* 왼쪽: 지도 영역 */}
                    <div className='pkgSelectMapSection'>
                        <h2 className='pkgSelectMapTitle'>교통수단 수정</h2>
                        <div className='pkgSelectMapContainer'>
                            <div ref={mapRef} className='pkgSelectMap'></div>
                        </div>
                    </div>

                    {/* 오른쪽: 날짜 선택 및 교통수단 리스트 */}
                    <div className='pkgSelectListSection'>
                        {/* 날짜 선택 */}
                        <div className='pkgSelectDateSection'>
                            <div style={{display:'flex', flexDirection:'column'}}>
                                <div className='pkgSelectDateLabel'>이 날 출발해요!</div>
                                <div className='pkgSelectDateBox' style={{fontSize:'15pt'}}>
                                    {place.startdate? place.startdate.substring(0, 10):null}
                                </div>
                            </div>
                            <div style={{display:'flex', flexDirection:'column', marginLeft:'50px'}}>
                                <div className='pkgSelectDateLabel'>몆 분이서 가시나요?</div>
                                <Salecount count={count} onCountChange={setCount} />
                            </div>
                        </div>

                        {/* 교통수단 리스트 */}
                        <div className='pkgSelectList'>
                            <div className='pkgSelectLabel'>어떤걸로 가실지 골라주세요</div>
                            <div className='pkgSelectScroll'>
                                {
                                    (transList.length == 0) ? (
                                        <div className='pkgSelectEmpty'>이용 가능한 교통수단이 없습니다.</div>
                                    ) : (
                                        transList.map((list, idx) => {
                                            return (
                                                <div 
                                                    className={`pkgSelectItem ${transOne.tid === list.tid ? "pkgSelectSelected" : ""}`} 
                                                    onClick={() => { showOptions(list.tid) }} 
                                                    key={idx}
                                                >
                                                    <div className='pkgSelectCategory'>{list.category}</div>
                                                    <div className='pkgSelectName'>{list.name}</div>
                                                    <div className='pkgSelectRoute'>{list.end} 행</div>
                                                </div>
                                            )
                                        })
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* 선택한 교통수단 상세 정보 */}
                <div className='pkgSelectDetailSection'>
                    <div className='pkgSelectDetailTitle'>선택한 교통수단 정보</div>
                    <div className='pkgSelectDetailContent pkgSelectDetailRowSplit'>
                        <div className='pkgSelectDetailGroup'>
                            <span className='pkgSelectDetailLabel'>상품명</span>
                            <span className='pkgSelectDetailValue'>{transOne.name || '-'}
                            </span>
                        </div>
                        <div className='pkgSelectDetailGroup'>
                            <span className='pkgSelectDetailLabel'>출발 / 도착</span>
                            <span className='pkgSelectDetailValue'>{ transOne?.start || '-' } / { transOne?.end || '-' }</span>
                        </div>
                    </div>
                    <div className='pkgSelectDetailContent pkgSelectDetailRowSplit pkgSelectDetailRowLast'>
                        <div className='pkgSelectDetailGroup'>
                            <span className='pkgSelectDetailLabel'>출발일</span>
                            <span className='pkgSelectDetailValue'>
                                {(place.startdate) ? (selectedDate.substring(0, 10)) : ('날짜를 선택해주세요')}
                                {` / ${transOne?.starttime || ''} - ${transOne?.endtime || ''}`}
                            </span>
                        </div>
                        <div className='pkgSelectDetailGroup'>
                            <span className='pkgSelectDetailLabel'>가격</span>
                            <span className='pkgSelectDetailValue pkgSelectDetailPrice'>
                                {transOne.price1 ? `${new Intl.NumberFormat('ko-KR').format(Number(transOne.price1)*count)}원` : '-'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            
            <div className='pk_button'>
                {/* 공유 state 보내서 값 꺼낸후 다시 쿠키에 저장하기 */}
                <button onClick={()=>{onSubmit()}}>저장 및 닫기</button><button onClick={onClose}>취소</button>
            </div>
            </div>
            </div>
        </>
    )
}

export default EnTransEditModal