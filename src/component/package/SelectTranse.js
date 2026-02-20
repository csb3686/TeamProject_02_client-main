import React, {useState, useEffect, useRef} from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { Cookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';
import CalendarModal from '../CalendarModal';
import Salecount from '../Salecount';

import '../../css/package.css'
import axios from 'axios';
import { setInfo } from '../../store/placeSlice';

function SelectTranse() {
    const [keyword, setKeyword] = useState(""); 
    const [transList, setTransList] = useState([]);
    const [transOne, setTransOne] = useState({});
    const [cidStr, setCidStr] = useState('');
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [place, setPlace] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const mapRef = useRef(null);
    const [count, setCount] = useState(1);

    // 이전에 선택한 정보들
    const [transname, setTransname] = useState('');
    const [transstart, setTransstart] = useState('');
    const [transend, setTransend] = useState('');

    const navigate = useNavigate();
    const cookies = new Cookies();
    const dispatch = useDispatch();

    const loginUser = useSelector(state=>state.user);

    useEffect(
        ()=>{
            // 1. cookies 에서 place(카카오맵 검색결과) 꺼냄
            const place = cookies.get('endplace');
            if (!place) {
            return;
            }else{
                setPlace(place)
                setKeyword(place.keyword)
                setSelectedDate(place.startdate)
                
                if(place.transname){
                    setTransname(place.transname)
                }
                if(place.transstart) setTransstart(place.transstart);
                if(place.transend) setTransend(place.transend);
                if(place.transCount) setCount(place.transCount);
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

            async function fetchData(){
                try{
                    // keyword 의 cid를 얻어야함 ㅎㅎ
                    const result1 = await axios.get('/api/package/getCidByKeyword', {params:{keyword:place.keyword}})
                    
                    setCidStr(String(result1.data).substring(0, 2)); 

                    // place로 trans-detail 테이블 조회해 리스트 얻어서 출력
                    const result2 = await axios.get('/api/package/getTransList', {params:{place:place.keyword, start:place.start}})
                    setTransList(result2.data.transList)

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

        dispatch(setInfo({cid:cidStr, tid:transOne.tid}))

        const placeFilter = {
            cid:cidStr,
            sttid:transOne.tid,
            sttranscount:count,
            sttransname:transOne.name,
            sttransstart:transOne.start,
            sttransend:transOne.end,
            sttransselecteddate:selectedDate,
            sttransprice:transOne.price1,
            ststarttime:transOne.starttime,
            stendtime:transOne.endtime,
        }
        cookies.set('orderinfo', JSON.stringify(placeFilter), {path:'/'});
        navigate('/selectHotel');
    }

    function onSubmitWithoutTs(){
        if(window.confirm('출발일의 교통을 선택하지 않고 진행하시겠습니까?')){

            const placeFilter = {
                cid:cidStr,
                sttid:'',
                sttransSelectedDate:'',
                sttransCount:'',
                sttransname:'',
                sttransstart:'',
                sttransend:'',
                sttransprice:'',
                ststarttime:'',
                stendtime:''
            }
            cookies.set('orderinfo', JSON.stringify(placeFilter), {path:'/'});

            navigate('/selectHotel')
        }else{
            return
        }
    }

    

    return (
        <>

            <div className='package-page-header pksub'>
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
            <div className='pkgSelectWrapper'>
                {/* 단계 표시 헤더 */}
                <div className='pkgSelectHeader'>
                    <div className='pkgSelectSteps'>
                        <div className='pkgStepItem pkgStepCompleted'>위치 선택</div>
                        <div className='pkgStepArrow'><i className="fas fa-chevron-right"></i></div>
                        <div className='pkgStepItem pkgStepActive'>교통수단 선택</div>
                        <div className='pkgStepArrow'><i className="fas fa-chevron-right"></i></div>
                        <div className='pkgStepItem'>숙소 선택</div>
                        <div className='pkgStepArrow'><i className="fas fa-chevron-right"></i></div>
                        <div className='pkgStepItem'>체험 선택</div>
                        <div className='pkgStepArrow'><i className="fas fa-chevron-right"></i></div>
                        <div className='pkgStepItem'>돌아오는 교통수단 선택</div>
                    </div>
                </div>

                {/* 메인 컨텐츠 영역 */}
                <div className='pkgSelectMain'>
                    {/* 왼쪽: 지도 영역 */}
                    <div className='pkgSelectMapSection'>
                        <h2 className='pkgSelectMapTitle'>{place.startdate? place.startdate.substring(0, 10):null} {keyword} 으로 출발! 어떻게 가실건가요?</h2>
                        <div className='pkgSelectMapContainer'>
                            <div ref={mapRef} className='pkgSelectMap'></div>
                        </div>
                    </div>

                    {/* 오른쪽: 날짜 선택 및 교통수단 리스트 */}
                    <div className='pkgSelectListSection'>
                        {/* 날짜 선택 */}
                        <div className='pkgSelectDateSection'>
                            {/* <div style={{display:'flex', flexDirection:'column'}}>
                                <div className='pkgSelectDateLabel'>이 날 출발해요!</div>
                                <div className='pkgSelectDateBox' style={{fontSize:'15pt'}}>
                                    {place.startdate? place.startdate.substring(0, 10):null}
                                </div>
                            </div> */}
                            <div style={{display:'flex', flexDirection:'column'}}>
                                <div className='pkgSelectDateLabel'>몆 분이서 가시나요?</div>
                                <Salecount count={count} onCountChange={setCount} />
                            </div>
                        </div>

                        {/* 교통수단 리스트 */}
                        <div className='pkgSelectList'>
                            <div className='pkgSelectLabel'>교통수단을 선택해주세요</div>
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
                            <span className='pkgSelectDetailValue'>{ transOne?.start || transstart || '-' } / { transOne?.end || transend || '-' }</span>
                        </div>
                    </div>
                    <div className='pkgSelectDetailContent pkgSelectDetailRowSplit pkgSelectDetailRowLast'>
                        <div className='pkgSelectDetailGroup'>
                            <span className='pkgSelectDetailLabel'>출발일/시</span>
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
            
            {/* 하단 버튼 영역 - 화면 하단 고정 */}
            <div className='pkgSelectFooter'>
                <div className='pkgSelectFooterInner'>
                    <button 
                        className='pkgSelectBtn pkgSelectBtnPrev' 
                        onClick={() => { navigate('/') }}
                    >
                        이전으로
                    </button>
                    <div className='pkgSelectSelectedInfo'>
                        <span className='pkgSelectSelectedLabel'>선택한 교통수단:</span>
                        <span className='pkgSelectSelectedName'>{transOne.name || '선택 안됨'}</span>
                    </div>
                    <button className='pkgSelectBtn pkgSelectBtnPrev' onClick={()=>{onSubmitWithoutTs()}} >선택하지 않고 건너뛰기</button>
                    <button 
                        className='pkgSelectBtn pkgSelectBtnNext' 
                        onClick={() => { onSubmit() }}
                    >
                        다음으로
                    </button>
                </div>
            </div>
        </>
    )
}

export default SelectTranse