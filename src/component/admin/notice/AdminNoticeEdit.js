import React, { useEffect, useState } from 'react'
import AdminHeader from '../AdminHeader';
import jaxios from '../../../util/JWTutil';
import { useNavigate, useParams } from 'react-router-dom';

function AdminNoticeEdit() {
    const navigate = useNavigate();
    const {nid} = useParams();
    const [title, setTitle] = useState();
    const [content, setContent] = useState();

    useEffect(
        ()=>{
            jaxios.get(`/api/customer/getNoticeDetail/${nid}`)
        .then((res) => {
            setTitle(res.data.notice.title);
            setContent(res.data.notice.content);
        })
        .catch((err) => console.error(err));
        }, [nid]
    )

    function onSubmit() {
        if(!title) {return alert('제목을 입력하세요.');}
        if(!content) {return alert('내용을 입력하세요.');}

        jaxios.post('/api/admin/editNotice', {nid, title, content})
        .then(()=>{
            alert('수정이 완료되었습니다.');
            navigate('/admin/notice');
        }).catch((err)=>{
            console.error(err);
            alert('수정에 실패했습니다.');
        })
    }

    return (
        <div className='admin_detail_edit'>
            <AdminHeader />
            <div className='admin_detail_edit_container'>
                <div className='admin_detail_edit_wrap'>
                    <h2>공지사항 수정</h2>
                    <div className='admin_detail_edit_field'>
                        <div>제목</div>
                        <input type='text' value={title} onChange={(e)=>{setTitle(e.currentTarget.value)}} />
                    </div>
                    <div className='admin_detail_edit_field'>
                        <div>내용</div>
                        <textarea row='10' value={content} onChange={(e)=>{setContent(e.currentTarget.value)}}></textarea>
                    </div>
                    <div className='btns'>
                        <button onClick={()=>{onSubmit();}}>수정 완료</button>
                        <button onClick={()=>{navigate('/admin/notice');}}>돌아가기</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminNoticeEdit