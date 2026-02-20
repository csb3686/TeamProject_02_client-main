import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { redirect, useNavigate } from 'react-router-dom';
import { Cookies } from 'react-cookie';

import '../../css/package.css';

function GoLogin() {

    const loginUser = useSelector(state=>state.user);
    const navigate = useNavigate();
    const cookies = new Cookies();

    useEffect(
        ()=>{
            if(loginUser?.userid){
                navigate('/goCartForPackage')
            }
        },[]
    )

    function goJoin(){
        cookies.set('redirectPage', '/goCartForPackage', { path: '/' });
        navigate('/join');
    }

    function goLogin(){
        cookies.set('redirectPage', '/goCartForPackage', { path: '/' });
        navigate('/login');
    }

    return (
        <div className='goLogin'>
            <div className='goLogin_container'>
                <div style={{fontSize:'70pt'}}>잠깐!</div>
                <div style={{fontSize:'30pt'}}>패키지 주문은 로그인이 필요해요.</div>
                <div style={{fontSize:'18pt'}}>아래 버튼을 눌러 회원가입 혹은 로그인 을 진행해주세요.</div>

                <div className='goLogin_button'>
                    <button onClick={()=>{goJoin()}}>회원가입</button>
                    <button onClick={()=>{goLogin()}}>로그인</button>
                </div>
            </div>
        </div>
    )
}

export default GoLogin