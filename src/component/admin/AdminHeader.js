import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'

import '../../css/admin.css'

function AdminHeader() {

    const [key, setKey] = useState('');

    const navigate = useNavigate();
    const loginUser = useSelector(state=>state.user);

    function goSerch(){
        if(!key){return}

        navigate(`/admin/goSerchResult?key=${encodeURIComponent(key)}`);
    }

    return (
        <div className='admin_header'>
            <div className='admin_header_wrap'>
                <div className='admin_header_first'>
                    <div className='admin_header_logo'  onClick={()=>{navigate('/admin/member')}}>
                        <img src='/images/logo.png'/>
                    </div>
                    <div className="adminUserPbtn" onClick={()=>{navigate('/main')}}>
                        사용자 페이지
                    </div>
                    <div>환영합니다, {loginUser.name} 님</div>
                    <div className='serch_for_all'>
                        <i class="fas fa-search"></i>&nbsp;&nbsp;
                        <input type='text' value={key} onChange={(e)=>{setKey(e.currentTarget.value)}} placeholder='검색어를 입력해주세요' />

                        <div className='serch_for_all_result' onClick={()=>{goSerch()}}>검색</div>
                    </div>
                </div>
                <div className='admin_header_second'>
                    <div className='admin_header_second_wrap'>
                        <div onClick={()=>{navigate('/admin/member')}}>회원정보</div>
                        <div onClick={()=>{navigate('/admin/adminEProduct')}}>상품정보</div>
                        <div onClick={()=>{navigate('/admin/notice')}}>공지사항</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminHeader