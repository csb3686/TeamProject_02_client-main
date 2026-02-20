import axios from 'axios';
import React, { useEffect } from 'react'
import { Cookies } from 'react-cookie';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import { loginAction } from '../../store/userSlice';

function KakaoIdLogin() {
    const {userid} = useParams();
    const navigate = useNavigate();
    const cookies = new Cookies();
    const dispatch = useDispatch();

    useEffect(
        ()=>{
            axios.post('/api/member/login', null, {params:{username: userid, password: 'KAKAO'}})
            .then((result)=>{
                if(result.data.error === 'ERROR_LOGIN') {
                    alert('아이디 혹은 비밀번호가 틀렸습니다.')
                }else {
                    console.log('KakaoUser: ', result.data);
                    cookies.set('user', JSON.stringify(result.data), {path:'/'});
                    dispatch(loginAction(result.data));
                    const redirectPage = cookies.get('redirectPage') || '/main';
                    cookies.remove('redirectPage');           
                    navigate(redirectPage);
                }
            }).catch((err)=>{console.error(err);})
        }
    )

    return (
        <div>Loading...</div>
    )
}

export default KakaoIdLogin