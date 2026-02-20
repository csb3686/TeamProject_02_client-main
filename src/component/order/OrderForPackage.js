import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import jaxios from '../../util/JWTutil';
import { useSelector } from 'react-redux';
import { Cookies } from 'react-cookie';

import Header from '../Header';
import Footer from '../Footer';
import { isRejectedWithValue } from '@reduxjs/toolkit';

let hasRun = false;

function OrderForCart() {

    const cookies = new Cookies();
    const loginUser = useSelector(state=>state.user);
    const navigate = useNavigate();


    const [cartList, setCartList] = useState([]);
    const [place, setPlace] = useState({});
    const [order, setOrder] = useState({});
    const [options, setOptions] = useState(null);

    const [pkid, setPkid] = useState(0);


    useEffect(
        ()=>{

            // const alreadyRan = sessionStorage.getItem("didRunMyEffect");

            // if (alreadyRan) {
            //     return; // 이미 실행했음 → 실행 안 함

                async function fetchData(){

                    const place = cookies.get('startplace');
                    if (!place) {
                    return;
                    }else{
                        setPlace(place);
                    }
                    console.log(place);

                    const order = cookies.get('orderinfo');
                    if(!order){
                        return;
                    }else{
                        setOrder(order);
                    }
                    console.log(order);


                    const sendToCart = {
                        cid:order.cid,
                        opid:order.hopid,
                        startdate:place.startdate,
                        enddate:place.enddate,
                        sttid:order.sttid,
                        sttransselecteddate:order.sttransselecteddate,
                        sttranscount:order.sttranscount,
                        entid:order.entid,
                        entransselecteddate:order.entransselecteddate,
                        entranscount:order.entranscount,
                        hid:order.hid,
                        hotelnights:order.nights,
                        hotelcount:order.hotelcount,
                        entranscount:order.entranscount,

                        userid:loginUser.userid,
                    }

                    
                    try{
                        const result1 = await jaxios.post('/api/package/insertCartPackage', sendToCart)
                        let pkid = result1.data.packageid;

                        let exlist = [];
                        if(order.exlist != ""){
                            exlist = JSON.parse(order.exlist);
                        }

                        console.log("exlist : " + exlist);
                        
                        
                        if(exlist.length != 0){

                            for(let i=0; i<exlist.length; i++){
                                await jaxios.post('/api/package/insertCartExlist', exlist[i], {params:{packageid:pkid, userid:loginUser.userid}})
                                
                            }
                        }
                        setPkid(pkid);
                        console.log(pkid)
                    }catch(err){
                        console.error(err)
                    }
                }
                fetchData()
            // }

            // sessionStorage.setItem("didRunMyEffect", "true");
        },[]
    )


    useEffect(
        ()=>{
            jaxios.get('/api/package/getCartList', {params:{packageid:pkid}})
            .then((res)=>{
                setCartList(res.data)
                
            }).catch((err)=>{console.error(err)})
                    
        },[pkid]
    )

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

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

        if(!name || !phone){
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

                            {
                                Array.isArray(cartList) && cartList.length > 0 ? (
                                    [...new Set(cartList.map(cart => cart.category))].map(category => {
                                    const filterCarts = cartList.filter(cart => cart.category === category);

                                    return (
                                        <div key={category} style={{ marginBottom: "40px" }}>
                                        <div style={{ marginTop: "20px", marginBottom: "20px", fontSize: "13pt" }}>
                                            - {category}
                                        </div>

                                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                            <tbody>
                                            {filterCarts.map((forder, idx) => {
                                                const checkIn = forder.checkInDate?.substring(0, 10);
                                                const checkOut = forder.checkOutDate?.substring(0, 10);
                                                const selectedDate = forder.selecteddate?.substring(0, 10);

                                                totalPrice.push(forder.price * forder.count)
                                                sum = totalPrice.reduce((acc, cur) => acc + cur, 0);

                                                return (
                                                <React.Fragment key={forder.id || idx}>
                                                    <tr>
                                                    <th>상품명</th>
                                                    <td>{forder.product?.name || forder.name}</td>
                                                    </tr>
                                                    <tr>
                                                    <th>옵션명</th>
                                                    <td>{forder.product?.options?.name || "옵션 없음"}</td>
                                                    </tr>
                                                    <tr>
                                                    <th>예약일(숙박기간)</th>
                                                    <td>
                                                        {selectedDate
                                                        ? selectedDate
                                                        : checkIn && checkOut
                                                        ? `${checkIn} ~ ${checkOut}`
                                                        : "-"}
                                                    </td>
                                                    </tr>
                                                    <tr>
                                                    <th>수량(숙박일수)</th>
                                                    <td>{`${forder.count} (개/일)`}</td>
                                                    </tr>
                                                    <tr>
                                                    <th>결제금액</th>
                                                    <td>{new Intl.NumberFormat("ko-KR").format(forder.price)}원</td>
                                                    </tr>
                                                </React.Fragment>
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                        </div>
                                    );
                                    })
                                ) : (
                                    <>LOADING...</>
                                )
                            }
                        </table>
                    </section>

                    {/* 예약자 정보 테이블 */}
                    <section className="reservationInfo">
                        <h3 className="sectionTitle">예약자 정보</h3>
                        <div className='checkbookper'>
                            <label style={{flex:'9', textAlign:'right'}}>현재 사용자와 주문자가 동일합니다</label>
                            <input type='checkbox' style={{flex:'1'}} onChange={(e)=>{ fillUserInfo(e.currentTarget.checked ) }} /> 
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