import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/EReviewList.css';
import Header from '../Header';
import Footer from '../Footer';

function HReviewList() {
  const [hReviewList, setHReviewList] = useState([]);
  const [bestHReviewList, setBestHReviewList] = useState([]);

  const [sortOption, setSortOption] = useState('default');
  const [searchTerm, setSearchTerm] = useState('');

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [totalCount, setTotalCount] = useState(0);

  const observerRef = useRef(null);
  const navigate = useNavigate();

  const loadMore = () => {
    if (loading || page >= totalPages) return;

    setLoading(true);

    axios
      .get('/api/product/getHReviewList', {
        params: { category: "숙소", page: page },
      })
      .then((res) => {
        const newList = res.data.list || [];
        setHReviewList((prev) => [...prev, ...newList]);

        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.totalElements);
        setPage((prev) => prev + 1);
      })
      .catch((err) => {
        console.error('getHReviewList error:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {

    axios
      .get('/api/product/getBestHReviewList', { params: { category: '숙소' } })
      .then((res) => {
        setBestHReviewList(res.data.bestHReviewList || []);
      })
      .catch((err) => {
        console.error('getBestHReviewList error:', err);
      });

    // 초기 목록 로드
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 처음 마운트 시 한 번 실행


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMore();
        }
      },
      { threshold: 1 }
    );

    const el = observerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
      observer.disconnect();
    };
  }, [loading]); 

  const filteredhReview = (hReviewList || [])
    .filter((hReview) => {
      const term = searchTerm.toLowerCase();
      return (
        (hReview.title && hReview.title.toLowerCase().includes(term)) ||
        (hReview.content && hReview.content.toLowerCase().includes(term)) ||
        (hReview.productname && hReview.productname.toLowerCase().includes(term))
      );
    })
    .slice()
    .sort((a, b) => {
      switch (sortOption) {
        case 'high':
          return (b.point || 0) - (a.point || 0);
        case 'low':
          return (a.point || 0) - (b.point || 0);
        case 'newest':
          return new Date(b.indate).getTime() - new Date(a.indate).getTime();
        case 'oldest':
          return new Date(a.indate).getTime() - new Date(b.indate).getTime();
        default:
          return 0;
      }
    });

    console.log(filteredhReview)

  return (
    <article>
      <Header />
      <div className="subPage">
        <div className="submenu" onClick={() => navigate('/EReviewList')}>
          투어/체험
        </div>
        <div className="submenu active" onClick={() => navigate('/HReviewList')}>
          숙소
        </div>
        <div className="submenu" onClick={() => navigate('/TReviewList')}>
          교통
        </div>

        
        <div className="bestReviewSection">
          <h3 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            🔥숙소 Best Reviews
          </h3>
          <div className="bestReviewList">
            {bestHReviewList.length > 0 ? (
              bestHReviewList.map((bestHReview, idx) => (
                <div className="bestReviewCard" key={bestHReview.rid || idx} onClick={() => navigate(`/HotelDetail/${bestHReview.hid}`)}>
                  {
                    (bestHReview.image)?
                    (<img src={bestHReview.image}/>):
                    (<div style={{width:'200px', height:'170px', display:'flex', alignItems:'center', justifyContent:'center',color:'gray',marginBottom:'25px'}}>No Image</div>)
                  }
                  <div className="bestReviewInfo">
                    <div className="bestTitle">{bestHReview.title}</div>
                    <div className="bestUser">{bestHReview.userid || '작성자 없음'}</div>
                    <div className="bestPoint">{'⭐'.repeat(bestHReview.point || 0)}</div>
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

            <button
              type="button"
              className={sortOption === 'high' ? 'active' : ''}
              onClick={() => setSortOption((prev) => (prev === 'high' ? 'default' : 'high'))}
            >
              평점높은순
            </button>

            <button
              type="button"
              className={sortOption === 'low' ? 'active' : ''}
              onClick={() => setSortOption((prev) => (prev === 'low' ? 'default' : 'low'))}
            >
              평점낮은순
            </button>

            <button
              type="button"
              className={sortOption === 'newest' ? 'active' : ''}
              onClick={() => setSortOption((prev) => (prev === 'newest' ? 'default' : 'newest'))}
            >
              최신순
            </button>

            <button
              type="button"
              className={sortOption === 'oldest' ? 'active' : ''}
              onClick={() => setSortOption((prev) => (prev === 'oldest' ? 'default' : 'oldest'))}
            >
              오래된순
            </button>
          </div>
        </div>

        {/* <div className="notice">
          <h2>즐거운 하루 되세요</h2>
        </div> */}

        
        <div className="titlerow">
          <div className="titlecol col-image" style={{flex:'1.5'}}>사진</div>
          <div className="titlecol col-writer" style={{flex:'1',textAlign:'center'}}>작성자</div>
          <div className="titlecol col-content" style={{flex:'2.8', textAlign:'center'}}>내용</div>
          <div className="titlecol col-date" style={{flex:'1', textAlign:'center'}}>작성일</div>
          <div className="titlecol col-point">평점</div>
        </div>

        
        <div className="itemList">
          {filteredhReview.length > 0 ? (
            filteredhReview.map((hReview, idx) => (
              <div
                className="itemRow"
                key={hReview.rid || idx}
                onClick={() => navigate(`/HotelDetail/${hReview.hid}`)}
              >
                <div className="col-image">
                  {hReview.image ? (
                    <img src={hReview.image} className="review-img" alt="review" />
                  ) : (
                    <div className="noImage">No Image</div>
                  )}
                </div>
                <div className="col-writer">{hReview.userid || '작성자 없음'}</div>
                <div className="col-content">
                  <div>
                    <div style={{color:'#666'}}>[{hReview.productname || ''}]</div><br />
                    {hReview.content || '(내용 없음)'}
                  </div>
                </div>
                <div className="col-date">
                  {hReview.indate ? new Date(hReview.indate).toLocaleDateString() : ''}
                </div>
                <div className="col-point">{'⭐'.repeat(hReview.point || 0)}</div>
              </div>
            ))
          ) : (
            <div className="noResult">검색 결과가 없습니다.</div>
          )}
        </div>

        
        <div ref={observerRef} style={{ height: '40px' }}></div>

        {loading && <div className="loading">로딩 중...</div>}
      </div>

      <Footer />
    </article>
  );
}

export default HReviewList;