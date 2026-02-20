import React, { useState } from 'react'
import { Cookies } from 'react-cookie';
import { redirect, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import {loginAction} from '../../store/userSlice'

import '../../css/login.css'
import axios from 'axios';

function Login() {
    const navigate = useNavigate();
    const cookies = new Cookies();
    const dispatch = useDispatch();
    const loginUser = useSelector(state=>state.user);


    const [userid, setUserid] = useState('');
    const [pwd, setPwd] = useState('');
    

    function onLogin() {

        if(!userid) {return alert('아이디를 입력하세요.');}
        if(!pwd) {return alert('비밀번호를 입력하세요.');}
        axios.post('/api/member/login', null, {params:{username:userid, password:pwd}})
        .then((result)=>{
            if(result.data.error === 'ERROR_LOGIN') {
                alert('아이디 혹은 비밀번호가 틀렸습니다.')
            }else {
                cookies.set('user', JSON.stringify(result.data), {path:'/'});
                dispatch(loginAction(result.data));
                const redirectPage = cookies.get('redirectPage') || '/main';
                cookies.remove('redirectPage');           
                navigate(redirectPage); 
            }
        }).catch((err)=>{console.error(err);})

        
    }

    return (
        <article id='loginWrap'>
            <div className='login'>
                <div className='login-menu'>
                    <i className="fas fa-arrow-left" onClick={()=>{navigate('/main')}} style={{color:'#999'}}>&nbsp;뒤로가기</i>
                </div>
                <div className='login-title'><img src='/images/logo.png' alt='로고'/></div>
                <div className='login-cn'>
                    <div className='login-field-cn'>
                        <div className='login-field'>
                            <div>아이디</div>
                            <input type='text' value={userid} onChange={(e)=>{setUserid(e.currentTarget.value);}} />
                        </div>
                        <div className='login-field'>
                            <div>비밀번호</div>
                            <input type='password' value={pwd} onChange={(e)=>{setPwd(e.currentTarget.value);}} />
                        </div>
                    </div>
                    
                </div>
                <div className='login-side-btn'>
                        <button onClick={()=>{onLogin();}}>로그인</button>
                    </div>
                <div className='login-btns'>
                    <button onClick={()=>{navigate('/join');}}>회원가입</button>
                    <button onClick={()=>{navigate('/findAccount');}}>아이디/비밀번호 찾기</button>
                    <button className="kakaoBtn" onClick={()=>{window.location.href='http://43.200.240.59:8070/member/kakaoStart'}}>카카오 아이디로 로그인</button>
                </div>
            </div>
        </article>
    )
}

export default Login