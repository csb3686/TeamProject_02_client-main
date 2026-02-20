import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import '../../css/order.css';

import Header from '../Header';
import Footer from '../Footer';
import jaxios from '../../util/JWTutil';

function OrderDetail() {
  const { oid } = useParams(); // URL에서 주문번호 추출
  const [orderData, setOrderData] = useState(null);
  const [hotelData, setHotelData] = useState(null);
  const [optionData, setOptionData] = useState(null);
  const [experienceData, setExperienceData] = useState(null);
  const [transData, setTransData] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    if (!oid) return;

    jaxios.get(`/api/order/getOrderDetail/${oid}`)
      .then(res => {
        const data = res.data;
        console.log("dddd",data)
        setOrderData(data.order);          // 공통 주문 정보
        setHotelData(data.hotel || null);  // 숙소인 경우
        setOptionData(data.option || null); // 숙소 옵션
        setExperienceData(data.experience || null); // 체험인 경우
        setTransData(data.trans || null);  // 교통인 경우
        setStartTime(data.starttime);
        setEndTime(data.endtime);
      })
      .catch(err => console.error(err));
  }, [oid]);


  if (!orderData) {
    return <div>주문 정보를 불러오는 중...</div>;
  }

  //  숙박일수 계산 함수
  function calculateNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 1;
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diffTime = outDate - inDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays > 0 ? diffDays : 1;
  }
  const nights = calculateNights(orderData.checkInDate, orderData.checkOutDate);

  return (
    <>
      <Header />
      <div className='myWrap'>
          <div className='orderWrap_detailmy'>
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
              <div className="orderPage orderDetail_my">
                <h2 className="orderTitle">주문 상세</h2>
                <div className="orderContainer">
                  <div className="orderLeft">

                    {/* 주문 정보 */}
                    <section className="productInfo">
                      <h3 className="sectionTitle">주문 정보</h3>
                      <table className="infoTable">
                        <tbody>
                          <tr>
                            <th>주문일자</th>
                            <td>{orderData.indate ? new Date(orderData.indate).toISOString().split('T')[0] : "-"}</td>
                          </tr>
                          <tr><th>결제 가격</th><td>{orderData.price?.toLocaleString()}원</td></tr>

                          {orderData.category === '교통' &&(
                            <tr>
                              <th>주문수량</th>
                              <td>{orderData.count}개</td>
                            </tr>
                          )}
                          
                          {orderData.category === '체험' &&(
                            <tr>
                              <th>주문수량</th>
                              <td>{orderData.count}개</td>
                            </tr>
                          )}

                          
                          {orderData.category === '숙소' && (
                            <>
                              <tr>
                                <th>주문 객실 수</th>
                                <td>{orderData.count}객실</td>
                              </tr>
                              
                              <tr>
                                <th>체크인/체크아웃</th>
                                <td>{orderData.checkInDate?.split('T')[0]} ~ {orderData.checkOutDate?.split('T')[0]} ({nights}박)</td>
                              </tr>
                            </>
                          )}
                          
                          
                        </tbody>
                      </table>
                    </section>

                    {/* 숙소 정보 */}
                    {orderData.category === '숙소' && hotelData && optionData && (
                      <section className="reservationInfo">
                        <h3 className="sectionTitle">숙소 정보</h3>
                        <table className="infoTable">
                          <tbody>
                            <tr><th>호텔명</th><td>{hotelData.name}</td></tr>
                            <tr><th>선택옵션</th><td>{optionData.name}</td></tr>
                            <tr><th>설명</th><td>{optionData.content}</td></tr>
                            <tr><th>위치안내</th><td>{hotelData.spotcontent}</td></tr>
                            <tr><th>유의사항</th><td>{hotelData.notice}</td></tr>
                            {hotelData.image && (
                              <tr>
                                <th>이미지</th>
                                <td><img src={hotelData.image} alt={hotelData.name} width="300" /></td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </section>
                    )}

                    {/* 체험 정보 */}
                    {orderData.category === '체험' && experienceData && (
                      <section className="reservationInfo">
                        <h3 className="sectionTitle">체험 정보</h3>
                        <table className="infoTable">
                          <tbody>
                            <tr><th>체험명</th><td>{experienceData.name}</td></tr>
                            <tr><th>설명</th><td>{experienceData.content}</td></tr>
                            <tr><th>선택 날짜</th><td>{orderData.selecteddate?.split('T')[0]}</td></tr>
                            {experienceData.image && (
                              <tr>
                                <th>이미지</th>
                                <td><img src={experienceData.image} alt={experienceData.name} width="300" /></td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </section>
                    )}

                    {/* 교통 정보 */}
                    {orderData.category === '교통' && transData &&(
                      <section className="reservationInfo">
                        <h3 className="sectionTitle">교통 정보</h3>
                        <table className="infoTable">
                          <tbody>
                            <tr><th>교통편명</th><td>{transData.name}</td></tr>
                            <tr><th>출발일</th><td>{orderData.selecteddate?.split('T')[0]}</td></tr>
                            <tr><th>출발시간</th><td>{startTime}</td></tr>
                            <tr><th>도착시간</th><td>{endTime}</td></tr>

                          </tbody>
                        </table>
                      </section>
                    )}

                  </div>
                </div>
              </div>
          </div>
      </div>
      <Footer />
    </>
  );
}

export default OrderDetail;
