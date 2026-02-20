import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/product.css';
import Header from '../Header';
import Footer from '../Footer';

function TransList() {
    const [transList, setTransList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("default");
    const [paging, setPaging] = useState({});
    const [pages, setPages] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();

    // 숫자를 시간 형식으로 변환 (예: 930 -> "09:30")
    const formatTime = (timeValue) => {
        if (!timeValue && timeValue !== 0) return '-';
        const hour = Math.floor(timeValue / 100);
        const minute = timeValue % 100;
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };

    useEffect(() => {
        axios.get('/api/product/getTransList', {
            params: {
                page: currentPage,
                sort: sortOption,
                keyword: searchTerm
            }
        })
        .then((result) => {
            const list = result.data.TransList || [];
            setTransList(list);

            const pg = result.data.paging;
            setPaging(pg);

            setTotalCount(result.data.paging.totalCount);
            
            let p = [];
            for (let i = pg.beginPage; i <= pg.endPage; i++) {
                p.push(i);
            }
            setPages(p);
        })
        .catch((err) => console.error(err));
    }, [currentPage, sortOption, searchTerm]);

    
    function onPageMove(p) {
        setCurrentPage(p);
    }

    return (
        <article>
            <Header />

            <div className="subPage">

                
                <div className="topRightControls">
                    <div className="searchBox">
                        <i className="fas fa-search" style={{ fontSize: '20px', marginRight: '8px', color: '#666' }}></i>
                        <input
                            type="text"
                            placeholder="검색어를 입력하세요"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    
                    <div className="filterGroup">
                        <span className="experienceCount">총 {totalCount.toLocaleString()}개</span>
                        <button
                            className={sortOption === 'high' ? 'active' : ''}
                            onClick={() => {
                                setSortOption("high");
                                setCurrentPage(1);
                            }}
                        >
                            높은가격순
                        </button>

                        <button
                            className={sortOption === 'low' ? 'active' : ''}
                            onClick={() => {
                                setSortOption("low");
                                setCurrentPage(1);
                            }}
                        >
                            낮은가격순
                        </button>

                        <button
                            className={sortOption === 'sale' ? 'active' : ''}
                            onClick={() => {
                                setSortOption("sale");
                                setCurrentPage(1);
                            }}
                        >
                            구매수순
                        </button>
                    </div>
                </div>
                
                <div className="kindList">
                    <div className="itemList">
                        {transList.length > 0 ? (
                            transList.map((item, idx) => (
                                <div
                                    className="item"
                                    key={item.tid || idx}
                                    onClick={() => navigate(`/transDetail/${item.tid}`)}
                                >
                                    <div className="image">
                                        <img src={item.image || '/images/noimage.jpg'} alt={item.name} />
                                    </div>

                                    <div className="itemInfo">
                                        <div className="name-list" style={{ fontSize: '15pt', fontWeight: 'bold' }}>
                                            {item.name}
                                        </div>

                                        <div className="content-list" style={{ fontSize: '13pt' }}>
                                            {item.start} <i className="fas fa-long-arrow-alt-right"></i> {item.end}
                                            <br />
                                            <span style={{ fontSize: '11pt', color: '#666' }}>
                                                {formatTime(item.starttime)} - {formatTime(item.endtime)}
                                            </span>
                                        </div>

                                        <div className="priceBox">
                                            <span className="salePrice">{item.price2?.toLocaleString()}원</span>
                                            <span className="originalPrice">{item.price1?.toLocaleString()}원</span>
                                        </div>

                                        <div className="hashtag">{item.category}</div>

                                        <div className="stats" style={{ fontSize: "13pt" }}>
                                            구매수 : {item.salecount?.toLocaleString() || 0}
                                        </div>

                                        
                                    </div>
                                </div>
                            ))
                        ) : (
                            <>검색 결과가 없습니다.</>
                        )}
                    </div>
                </div>

                
                <div id="paging" style={{ textAlign: "center", padding: "10px" }}>
                    {paging.prev && (
                        <span style={{ cursor: "pointer" }} onClick={() => onPageMove(paging.beginPage - 1)}>
                            ◀
                        </span>
                    )}

                    {pages.map((page, idx) => (
                        <span
                            style={{
                                cursor: "pointer",
                                fontWeight: page === currentPage ? "bold" : "normal",
                            }}
                            key={idx}
                            onClick={() => onPageMove(page)}
                        >
                            &nbsp;{page}&nbsp;
                        </span>
                    ))}

                    {paging.next && (
                        <span style={{ cursor: "pointer" }} onClick={() => onPageMove(paging.endPage + 1)}>
                            ▶
                        </span>
                    )}
                </div>
            </div>

            <Footer />
        </article>
    );
}

export default TransList;