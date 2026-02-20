import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

function ResetPassword() {
    const navigate = useNavigate();
    const {resetToken} = useParams();
    const [pwd, setPwd] = useState('');
    const [pwdChk, setPwdChk] = useState('');

    useEffect(
        ()=>{
            axios.get('/api/member/checkResetToken', {params:{resetToken}})
            .then((result)=>{
                if(result.data.msg !== 'confirmed') {
                    alert('유효하지 않은 접근입니다.');
                    navigate('/findPassword');
                }
            }).catch((err)=>{console.error(err);});
            
        }, []
    )

    function changePassword() {
        if(!pwd) {return alert('비밀번호를 입력하세요.');}
        if(pwd !== pwdChk) {return alert('비밀번호 확인이 일치하지 않습니다.');}

        axios.post('/api/member/updatePwd', null, {params:{resetToken, pwd}})
        .then((result)=>{
            if(result.data.msg === 'success') {
                alert('비밀번호가 수정되었습니다. 로그인하세요.');
                navigate('/login');
            }else if(result.data.msg === 'expired') {
                alert('세션이 만료되었습니다. 처음부터 다시 시도해주세요.');
                navigate('/findPassword');
            }else {
                alert('비밀번호 수정에 실패했습니다.');
            }
        }).catch((err)=>{console.error(err);});
    }

    return (
        <article>
            <div className='memberform'>
                <h2>비밀번호 변경</h2>
                <div className='field'>
                    <label>새 비밀번호</label>
                    <input type='password' value={pwd} 
                    onChange={(e)=>{setPwd(e.currentTarget.value)}} />
                </div>
                <div className='field'>
                    <label>비밀번호 확인</label>
                    <input type='password' value={pwdChk} 
                    onChange={(e)=>{setPwdChk(e.currentTarget.value)}} />
                    <button onClick={()=>{changePassword()}}>변경하기</button>
                </div>
            </div>
        </article>
    )
}

export default ResetPassword