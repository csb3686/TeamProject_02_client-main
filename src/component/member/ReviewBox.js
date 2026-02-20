import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import jaxios from '../../util/JWTutil';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import '../../css/ReviewBox.css';

function ReviewBox() {
  const loginUser = useSelector(state => state.user);
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  
  const fetchReviews = async (pageNum) => {
    try {
      const res = await jaxios.get('/api/member/getMyReviews', {
        params: { 
          userid: loginUser.userid, 
          page: pageNum 
        }
      });

     

      setReviews(res.data.list || []);
      setPage(res.data.page || 1);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.totalCount || 0);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!loginUser.userid) {
      navigate('/login');
      return;
    }
    fetchReviews(page);
  }, [loginUser, navigate, page]);

  
  const handlePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="mypage">
      <Header />
      <div className="myWrap">
        <div className="mypage-content">
          
          
          <div className="mypage-submenu">
            <div className="mypage-title">MY PAGE</div>
            <ul>
              <li onClick={() => navigate('/mypage')}>주문내역</li>
              <li onClick={() => navigate('/editmember')}>회원정보 수정</li>
              <li className="active" onClick={() => navigate('/reviewbox')}>리뷰 보관함</li>
            </ul>
          </div>

          
          <div className="mypage-content-wrap">
            <div className="mypage-detail">

           
              <div className="mypage-userinfo">
                <div>{loginUser.name} 님</div>
                <div>총 {totalCount}건 리뷰 작성 완료</div>
              </div>

              <div className="mypage-order">

                
                <div className="mypage-section-title">
                  <div className="titlecol col-category">카테고리</div>
                  <div className="titlecol col-content">내용</div>
                  <div className="titlecol col-date">작성일</div>
                  <div className="titlecol col-point">평점</div>
                  <div className="titlecol col-image">사진</div>
                </div>

               
                {reviews.length > 0 ? (
                  reviews.map((review, idx) => (
                    <div className="mypage-row" key={idx}>
                      
                      <div className="mypage-col col-category">
                        {review.productName || ''} {review.category}
                      </div>

                      <div className="mypage-col col-content">
                        {review.content}
                      </div>

                      <div className="mypage-col col-date">
                        {review.indate
                          ? new Date(review.indate).toLocaleDateString()
                          : '날짜 없음'}
                      </div>

                      <div className="mypage-col col-point">
                        {'⭐'.repeat(review.point || 0)}
                      </div>

                      <div className="mypage-col col-image">
                        {review.image && <img src={review.image} alt="" />}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="mypage-row empty">작성된 리뷰가 없습니다.</div>
                )}

                
                <div className="paging">
                  <button 
                    onClick={() => handlePage(page - 1)} 
                    disabled={page <= 1}
                  >
                    ◀
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={page === i + 1 ? 'active' : ''}
                      onClick={() => handlePage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button 
                    onClick={() => handlePage(page + 1)} 
                    disabled={page >= totalPages}
                  >
                    ▶
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ReviewBox;