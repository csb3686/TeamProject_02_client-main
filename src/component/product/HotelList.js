import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/product.css';
import Header from '../Header';
import Footer from '../Footer';

function HotelList() {
    const [hotelList, setHotelList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [sortOption, setSortOption] = useState('default');
    const [searchTerm, setSearchTerm] = useState('');
    const [paging, setPaging] = useState({});
    const [pages, setPages] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/product/getHotelList', {
            params: {
                page: currentPage,
                sort: sortOption,
                keyword: searchTerm
            }
        })
        .then((result) => {
            const list = result.data.HotelList || [];
            setHotelList(list);
            setPaging(result.data.paging);
            setTotalCount(result.data.paging.totalCount);

            let p = [];
            for (let i = result.data.paging.beginPage; i <= result.data.paging.endPage; i++) {
                p.push(i);
            }
            setPages([...p]);
        })
        .catch((err) => console.error(err));

        axios.get('/api/product/getCityList')
            .then((result) => setCityList(result.data.CityList || []))
            .catch((err) => console.error(err));
    }, [currentPage, sortOption, searchTerm]);

    const findCityByCid = (hotelCid) => {
    if (!hotelCid || cityList.length === 0) return null;

    const cidStr = String(hotelCid).trim();

    // 1) 완전 일치
    const exact = cityList.find(c => String(c.cid).trim() === cidStr);
    if (exact) return exact;

    // 2) 앞자리 일치
    const prefix = cityList.find(c => String(c.cid).startsWith(cidStr));
    if (prefix) return prefix;

    // 3) 반대(호텔 cid가 더 긴 경우)
    const reverse = cityList.find(c => cidStr.startsWith(String(c.cid)));
    if (reverse) return reverse;

    // 4) 0 패딩 처리
    const padded = cidStr.padEnd(10, '0');
    const paddedMatch = cityList.find(c => String(c.cid).trim() === padded);
    if (paddedMatch) return paddedMatch;

    // 5) 5~6자리 범위 검색
    const cid5 = cidStr.slice(0, 5);
    const cid6 = cidStr.slice(0, 6);

    const rangeMatch = cityList.find(c => {
        const cc = String(c.cid).trim();
        return cc.startsWith(cid5) || cc.startsWith(cid6);
    });
    if (rangeMatch) return rangeMatch;

    return null;
};

    const onPageMove = (p) => {
        setCurrentPage(p);
    };

    //조회수증가
    async function viewCount(hid) {
        try {
            await axios.post(`/api/product/increaseHotelView/${hid}`);
            navigate(`/HotelDetail/${hid}`);
        } catch (err) {
            console.error(err);
        }

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
                        <button className={sortOption === 'high' ? 'active' : ''} onClick={() => setSortOption('high')}>높은가격순</button>
                        <button className={sortOption === 'low' ? 'active' : ''} onClick={() => setSortOption('low')}>낮은가격순</button>
                        <button className={sortOption === 'view' ? 'active' : ''} onClick={() => setSortOption('view')}>조회수순</button>
                        <button className={sortOption === 'sale' ? 'active' : ''} onClick={() => setSortOption('sale')}>구매수순</button>
                    </div>
                </div>

                <div className="kindList">
                    <div className="itemList">
                        {hotelList.length > 0 ? (
                            hotelList.map((hotel, idx) => {
                                const city = findCityByCid(hotel.cid);
                                return (
                                    <div
                                        className="item"
                                        key={hotel.hid || idx}
                                        onClick={() => viewCount(hotel.hid)}
                                    >
                                        <div className="image">
                                            <img src={hotel.image || '/images/noimage.jpg'}  />
                                        </div>

                                        <div className="itemInfo">
                                            <div className="name-list" style={{ fontSize: '15pt', fontWeight: 'bold', paddingBottom: '5px' }}>
                                                {hotel.name}
                                            </div>
                                            <div className="content-list" style={{ fontSize: '13pt' }}>
                                                {hotel.content}
                                            </div>
                                            

                                            <div className="priceBox">
                                                <span className="salePrice">{hotel.price1?.toLocaleString()}원</span>
                                                <span className="originalPrice">{hotel.price2?.toLocaleString()}원</span>
                                            </div>

                                            {city && (

                                                <div className="city">
                                                    <i className="fas fa-map-marker-alt" style={{marginRight:"6px"}}></i>
                                                    {city.ad1} {city.ad2} {city.ad3}</div>
                                            )}

                                            <div className="hashtag">
                                                <i className="fas fa-exclamation-circle" style={{marginRight:"6px"}}></i>
                                                {hotel.notice}
                                            </div>

                                            <div className="stats" style={{fontSize:'13pt'}} >
                                                조회수: {hotel.viewcount?.toLocaleString() || 0} &nbsp;&nbsp;
                                                구매수: {hotel.salecount?.toLocaleString() || 0}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <>검색 결과가 없습니다.</>
                        )}
                    </div>
                </div>

                
                <div id="paging" style={{ textAlign: "center", padding: "10px" }}>
                    {paging.prev && (
                        <span style={{ cursor: "pointer" }} onClick={() => onPageMove(paging.beginPage - 1)}> ◀ </span>
                    )}

                    {pages.map((page, idx) => (
                        <span
                            key={idx}
                            style={{
                                cursor: "pointer",
                                fontWeight: page === currentPage ? 'bold' : 'normal'
                            }}
                            onClick={() => onPageMove(page)}
                        >
                            &nbsp;{page}&nbsp;
                        </span>
                    ))}

                    {paging.next && (
                        <span style={{ cursor: "pointer" }} onClick={() => onPageMove(paging.endPage + 1)}> ▶ </span>
                    )}
                </div>

            </div>

            <Footer />
        </article>
    );
}

export default HotelList;
