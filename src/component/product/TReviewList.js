import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/EReviewList.css';
import Header from '../Header';
import Footer from '../Footer';

function TReviewList() {
  const [tReviewList, setTReviewList] = useState([]);
  const [bestTReviewList, setBestTReviewList] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [sortOption, setSortOption] = useState('default');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();

 
  useEffect(() => {
    axios.get('/api/product/getBestTReviewList?category=교통')
      .then(res => setBestTReviewList(res.data.bestTReviewList || []))
      .catch(err => console.error(err));
  }, []);

 
  useEffect(() => {
    loadPageData(page);
  }, [page]);

  
  useEffect(() => {
    const handleScroll = () => {
      if (loading) return;

      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      const scrollHeight = document.documentElement.scrollHeight;

      if (scrollTop + clientHeight + 150 >= scrollHeight) {
        if (page < totalPages) {
          setPage(prev => prev + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, totalPages, page]);

 
  const loadPageData = (pageNum) => {
    setLoading(true);

    axios.get('/api/product/getTReviewList', {
      params: { category: '교통', page: pageNum }
    })
      .then(res => {
        const list = res.data.tReviewList || [];
        setTReviewList(prev => [...prev, ...list]); 

        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || 0);
      })
      .finally(() => setLoading(false));
  };

 
  const filteredTReview = (tReviewList || [])
    .filter(tReview => {
      const term = searchTerm.toLowerCase();
      return (
        (tReview.title && tReview.title.toLowerCase().includes(term)) ||
        (tReview.content && tReview.content.toLowerCase().includes(term)) ||
        (tReview.productname && tReview.productname.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'high': return b.point - a.point;
        case 'low': return a.point - b.point;
        case 'newest': return new Date(b.indate) - new Date(a.indate);
        case 'oldest': return new Date(a.indate) - new Date(b.indate);
        default: return 0;
      }
    });

  return (
    <article>
      <Header />

      <div className="subPage">

        
        <div className='submenu' onClick={() => navigate('/EReviewList')}>투어/체험</div>
        <div className='submenu' onClick={() => navigate('/HReviewList')}>숙소</div>
        <div className='submenu active' onClick={() => navigate('/TReviewList')}>교통</div>

        
        <div className="bestReviewSection">
          <h3 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🔥교통 Best Reviews</h3>
          <div className="bestReviewList">
            {bestTReviewList.length > 0 ? (
              bestTReviewList.map((bestTReview, idx) => (
                <div
                  className='bestReviewCard'
                  key={bestTReview.rid || idx}
                  onClick={() => navigate(`/TransDetail/${bestTReview.tid}`)}
                >
                  {
                    (bestTReview.image)?
                    (<img src={bestTReview.image}/>):
                    (<div style={{width:'200px', height:'170px', display:'flex', alignItems:'center', justifyContent:'center',color:'gray', marginBottom:'25px'}}>No Image</div>)
                  }
                  <div className="bestReviewInfo">
                    <div className='bestTitle'>{bestTReview.title}</div>
                    <div className='bestUser'>{bestTReview.userid || '작성자 없음'}</div>
                    <div className='bestPoint'>{'⭐'.repeat(bestTReview.point || 0)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="noBestReview">베스트 리뷰가 없습니다.</div>
            )}
          </div>
        </div>

        
        <div className="topRightControls">
          <div className="searchBox">
            <i className="fas fa-search" style={{ fontSize: '20px', marginRight: '8px', color: '#666' }}></i>
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filterGroup">
            <span className="hotelCount">총 {totalCount}개</span>
            <button className={sortOption === 'high' ? 'active' : ''} onClick={() => setSortOption('high')}>평점높은순</button>
            <button className={sortOption === 'low' ? 'active' : ''} onClick={() => setSortOption('low')}>평점낮은순</button>
            <button className={sortOption === 'newest' ? 'active' : ''} onClick={() => setSortOption('newest')}>최신순</button>
            <button className={sortOption === 'oldest' ? 'active' : ''} onClick={() => setSortOption('oldest')}>오래된순</button>
          </div>
        </div>

        
        <div className="titlerow">
          <div className="titlecol col-image" style={{flex:'1.5'}}>사진</div>
          <div className="titlecol col-writer" style={{flex:'1',textAlign:'center'}}>작성자</div>
          <div className="titlecol col-content" style={{flex:'2.8', textAlign:'center'}}>내용</div>
          <div className="titlecol col-date" style={{flex:'1', textAlign:'center'}}>작성일</div>
          <div className="titlecol col-point">평점</div>
        </div>

        
        <div className="itemList">
          {filteredTReview.length > 0 ? (
            filteredTReview.map((tReview, idx) => (
              <div
                className="itemRow"
                key={tReview.rid || idx}
                onClick={() => navigate(`/TransDetail/${tReview.tid}`)}
              >
                <div className="col-image">
                  {tReview.image ? (
                    <img src={tReview.image} className="review-img" alt="review" />
                  ) : (
                    <div className="noImage">No Image</div>
                  )}
                </div>
                <div className="col-writer">{tReview.userid || '작성자 없음'}</div>
                <div className="col-content">
                  <div>
                    <div style={{color:'#666'}}>[{tReview.productname || ''}]</div><br />
                    {tReview.content || '(내용 없음)'}
                  </div>
                </div>
                <div className="col-date">{tReview.indate ? new Date(tReview.indate).toLocaleDateString() : ''}</div>
                <div className="col-point">{'⭐'.repeat(tReview.point || 0)}</div>
              </div>
            ))
          ) : (
            <div className="noResult">검색 결과가 없습니다.</div>
          )}
        </div>

        
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '18px' }}>
            ⏳ 불러오는 중...
          </div>
        )}
      </div>

      <Footer />
    </article>
  );
}

export default TReviewList;
