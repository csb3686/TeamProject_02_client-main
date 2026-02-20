import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import '../../css/qnaDetail.css'; 

function QnaDetail() {
  const { qid } = useParams();
  const [qna, setQna] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/customer/getQnaDetail/${qid}`)
      .then((res) => {
        setQna(res.data.qna);
      })
      .catch((err) => console.error(err));
  }, [qid]);

  return (
    <div>
      <Header />
      <div className="subPage">
        {qna ? (
          <div className="qnaview">
          <h2>Qna</h2>

            <div className="field-qnaDetail">
              <label>제목</label><div>{qna.title}</div>
            </div>

            <div className="field-qnaDetail">
              <label>내용</label><div>{qna.content}</div>
            </div>

            <div className="field-qnaDetail">
              <label>작성일</label><div>{qna.indate?.substring(0, 10)}</div>
            </div>

            {qna.answer && (
              <div className="field-qnaDetail answer-block">
                <label>답변</label>
                <div>{qna.answer}</div>
              </div>
            )}

            <div className="btns">
              <button onClick={() => navigate('/QnaList')}>목록으로</button>
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
