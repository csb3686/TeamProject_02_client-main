import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import '../../css/qnaList.css';

import Header from '../Header';
import Footer from '../Footer';

function QnaList() {

    const loginUser = useSelector(state => state.user);
    const [qnaList, setQnaList] = useState([]);       
    const [allQnaList, setAllQnaList] = useState([]); 
    const [paging, setPaging] = useState({});
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('default');

    const navigate = useNavigate();

    
    useEffect(() => {
        if (!loginUser.userid) {
            navigate('/login');
            return;
        }

        
        const loadPageData = async (page) => {
            try {
                const res = await axios.get(`/api/customer/getQnaList/${page}`);
                setQnaList(res.data.qnaList);
                setPaging(res.data.paging);

                let p = [];
                for (let i = res.data.paging.beginPage; i <= res.data.paging.endPage; i++) {
                    p.push(i);
                }
                setPages([...p]);
            } catch (err) {
                console.error(err);
            }
        };

        
        const loadAllQna = async () => {
            try {
                let allList = [];
                let page = 1;
                while (true) {
                    const res = await axios.get(`/api/customer/getQnaList/${page}`);
                    allList = [...allList, ...res.data.qnaList];

                    if (!res.data.paging.next) break;
                    page++;
                }
                setAllQnaList(allList);
            } catch (err) {
                console.error(err);
            }
        };

        loadPageData(1);
        loadAllQna();
    }, [loginUser.userid, navigate]);

    
    function onPageMove(p) {
        axios.get(`/api/customer/getQnaList/${p}`)
            .then((result) => {
                setQnaList([...result.data.qnaList]);
                setPaging(result.data.paging);

                let pArr = [];
                for (let i = result.data.paging.beginPage; i <= result.data.paging.endPage; i++) {
                    pArr.push(i);
                }
                setPages([...pArr]);
                setCurrentPage(p);
            })
            .catch((err) => console.error(err));
    }

    
    const filteredQna = searchTerm.trim() === ''
        ? qnaList
        : allQnaList.filter(qna =>
            qna.title?.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => {
            switch (sortOption) {
                case 'high':
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });

    return (
        <div>
            <Header />
            <div className='total'>
                <div className='submenu active' onClick={() => { navigate('/QnaList') }}>qna</div>
                <div className='submenu' onClick={() => { navigate('/NoticeList') }}>notice</div>
                <div className='qnaList'>
                    <div style={{ height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0', fontSize: '20px' }}>
                        <h2>RODY투어 고객센터입니다. 무엇을 도와드릴까요?</h2>
                    </div>
                    <div style={{ height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <h2>자주 찾는 QNA</h2>
                    </div>

                    
                    <div className="searchBox qnaSearch">
                        <i className="fas fa-search" style={{ fontSize: '20px', marginRight: '8px', color: '#000' }}></i>
                        <input
                            className='inputQna'
                            type="text"
                            placeholder="검색어를 입력하세요"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    
                    <div style={{ textAlign: 'right', padding: '0 20px', marginBottom: '10px', color: '#555', fontSize: '20px' }}>
                        <span className="qnaCount">총 {paging.totalCount}개</span>
                    </div>

                   
                    <div className='titlerow'>
                        <div className='titlecol'>번호</div>
                        <div className='titlecol'>제목</div>
                        <div className='titlecol'>작성일</div>
                    </div>

                    
                    {
                        filteredQna.length > 0 ? filteredQna.map((qna, idx) => (
                            <div className='row-qna' key={idx}>
                                <div className='col-qna'>{qna.qid}</div>
                                <div className='col-qna' onClick={() => navigate(`/QnaDetail/${qna.qid}`)}>
                                    {qna.title}
                                </div>
                                <div className='col-qna'>
                                    {qna.indate ? qna.indate.substring(0, 10) : null}
                                </div>
                            </div>
                        )) : <div style={{ textAlign: 'center', padding: '20px' }}>검색 결과가 없습니다.</div>
                    }

                    
                    {searchTerm.trim() === '' && (
                        <div id='paging' style={{ textAlign: "center", padding: "10px" }}>
                            {paging.prev && <span style={{ cursor: "pointer" }} onClick={() => onPageMove(paging.beginPage - 1)}> ◀ </span>}
                            {pages.map((page, idx) => (
                                <span
                                    style={{ cursor: "pointer", fontWeight: page === currentPage ? 'bold' : 'normal' }}
                                    key={idx}
                                    onClick={() => onPageMove(page)}
                                >
                                    &nbsp;{page}&nbsp;
                                </span>
                            ))}
                            {paging.next && <span style={{ cursor: "pointer" }} onClick={() => onPageMove(paging.endPage + 1)}> ▶ </span>}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default QnaList;
