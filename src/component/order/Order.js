import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../../css/order.css';
import jaxios from '../../util/JWTutil';

import Header from '../Header';
import Footer from '../Footer';
import axios from 'axios';

function Order() {
  const loginUser = useSelector(state => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  //  받아온 데이터에서 변수 추출
  const { state: orderInfo } = location;
  const {
    userid,
    opid,
    pid,
    checkInDate,
    checkOutDate,
    count,
    category,
    selecteddate
  } = orderInfo || {}; 
  useEffect(()=> {
    console.log(orderInfo)
  }, [])
 

  const [hotelData, setHotelData] = useState({});
  const [optionData, setOptionData] = useState({});
  const [experience, setExperience] = useState({});
  const [transData, setTransData] = useState({});
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

    //timetable 변환..
  const formatTime = (str) => {
  if (!str) return "";
    return str.substring(11, 16);  // "01:30"
  };

  // category별 API 호출
  useEffect(() => {
    if (!loginUser || !loginUser.userid) {
      navigate('/login');
      return;
    }

    if (category === "숙소") {
      jaxios.get(`/api/hotel/getOptionItem/${opid}`)
        .then(res => {
          setOptionData(res.data.optionDetail);
          setHotelData(res.data.hotelDetail);
        })
        .catch(err => console.error(err));
    }

    if (category === "체험") {
      jaxios.get(`/api/product/experienceDetail/${pid}`)
        .then(res => {
          setExperience(res.data.experience)

        //console.log("체험 API 응답:", res.data); 
        //console.log("experience state로 설정할 데이터:", res.data.experience);
          
        })
        .catch(err => console.error(err));
    }

    if (category === "교통") {
      jaxios.get(`/api/trans/getTransDetail/${pid}`)
        .then(res => {
          console.log(res.data)
          setTransData(res.data.transData);
          setStartTime(res.data.starttime);
          setEndTime(res.data.endtime);
        })
        .catch(err => console.error(err));
    }
  }, []);


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
  let totalPrice = 0;
  const nights = calculateNights(checkInDate, checkOutDate);

  if (category === "숙소") {
    totalPrice = optionData.price1 * count * nights;
  }

  if (category === "체험") {
    totalPrice = experience.price1 * count;
  }

  if (category === "교통") {
    totalPrice = transData.price1 * count;
  }

  
  //오더 회원정보 자동입력체크
  function fillUserInfo(checked) {
      if (checked) {
          // 이름은 자동 입력
          setName(loginUser.name || "");

          // 카카오 회원이면 phone은 비워둠
          if (loginUser.sns_type === "KAKAO") {
              setPhone("");
          } else {
              setPhone(loginUser.phone || "");
          }

      } else {
          setName("");
          setPhone("");
      }
  }
 


  function goPay() {

      if (!loginUser.userid) {
        navigate('/login');
        return;
      }

      if(!name || !phone){
        window.confirm('예약자 정보를 입력해주세요');
        return;
      }

      if (!window.confirm('결제하시겠습니까?')) return;

      jaxios.post(`/api/order/insertOrder`, {
          userid: loginUser.userid,
          pid,
          opid,
          count,
          category,
          checkInDate,
          checkOutDate,
          selecteddate,
          mname: name,
          mphone: phone,
      })
        .then((res) => {
          const oid = res.data.oid;
          if (window.confirm('결제가 완료되었습니다.')) {
            navigate(`/orderDetail/${oid}`);
          }
        })
        .catch((err) => console.error(err));
    }

  return (
    <>
      <Header />
      <div className='subPage'>
        <div id="orderPage">
          <h2 className="orderTitle">예약하기</h2>

          <div className="orderContainer">

            {/* 왼쪽 영역 */}
            <div className="orderLeft">

              {/* 상품 정보 테이블 */}
              <section className="productInfo">
                <h3 className="sectionTitle">상품 정보</h3>
                <table className="infoTable">
                  <tbody>

                      {category === "숙소" && (
                          <>
                            <tr><th>숙소명</th><td>{hotelData.name}</td></tr>
                            <tr><th>객실명</th><td>{optionData.name}</td></tr>
                            
                            <tr>
                              <th>투숙기간</th>
                              <td className='fontColorPoint'>
                                {checkInDate.toISOString().slice(0, 10)} ~ {checkOutDate.toISOString().slice(0, 10)} ({nights}박)
                              </td>
                            </tr>
                            <tr><th>객실수</th><td className='fontColorPoint'>총 {count}객실</td></tr>
                            <tr><th>1박 가격</th><td>{(optionData?.price1 || 0).toLocaleString()}원</td></tr>
                            <tr><th>총 결제금액</th><td className='fontColorPoint'>{totalPrice.toLocaleString()}원</td></tr>
                          </>
                      )}

                      {category === "체험" && (
                          <>
                            <tr><th>상품명</th><td>{experience.name}</td></tr>
                            <tr><th>선택날짜</th><td>{
                          selecteddate ? selecteddate.toLocaleString() : ""
                          }</td></tr>
                            <tr><th>수량</th><td className='fontColorPoint'>총 {count}개</td></tr>
                            <tr><th>개당 가격</th><td>{(experience?.price1 || 0).toLocaleString()}원</td></tr>
                            <tr><th>총 결제금액</th><td className='fontColorPoint'>{totalPrice.toLocaleString()}원</td></tr>
                          </>
                      )}


                      {category === "교통" && (
                        <>
                          <tr><th>교통편</th><td>{transData.name}</td></tr>
                          <tr><th>출발지</th><td>{transData.start}</td></tr>
                          <tr><th>도착지</th><td>{transData.end}</td></tr>
                          <tr><th>선택날짜</th><td>{
                          selecteddate ? selecteddate.toLocaleDateString('ko-KR') : ""}</td></tr>
                          <tr><th>출발시간</th><td>{startTime}</td></tr>
                          <tr><th>도착시간</th><td>{endTime}</td></tr>
                          <tr><th>수량</th><td className='fontColorPoint'>{count}개</td></tr>
                          <tr><th>가격</th><td>{(transData?.price1 || 0).toLocaleString()}원</td></tr>
                          <tr><th>총 결제금액</th><td className='fontColorPoint'>{totalPrice.toLocaleString()}원</td></tr>
                        </>
                      )}

                            

                  </tbody>
                </table>
              </section>

              {/* 예약자 정보 테이블 */}
              <section className="reservationInfo">
                <div className='reservPerInfo'>
                  <h3 className="sectionTitle">예약자 정보</h3>
                  <div className='checkbookper'>
                      <input type='checkbox' style={{flex:'1'}} onChange={(e)=>{ fillUserInfo(e.currentTarget.checked ) }} /> 
                      <label style={{flex:'9', textAlign:'right'}}>회원정보와 동일함</label>
                  </div>
                </div>
                <table className="infoTable">
                  <tbody>
                    <tr><th>성명</th><td><input type='text' value={name} onChange={(e)=>{ setName(e.currentTarget.value)}}/></td></tr>
                    <tr><th>휴대폰</th><td><input type='text' value={phone} onChange={(e)=>{ setPhone(e.currentTarget.value)}}/></td></tr>
                  </tbody>
                </table>
              </section>
            </div>

            {/* 오른쪽 결제 박스 */}
            <div className="orderRight">
              <h3 className="sectionTitle">결제 정보</h3>
              <div className="paymentBox">
                <div className='fs_14'>최종 결제 금액</div>
                
                {category === "숙소" && (
                    <div className='total_infopay'>
                        {(optionData?.price1 || 0).toLocaleString()} * {count} 객실 * {nights} 박
                    </div>
                )}

                {category === "체험" && (
                    <div className='total_infopay'>
                        {(experience?.price1 || 0).toLocaleString()} * {count}개
                    </div>
                )}

                {category === "교통" && (
                    <div className='total_infopay'>
                        {(transData?.price1 || 0).toLocaleString()} * {count}개
                    </div>
                )}

                <div className='paymentPrice'>{totalPrice.toLocaleString()}원</div>
                <button className="payButton" onClick={goPay}>
                  {(totalPrice || 0).toLocaleString()}원 결제하기
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Order;
