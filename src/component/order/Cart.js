import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';

import jaxios from '../../util/JWTutil'

import Header from '../Header';
import Footer from '../Footer';
import '../../css/cart.css'

function Cart() {

    const navigate = useNavigate();
    const loginUser = useSelector(state=>state.user);

    const [cartList, setCartList] = useState([]);
    const [checkList, setCheckList] = useState([]);
    const [option, setOption] = useState({});

    const [paging, setPaging] = useState({});
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(
        ()=>{

            if(!loginUser.userid){
                navigate('/login')
                return;
            }
            //삭제된 상품 카트리스트에서 제거
            jaxios.delete('/api/cart/removeDeletedItems',{ params: { userid: loginUser.userid } })
            .then((res) => {
                const deletedNames = res.data;
                if (deletedNames.length > 0) {
                    alert(`장바구니에서 판매중지된 상품이 삭제되었습니다.\n- ${deletedNames.join('\n- ')}`);
                }

                return jaxios.get('/api/cart/getCartList', {params:{userid:loginUser.userid, page:currentPage}})
            })
            .then((res)=>{
                const list = res.data;
                setCartList(res.data.cartList);
                setPaging(res.data.paging);

                let p = [];
                if(res.data.paging != null){
                for (let i = res.data.paging.beginPage; i <= res.data.paging.endPage; i++) {
                    p.push(i);
                }
                setPages([...p]);
                }else{
                    setPages([]);
                }
                
                
                console.log(res.data)
                if(list.deletedList && list.deletedList.length > 0){
                    alert("장바구니에서 기간이 지난 상품이 삭제되었습니다.")
                }

            })
            .catch((err)=>{console.error(err)});
        },[currentPage]
    );

    function onCheck(cartid, checked){
        const id = Number(cartid);
        if(checked){
            setCheckList((prev)=> {
                if (!prev.includes(id)) {
                    return [...prev, id]; // 중복 방지
                }
                return prev;
            })
        }else{
            setCheckList((prev)=> prev.filter((item)=> item != id))
        }
        console.log(checkList)
    }

    function setAll(e) {
        if (e.target.checked) {
        // 전체 선택 → 모든 cartid를 배열에 추가
            const allIds = cartList.map(cart => cart.cartid);
            setCheckList(allIds);
        } else {
        // 전체 해제 → 빈 배열로 초기화
            setCheckList([]);
        }
        console.log(checkList);
    }

    
    async function deleteOneCart(cartid){
        if(window.confirm('해당 상품을 삭제하시겠습니까?')){
            try{
                await jaxios.delete(`/api/cart/deleteCart/${cartid}`)

                const result = await jaxios.get('/api/cart/getCartList',{params:{userid:loginUser.userid, page:currentPage}})
                const res = result.data
                setCartList(res.cartList);
                setCheckList([]);

                res.forEach(item => {
                    if (item.category === "숙소") {
                        setOption (item.product?.options?.find(opt => opt.opid == item.opid));
                    }
                })
            }catch(err){
                console.error(err)
            }
        }
    }

    async function deleteCart(){
        if(checkList.length == 0){
            return alert('삭제할 상품들을 선택해주세요');
        }
        if(window.confirm('선택한 상품들을 삭제하시겠습니까?')){
            try{
                for(let i=0; i<checkList.length; i++){
                    await jaxios.delete(`/api/cart/deleteCart/${checkList[i]}`)
                }

                const result = await jaxios.get('/api/cart/getCartList',{params:{userid:loginUser.userid, page:currentPage}})
                const res = result.data
                setCartList(res.cartList);
                setCheckList([]);

                res.forEach(item => {
                    if (item.category === "숙소") {
                        setOption (item.product?.options?.find(opt => opt.opid == item.opid));
                    }
                    // console.log(option)
                })
            }catch(err){
                console.error(err);
            } 
        }
    }


    

    async function onsubmit() {
        if (checkList.length === 0) {
            return alert('주문하실 상품들을 선택해주세요');
        }

        try {
            const shortageHotel = []; // 부족객실 호텔 이름 리스트
            const shortageTrans = []; // 부족좌석 교통 이름 리스트

            //선택된 장바구니 상품 ID들을 순회
            for (let id of checkList) {
                //cartList 에서 현재 ID와 일치하는 상품 객체 찾기
                const cartItem = cartList.find(c => c.cartid === id);

                if (cartItem.category === '숙소') {
                    const startISO = new Date(cartItem.checkInDate).toISOString();
                    const endISO = new Date(cartItem.checkOutDate).toISOString();
                    console.log(startISO);

                    const res = await jaxios.get('/api/hotel/countRoom', {
                        params: {
                            opid: cartItem.opid,
                            startdate: startISO,
                            enddate: endISO,
                            count: cartItem.count
                        }
                    });

                    if (res.data.msg !== 'ok') {
                        shortageHotel.push(cartItem.product.name); // 이름 저장
                    }
                }

                if (cartItem.category === '교통') {
                    const selectISO = new Date(cartItem.selecteddate).toISOString().split('T')[0];
                    const res = await jaxios.get('/api/trans/getcount', {
                        params: {
                            tid: cartItem.pid,
                            selectedDate: selectISO,
                            count: cartItem.count
                        }
                });

                if (res.data.msg !== 'ok') {
                    shortageTrans.push(cartItem.product.name); // 이름 저장
                }
            }
            }

            // 부족한 호텔/교통 상품 알림
            if (shortageHotel.length > 0 || shortageTrans.length > 0) {
                let msg = '';
                if (shortageHotel.length > 0) {
                    msg += `호텔 예약 가능 객실 부족 \n- ${shortageHotel.join('\n- ')}\n\n`;
                }
                if (shortageTrans.length > 0) {
                    msg += `교통 예약 가능 좌석 부족 \n- ${shortageTrans.join('\n- ')}`;
                }
                return alert(msg);
            }

            // 모두 OK → 주문 페이지로 이동
            navigate('/orderForCart', { state: { cidList: checkList } });

        } catch (err) {
            console.error(err);
            alert('서버 오류로 주문을 진행할 수 없습니다.');
        }
    }

    function onPageMove(p){
        setCheckList([]);
        setCurrentPage(p);
    }


    return (
        <div className='cart'>
            <div>
                <Header />
            </div>
            <div className='cartCn'>
                <div className='cartListBox'>
                    <div className='title-cart'>장바구니</div>

                    {
                        ( cartList == null || cartList.length ==0 )?
                        (<div className='content-cart'>장바구니가 비어있습니다.</div>):
                        (
                            cartList.map((cart, idx)=>{
                            const productName = cart.product?.name || cart.name || '상품 정보 없음';
                            const productDetail = (() => {
                                if (cart.category === "숙소") {
                                    return cart.product?.options?.name || cart.opname || '-';
                                }
                                if (cart.product?.start && cart.product?.end) {
                                    return `${cart.product.start} - ${cart.product.end}`;
                                }
                                return cart.product?.content || '';
                            })();

                                function renderDate(cart){
                                    if(cart.category === "숙소"){
                                        const checkIn = cart.checkInDate ? cart.checkInDate.substring(0, 10) : null;
                                        const checkOut = cart.checkOutDate ? cart.checkOutDate.substring(0, 10) : null;

                                        return(
                                            <div style={{display:'flex', flexDirection:'column', textAlign:'center'}}>
                                                <p style={{margin:'3px 0'}}>{checkIn}</p>
                                                <p style={{margin:'3px 0'}}> - </p>
                                                <p style={{margin:'3px 0'}}>{checkOut}</p>
                                            </div>
                                        )
                                    }

                                    if (cart.selecteddate) {
                                        return <p>{cart.selecteddate.substring(0, 10)}</p>;
                                    }
                                }
                            return(
                                <div className='content-cart' key={idx}>
                                    <div className='checkBox-cart'>
                                        <input type='checkbox' value={cart.cartid} onChange={(e)=>{onCheck(e.currentTarget.value, e.currentTarget.checked)}} checked={checkList.includes(cart.cartid)} />
                                    </div>
                                    <div className='image-cart'>
                                        <img src={cart.image} />
                                    </div>
                                    <div className='cart_detail'>
                                        <div className='row-cart'>
                                            <div style={{width:'350px'}}>
                                            <div className='col-cart' style={{cursor:'pointer'}} 
                                            onClick={()=>{
                                                if(cart.category === '숙소'){
                                                    navigate(`/hotelDetail/${cart.pid}`)
                                                }else if(cart.category === '교통'){
                                                    navigate(`/transDetail/${cart.pid}`)
                                                }else if(cart.category === '체험'){
                                                    navigate(`/experienceDetail/${cart.pid}`)
                                                }
                                            }}
                                            >
                                                {productName}
                                            </div>
                                            <div className='col-cart'>
                                                {productDetail}
                                            </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='detail' style={{marginRight:'50px'}}>
                                        {renderDate(cart)}
                                    </div>
                                    <div className='detail' style={{marginRight:'50px'}}>{cart.count}</div>
                                    <div className='detail' style={{width:'150px'}}>{new Intl.NumberFormat('ko-KR').format(Number(cart.price)*Number(cart.count))} 원</div>
                                    <div className='detail' style={{cursor:'pointer'}}>
                                        <i className="far fa-trash-alt" onClick={()=>{deleteOneCart(cart.cartid)}}></i>
                                    </div>
                                </div>
                            )
                        })
                        )
                    }

                    {
                        (paging == null)?
                        (null):(

                            <div id="paging" style={{ textAlign: "center", padding: "10px" }}>
                                {
                                    paging.prev && (
                                        <span style={{ cursor: "pointer" }} onClick={() => onPageMove(paging.beginPage - 1)}> ◀ </span>
                                    )
                                }

                                {pages.map((page, idx) => (
                                    <span
                                        key={idx}
                                        style={{
                                            cursor: "pointer",
                                            fontWeight: page === currentPage ? 'bold' : 'normal'
                                        }}
                                        onClick={() => onPageMove(page)}
                                    >
                                        &nbsp;{page}&nbsp;
                                    </span>
                                ))}

                                {paging.next && (
                                    <span style={{ cursor: "pointer" }} onClick={() => onPageMove(paging.endPage + 1)}> ▶ </span>
                                )}
                            </div>

                        )
                    }
                    
                    
                    
                    <div className='option-cart'>
                        <div className='delete-cart'>
                            <div><input type='checkbox' onChange={setAll}/>
                            <span className='allChktxt'>전체선택</span>
                            </div>
                            
                        </div>
                        <div>
                            <button className="delBtn gray" onClick={()=>{deleteCart()}}>선택 삭제</button>
                            <button className='btns-cart' onClick={()=>{onsubmit()}}>결제하기</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className='footer'>
                <Footer />
            </div>
        </div>
    )
}

export default Cart