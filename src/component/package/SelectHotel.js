import React, {useState, useEffect, useRef} from 'react'
import { useNavigate } from 'react-router-dom';
import { Cookies } from 'react-cookie';
import CalendarModal from '../CalendarModal';
import Salecount from '../Salecount';


import '../../css/package.css'
import axios from 'axios';
import { useSelector } from 'react-redux';

function SelectHotel() {

    // 쿠키 변수 
    const [place, setPlace] = useState({});
    const [order, setOrder] = useState({});

    const [hotel, setHotel] = useState('');
    const [keyword, setKeyword] = useState(""); // 검색어
    
    const [hotelList, setHotelList] = useState([]);
    const [option, setOption] = useState([]);
    const [selectOp, setSelectOp] = useState({});
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [count, setCount] = useState(1);
    const mapRef = useRef(null);

    const navigate = useNavigate();
    const cookies = new Cookies();

    const [showOptionSection, setShowOptionSection] = useState(false);
    const loginUser = useSelector(state=>state.user);

    useEffect(
        ()=>{
            // 1. cookies 에서 place 꺼냄
            const place = cookies.get('endplace');
            if (!place) {
            return;
            }else{
                setPlace(place);
                setKeyword(place.keyword)
                setStartDate(new Date(place.startdate))
                setEndDate(new Date(place.enddate))
            }
            console.log(place)

            const order = cookies.get('orderinfo');
            if (!order) {
            return;
            }else{
                setOrder(order);
            }
            console.log(order)
            
            // 2. place 에 있는 cid로 hotel 리스트 조회
            axios.get('/api/package/getHotelListByCid', {params:{cid:order.cid}})
            .then((result)=>{
                setHotelList(result.data.hotelList);
                // console.log(result.data.hotelList);
            }).catch((err)=>{console.error(err)})

        },[]
    )

    function showOptions(hid){
        setShowOptionSection(true); //리스트에서 클릭시 옵션보여주기

        const target = hotelList.find(item => item.hid === hid);
        setHotel(target);

        const geocoder = new window.kakao.maps.services.Geocoder();

        function getAddressFromCoords(x, y) {
        geocoder.coord2Address(x, y, function(result, status) {
            if (status === window.kakao.maps.services.Status.OK) {
            const road = result[0].road_address?.address_name || "";
            const jibun = result[0].address.address_name;
            // console.log("지번:", jibun);
            
            setHotel(prev => ({
                ...prev,
                road: road,
                jibun: jibun
            }));
            }

            setSelectOp({});
        });
        }
        getAddressFromCoords(target.x, target.y)

        axios.get('/api/package/getOptionListByHid', {params:{hid:target.hid}})
        .then((result)=>{
            setOption(result.data.optionList);
            console.log(result.data.optionList)
        }).catch((err)=>{console.error(err)})
    }

    function oneOption(opid, start, end){
       
        const target = option.find(item => item.opid === opid);
        setSelectOp(target);

        const sdate = new Date(start)
        const edate = new Date(end)
        const fmSDate = sdate.toISOString().slice(0, 10);
        const fmEDate = edate.toISOString().slice(0, 10);

        setSelectOp(prev =>({
            ...prev,
            startDate:fmSDate,
            endDate:fmEDate
        }))
    }


    function calculateNights(checkIn, checkOut) {
        if (!checkIn || !checkOut) return 1;
        const inDate = new Date(checkIn);
        const outDate = new Date(checkOut);
        const diffTime = outDate - inDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays > 0 ? diffDays : 1;
    }
    // ✅ 숙박일수 & 총금액 계산
    const nights = calculateNights(startDate, endDate);

    const formatLocalDate = (date) => {
        if(!date) return null;
        const d = (date instanceof Date) ? date : new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

     //startDate / endDate 상태 업데이트
    useEffect(() => {
        if(selectOp?.opid){
            setSelectOp(prev => ({
                ...prev,
                startDate: formatLocalDate(startDate) || prev.startDate,
                endDate: formatLocalDate(endDate) || prev.endDate
            }));
        }
    }, [startDate, endDate, selectOp?.opid]);

    function onSubmit(){
        const today = new Date();
        const start = new Date(startDate);

        const tmonth = today.getMonth() + 1; // 월(0~11이므로 +1)
        const tday = today.getDate();        // 일

        const smonth = start.getMonth() + 1;
        const sday = start.getDate();

        if(!hotel){
            return alert('숙소를 선택해주세요')
        }
        if(!selectOp.opid){
            return alert('옵션을 선택해주세요')
        }
        // if(tmonth == smonth && tday == sday){
        //     return alert('날짜를 선택해주세요')
        // }

        const placeFilter = {
            ...order,
            hnights:nights,
            hid:hotel.hid,
            hopid:selectOp.opid,
            hotelstartdate:startDate,
            hotelenddate:endDate,
            hotelcount: count,
            hotelname:hotel.name,
            hotelprice:selectOp.price1,
        }
        cookies.set('orderinfo', JSON.stringify(placeFilter), {path:'/'});
        navigate('/selectEx');
    }

    const totalPrice = selectOp?.price1 ? nights * selectOp.price1 * count : null;

    const isSelectable = (date, start, end) => {
        if (!date) return false;

        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const s = start instanceof Date
            ? new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
            : null;
        const e = end instanceof Date
            ? new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
            : null;

        return (!s || d >= s) && (!e || d <= e);
    };

    function onSubmitWithoutHo(){
        if(window.confirm('숙소를 선택하지 않고 진행하시겠습니까?')){
        const placeFilter = {
            ...order,
            hnights:'',
            hid:'',
            hopid:'',
            hotelstartdate:'',
            hotelenddate:'',
            hotelcount: '',
            hotelname:'',
            hotelprice:'',
        }
        cookies.set('orderinfo', JSON.stringify(placeFilter), {path:'/'});

        navigate('/selectEx')
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
                <div className='pkgSelectHeader'>
                    
                    <div className='pkgSelectSteps'>
                        <div className='pkgStepItem pkgStepCompleted'>위치 선택</div>
                        <div className='pkgStepArrow'><i className="fas fa-chevron-right"></i></div>
                        <div className='pkgStepItem pkgStepCompleted'>교통수단 선택</div>
                        <div className='pkgStepArrow'><i className="fas fa-chevron-right"></i></div>
                        <div className='pkgStepItem pkgStepActive'>숙소 선택</div>
                        <div className='pkgStepArrow'><i className="fas fa-chevron-right"></i></div>
                        <div className='pkgStepItem'>체험 선택</div>
                        <div className='pkgStepArrow'><i className="fas fa-chevron-right"></i></div>
                        <div className='pkgStepItem '>돌아오는 교통수단 선택</div>
                    </div>
                </div>

                <div className='pkgSelectMain'>
                    <div className='pkgSelectMapSection'>
                        <h2 className='pkgSelectMapTitle'>{keyword} 어디에서 지내시나요?</h2>
                        <div className='pkgSelectMapContainer pkgSelectHotelPreview'>
                            {
                                hotel?.image ? (
                                    <img src={hotel.image} alt={hotel.name} />
                                ) : (
                                    <div className='pkgSelectEmptyState'>숙소를 선택하면 정보가 표시됩니다.</div>
                                )
                            }
                        </div>
                        {
                            (hotel?.road || hotel?.jibun) && (
                                <div className='pkgSelectHotelAddress'>
                                    <i className="fas fa-map-marker-alt"></i>
                                    {hotel.road || hotel.jibun}
                                </div>
                            )
                        }
                    </div>

                    <div className='pkgSelectListSection'>
                        <div className='pkgSelectDateSection pkgCalCol'>
                            <div style={{display:'flex', flexDirection:'column'}}>
                                <div className='pkgSelectDateLabel'>체크인 / 체크아웃</div>
                                <div className='pkgSelectDateBox'>
                                    <CalendarModal
                                        mode="packageDateRange"
                                        startDate={startDate} 
                                        endDate={endDate} 
                                        setStartDate={setStartDate}
                                        setEndDate={setEndDate}
                                        filterDate={(date) => isSelectable(date, startDate, endDate)}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className='pkgSelectDateLabel'>객실은 몆 개가 필요하신가요?</div>
                                <Salecount count={count} onCountChange={setCount} />
                            </div>
                        </div>

                        <div className='pkgSelectList'>
                            <div className='pkgSelectLabel'>숙소 선택</div>
                            <div className='pkgSelectScroll'>
                                {
                                    (hotelList.length === 0) ?
                                        (<div className='pkgSelectEmpty'>이용 가능한 호텔이 없습니다.</div>) :
                                        (
                                            hotelList.map((list, idx) => (
                                                <div
                                                    className={`pkgSelectItem ${hotel?.hid === list.hid ? 'pkgSelectSelected' : ''}`}
                                                    onClick={() => { showOptions(list.hid) }}
                                                    key={idx}
                                                >
                                                    <div className='pkgSelectName'>{list.name}</div>
                                                    <div className='pkgSelectRoute'>{list.spotcontent}</div>
                                                </div>
                                            ))
                                        )
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`pkgSelectOptionSection ${showOptionSection ? 'active' : ''}`}>
                    <div className='pkgSelectLabel'>숙소 옵션 선택</div>
                    <div className='pkgSelectOptionList'>
                        {
                            option.length === 0 ? (
                                <div className='pkgSelectEmpty'>선택 가능한 옵션이 없습니다.</div>
                            ) : (
                                option.map((op, idx) => (
                                    <div className='pkgSelectOptionCard' key={idx}>
                                        <div className='pkgSelectOptionInline'>
                                            <span className='pkgSelectOptionTitle'>{op.name}</span>
                                            <span className='pkgSelectOptionDivider'>|</span>
                                            <span className='pkgSelectOptionPrice'>
                                                {new Intl.NumberFormat('ko-KR').format(op.price1)}원 / 박
                                            </span>
                           	    			<span className='pkgSelectOptionDivider'>|</span>
                                            <span className='pkgSelectOptionDesc'>{op.content}</span>
                                        </div>
                                        <button
                                            className='pkgSelectBtn pkgSelectOptionBtn'
                                            onClick={() => { oneOption(op.opid, startDate, endDate) }}
                                        >
                                            옵션 선택
                                        </button>
                                    </div>
                                ))
                            )
                        }
                    </div>
                </div>

                <div className='pkgSelectDetailSection'>
                    <div className='pkgSelectDetailTitle'>선택한 숙소 정보</div>
                    <div className='pkgSelectDetailContent pkgSelectDetailRowSplit'>
                        <div className='pkgSelectDetailGroup'>
                            <span className='pkgSelectDetailLabel'>숙소명</span>
                            <span className='pkgSelectDetailValue'>{hotel?.name || '-'}</span>
                        </div>
                        <div className='pkgSelectDetailGroup'>
                            <span className='pkgSelectDetailLabel'>위치</span>
                            <span className='pkgSelectDetailValue'>{hotel?.road || hotel?.jibun || '-'}</span>
                        </div>
                    </div>
                    <div className='pkgSelectDetailContent pkgSelectDetailRowSplit pkgSelectDetailRowLast'>    
                        <div className='pkgSelectDetailGroup'>
                            <span className='pkgSelectDetailLabel'>옵션</span>
                            <span className='pkgSelectDetailValue'>
                                {
                                    selectOp?.name
                                        ? `${selectOp.name} (${selectOp.startDate || '-'} ~ ${selectOp.endDate || '-'}, ${nights}박)`
                                        : '-'
                                }
                            </span>
                        </div>
                        <div className='pkgSelectDetailGroup'>
                            <span className='pkgSelectDetailLabel'>총 금액</span>
                            <span className='pkgSelectDetailValue pkgSelectDetailPrice'>
                                {totalPrice ? `${new Intl.NumberFormat('ko-KR').format(totalPrice)}원` : '-'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className='pkgSelectFooter'>
                <div className='pkgSelectFooterInner'>
                    <button
                        className='pkgSelectBtn pkgSelectBtnPrev'
                        onClick={()=>{navigate('/selectTranse')}}
                    >
                        이전으로
                    </button>
                    <div className='pkgSelectSelectedInfo'>
                        <span className='pkgSelectSelectedLabel'>선택한 숙소:</span>
                        <span className='pkgSelectSelectedName'>{hotel?.name || '선택 안됨'}</span>
                        <span className='pkgSelectSelectedLabel'>선택한 옵션:</span>
                        <span className='pkgSelectSelectedName'>{selectOp?.name || '선택 안됨'}</span>
                    </div>
                    <button className='pkgSelectBtn pkgSelectBtnPrev' onClick={()=>{onSubmitWithoutHo()}} >선택하지 않고 건너뛰기</button>
                    <button
                        className='pkgSelectBtn pkgSelectBtnNext'
                        onClick={()=>{onSubmit()}}
                    >
                        다음으로
                    </button>
                </div>
            </div>
        </>
    )
}

export default SelectHotel