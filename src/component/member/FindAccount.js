import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

function FindAccount() {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [inputCode, setInputCode] = useState(null);
    const [userid, setUserid] = useState('');
    const [viewId, setViewId] = useState({display:'none'});


    function sendMail() {
        if(!name) {return alert('이름을 입력하세요.');}
        if(!email) {return alert('이메일을 입력하세요.');}
        axios.post('/api/member/sendMailForUserid', {name, email})
        .then((result)=>{
            if(result.data.msg === 'confirmed') {
                alert('인증번호가 발송되었습니다. 인증번호는 3분간 유효합니다.');
            }else {
                alert('해당하는 정보의 회원이 없습니다.');  
            }
        }).catch((err)=>{console.error(err);});
    }

    function verifyCode() {
        if(!name) {return alert('이름을 입력하세요.');}
        if(!email) {return alert('이메일을 입력하세요.');}
        if(!inputCode) {return alert('인증번호를 입력하세요.');}
        axios.post('/api/member/findUserid', {name, email, inputCode})
        .then((result)=>{
            if(result.data.msg === 'confirmed') {
                alert('인증이 완료되었습니다.');
                setUserid(result.data.userid);
                setViewId({display:'block'});
            }else{
                alert('인증번호가 일치하지 않거나 만료되었습니다.');
            }
        }).catch((err)=>{console.error(err);});
    }

    return (
        <article className='findAccountPage'>
            <div className="findAwrap">
                
                <div className='memberform'>
                    <h2 className='findA'>아이디 찾기</h2>
                    <div className='field'>
                        <input type='text' value={name} 
                        onChange={(e)=>{setName(e.currentTarget.value)}} placeholder='이름'/>
                    </div>
                    <div className='field'>
                        <input type='text' value={email} 
                        onChange={(e)=>{setEmail(e.currentTarget.value)}} placeholder='이메일'/>
                        <button onClick={()=>{sendMail()}}>메일전송</button>
                    </div>
                    <div>
                        <input type='text' value={inputCode} 
                        onChange={(e)=>{setInputCode(e.currentTarget.value)}} placeholder='인증코드' className='findAinput'/>
                        <button onClick={()=>{verifyCode();}}>인증하기</button>
                    </div>

                    <div className='field findPwdBox' style={viewId}>
                        검색하신 아이디는 <b>{userid}</b>입니다.
                        {/* <button onClick={()=>{navigate('/findPassword')}}>비밀번호 찾기</button> */}
                    </div>
                    
                    <div className='findAbottom'>
                        <button onClick={()=>{navigate('/login')}}>로그인</button>
                        <button onClick={()=>{navigate('/findPassword')}}>비밀번호 찾기</button>
                        <button onClick={()=>{navigate('/join')}}>회원가입</button>
                    </div>
                    
                </div>
            </div>
        </article>
    )
}

export default FindAccount