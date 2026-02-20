import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/product.css';
import Header from '../Header';
import Footer from '../Footer';

function ExperienceList() {
    const [itemList, setItemList] = useState([]);
    const [experienceList, setExperienceList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [sortOption, setSortOption] = useState('default');
    const [searchTerm, setSearchTerm] = useState('');
    const [paging, setPaging] = useState({});
    const [pages, setPages] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1); 

    const navigate = useNavigate();

    
    useEffect(() => {
        axios.get('/api/product/getExperienceList', {
            params: {
                page: currentPage,
                sort: sortOption,
                keyword: searchTerm
            }
        })
        .then((result) => {
            const list = result.data.ExperienceList || [];
            setItemList(list);
            setExperienceList(list);
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
            .then((result) => {
                const list = result.data.CityList || [];
                setCityList(list);
            })
            .catch((err) => console.error(err));
    }, [currentPage, sortOption, searchTerm]); 

    
    const findCityByCid = (experienceCid) => {
        if (!experienceCid || cityList.length === 0) return null;

        const expStr = String(experienceCid).trim();

        const exact = cityList.find(c => String(c.cid).trim() === expStr);
        if (exact) return exact;

        const prefixMatch = cityList.find(c => String(c.cid).trim().startsWith(expStr));
        if (prefixMatch) return prefixMatch;

        const reverseMatch = cityList.find(c => expStr.startsWith(String(c.cid).trim()));
        if (reverseMatch) return reverseMatch;

        const paddedExp = expStr.padEnd(10, '0');
        const paddedMatch = cityList.find(c => String(c.cid).trim() === paddedExp);
        if (paddedMatch) return paddedMatch;

        const exp5 = expStr.slice(0, 5);
        const exp6 = expStr.slice(0, 6);
        const rangeMatch = cityList.find(c => {
            const cityCid = String(c.cid).trim();
            return cityCid.startsWith(exp5) || cityCid.startsWith(exp6);
        });
        if (rangeMatch) return rangeMatch;

        return null;
    };

    
    function onPageMove(p) {
        setCurrentPage(p);
    }

    //조회수증가
    async function viewCount(eid) {
        try {
            await axios.post(`/api/product/increaseExView/${eid}`);
            navigate(`/ExperienceDetail/${eid}`);
        } catch (err) {
            console.error(err);
        }

    }

    return (
        <article>
            <div>
                <Header />
            </div>
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
                                setSortOption('high');
                                setCurrentPage(1);
                            }}
                        >
                            높은가격순
                        </button>

                        <button
                            className={sortOption === 'low' ? 'active' : ''}
                            onClick={() => {
                                setSortOption('low');
                                setCurrentPage(1);
                            }}
                        >
                            낮은가격순
                        </button>

                        <button
                            className={sortOption === 'view' ? 'active' : ''}
                            onClick={() => {
                                setSortOption('view');
                                setCurrentPage(1);
                            }}
                        >
                            조회수순
                        </button>

                        <button
                            className={sortOption === 'sale' ? 'active' : ''}
                            onClick={() => {
                                setSortOption('sale');
                                setCurrentPage(1);
                            }}
                        >
                            구매수순
                        </button>
                    </div>
                </div>
               
                <div className="kindList">
                    <div className="itemList">
                        {experienceList.length > 0 ? (
                            experienceList.map((experience, idx) => {
                                const city = findCityByCid(experience.cid);
                                return (
                                    <div
                                        className="item"
                                        key={experience.eid || idx}
                                        onClick={() => viewCount(experience.eid)}
                                    >
                                        <div className="image">
                                            <img src={experience.image || '/images/noimage.jpg'}  />
                                        </div>

                                        <div className="itemInfo">
                                            <div className="name-list" style={{ fontSize: '15pt', fontWeight: 'bold', paddingBottom: '5px' }}>
                                                {experience.name}
                                            </div>
                                            <div className="content-list" style={{ fontSize: '13pt' }}>
                                                {experience.content}
                                            </div>
                                            

                                            <div className="priceBox">
                                                <span className="salePrice">{experience.price2.toLocaleString()}원</span>
                                                <span className="originalPrice">{experience.price1.toLocaleString()}원</span>
                                            </div>

                                            {city && (
                                                <div className="city">
                                                    <i class="fas fa-map-marker-alt"></i>
                                                    {city.ad1} {city.ad2} {city.ad3}</div>
                                            )}
                                            <div className="hashtag">{experience.hashtag}</div>

                                            <div className="stats statusEx" style={{fontSize:'13pt'}}>
                                                조회수: {experience.viewcount?.toLocaleString() || 0} &nbsp;&nbsp;
                                                구매수: {experience.salecount?.toLocaleString() || 0}
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
                            style={{
                                cursor: "pointer",
                                fontWeight: page === currentPage ? 'bold' : 'normal',
                            }}
                            key={idx}
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

            <div>
                <Footer />
            </div>
        </article>
    );
}

export default ExperienceList;
