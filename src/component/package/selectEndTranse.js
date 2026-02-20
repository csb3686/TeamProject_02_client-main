import React, {useState, useEffect, useRef} from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { Cookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';
import CalendarModal from '../CalendarModal';
import Salecount from '../Salecount';

import '../../css/package.css'
import axios from 'axios';
import { setInfo } from '../../store/placeSlice';

function SelectEndTranse() {

    const [place, setPlace] = useState({});
    const [order, setOrder] = useState({});

    const [keyword, setKeyword] = useState(""); 
    const [transList, setTransList] = useState([]);
    const [transOne, setTransOne] = useState({});
    const [cidStr, setCidStr] = useState('');
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    
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
            const place = cookies.get('startplace');
            if (!place) {
            return;
            }else{
                setPlace(place)
                setKeyword(place.start)
                console.log(place)
            }

            const order = cookies.get('orderinfo');
            if (!order) {
            return;
            }else{
                setOrder(order);
            }
            
            console.log(order)

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
                    // place로 trans-detail 테이블 조회해 리스트 얻어서 출력
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

        // target의 startTime 값을 formatTime 적용
        const formatted = {
            ...target,
            starttime: formatTime(target.starttime),
            endtime: formatTime(target.endtime)
        };

        setTransOne(formatted);
        // console.log(target)
    }

    const formatTime = (timeValue) => {
        if (!timeValue && timeValue == 0) return '-';
        const hour = Math.floor(timeValue / 100);
        const minute = timeValue % 100;
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };
        
    // 6. 선택된 교통 tid 얻어 cookies 에 저장 후 다음 페이지로 이동
    function onSubmit(){

        if(!transOne.name){
            return alert('교통수단을 선택해주세요')
        }
        if(!count || count == 0){
            return alert('수량을 선택해주세요')
        }

        dispatch(setInfo({cid:cidStr, tid:transOne.tid}))

        const placeFilter = {
            ...order,
            // cid:cidStr,
            entid:transOne.tid,
            entranscount:count,
            entransname:transOne.name,
            entransstart:transOne.start,
            entransend:transOne.end,
            entransselecteddate:place.enddate,
            enstarttime:transOne.starttime,
            enendtime:transOne.endtime,
            entransprice:transOne.price1,
        }
        cookies.set('orderinfo', JSON.stringify(placeFilter), {path:'/'});
        navigate('/confirmPackage');
    }

    function onSubmitWithoutTs(){
        if(window.confirm('출발일의 교통을 선택하지 않고 진행하시겠습니까?')){

            const placeFilter = {
                ...order,
                entid:'',
                entranscount:'',
                entransname:'',
                entransstart:'',
                entransend:'',
                entransselecteddate:'',
                enstarttime:'',
                enendtime:'',
                entransprice:''
            }
            cookies.set('orderinfo', JSON.stringify(placeFilter), {path:'/'});

            navigate('/confirmPackage')
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
                        <div className='pkgStepItem pkgStepCompleted'>교통수단 선택</div>
                        <div className='pkgStepArrow'><i className="fas fa-chevron-right"></i></div>
                        <div className='pkgStepItem pkgStepCompleted'>숙소 선택</div>
                        <div className='pkgStepArrow'><i className="fas fa-chevron-right"></i></div>
                        <div className='pkgStepItem pkgStepCompleted'>체험 선택</div>
                        <div className='pkgStepArrow'><i className="fas fa-chevron-right"></i></div>
                        <div className='pkgStepItem pkgStepActive'>돌아오는 교통수단 선택</div>
                    </div>
                </div>

                {/* 메인 컨텐츠 영역 */}
                <div className='pkgSelectMain'>
                    {/* 왼쪽: 지도 영역 */}
                    <div className='pkgSelectMapSection'>
                        <h2 className='pkgSelectMapTitle'>{place.enddate? place.enddate.substring(0, 10):null}{" "}{keyword}(으로)로 어떻게 돌아가실건가요?</h2>
                        <div className='pkgSelectMapContainer'>
                            <div ref={mapRef} className='pkgSelectMap'></div>
                        </div>
                    </div>

                    {/* 오른쪽: 날짜 선택 및 교통수단 리스트 */}
                    <div className='pkgSelectListSection'>
                        {/* 날짜 선택 */}
                        <div className='pkgSelectDateSection'>
                            {/* <div style={{display:'flex', flexDirection:'column'}}>
                                <div className='pkgSelectDateLabel'>이 날 도착해요!</div>
                                <div className='pkgSelectDateBox' style={{fontSize:'15pt'}}>
                                    {place.enddate? place.enddate.substring(0, 10):null}
                                </div>
                            </div> */}
                            <div>
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
                                {place?.enddate?.substring(0, 10)||''}
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
                        onClick={() => { navigate('/selectEx') }}
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

export default SelectEndTranse