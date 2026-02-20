import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import '../../css/detail.css'
import axios from 'axios';
import jaxios from '../../util/JWTutil'
import KakaoMapSearch from './kakaomap';
import CalendarModal from '../CalendarModal';
import DragScroll from '../../DragScroll';
import Salecount from '../Salecount';

import Header from '../Header';
import Footer from '../Footer';

function HotelDetail() {
    const navigate = useNavigate();
    const [hotel, setHotel] = useState({});
    const [optionList, setOptionList] = useState([]);
    const [reviewList, setReviewList] = useState([]);
    const loginUser = useSelector( state=>state.user );
    const {hid} = useParams();

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    // const [count, setCount] = useState(1);
    

     //  숙박일수 계산 함수
    function calculateNights(checkIn, checkOut) {
        if (!checkIn || !checkOut) return 1;
        const inDate = new Date(checkIn);
        const outDate = new Date(checkOut);
        const diffTime = outDate - inDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays > 0 ? diffDays : 1;
    }
    //  숙박일수 & 총금액 계산
    const nights = calculateNights(startDate, endDate);


    //리뷰용 드래그스크롤
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

    useEffect(
        
        ()=>{

            axios.get(`/api/hotel/getHotelDetail/${hid}`)
            .then((result)=>{
                setHotel( result.data.hotel );
                setReviewList( result.data.reviewList );
            }).catch((err)=>{ console.error(err);  })

            axios.get(`/api/hotel/getOptionList/${hid}`)
            .then((result) => {
                
                if(result){
                    const optionListWithCount = result.data.optionList.map(opt =>({
                        ...opt,
                        count: 1
                    }))
                    setOptionList(optionListWithCount)
                };
            })
            .catch((err) => console.error(err));

        },[]
    )

    //  페이지 진입 시 무조건 스크롤 맨 위로 이동
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    //@@@@@@@@@카트
    function goCart(opid, count){
        if(!loginUser.userid){
            navigate('/login')
        }

        if (!startDate || !endDate) {
            alert('체크인/체크아웃 날짜를 선택해주세요.');
            return;
        }

        //남은객실수체크
        axios.get('/api/hotel/countRoom', {params:{opid:opid, startdate:startDate, enddate:endDate, count:count}})
        .then((result)=>{ 
            if(result.data.msg != "ok"){
                return alert(result.data.msg);
            }

            if( window.confirm('이 상품을 장바구니에 담으시겠습니까')){
                jaxios.post('/api/cart/insertCart', { 
                    category: "숙소",
                    pid: hotel.hid,
                    opid,
                    count,
                    userid: loginUser.userid,
                    checkInDate: startDate,
                    checkOutDate: endDate,
                })
                .then((result)=>{
                    if( window.confirm('장바구니에 상품을 추가했어요. 장바구니로 이동할까요?') ){
                        navigate('/cart');
                    }
                }).catch((err)=>{console.error(err)})
            }
        }).catch((err) => { console.error(err); })

    }


    //@@@@@@@@@@@오더
    function goOrder(opid, count) {
        if(!loginUser.userid){
            navigate('/login')
        }
        if (!startDate || !endDate) {
            alert('체크인/체크아웃 날짜를 선택해주세요.');
            return;
        }

        //남은객실수체크
        axios.get('/api/hotel/countRoom', {params:{opid:opid, startdate:startDate, enddate:endDate, count:count}})
        .then((result)=>{ 
            console.log(result.data.msg)
        if(result.data.msg != "ok"){
            return alert(result.data.msg);
        }else{
            // 예약 정보 객체
            const orderData = {
                userid: loginUser.userid,
                opid,
                pid: hid,
                checkInDate: startDate,
                checkOutDate: endDate,
                count,
                category: "숙소",
                cid: hotel.cid
            };
            navigate("/order",{state: orderData});
        }
        }).catch((err)=>{console.error(err)})
    }

    function updateCount(idx, newCount){
        setOptionList(prev =>
            prev.map((item, i)=>
                i === idx ? {...item, count: newCount} : item
            )
        )
    }

    return (
        <>
            <Header />
            <div className='subPage'>
                
                <div id='detailPage'>
                    {/* <!-- 메인 이미지 --> */}
                    <section id='detailSection' className="infoSection">
                        <div className='imgBox'>
                            <img className="img" src={hotel.image} alt="호텔 대표 이미지" />
                        </div>
                        <div className='infoBox'>
                            <h2 className='name'>{hotel.name}</h2>
                            <div className='point'>별점 5점</div>
                            <div className='detailCon'>{hotel.content}</div>
                            <div className='detailNotice'><i className="fas fa-exclamation-circle" style={{marginRight:"10px"}}></i>{hotel.notice}</div>
                        </div>
                    </section>

                    {/* <!-- 목록 --> */}
                    <section id='detailSection' className="listSection">
                        <h3 className='detailTitle'>객실 선택</h3>
                        <div className='selectSection'>
                            <div className='dateBox'>
                                <CalendarModal
                                    mode="range"
                                    startDate={startDate} 
                                    endDate={endDate} 
                                    setStartDate={setStartDate}
                                    setEndDate={setEndDate}
                                />
                            </div>
                        </div>
                        <div className="optionList">

                            {
                                optionList.map((option, idx)=>{
                                    return (
                                        <div className='listwrap' key={idx} >
                                            <div className='leftBox'>
                                                <div className='imgwrap'>
                                                    <img src={option.image} />
                                                </div>
                                                <div className='optionInfo hDtailOp'>
                                                    <div>
                                                        <div className='name'>{option.name}</div>
                                                        <div className='detailCon'>{option.content}</div>
                                                    </div>

                                                    <div className='salecountBox'>
                                                        <span>객실 수</span>
                                                        <Salecount count={option.count} onCountChange={(newCount)=> updateCount(idx, newCount)} />
                                                    </div>

                                                </div>
                                            </div>
                                            <div className='rightBox'>
                                                <div className='detailPriceBox'>
                                                    {/* 정가 */}
                                                    <div className='price2Box'>
                                                        <span className='price2'>{option.price2?.toLocaleString()}원</span>
                                                    </div>

                                                    <div className='price1'>{option.price1?.toLocaleString()}원</div>
                                                </div>
                                                <div className='btnBox'>
                                                    <button className='btnCart' onClick={()=>{goCart(option.opid, option.count)}}>
                                                        <i className="fas fa-cart-plus"></i>
                                                    </button>
                                                    <button className='btnBook' onClick={()=>{goOrder(option.opid, option.count)}}>예약하기</button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </section>

                    {/* <!-- 지도 --> */}
                    <section id='detailSection' className="mapSection">
                        <h3 className='detailTitle'>숙소 위치</h3>
                        <div id="map">
                            {hotel.x && hotel.y ? (
                            <KakaoMapSearch x={hotel.x} y={hotel.y} />
                            ) : (
                            <p>지도 정보를 불러오는 중...</p>
                            )}
                        </div>
                        <div className='locationbox'>
                            <i className="fas fa-map-marker-alt"></i>
                            <p className='spotinfo'>{hotel.spotcontent}</p>
                        </div>
                    </section>

                    {/* <!-- 후기 --> */}
                    <section id="detailSection" className="reviewSection">
                        <h3 className="detailTitle">이용 후기</h3>

                        <div className="reviewContainer">
                            {reviewLeftArrow && (
                            <button className="arrowBtn left" onClick={reviewLeftFunc}>
                                &#10094;
                            </button>
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
                            <button className="arrowBtn right" onClick={reviewscrollRight}>
                                &#10095;
                            </button>
                            )}
                        </div>
                    </section>
                    
                    <button className="goListBtn" onClick={()=>{navigate('/HotelList')}}>목록으로</button>
                </div>
                
            </div>
            <Footer />
        </>
                            
    )
}

export default HotelDetail