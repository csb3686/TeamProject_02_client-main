import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Cookies } from 'react-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import ObEditModal from './HotelEditModal';
import ListEditModal from './ListEditModal';
import StTransEditModal from './StTransEditModal';
import EnTransEditModal from './EnTransEditModal';

function ConfirmPackage() {

    const [startplace, setStartPlace] = useState({});
    const [endplace, setEndPlace] = useState({});
    const [order, setOrder] = useState({});

    const loginUser = useSelector(state=>state.user);
    const cookies = new Cookies();
    const navigate = useNavigate();
    
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [hotel, setHotel] = useState({});
    const [starttrans, setStartTrans] = useState({});
    const [endtrans, setEndTrans] = useState({});
    const [exList, setExList] = useState([]);
    const [option, setOption] = useState({});

    const [obModalOpen, setObModalOpen] = useState(false);
    const [ListModalOpen, setListModalOpen] = useState(false);
    const [EnTransModalOpen, setEnTransModalOpen] = useState(false)
    const [StTransModalOpen, setStTransModalOpen] = useState(false);

    const [edit, setEdit] = useState({});
    const [editList, setEditList] = useState([]);


    useEffect(
        ()=>{
            // 1. cookies 에서 place 꺼냄
            const startplace = cookies.get('startplace');
            if (!startplace) {
            return;
            }else{
                setStartPlace(startplace);
                setStart(startplace.start)
            }

            const order = cookies.get('orderinfo');
            if (!order) {
            return;
            }else{
                setOrder(order);

                let safeExList = [];
                try {
                    safeExList = order.exlist ? JSON.parse(order.exlist) : [];
                    if (!Array.isArray(safeExList)) {
                        safeExList = [];
                    }
                } catch (e) {
                    safeExList = [];
                }
                setExList(safeExList);

                setHotel({hid:order.hid, nights:order.hnights, count:order.hotelcount, opid:order.hopid, startdate:order.hotelstartdate, enddate:order.hotelenddate, name:order.hotelname, price:order.hotelprice})

                setStartTrans({sttid:order.sttid, count:order.sttranscount, start:order.sttransstart, end:order.sttransend, name:order.sttransname, selecteddate:order.sttransselecteddate, price:order.sttransprice, starttime:order.ststarttime, endtime:order.stendtime})

                setEndTrans({entid:order.entid, count:order.entranscount, start:order.entransstart, end:order.entransend, name:order.entransname, selecteddate:order.entransselecteddate, starttime:order.enstarttime, endtime:order.enendtime, price:order.entransprice})
            }
            console.log(order)


            const endplace = cookies.get('endplace');
            if(!endplace){
                return;
            }else{
                setEndPlace(endplace);
                setEnd(endplace.keyword)
            }

            axios.get('/api/package/getOptionByOpid', {params:{opid:order.hopid}})
            .then((result)=>{
                setOption(result.data)
            }).catch((err)=>{console.error(err)})

        },[]
    )

    useEffect(() => {
    if (!StTransModalOpen) {
        const order = cookies.get('orderinfo');
        if (order) {
            setOrder(order);
            // 필요한 state들 다시 세팅
            setStartTrans({sttid:order.sttid, count:order.sttranscount, start:order.sttransstart, end:order.sttransend, name:order.sttransname, selecteddate:order.sttransselecteddate, price:order.sttransprice, starttime:order.ststarttime, endtime:order.stendtime})
        }
    }
    }, [StTransModalOpen]);

    useEffect(() => {
    if (!EnTransModalOpen) {
        const order = cookies.get('orderinfo');
        if (order) {
            setOrder(order);
            // 필요한 state들 다시 세팅
            setEndTrans({entid:order.entid, count:order.entranscount, start:order.entransstart, end:order.entransend, name:order.entransname, selecteddate:order.entransselecteddate, starttime:order.enstarttime, endtime:order.enendtime, price:order.entransprice})
        }
    }
    }, [EnTransModalOpen]);

    useEffect(() => {
    if (!obModalOpen) {
        const order = cookies.get('orderinfo');
        if (order) {
            setOrder(order);
            // 필요한 state들 다시 세팅
            setHotel({hid:order.hid, nights:order.hnights, count:order.hotelcount, opid:order.hopid, startdate:order.hotelstartdate, enddate:order.hotelenddate, name:order.hotelname, price:order.hotelprice})

            axios.get('/api/package/getOptionByOpid', {params:{opid:order.hopid}})
            .then((result)=>{
                setOption(result.data)
            }).catch((err)=>{console.error(err)})
        }
    }
    }, [obModalOpen]);

    useEffect(() => {
    if (!ListModalOpen) {
        const order = cookies.get('orderinfo');
        if (order) {
            setOrder(order);
            // 필요한 state들 다시 세팅
            let safeExList = [];
            try {
                safeExList = order.exlist ? JSON.parse(order.exlist) : [];
                if (!Array.isArray(safeExList)) {
                    safeExList = [];
                }
            } catch (e) {
                safeExList = [];
            }
            setExList(safeExList);
        }
    }
    }, [ListModalOpen]);
    

    function onsubmit(){
        if(window.confirm('주문을 진행하시겠습니까?')){

            if(order.hid == '' && order.sttid == '' && order.entid == '' && order.exlist == ''){
                alert('선택된 내용이 없습니다');
                return;
            }
            if(loginUser.userid){

                navigate('/goCartForPackage')
            }else{
                navigate('/goLogin')
            }
        }else{
            return;
        }
    }

    function goDetail(object){

        // 각 객체를 수정하기 누르면 객체의 정보가 공유하는 state 변수에 담김
        setEdit(object)

        // 그리고 모달 오픈
        setObModalOpen(true);
    }

    function goStTransDetail(object){
        setEdit(object)
        setStTransModalOpen(true);
    }

    function goEnTransDetail(object){
        setEdit(object);
        setEnTransModalOpen(true);
    }


    function goListDetail(exList){

        setEditList(exList);

        setListModalOpen(true);

    }


    return (
        <>
        {
            obModalOpen && (
                <ObEditModal 
                    onClose={()=>{setObModalOpen(false)}}
                    oldhotel={edit}
                    oldop={option}
                />
            )
        }
        {
            StTransModalOpen && (
                <StTransEditModal 
                    onClose={()=>{setStTransModalOpen(false)}}
                    oldtrans={edit}
                />
            )
        }
        {
            EnTransModalOpen && (
                <EnTransEditModal
                    onClose={()=>{setEnTransModalOpen(false)}}
                    oldtrans={edit}
                />
            )
        }
        {
            ListModalOpen && (
                <ListEditModal 
                    onClose={()=>{setListModalOpen(false)}}
                    list={editList}
                />
            )
        }
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
        <div className='pk_confirm'>
            <div className='pk_confirm_wrap'>
                <i class="fas fa-check" style={{display:"inline-block",fontSize: "30px",marginRight: "10px"}}></i>
                <h2 style={{display:"inline-block"}}>패키지 체크</h2>

                <div className='pk_cofirmMsg' style={{color:"#5c5c5cff"}}>
                    <i class="fas fa-exclamation-circle" style={{marginRight: '8px'}}></i>
                    선택하신 내역이 맞는지 확인해주세요!
                </div>
                <div className='pk_conflexBox'>
                    <div className='pk_confirm_box'>
                        <div className='pk_title_wrap'><h3>1. 가는 교통수단</h3><button onClick={()=>{goStTransDetail(starttrans)}}>부분 수정</button></div>
                        <div className='pk_table_wrap'>
                            <div className='pk_table'>
                                <div className='pk_tr'>
                                    <div className='pk_th'>상품명</div><div className='pk_td'>{starttrans.name || ' - '}</div>
                                </div>
                                <div className='pk_tr'>
                                    <div className='pk_th'>명수(개수)</div><div className='pk_td'>{starttrans.count || ' - '}</div>
                                </div>
                                <div className='pk_tr'>
                                    <div className='pk_th'>출발지</div><div className='pk_td'>{starttrans.start || ' - '}</div>
                                </div>
                                <div className='pk_tr'>
                                    <div className='pk_th'>도착지</div><div className='pk_td'>{starttrans.end || ' - '}</div>
                                </div>
                                <div className='pk_tr'>
                                    <div className='pk_th'>예약일자</div><div className='pk_td'>{starttrans.selecteddate ? starttrans.selecteddate.substring(0, 10):null || ' - '}</div>
                                </div>
                                <div className='pk_tr'>
                                    <div className='pk_th'>예약시간</div><div className='pk_td'>{`${starttrans.starttime}` - `${starttrans.endtime}` || ' - '}</div>
                                </div>
                                <div className='pk_tr'>
                                    <div className='pk_th'>총 금액</div>
                                    <div className='pk_td'>
                                        {starttrans.price && starttrans.count
                                        ? (Number(starttrans.price) * Number(starttrans.count)).toLocaleString('ko-KR')
                                        : ' - '}원

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='pk_confirm_box'>
                        <div className='pk_title_wrap'><h3>2. 오는 교통수단</h3><button onClick={()=>{goEnTransDetail(endtrans)}}>부분 수정</button></div>
                        <div className='pk_table_wrap'>
                            <div className='pk_table'>
                                <div className='pk_tr'>
                                    <div className='pk_th'>상품명</div><div className='pk_td'>{endtrans.name || ' - '}</div>
                                </div>
                                <div className='pk_tr'>
                                    <div className='pk_th'>명수(개수)</div><div className='pk_td'>{endtrans.count || ' - '}</div>
                                </div>
                                <div className='pk_tr'>
                                    <div className='pk_th'>출발지</div><div className='pk_td'>{endtrans.start || ' - '}</div>
                                </div>
                                <div className='pk_tr'>
                                    <div className='pk_th'>도착지</div><div className='pk_td'>{endtrans.end || ' - '}</div>
                                </div>
                                <div className='pk_tr'>
                                    <div className='pk_th'>예약일자</div><div className='pk_td'>{endtrans.selecteddate ? endtrans.selecteddate.substring(0, 10):null || ' - '}</div>
                                </div>
                                <div className='pk_tr'>
                                    <div className='pk_th'>예약시간</div><div className='pk_td'>{`${endtrans.starttime} - ${endtrans.endtime}` || ' - '}</div>
                                </div>
                                <div className='pk_tr'>
                                    <div className='pk_th'>총 금액</div>
                                    <div className='pk_td'>
                                        {endtrans.price && endtrans.count
                                        ? (Number(endtrans.price) * Number(endtrans.count)).toLocaleString('ko-KR')
                                        : ' - '}원

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='pk_confirm_box'>
                        <div className='pk_title_wrap'><h3>3. 숙소</h3><button onClick={()=>{goDetail(hotel)}}>부분 수정</button></div>
                        <div className='pk_table_wrap'>
                            <div className='pk_table'>
                                <div className='pk_tr'>
                                    <div className='pk_th'>상품명</div><div className='pk_td'>{hotel.name || ' - '}</div>
                                </div>
                                <div className='pk_tr'>
                                    <div className='pk_th'>객실 수</div><div className='pk_td'>{hotel.count || ' - '}</div>
                                </div>
                                <div className='pk_tr'>
                                    <div className='pk_th'>체크인 날짜</div><div className='pk_td'>{hotel.startdate ? hotel.startdate.substring(0, 10):null || ' - '}</div>
                                </div>
                                <div className='pk_tr'>
                                    <div className='pk_th'>체크 아웃 날짜</div><div className='pk_td'>{hotel.enddate ? hotel.enddate.substring(0, 10):null || ' - '}</div>
                                </div>
                                <div className='pk_tr'>
                                    <div className='pk_th'>옵션 이름</div><div className='pk_td'>{option.name || ' - '}</div>
                                </div>
                                <div className='pk_tr'>
                                    <div className='pk_th'>총 금액</div>
                                    <div className='pk_td'>
                                        {(Number(option.price) * Number(hotel.count) * Number(hotel.nights)).toLocaleString('ko-KR') || '0'}원

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='pk_confirm_box'>
                        <div className='pk_title_wrap'><h3>4. 체험</h3><button onClick={()=>{goListDetail(exList)}}>부분 수정</button></div>
                        <div className='pk_table_wrap'>
                            {exList.map((ex, idx)=>{
                                return(
                                    <div className='pk_table' key={idx}>
                                        <div className='pk_tr'>
                                            <div className='pk_th'>상품명</div><div className='pk_td'>{ex.name || ' - '}</div>
                                        </div>
                                        <div className='pk_tr'>
                                            <div className='pk_th'>선택 날짜</div><div className='pk_td'>{ex.selectedDate ? ex.selectedDate.substring(0, 10):null || ' - '}</div>
                                        </div>
                                        <div className='pk_tr'>
                                            <div className='pk_th'>개수(명수)</div><div className='pk_td'>{ex.count || ' - '}</div>
                                        </div>
                                        <div className='pk_tr'>
                                            <div className='pk_th'>총 금액</div>
                                            <div className='pk_td'>
                                                {(Number(ex.count) * Number(ex.price2)).toLocaleString('ko-KR')}원
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 하단 버튼 영역 - 화면 하단 고정 */}
        <div className='pkgSelectFooter'>
            <div className='pkgSelectFooterInner'>
                <div>
                    <button 
                        className='pkgSelectBtn pkgSelectBtnPrev' 
                        onClick={() => { navigate('/selectendtrans') }}
                    >
                        이전으로
                    </button>
                    <button 
                        className='pkgSelectBtn pkgSelectBtnPrev' 
                        onClick={() => { navigate('/package') }}
                    >
                        다시 시작하기
                    </button>
                </div>
                <button 
                    className='pkgSelectBtn pkgSelectBtnNext' 
                    onClick={() => { onsubmit() }}
                >
                    주문하기
                </button>
            </div>
        </div>
    </>
    )
}

export default ConfirmPackage