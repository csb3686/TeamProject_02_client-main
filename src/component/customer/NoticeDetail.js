import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import '../../css/qnaDetail.css'; 

function QnaDetail() {
  const { nid } = useParams();
  const [notice, setNotice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/customer/getNoticeDetail/${nid}`)
      .then((res) => {
        setNotice(res.data.notice);
      })
      .catch((err) => console.error(err));
  }, [nid]);

  return (
    <div>
      <Header />
      <div className="subPage">
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
              <button onClick={() => navigate('/NoticeList')}>목록으로</button>
            </div>
          </div>
        ) : (
          <div className="qnaview-loading">Loading...</div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default QnaDetail;
