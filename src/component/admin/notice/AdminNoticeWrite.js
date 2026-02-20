import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../AdminHeader';
import jaxios from '../../../util/JWTutil';

function AdminNoticeWrite() {
    const navigate = useNavigate();
    const [title, setTitle] = useState();
    const [content, setContent] = useState();

    function onSubmit() {
        if(!title) {return alert('제목을 입력하세요.');}
        if(!content) {return alert('내용을 입력하세요.');}

        jaxios.post('/api/admin/writeNotice', {title, content})
        .then(()=>{
            alert('작성이 완료되었습니다.');
            navigate('/admin/notice');
        }).catch((err)=>{
            console.error(err);
            alert('작성에 실패했습니다.');
        })
    }

    return (
        <div className='admin_detail_edit'>
            <AdminHeader />
            <div className='admin_detail_edit_container'>
                <div className='admin_detail_edit_wrap'>
                    <h2>공지사항 작성</h2>
                    <div className='admin_detail_edit_field'>
                        <label>제목</label>
                        <input type='text' value={title} onChange={(e)=>{setTitle(e.currentTarget.value)}} />
                    </div>
                    <div className='admin_detail_edit_field'>
                        <label>내용</label>
                        <textarea row='10' value={content} onChange={(e)=>{setContent(e.currentTarget.value)}}></textarea>
                    </div>
                    <div className='btns'>
                        <button onClick={()=>{onSubmit();}}>작성 완료</button>
                        <button onClick={()=>{navigate('/admin/notice');}}>돌아가기</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminNoticeWrite