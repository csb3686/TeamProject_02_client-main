import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import jaxios from '../../util/JWTutil';

import '../../css/detail.css';
import DragScroll from '../../DragScroll';
import CalendarModal from '../CalendarModal';
import Salecount from '../Salecount';
import Header from '../Header';
import Footer from '../Footer';
import axios from 'axios';


function TransDetail() {
    const navigate = useNavigate();
    const { tid } = useParams();
    const loginUser = useSelector(state => state.user);

    const [transData, setTransData] = useState({});
    const [reviewList, setReviewList] = useState([]);

    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const [selectedDate, setSelectedDate] = useState(null);
    const [count, setCount] = useState(0);

    const [remainingSeats, setRemainingSeats] = useState(null); // 남은 좌석


    // 리뷰용 드래그스크롤
    const {
        ref: reviewListRef,
        handleMouseDown: reviewMouseDown, 
        handleMouseLeave: reviewMouseLeave,
        handleMouseUp: reviewMouseUp,
        handleMouseMove: reviewMouseMove,
        scrollLeftFunc: reviewLeftFunc,
        scrollRight: reviewscrollRight,
        showLeftArrow: reviewLeftArrow,
        showRightArrow: reviewRightArrow,
    } = DragScroll(350); 

    useEffect(() => {
        axios.get(`/api/trans/getTransDetail/${tid}`)
            .then((res) => {
                setTransData(res.data.transData);
                setReviewList(res.data.reviewList);

                setStartTime(res.data.starttime); 
                setEndTime(res.data.endtime);    
            })
            
            .catch(err => console.error(err));

    }, [tid]);

    useEffect(() => {
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            // 선택된 날짜가 있으면 남은 좌석 조회
            axios.get(`/api/trans/getcount`, {
                params: { 
                    tid: tid, 
                    selectedDate: formattedDate,
                    count
                }
            })
            .then((res) => {
                if (res.data.msg === 'ok') {
                    // 남은 좌석 = 총좌석 - 예약된 수량
                    setRemainingSeats(res.data.remainingSeats); 
                } else {
                    setRemainingSeats(res.data.remainingSeats); 
                }
            })
            .catch(err => {
                console.error(err);
                setRemainingSeats(0);
            });
        }
    }, [selectedDate, tid]);


    //  페이지 진입 시 무조건 스크롤 맨 위로 이동
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    function goOrder(pid) {
        if(!loginUser.userid){
            navigate('/login')
        }

        if (!selectedDate) {
            alert("날짜를 선택해주세요");
            return;
        }

        if (!count) {
            alert('수량을 선택해주세요');
            return;
        }

        const formattedDate = selectedDate.toISOString().split('T')[0];

        axios.get(`/api/trans/getcount`, {params:{tid:tid, selectedDate:formattedDate, count:count}})
        .then((result) => {
            if(result.data.msg != "ok"){
                return alert(result.data.msg);
            }else{
                // 예약 정보 객체
                const orderData = {
                    userid: loginUser.userid,
                    pid: tid,
                    selecteddate: selectedDate,
                    count,
                    category: "교통",
                };
                
                navigate("/order",{state: orderData});
                }
        })
        
        .catch(err => console.error(err));
        
    }


    function goCart(){
        if(!loginUser.userid){
            navigate('/login')
            return;
        }

        if (!selectedDate) {
            alert("날짜를 선택해주세요");
            return;
        }

        if (!count) {
            alert('수량을 선택해주세요');
            return;
        }
        const formattedDate = selectedDate.toISOString().split('T')[0];

        axios.get(`/api/trans/getcount`, {params:{tid:tid, selectedDate:formattedDate, count:count}})
        .then((result) => {
            if(result.data.msg != "ok"){
                return alert(result.data.msg);
            }else{
                if( window.confirm('이 상품을 장바구니에 담으시겠습니까')){
                jaxios.post('/api/cart/insertCart', { 
                    category: "교통",
                    pid: tid,
                    count,
                    userid: loginUser.userid,
                    selecteddate: selectedDate
                })
                .then((result)=>{
                    if( window.confirm('장바구니에 상품을 추가했어요. 장바구니로 이동할까요?') ){
                        navigate('/cart');
                    }
                }).catch((err)=>{console.error(err)})
                }
            }
        })
        
        .catch(err => console.error(err));


       
    }

    return (
        <>
            <Header />
            <div className='subPage'>
                <div id='detailPage'>
                    {/* 메인 정보 */}
                    <section id='detailSection' className="infoSection">
                        <div className='imgBox'>
                            <img className="img" src={transData.image} alt="교통 대표 이미지" />
                        </div>
                        <div className='infoBox'>
                            <h2 className='name'>{transData.name}</h2>
                            <div className='category'>{transData.category}</div>
                            <div className='company'>운송사: {transData.company}</div>
                        </div>
                    </section>

                    {/* <!-- 목록 --> */}
                    <section id='detailSection' className="listSection">
                        <h3 className='detailTitle'>상품 선택</h3>
                        <div className='selectSection'>
                            <div className='dateBox'>
                                <CalendarModal 
                                    mode="single"
                                    selectedDate={selectedDate} 
                                    setSelectedDate={setSelectedDate} 
                                />
                            </div>
                            
                        </div>
                        <div className="optionList flight-wrap">
                            <div className="flight-info-box">
                                <div className="flight-airline">
                                    <span className="airline-name">{transData.company}</span>
                                    <span className="flight-number">{transData.name}</span>
                                    <div className="seats-left">
                                        총 좌석 {transData.maxcount || '-'}석
                                        {remainingSeats !== null && ` / 남은 좌석 ${remainingSeats}석`}
                                    </div>
                                </div>

                                <div className="flight-times">
                                    <div className="time-block">
                                        <div className="time-label">출발</div>
                                        <div className="time-value">{startTime}</div>
                                        <div className="time-label-lo">{transData.start}</div>
                                    </div>
                                    <div className="duration">▶</div>
                                    <div className="time-block">
                                        <div className="time-label">도착</div>
                                        <div className="time-value">{endTime}</div>
                                        <div className="time-label-lo">{transData.end}</div>
                                    </div>
                                </div>

                                <div className="flight-price">
                                    <div className='price2Box'>
                                        <span className='price2'>{transData.price2?.toLocaleString()}원</span>
                                    </div>
                                    <span className="price1">{transData.price1?.toLocaleString()}원</span>
                                </div>
                                
                            </div>
                            <div className='flight-info-bottom'>
                                <div className='salecountBox'>
                                    <span>수량선택</span>
                                    <Salecount count={count} onCountChange={setCount} remainingSeats={remainingSeats}/>
                                </div>
                                <div className='btnBox'>
                                    <button className='btnCart' onClick={() => { goCart() }}>
                                        <i className="fas fa-cart-plus"></i>
                                    </button>
                                    <button className='btnBook' onClick={() => { goOrder(tid) }}>예약하기</button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 후기 */}
                    <section id="detailSection" className="reviewSection">
                        <h3 className="detailTitle">이용 후기</h3>
                        <div className="reviewContainer">
                            {reviewLeftArrow && (
                                <button className="arrowBtn left" onClick={reviewLeftFunc}>&#10094;</button>
                            )}

                            <div
                                id="reviewList"
                                className="reviewList"
                                ref={reviewListRef}
                                onMouseDown={reviewMouseDown}
                                onMouseLeave={reviewMouseLeave}
                                onMouseUp={reviewMouseUp}
                                onMouseMove={reviewMouseMove}
                            >
                                {reviewList && reviewList.length > 0 ? (
                                    reviewList?.map((review, idx) => (
                                        <div key={idx} className="reviewCard">
                                            <div className="reviewHeader">
                                                <div className="reviewUserInfo">
                                                    <div className="reviewAvatar">
                                                        <i className="fas fa-user"></i>
                                                    </div>
                                                    <div className="reviewUserMeta">
                                                        <div className="reviewUserid">{review.userid || '익명'}</div>
                                                        <div className="reviewStars">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span key={i} className={i < review.point ? 'star filled' : 'star'}>
                                                                    ⭐
                                                                </span>
                                                            ))}
                                                            <span className="reviewPoint">{review.point}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {review.image && (
                                                <div className="reviewImageBox">
                                                    <img src={review.image} alt="리뷰 이미지" />
                                                </div>
                                            )}
                                            <div className="reviewContent">{review.content}</div>
                                            <div className="reviewDate">{new Date(review.indate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="noReviews">리뷰가 없습니다.</p>
                                )}
                            </div>

                            {reviewRightArrow && (
                                <button className="arrowBtn right" onClick={reviewscrollRight}>&#10095;</button>
                            )}
                        </div>
                    </section>
                    <button className="goListBtn" onClick={()=>{navigate('/TransList')}}>목록으로</button>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default TransDetail;
