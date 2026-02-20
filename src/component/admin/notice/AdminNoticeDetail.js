import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../../css/qnaDetail.css'; 
import AdminHeader from '../AdminHeader';
import jaxios from '../../../util/JWTutil';

function AdminNoticeDetail() {
  const { nid } = useParams();
  const [notice, setNotice] = useState(null);
  const navigate = useNavigate();

    useEffect(() => {
        jaxios.get(`/api/customer/getNoticeDetail/${nid}`)
        .then((res) => {
            setNotice(res.data.notice);
        })
        .catch((err) => console.error(err));
    }, [nid]);

    function noticeDelete(nid) {
        if(window.confirm('공지사항을 삭제하시겠습니까?')) {
            jaxios.delete(`/api/admin/deleteNotice/${nid}`)
            .then((res) => {
                alert('삭제되었습니다.');
                navigate('/admin/notice');
            })
            .catch((err) => {
                alert('삭제에 실패했습니다.');
                console.error(err);
            });
        }
        
    }

    return (
        <div className='admin_notice_detail'>
            <AdminHeader />
            <div className="admin_notice_subPage">
                {notice ? (
                <div className="qnaview">
                    <h2>Notice</h2>
                    <div className="field-qnaDetail">
                        <label>제목</label><div>{notice.title}</div>
                    </div>
                    <div className="field-qnaDetail">
                        <label>내용</label><div>{notice.content}</div>
                    </div>
                    <div className="field-qnaDetail">
                        <label>작성일</label><div>{notice.indate?.substring(0, 10)}</div>
                    </div>
                    <div className="btns">
                        <button onClick={() => navigate(`/admin/noticeEdit/${nid}`)}>수정하기</button>
                        <button onClick={() => noticeDelete(nid)}>삭제하기</button>
                        <button onClick={() => navigate('/admin/notice')}>목록으로</button>
                    </div>
                </div>
                ) : (
                <div className="qnaview-loading">Loading...</div>
                )}
            </div>
        </div>
    );
}

export default AdminNoticeDetail;