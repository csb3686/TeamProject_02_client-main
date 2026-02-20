import React, { useState } from 'react'
import Modal from 'react-modal';
import DaumPostcode from 'react-daum-postcode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Cookies } from 'react-cookie';

import '../../css/join.css'
import { useDispatch, useSelector } from 'react-redux';

function Join() {
    const [userid, setUserid] = useState('');
    const [idCheckResStyle, setIdCheckResStyle] = useState({flex: '1', textAlign: 'center', fontWeight: 'bold'});
    const [idConfirmed, setIdConfirmed] = useState('');
    const [message, setMessage] = useState('');
    const [pwd, setPwd] = useState('');
    const [pwdChk, setPwdChk] = useState('');
    const [name, setName] = useState('');
    const [birth, setBirth] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [address, setAddress] = useState('');
    const [addressDetail, setAddressDetail] = useState('');
    const [isOpen, setIsOpen] = useState();

    const navigate = useNavigate();
    const cookies = new Cookies();

    const customStyles = {
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
        },
        content: {
            left: '0',
            margin: 'auto',
            width: '500px',
            height: '600px',
            padding: '0',
            overflow: 'hidden'
        }
    } 

    const completeHandler = (data)=>{
        console.log(data);
        setZipCode(data.zonecode);
        setAddress(data.address);
        setIsOpen(false);
    }

    function idCheck() {
        if(!userid) {return alert('아이디를 입력하세요.');}
        axios.post('/api/member/idCheck', null, {params:{userid}})
        .then((result)=>{
            if(result.data.msg === 'confirmed') {
                setMessage('사용 가능');
                setIdConfirmed(userid);
                setIdCheckResStyle({width:'90px', textAlign:'center', fontWeight: 'bold', color: 'blue'});
            }else {
                setMessage('사용 불가능');
                setIdConfirmed('');
                setIdCheckResStyle({ fontWeight: 'bold', color: 'red'});
            }
        }).catch((err)=>{console.error(err);});
    }

    const emailRegex = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/

    async function onSubmit(e) {
        e.preventDefault();
        if(!userid) {return alert('아이디를 입력하세요.');}
        if(userid !== idConfirmed) {return alert('아이디 중복 검사를 실행하세요.');}
        if(!pwd) {return alert('비밀번호를 입력하세요.');}
        if(pwd !== pwdChk) {return alert('비밀번호 확인이 일치하지 않습니다.');}
        if(!name) {return alert('이름을 입력하세요.');}
        if(!email) {return alert('이메일을 입력하세요.');}
        if(!emailRegex.test(email)) {return alert('올바르지 않은 이메일 형식입니다.');}
        if(!phone) {return alert('전화번호를 입력하세요.');}
        if(!zipCode) {return alert('우편번호를 검색해 주소를 입력하세요.');}
        if(!address) {return alert('우편번호를 검색해 주소를 입력하세요.');}
        try {
            const result = await axios.post('/api/member/join', 
            {userid, pwd, birth, name, email, phone, zipCode, address, addressDetail})
                if(result.data.msg === 'success') {
                    alert('회원가입이 완료되었습니다.');
                    const redirectPage = cookies.get('redirectPage') || '/main';
                    cookies.remove('redirectPage');           
                    navigate(redirectPage); 
                }else {
                    alert('회원가입에 실패했습니다.');
                }
        }catch(err) {console.error(err);}
    }

    return (
        <article className='joinWrap'>
            <div className='join'>
                <div className='join-menu'>
                    <div  onClick={()=>{navigate('/login')}}><i class="fas fa-arrow-left" style={{color:'#999'}}>&nbsp;뒤로가기</i></div>
                </div>
            <div className='join-title'>회원가입</div>
            <form onSubmit={(e)=>{onSubmit(e)}} className='join-form'>
                <div className='join-field'>
                    <div>아이디</div>
                    <input type='text' value={userid} onChange={(e)=>{setUserid(e.currentTarget.value)}}/>
                    <input type='button' value='중복확인' onClick={()=>{idCheck();}} />
                    <input type='hidden' name='idConfirmed' value={idConfirmed} />
                    <div style={idCheckResStyle}>{message}</div>
                </div>
                
                <div className='join-field'>
                    <div>비밀번호</div>
                    <input type='password' value={pwd} onChange={(e)=>{setPwd(e.currentTarget.value)}} />
                </div>
                <div className='join-field'>
                    <div>비밀번호 확인</div>
                    <input type='password' value={pwdChk} onChange={(e)=>{setPwdChk(e.currentTarget.value)}} />
                </div>
                <div className='join-field'>
                    <div>이름</div>
                    <input type='text' value={name} onChange={(e)=>{setName(e.currentTarget.value)}} />
                </div>
                <div className='join-field'>
                    <div>생년월일</div>
                    <input type='date' value={birth} onChange={(e)=>{setBirth(e.currentTarget.value)}} />
                </div>
                <div className='join-field'>
                    <div>이메일</div>
                    <input type='text' value={email} onChange={(e)=>{setEmail(e.currentTarget.value)}} />
                </div>
                <div className='join-field'>
                    <div>전화번호</div>
                    <input type='text' value={phone} onChange={(e)=>{setPhone(e.currentTarget.value)}} />
                </div>
                <div className='join-field'>
                    <div>우편번호</div>
                    <input type='text' value={zipCode} readOnly />
                    <input type='button' value='검색' onClick={()=>{setIsOpen(true)}} />
                </div>
                <div>
                    <Modal isOpen={isOpen} ariaHideApp={false} style={customStyles}>
                        <DaumPostcode onComplete={completeHandler} /><br />
                        <input type='button' value='닫기' onClick={()=>{setIsOpen(false)}} />
                    </Modal>
                </div>
                <div className='join-field'>
                    <div>주소</div>
                    <input type='text' value={address} readOnly />
                </div>
                <div className='join-field'>
                    <div>상세주소</div>
                    <input type='text' value={addressDetail} onChange={(e)=>{setAddressDetail(e.currentTarget.value)}} />
                </div>
                <div className='join-btns'>
                    <input type='submit' value='가입하기' />
                    <input type='button' value='돌아가기' onClick={()=>{navigate('/login');}} />
                </div>
            </form>
            </div>
        </article>
    )
}

export default Join