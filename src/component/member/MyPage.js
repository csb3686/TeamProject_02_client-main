import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import jaxios from '../../util/JWTutil'
import { useSelector } from 'react-redux'

import Header from '../Header'
import Footer from '../Footer'
import '../../css/mypage.css'

function MyPage() {

    const [orderList, setOrderList] = useState([]);
    const [state, setState] = useState(null);
    const [dday, setDday] = useState();
    const [showCount, setShowCount] = useState({});

    const navigate = useNavigate();
    const loginUser = useSelector(state=>state.user);
    
    useEffect(
        ()=>{
            if(!loginUser.userid){
                navigate('/login')
            }
            jaxios.get(`/api/order/getOrderList`, {params:{userid:loginUser.userid}})
            .then((res)=>{
                const list = Array.isArray(res.data) ? res.data : (res.data.orders || []);

                const ordersWithDiff = list.map(forder => {
                const today = new Date();
                const selectedUTC = new Date(forder.selecteddate);
                const selected = new Date(selectedUTC.getTime() + 9 * 60 * 60 * 1000);
                const diffTime = selected.getTime() - today.getTime();

                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                return {
                    ...forder,
                    diffDays
                };
                });

                setOrderList(ordersWithDiff)
                // console.log("오더리스트@@@@@@@",res.data)


                const categories = [...new Set(ordersWithDiff.map(o => o.category))];

                // 기본값 세팅 (카테고리별 모두 5개)
                const initialCount = {};
                categories.forEach(cat => {
                    initialCount[cat] = 5;
                });

                setShowCount(initialCount);

            })
            .catch((err)=>{console.error(err)})
        },[]
    )

    function openSesami(idx){
        setState(prev => (prev === idx? null:idx))
    }

    const countDays = orderList.filter(order => 
        order.diffDays <= 7 && order.diffDays >= 1
    ).length;

    const canReview = orderList.filter(order => 
        order.diffDays < 0 && !order.hasReview   //hasReview=>리뷰작성여부
    ).length;

    function toggleShow(category, totalCount) {
        setShowCount(prev => ({
            ...prev,
            [category]: prev[category] === 5 ? totalCount : 5
        }));
    }


    return (
        <div className='mypage'>
            <div>
                <Header />
            </div>
            <div className='myWrap'>
                <div className='mypage-content'>
                    <div className='mypage-submenu'>
                        <div className='mypage-title'>
                            MY PAGE
                        </div>
                        <ul>
                            <li className="active" onClick={()=>{navigate('/mypage')}}>주문내역</li>
                            <li onClick={()=>{navigate('/editmember')}}>회원정보 수정</li>
                            <li onClick={()=>{navigate('/reviewBox')}}>리뷰 보관함</li>
                        </ul>
                    </div>
                    <div className='mypage-content-wrap'>
                        <div className='mypage-detail'>

                            <div className='mypage-userinfo'>
                                <div>안녕하세요, {loginUser.name} 님</div>
                                <div>기간 임박 {countDays}건</div>
                                <div>리뷰 작성가능 {canReview}건</div>
                            </div>
                            <div>
                                <i className="fas fa-exclamation-circle" style={{marginRight:"6px"}}></i>
                                <span>리뷰 작성은 예약날짜 이후 7일 까지만 가능합니다.</span>
                            </div>

                            <div className='mypage-order'>
                                
                                {
                                    // 카테고리 별로 하나씩 테이블 출현
                                    (Array.isArray(orderList) && orderList.length > 0)?
                                    (
                                        [...new Set(orderList.map(order => order.category))].map(category => {
                                            const filterOrders = orderList.filter(order => order.category === category);
                                            return(
                                                <div className='mypage-section'>
                                                    <div className='mypage-section-title'>{category}</div>
                                                    <div className='mypage-row-title'>
                                                        <div className='mypage-col-title'>예약날짜</div>
                                                        <div className='mypage-col-title'>상품명</div>
                                                        <div className='mypage-col-title'>결제금액</div>
                                                        <div className='mypage-col-title'>개수</div>
                                                        <div className='mypage-col-title'>예약상태</div>
                                                        <div className='mypage-col-title' style={{flex:'0', marginRight:'12px'}}></div>
                                                        <div className='mypage-col-title'>리뷰</div>
                                                    </div>
                                                    {
                                                        filterOrders
                                                        .slice(0, showCount[category])
                                                        .map((forder, idx)=>{

                                                            const uniqueIdx = `${category}-${idx}`;

                                                            const customStyle = {
                                                                display: (state == uniqueIdx) ? ('flex') : ('none'),
                                                                flex:'0'
                                                            }

                                                            const today = new Date();
                                                            const selectedUTC = new Date(forder.selecteddate);
                                                            const selected = new Date(selectedUTC.getTime() + 9 * 60 * 60 * 1000);
                                                            const diffTime = selected.getTime() - today.getTime();
                                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                                            let rewind = '';
                                                            if (diffDays > 7) rewind = '예약 완료';
                                                            else if (diffDays <= 7 && diffDays > 1) rewind = `출발 ${diffDays}일 전`;
                                                            else if (diffDays <= 1 && diffDays > 0) rewind = `출발 당일`;
                                                            else rewind = '사용 완료'; 
                                                            
                                                            return(
                                                                <>
                                                                    <div className='mypage-row' key={uniqueIdx}>
                                                                        <div className='mypage-col'>

                                                                            {forder.category === "숙소" ? (
                                                                                `${forder.checkInDate?.substring(0,10)} ~ ${forder.checkOutDate?.substring(0,10)}`
                                                                            ) : (
                                                                                forder.selecteddate?.substring(0,10)
                                                                            )}

                                                                    </div>
                                                                    <div className='mypage-col' onClick={() => navigate(`/orderDetail/${forder.oid}`)}>{forder.product.name}</div>
                                                                    <div className='mypage-col'>
                                                                        {
                                                                            (forder.price1)?
                                                                            (new Intl.NumberFormat('ko-KR').format(forder.price1)):
                                                                            (new Intl.NumberFormat('ko-KR').format(forder.product.price1))
                                                                        }원
                                                                    </div>
                                                                    <div className='mypage-col'>{forder.count}</div>
                                                                    <div className='mypage-col'>
                                                                            {
                                                                                (rewind == '출발 당일')?
                                                                                (<p style={{color:'red', fontWeight:'bold', margin:'0'}}>{rewind}</p>)
                                                                                :(<p style={{margin:'0'}}>{rewind}</p>)
                                                                            }
                                                                     </div>

                                                                        

                                                                        <div className='mypage-col'>

                                                                        {
                                                                            diffDays > 0 ? (
                                                                                <></> // 사용 전: 버튼 없음
                                                                            ) : diffDays < -7 ? (
                                                                                <button disabled style={{ backgroundColor: "#ccc", cursor: "not-allowed" }}>
                                                                                작성기간<br />만료
                                                                                </button>
                                                                            ) : forder.hasReview ? (
                                                                                <button disabled style={{ backgroundColor: "#ccc", cursor: "not-allowed" }}>
                                                                                작성완료
                                                                                </button>
                                                                            ) : diffDays === -7 ? (
                                                                                // ⭐ 마지막 날: 특별 스타일
                                                                                <button className='reviewTodayBtn'
                                                                                onClick={() => navigate(`/reviewWriteForm/${forder.oid}`)}
                                                                                >
                                                                                리뷰작성<br />오늘마감
                                                                                </button>
                                                                            ) : (
                                                                                // 기본 리뷰 작성 버튼
                                                                                <button className="wReviewBtn" onClick={() => navigate(`/reviewWriteForm/${forder.oid}`)}>
                                                                                리뷰작성<br />(D+{Math.abs(diffDays)})
                                                                                </button>
                                                                            )
                                                                        }

                                                                        </div>

                                                                        {
                                                                            (forder.opid)?
                                                                            (
                                                                                <div className='mypage-col' onClick={()=>{openSesami(uniqueIdx)}} style={{flex:'0'}}>
                                                                                    <i class="fas fa-angle-down"></i>
                                                                                </div>
                                                                            ):(<div className='mypage-col'  style={{flex:'0'}}></div>)
                                                                        }
                                                                        
                                                                    </div>
                                                                    
                                                                        
                                                                {(forder.opid)?
                                                                    (
                                                                        <div className='mypage-row' key={`option-${uniqueIdx}`} style={customStyle}>
                                                                            <div className='mypage-col'></div>
                                                                            <div className='mypage-col'>옵션명 : {forder.name}</div>
                                                                            <div className='mypage-col'>
                                                                                {new Intl.NumberFormat('ko-KR').format(forder.price1)}원
                                                                            </div>
                                                                            <div className='mypage-col'></div>
                                                                            <div className='mypage-col'></div>
                                                                            </div>

                                                                    ):(null)
                                                                }
                                                        
                                                                    
                                                                </>
                                                                
                                                            )
                                                            
                                                        })
                                                    }

                                                    {
                                                        filterOrders.length > 5 && (
                                                            <div style={{ textAlign:"center", marginTop:"10px" }}>
                                                                <button onClick={() => toggleShow(category)}>
                                                                    {showCount[category] === 5 ? '펼쳐보기' : '접기'}
                                                                </button>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            )
                                        }
                                    
                                    )
                                        
                                    ):(<div className='mypage-row'>예약/주문 건이 없습니다.</div>)
                                }

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <Footer/>
            </div>
        </div>
    )
}

export default MyPage