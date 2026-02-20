import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import '../../css/detail.css'
import axios from 'axios';
import CalendarModal from '../CalendarModal';
import Salecount from '../Salecount';
import DragScroll from './DragScroll';

import Header from '../Header';
import Footer from '../Footer';
import jaxios from '../../util/JWTutil';

function ExperienceDetail() {
    const navigate = useNavigate();
    const [experience, setExperience] = useState({});
    const [reviewList, setReviewList] = useState([]);
    const loginUser = useSelector(state => state.user);
    const { eid} = useParams();

    const [selectedDate, setSelectedDate] = useState(null);
    const [count, setCount] = useState(1);

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

        () => {
            axios.get(`/api/product/experienceDetail/${eid}`)
                .then((result) => {
                    setExperience(result.data.experience);
                    setReviewList(result.data.reviewList);
                    //console.log("###################useParams:", { eid});
                }).catch((err) => { console.error(err); })
        }, []
    )

    //  페이지 진입 시 무조건 스크롤 맨 위로 이동
        useEffect(() => {
            window.scrollTo(0, 0);
        }, []);



    function goCart(pid) {
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

        if (window.confirm('이 상품을 장바구니에 담으시겠습니까')) {
            jaxios.post('/api/cart/insertCart', {
                category: "체험",
                pid: eid,
                count,
                userid: loginUser.userid,
                selecteddate: selectedDate

            })
                .then((result) => {
                    if (window.confirm('장바구니에 상품을 추가했어요. 장바구니로 이동할까요?')) {
                        navigate('/cart');
                    }
                }).catch((err) => { console.error(err) })
        }


    }

    function goOrder(eid) {
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


        // 예약 정보 객체
        const orderData = {
            userid: loginUser.userid,
            pid: eid,
            selecteddate: selectedDate,
            count,
            category: "체험",
        };
        
        navigate("/order",{state: orderData});

    }

    return (
        <>
            <Header />
            <div className='subPage'>

                <div id='detailPage'>
                    {/* <!-- 메인 이미지 --> */}
                    <section id='detailSection' className="infoSection">
                        <div className='imgBox'>
                            <img className="img" src={experience.image} alt="" />
                        </div>

                        <div className='infoBox'>
                            <h2 className='name'>{experience.name}</h2>
                            <div className='point'>별점 5점</div>
                            <div className='detailCon'>{experience.detailCon}</div>
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
                        <div className="optionList exop">
                            <div className='listwrap'>
                                <div className='leftBox'>
                                    <div className='optionInfo'>
                                        <div className='name'>{experience.name}</div>
                                        <div className='detailCon'>{experience.content}</div>
                                    </div>
                                    <div className='salecountBox'>
                                        <span>수량선택</span>
                                        <Salecount count={count} onCountChange={setCount} />
                                    </div>
                                </div>
                                <div className='rightBox'>
                                    <div className='detailPriceBox'>
                                        <div className='price2Box'>
                                            {/* <span className='detailDiscount'>
                                                {experience.price1 && experience.price2
                                                    ? (((experience.price1 - experience.price2) / experience.price1) * 100).toFixed(0) + '%'
                                                    : ''}
                                            </span> */}
                                            <span className='price2'>{experience.price1?.toLocaleString()}원</span>
                                        </div>
                                        <div className='price1'>{experience.price2?.toLocaleString()}원</div>
                                    </div>
                                    <div className='btnBox'>
                                        <button className='btnCart' onClick={() => { goCart(eid) }}>
                                            <i className="fas fa-cart-plus"></i>
                                        </button>
                                        <button className='btnBook' onClick={() => { goOrder(eid) }}>예약하기</button>
                                    </div>
                                </div>
                            </div>
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

                    <button className="goListBtn" onClick={()=>{navigate('/ExperienceList')}}>목록으로</button>

                </div>

            </div>
            <Footer />
        </>

    )
}

export default ExperienceDetail