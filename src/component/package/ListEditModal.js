import React, {useState, useEffect, useRef} from 'react'
import { useNavigate } from 'react-router-dom';
import { Cookies } from 'react-cookie';
import CalendarModal from '../CalendarModal';
import Salecount from '../Salecount';

import '../../css/package.css'
import axios from 'axios';

function ListEditModal({onClose, list}){


    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const [place, setPlace] = useState({});
    const [order, setOrder] = useState({});

    const [keyword, setKeyword] = useState(""); // 검색어
    const [exList, setExList] = useState([]);
    const [oneEx, setOneEx] = useState({});
    let [selExList, SetSelExList] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null)
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    let [totalPrice, setTotalPrice] = useState(0);
    let [count, setCount] = useState(1);
    const mapRef = useRef(null);

    const navigate = useNavigate();
    const cookies = new Cookies();

    const [showOptionSection, setShowOptionSection] = useState(false);

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

            // 2. place의 cid로 체험 리스트 검색
            axios.get('/api/package/getExListByCid', {params:{cid:order.cid}})
            .then((result)=>{
                setExList(result.data.exList);
                console.log(result.data.exList)
            }).catch((err)=>{console.error(err)})
        },[]
    )

    useEffect(() => {
        if (startDate && !selectedDate) {
            setSelectedDate(startDate);
        }
    }, [startDate]);

    useEffect(
        ()=>{
            const totalPrice = selExList.reduce((sum, item) => {
                return sum + (item.price2 || 0);
            }, 0);

            setTotalPrice(totalPrice);
        },[selExList]
    )

    function showDetail(eid){
        const target = exList.find(item => item.eid === eid);
        if (!target) return;

        console.log(target)
        setOneEx(target);
        setCount(1);
        setShowOptionSection(true); //리스트에서 클릭시 옵션보여주기

    }


    function showOptions(eid){
        

        const target = exList.find(item => item.eid === eid);
        if (!target) return;

        const newTarget = {
            ...target,
            selectedDate: selectedDate ? new Date(selectedDate) : null,
            count: count
        };

        SetSelExList(prev => {

            const exists = prev.some(item => item.eid === eid);

            if (exists) {
            return prev.filter(item => item.eid !== eid);
            }

            return [...prev, newTarget];
        });
        setCount(1);
    }
    

    function onSubmit(){
        if(!oneEx?.eid){
            return alert('한개 이상의 체험을 선택해주세요')
        }

        const exList = JSON.stringify(selExList);

        const placeFilter = {
            ...order,
            exlist: exList
        }
        cookies.set('orderinfo', JSON.stringify(placeFilter), {path:'/'});
        onClose();
    }

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

    function deleteOneOp(eid){
        
        SetSelExList(prev => {

            const exists = prev.some(item => item.eid === eid);

            if (exists) {
                return prev.filter(item => item.eid !== eid);
            }
            return prev;
        });
    }



    return (
        <>
        <div className='pk_modal_background'>
            <div className='pk_modal'>
            
            <div className='pkgSelectWrapper'>
                

                <div className='pkgSelectDetailSection'>
                    <div className='pkgSelectDetailTitle'>선택한 체험 정보</div>
                    {
                        list.map((oldse, idx)=>{
                            return(
                                <div className='pkgSelectExPlus' key={idx}>
                                    <div className='pkgSelectDetailContent pkgSelectDetailRowSplit'>
                                        <div className='pkgSelectDetailGroup'>
                                            <span className='pkgSelectDetailLabel'>체험명</span>
                                            <span className='pkgSelectDetailValue'>{oldse?.name || '-'}</span>
                                        </div>
                                        <div className='pkgSelectDetailGroup'>
                                            <span className='pkgSelectDetailLabel'>개수</span>
                                            <span className='pkgSelectDetailValue'>
                                                {oldse.count}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='pkgSelectDetailContent pkgSelectDetailRowSplit pkgSelectDetailRowLast'>
                                        <div className='pkgSelectDetailGroup'>
                                            <span className='pkgSelectDetailLabel'>날짜</span>
                                            <span className='pkgSelectDetailValue'>
                                                {oldse?.selectedDate ? oldse.selectedDate.substring(0, 10) : '-'}
                                            </span>
                                        </div>
                                        <div className='pkgSelectDetailGroup'>
                                            <span className='pkgSelectDetailLabel'>가격</span>
                                            <span className='pkgSelectDetailValue pkgSelectDetailPrice'>
                                                {oldse?.price2 ? `${new Intl.NumberFormat('ko-KR').format(oldse.price2)}원` : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                        
                </div>


                <div className='pkgSelectMain'>
                    <div className='pkgSelectMapSection'>
                        <h2 className='pkgSelectMapTitle'>{keyword} 의 체험을 소개합니다!</h2>
                        <div className='pkgSelectMapContainer pkgSelectHotelPreview'>
                            {
                                oneEx?.image ? (
                                    <img src={oneEx.image} alt={oneEx.name} />
                                ) : (
                                    <div className='pkgSelectEmptyState'>체험을 선택하면 이미지가 표시됩니다.</div>
                                )
                            }
                        </div>
                        {
                            oneEx?.hashtag && (
                                <div className='pkgSelectHotelAddress'>#{oneEx.hashtag}</div>
                            )
                        }
                    </div>

                    <div className='pkgSelectListSection'>
                        <div className='pkgSelectDateSection pkgCalCol'>
                            <div className='pkgSelectDateLabel' style={{margin:'10px 10px 0 0'}}>체험 날짜 선택</div>
                            <div className='pkgSelectDateBox'>
                                <CalendarModal
                                    mode="pkSingleModal"
                                    selectedDate={selectedDate}
                                    setSelectedDate={setSelectedDate}
                                    filterDate={(date) => isSelectable(date, startDate, endDate)}
                                />
                            </div>
                        </div>

                        <div className='pkgSelectList'>
                            <div className='pkgSelectLabel'>체험 선택</div>
                            <div className='pkgSelectScroll'>
                                {
                                    (exList.length === 0) ?
                                        (<div className='pkgSelectEmpty'>이용 가능한 체험이 없습니다.</div>) :
                                        (
                                            exList.map((list, idx) => (
                                                <div
                                                    className={`pkgSelectItem ${oneEx?.eid === list.eid ? 'pkgSelectSelected' : ''}`}
                                                    onClick={()=>{showDetail(list.eid)}}
                                                    key={idx}
                                                >
                                                    <div className='pkgSelectName'>{list.name}</div>
                                                    <div className='pkgSelectRoute'>{list.content?.slice(0, 40)}...</div>
                                                </div>
                                            ))
                                        )
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`pkgSelectOptionSection ${showOptionSection ? 'active' : ''}`}>
                    <div className='pkgSelectLabel'>체험 상세 선택</div>
                    <div className='pkgSelectOptionList'>
                        {
                            oneEx ? (
                                
                                <div className='pkgSelectOptionCard'>
                                    <div className='pkgSelectOptionInline'>
                                        <span className='pkgSelectOptionTitle'>{oneEx.name}</span>
                                        <span className='pkgSelectOptionDivider'>|</span>
                                        <span className='pkgSelectOptionPrice'>
                                            {oneEx.price2? new Intl.NumberFormat('ko-KR').format(oneEx.price2): '0'}원
                                        </span>
                                        <span className='pkgSelectOptionDivider'>|</span>
                                        <span className='pkgSelectOptionDesc'>{oneEx.content}</span>
                                        <span className='pkgSelectOptionDivider'>|</span>
                                        <span className='pkgSelectOptionPrice'><Salecount count={count} onCountChange={setCount} /></span>
                                    </div>
                                    <button
                                        className='pkgSelectBtn pkgSelectOptionBtn'
                                        onClick={() => { showOptions(oneEx.eid) }}
                                    >
                                        옵션 선택
                                    </button>
                                </div>
                            ) : (
                                <div className='pkgSelectEmpty'>선택 가능한 옵션이 없습니다.</div>
                            )
                        }
                    </div>
                </div>

                <div className='pkgSelectDetailSection'>
                    <div className='pkgSelectDetailTitle'>선택한 체험 정보</div>
                    {
                        selExList.map((selex, idx)=>{
                            return(
                                <div className='pkgSelectExPlus'>
                                    <div className='pkgSelectDetailContent pkgSelectDetailRowSplit'>
                                        <div className='pkgSelectDetailGroup'>
                                            <span className='pkgSelectDetailLabel'>체험명</span>
                                            <span className='pkgSelectDetailValue'>{selex?.name || '-'}</span>
                                        </div>
                                        <div className='pkgSelectDetailGroup'>
                                            <span className='pkgSelectDetailLabel'>개수</span>
                                            <span className='pkgSelectDetailValue'>
                                                {selex.count}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{display:'flex', justifyContent:'flex-end', marginRight:'20px', cursor:'pointer'}} onClick={()=>{deleteOneOp(selex.eid)}}><i class="fas fa-times"></i></div>
                                    <div className='pkgSelectDetailContent pkgSelectDetailRowSplit pkgSelectDetailRowLast'>
                                        <div className='pkgSelectDetailGroup'>
                                            <span className='pkgSelectDetailLabel'>날짜</span>
                                            <span className='pkgSelectDetailValue'>
                                                {selex.selectedDate ? selex.selectedDate.toISOString().slice(0, 10) : '-'}
                                            </span>
                                        </div>
                                        <div className='pkgSelectDetailGroup'>
                                            <span className='pkgSelectDetailLabel'>가격</span>
                                            <span className='pkgSelectDetailValue pkgSelectDetailPrice'>
                                                {selex?.price2 ? `${new Intl.NumberFormat('ko-KR').format(selex.price2)}원` : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                        
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

export default ListEditModal