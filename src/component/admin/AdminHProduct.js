import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../../css/qnaList.css';

import AdminHeader from './AdminHeader';
import jaxios from '../../util/JWTutil';

function AdminHProduct() {
    const loginUser = useSelector(state => state.user);
    const navigate = useNavigate();

    const [hProduct, setHProduct] = useState([]);
    const [paging, setPaging] = useState({});
    const [pages, setPages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cityList, setCityList] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');

    // 도시 목록 가져오기
    useEffect(() => {
        jaxios.get('/api/admin/getCities')
            .then(res => setCityList(res.data))
            .catch(err => console.error(err));
    }, []);

    // 로그인 체크
    useEffect(() => {
        if (!loginUser?.userid) {
            navigate('/login');
            return;
        }
        onPageMove(1);
    }, [loginUser]);

    // 검색어나 도시 변경 시 페이지 1로 이동
    useEffect(() => {
        onPageMove(1);
    }, [searchTerm, selectedCity]);

    // 페이지 이동 함수
    function onPageMove(p) {
        const qs = `search=${encodeURIComponent(searchTerm || '')}&city=${encodeURIComponent(selectedCity || '')}`;
        jaxios.get(`/api/admin/getHProduct/${p}?${qs}`)
            .then(result => {
                setHProduct(result.data.hProduct || []);
                setPaging(result.data.paging || {});
                let pArr = [];
                const begin = result.data.paging?.beginPage ?? 1;
                const end = result.data.paging?.endPage ?? 1;
                for (let i = begin; i <= end; i++) pArr.push(i);
                setPages([...pArr]);
            })
            .catch(err => console.error(err));
    }
        
    let checkList = []; 

    function onChecked(hid, checked) {
        if(checked) { 
            checkList.push(hid);
        }else { 
            checkList = checkList.filter((value, idx, arr)=>{return value !== hid})
        }      
        console.log(checkList);
    }
    
    async function deleteHProduct() {
        if(checkList.length === 0) {return alert('삭제할 항목을 선택하세요.');}
        if(window.confirm('해당 호텔을 삭제하시겠습니까?')) {
            try {
                await jaxios.post('/api/admin/deleteHProduct', checkList);

                alert('삭제되었습니다.');
                const result = await jaxios.get('/api/admin/getHProduct/1');
                setHProduct([...result.data.hProduct])
                setPaging(result.data.paging)

                let p = []
                for(let i=result.data.paging.beginPage; i<=result.data.paging.endPage; i++){
                    p.push(i)
                }
                setPages([...p])
                onPageMove(1);

                checkList = [];
                if(result.data.hProduct) {
                    for(let i=0; i<result.data.hProduct.length; i++) {
                        document.getElementById('ch'+i).checked = false;
                    }
                }
            }catch(err) {
                alert('삭제에 실패했습니다.');
                console.error(err);
            }
        }
    }

    return (
        <div>
            <AdminHeader />
            <div className='total' style={{paddingTop:'250px'}}>
                {/* 서브메뉴 */}
                <div className='submenu' onClick={() => navigate('/admin/AdminEProduct')}>투어/체험</div>
                <div className='submenu' onClick={() => navigate('/admin/AdminHProduct')}>숙소</div>
                <div className='submenu' onClick={() => navigate('/admin/AdminTProduct')}>교통</div>

                <div className='qnaList'>
                    <div style={{ height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0', fontSize: '20px' }}>
                        <h2>관리자 호텔 페이지</h2>
                    </div>

                    
                    {/* <div style={{ width: '200px', margin: '0 auto 20px auto' }}>
                        <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                            <option value=''>전체 도시</option>
                            {cityList.map(city => (
                                <option key={city.cid} value={city.cid}>{city.ad1} {city.ad2}</option>
                            ))}
                        </select>
                    </div> */}

                   
                    <div className="searchBox" style={{ position: 'relative', width: '320px', margin: '0 auto 20px auto' }}>
                        <i className="fas fa-search" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}></i>
                        <input
                            type="text"
                            placeholder="검색어를 입력하세요"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px 8px 32px',
                                fontSize: '16px',
                                border: '3px solid black',
                                borderRadius: '4px'
                            }}
                        />
                    </div>

                    <button onClick={() => navigate('/admin/adminHProductInsert')}>상품 추가</button>    
                    <button onClick={()=>{deleteHProduct()}}>삭제</button>
                    
                    <div style={{textAlign:'right', padding:'0 20px', marginBottom:'10px', color:'#555', fontSize:'20px'}}>
                        <span className="qnaCount">총 {paging.totalCount ?? 0}개</span>
                    </div>

                   
                    <div className='titlerow'>
                        <div className='titlecol'>번호</div>
                        <div className='titlecol'>이름</div>
                        <div className='titlecol'>도시</div>
                        <div className='titlecol'>할인가</div>
                    </div>

                    {
                        hProduct.map((hp, idx) => {
                            return (
                                <div className='row-qna' key={hp.hid ?? idx}>
                                    <div style={{marginRight:'10px'}}>
                                        <input type='checkbox' id={'ch'+idx} value={hp.hid}
                                            onChange={(e)=>{onChecked(e.currentTarget.value, e.currentTarget.checked);}} />
                                    </div>
                                    <div className='col-qna'>{hp.hid}</div>
                                    <div className='col-qna' onClick={() => navigate(`/admin/adminHProductDetail/${hp.hid}`)}>
                                        {hp.name}
                                    </div>
                                    <div className='col-qna'>
                                        {hp.price1 ?? '-'}
                                    </div>
                                </div>
                            )
                        })
                    }

                    <div id='paging' style={{textAlign:"center", padding:"10px"}}>
                        {
                            (paging.prev)?(
                                <span style={{cursor:"pointer"}} onClick={()=>{onPageMove(paging.beginPage-1)}}> ◀ </span>
                            ):(<span></span>)
                        }
                        {
                            pages.map((page, idx)=>{
                                return(
                                    <span style={{cursor:"pointer"}} key={idx}
                                    onClick={()=>{onPageMove(page)}}>&nbsp;{page}&nbsp;</span>
                                )
                            })
                        }
                        {
                            (paging.next)?(
                                <span style={{cursor:"pointer"}} onClick={()=>{onPageMove(paging.endPage+1)}}> ▶ </span>
                            ):(<span></span>)
                        }

                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminHProduct;
