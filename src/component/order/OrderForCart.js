import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'
import jaxios from '../../util/JWTutil';
import { useSelector } from 'react-redux';

import Header from '../Header';
import Footer from '../Footer';

function OrderForCart() {

    const location = useLocation();
    const loginUser = useSelector(state=>state.user);
    const navigate = useNavigate();
    const { cidList } = location.state;

    console.log(cidList)

    const [cartList, setCartList] = useState([]);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');


    useEffect(
        ()=>{
            jaxios.post('/api/cart/getOrdersFromCart', {cidList:cidList})
            .then((res)=>{
                setCartList(res.data);
                console.log(res.data)

            }).catch((err)=>{console.error(err)})
        },[cidList]
    )

    

    let totalPrice = [];
    let sum = 0;

    

    //오더 회원정보 자동입력체크
    function fillUserInfo(checked) {
        if (checked) {
            // 이름은 자동 입력
            setName(loginUser.name || "");

            // 카카오 회원이면 phone은 비워둠
            if (loginUser.snsType === "KAKAO") {
                setPhone("");  
            } else {
                setPhone(loginUser.phone || "");
            }

        } else {
            setName("");
            setPhone("");
        }
    }

    function goPay(){
        if (!loginUser.userid) {
            navigate('/login');
            return;
        }

        if(!name && !phone){
            window.confirm('예약자 정보를 입력해주세요');
            return;
        }

        if (!window.confirm('결제하시겠습니까?')) return;

        
        jaxios.post('/api/cart/insertOrderbyCart', {cartList:cartList}, {params:{userid:loginUser.userid, mname:name, mphone:phone}})
        .then((result)=>{
            if (window.confirm('결제가 완료되었습니다.')) {
                navigate('/mypage')
            }
        }).catch((err)=>{console.error(err)})
        
    

    }

    //숙박일 계산 함수
    const calculateNights = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 1;
        const inDate = new Date(checkIn);
        const outDate = new Date(checkOut);
        const diffTime = outDate - inDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays > 0 ? diffDays : 1;
    };

    
    return (
            <>
            <Header />
            <div className='subPage'>
                <div className="orderPage">
                <h2 className="orderTitle">예약하기</h2>

                <div className="orderContainer">

                    {/* 왼쪽 영역 */}
                    <div className="orderLeft">

                    {/* 상품 정보 테이블 */}
                    <section className="productInfo">
                        <h3 className="sectionTitle">상품 정보</h3>
                        <table className="infoTable">
                        <tbody>
                            {
                                (Array.isArray(cartList) && cartList.length > 0)?
                                (
                                [...new Set(cartList.map(cart => cart.category))].map(category => {
                                    const filterCarts = cartList.filter(cart => cart.category === category);
                                    return(
                                        <>

                                            {
                                                filterCarts.map((forder, idx)=>{

                                                    const checkInDate = (forder.checkInDate)?(forder.checkInDate.substring(0, 10)):(null);
                                                    const checkOutDate = (forder.checkInDate)?(forder.checkInDate.substring(0, 10)):(null);

                                                    const checkDate = (`${checkInDate} ~ ${checkOutDate}`)


                                                    
                                                    
                                                    totalPrice.push(forder.price * forder.count)
                                                    sum = totalPrice.reduce((acc, cur) => acc + cur, 0);
                                                    
                                                    return(
                                                        <>
                                                            <div style={{marginTop:'20px', marginBottom:'20px',fontSize:'13pt'}}>-&nbsp;{forder.category}</div>
                                                            <tr><th>상품명</th><td>{forder.name}</td></tr>
                                                            <tr><th>옵션명</th><td>{forder.opname || '옵션 없음'}</td></tr>
                                                            <tr>
                                                            <th>예약일(숙박기간)</th>
                                                            <td>
                                                                {
                                                                    forder.selecteddate
                                                                    ? forder.selecteddate.substring(0, 10)
                                                                    : (forder.checkInDate
                                                                        ? `${forder.checkInDate.substring(0, 10)} (${checkDate})`
                                                                        : null)
                                                                }
                                                            </td>
                                                            </tr>
                                                            <tr><th>수량(숙박일수)</th><td>{`${forder.count} (일)`}</td></tr>
                                                            <tr></tr>
                                                            <tr><th>1개(박)가격</th><td>{new Intl.NumberFormat('ko-KR').format(forder.price)}원</td></tr>
                                                        </>
                                                    )
                                                })
                                            }
                                        </>
                                    )
                                    })
                                ):(<>LOADING...</>)
                            }
                        </tbody>
                        </table>
                    </section>

                    {/* 예약자 정보 테이블 */}
                    <section className="reservationInfo">
                        <div className='reservPerInfo'>
                            <h3 className="sectionTitle">예약자 정보</h3>
                            <div className='checkbookper'>
                                <label style={{flex:'9', textAlign:'right'}}>현재 사용자와 주문자가 동일합니다</label>
                                <input type='checkbox' style={{flex:'1'}} onChange={(e)=>{ fillUserInfo(e.currentTarget.checked ) }} /> 
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
                            <div className='paymentPrice'>{new Intl.NumberFormat('ko-KR').format(sum)}원</div>
                            <button className="payButton" onClick={goPay}>
                                {(new Intl.NumberFormat('ko-KR').format(sum) || 0).toLocaleString()}원 결제하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
        </>
    )
}

export default OrderForCart