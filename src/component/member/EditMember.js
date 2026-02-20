import axios from 'axios'
import React, { useEffect, useState } from 'react'
import DaumPostcode from 'react-daum-postcode';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Cookies } from 'react-cookie';

import Header from '../Header';
import Footer from '../Footer';
import jaxios from '../../util/JWTutil'

import '../../css/join.css'
import { loginAction } from '../../store/userSlice';


function EditMember() {

    const [userid, setUserid] = useState('');

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
    const [snsType, setSnstype] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cookies = new Cookies();
    const loginUser = useSelector(state=>state.user);

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
        setZipCode(data.zonecode);
        setAddress(data.address);
        setIsOpen(false);
    }

    useEffect(
        ()=>{
            setUserid(loginUser.userid || '');
            setEmail(loginUser.email || '');
            setName(loginUser.name || '');
            setPhone(loginUser.phone || '');
            setZipCode(loginUser.zipCode || '');
            setAddress(loginUser.address || '');
            setAddressDetail(loginUser.addressDetail || '');
            console.log(loginUser);

            jaxios.get('/api/member/getBirth', {params:{userid:loginUser.userid}})
            .then((result)=>{ 
                setBirth(result.data.birth) ;
                setSnstype(result.data.snsType);
            })
            .catch((err)=>{console.error(err)})

            console.log(loginUser)
        },[]
    )

    const emailRegex = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/

    async function onSubmit(){
        if(!pwd) {return alert('비밀번호를 입력하세요.');}
        if(pwd !== pwdChk) {return alert('비밀번호 확인이 일치하지 않습니다.');}
        if(!name) {return alert('이름을 입력하세요.');}
        if(!email) {return alert('이메일을 입력하세요.');}
        if(!emailRegex.test(email)) {return alert('올바르지 않은 이메일 형식입니다.');}
        if(!phone) {return alert('전화번호를 입력하세요.');}
        if(!zipCode) {return alert('우편번호를 검색해 주소를 입력하세요.');}
        if(!address) {return alert('우편번호를 검색해 주소를 입력하세요.');}

        try {
            await jaxios.post('/api/member/updateMember', 
                {userid:loginUser.userid, pwd, name, email, phone, birth, zipCode, address, addressDetail});
            alert('회원정보가 수정되었습니다.');
            const reLogin = await axios.post('/api/member/login', null, {params:{username:userid, password:pwd}});
            cookies.set('user', JSON.stringify(reLogin.data), {path:'/'});
            dispatch(loginAction(reLogin.data));
            navigate('/mypage');
        }catch(err) {console.error(err);}
    }

    return (
        <div className='editUser' style={{display:'flex', flexDirection:'column'}}>
            <div>
                <Header />
            </div>
            <div className='myWrap' style={{marginBottom:'60px', display:'flex', justifyContent:'flex-start'}}>
                <div className='mypage-submenu'>
                    <div className='mypage-title' onClick={()=>{navigate('/mypage')}} style={{cursor:'pointer'}}>
                        MY PAGE
                    </div>
                    <ul>
                        <li onClick={()=>{navigate('/mypage')}}>주문내역</li>
                        <li className="active" onClick={()=>{navigate('/editmember')}}>회원정보 수정</li>
                        <li onClick={()=>{navigate('/reviewBox')}}>리뷰 보관함</li>
                    </ul>
                </div>
                <div style={{boxShadow:'none', paddingRight:'80px', paddingLeft:'80px', marginTop:'15px', width:'600px'}}>
                    {
                        (snsType !== "KAKAO")?
                        (
                            <>
                            <div className='join-title' style={{marginTop:'5px'}}>회원정보 수정</div>
                            <form onSubmit={(e)=>{onSubmit(e)}} className='join-form'>
                                <div className='join-field'>
                                    <div>아이디</div>
                                    <input type='text' value={userid} onChange={(e)=>{setUserid(e.currentTarget.value)}} readOnly/>
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
                                    <input type='button' value='수정하기' onClick={()=>{onSubmit();}} />
                                    <input type='button' value='돌아가기' onClick={()=>{navigate('/mypage');}} />
                                </div>
                            </form>
                            </>
                        ):(
                            <div className='join-title'>SNS 계정 가입 회원은 정보 수정이 불가합니다.</div>
                        )
                    }
                    
                </div>
            </div>
            <div>
                <Footer/>
            </div>
        </div>
    )
}

export default EditMember