import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jaxios from '../../util/JWTutil';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../../css/AdminEProductDetail.css';
import AdminHeader from './AdminHeader';

function AdminEProductDetail() {
    const loginUser = useSelector(state => state.user);
    const { eid } = useParams();

    const [eProductDetail, setEProductDetail] = useState(null);

    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [city, setCity] = useState('');
    const [citySearch, setCitySearch] = useState(''); // 검색용 입력값
    const [citySuggestions, setCitySuggestions] = useState([]); // 자동완성 목록
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [price1, setPrice1] = useState('');
    const [price2, setPrice2] = useState('');
    const [viewcount, setViewcount] = useState('');
    const [salecount, setSalecount] = useState('');
    const [hashtag, setHashtag] = useState('');
    const [oldImg, setOldImg] = useState('');

    const [newImageFile, setNewImageFile] = useState(null);
    const [newPreview, setNewPreview] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!loginUser.userid) {
            navigate('/login');
            return;
        }

        axios.get(`/api/admin/AdminEProduct/${eid}`)
            .then((result) => {
                const d = result.data.admin;
                setEProductDetail(d);
                setName(d.name);
                setContent(d.content);
                setCity(d.cid);
                setCitySearch(d.cid); // 초기값으로 법정동코드 설정
                setPrice1(d.price1);
                setPrice2(d.price2);
                setViewcount(d.viewcount);
                setSalecount(d.salecount);
                setHashtag(d.hashtag);
                setOldImg(d.image);

                // 법정동코드로 도시명 가져오기
                fetchCityName(d.cid);
            })
            .catch(err => console.error(err));
    }, []);

    // 법정동코드로 도시명 조회
    const fetchCityName = async (cid) => {
        if (!cid) return;
        
        try {
            const response = await jaxios.get(`/api/admin/searchCity?keyword=${cid}`);
            const cities = response.data.cities || [];
            if (cities.length > 0) {
                const cityData = cities[0];
                setCitySearch(`${cityData.ad1} ${cityData.ad2} ${cityData.ad3 || ''}`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 도시 검색 함수
    const searchCity = async (value) => {
        if (value.length >= 2) {
            try {
                const response = await jaxios.get(`/api/admin/searchCity?keyword=${value}`);
                setCitySuggestions(response.data.cities || []);
                setShowSuggestions(true);
            } catch (err) {
                console.error(err);
            }
        } else {
            setCitySuggestions([]);
            setShowSuggestions(false);
        }
    };

    // 도시 입력 핸들러
    const handleCitySearch = (e) => {
        const value = e.target.value;
        setCitySearch(value);
        searchCity(value);
    };

    // 도시 선택 핸들러
    const selectCity = (cityData) => {
        setCity(cityData.cid);
        setCitySearch(`${cityData.ad1} ${cityData.ad2} ${cityData.ad3 || ''}`);
        setShowSuggestions(false);
    };

    function handleNewImage(e) {
        const file = e.target.files[0];
        setNewImageFile(file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setNewPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setNewPreview(null);
        }
    }

    function onsubmit() {
        if (!name) return alert('제목을 입력하세요');
        if (!content) return alert('내용을 입력하세요');
        if (!city) return alert('도시를 선택하세요');
        if (Number(price2) >= Number(price1)) {
            alert("할인가는 정가보다 낮아야 합니다.");
            return;
        }

        const formData = new FormData();
        formData.append("eid", eid);
        formData.append("name", name);
        formData.append("content", content);
        formData.append("city", city);
        formData.append("price1", price1);
        formData.append("price2", price2);
        formData.append("viewcount", viewcount);
        formData.append("salecount", salecount);
        formData.append("hashtag", hashtag);

        if (newImageFile) formData.append("image", newImageFile);

        axios.post('/api/admin/updateAdminEProduct', formData)
            .then((result) => {
                if (result.data.msg === 'ok') {
                    alert('게시물의 수정이 완료되었습니다');
                    navigate('/admin/adminEProduct');
                } else {
                    alert(result.data.msg);
                }
            })
            .catch(err => console.error(err));
    }

    return (
        <div>
            <AdminHeader />
            <div className="subPage" style={{paddingTop:'100px', paddingBottom:'10px'}}>
                {eProductDetail ? (
                    <div className="qnaview">
                        <h2>투어/체험 상품 정보</h2>

                        <div className='field'>
                            <label>투어명</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>

                        <div className='field'>
                            <label>내용</label>
                            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} />
                        </div>

                        <div className='field' style={{ position: 'relative' }}>
                            <label>도시 (지역명 또는 법정동코드 입력)</label>
                            <input 
                                type='text' 
                                value={citySearch} 
                                onChange={handleCitySearch}
                                placeholder="예: 서울, 강남, 11110"
                                onFocus={() => citySuggestions.length > 0 && setShowSuggestions(true)}
                            />
                            {showSuggestions && citySuggestions.length > 0 && (
                                <ul style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: 'white',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: '4px 0',
                                    zIndex: 1000,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                    {citySuggestions.map((cityData, index) => (
                                        <li 
                                            key={index}
                                            onClick={() => selectCity(cityData)}
                                            style={{
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #f0f0f0'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                        >
                                            {cityData.ad1} {cityData.ad2} {cityData.ad3 || ''} ({cityData.cid})
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {city && (
                                <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                                    선택된 법정동코드: {city}
                                </small>
                            )}
                        </div>

                        <div className='field'>
                            <label>정가</label>
                            <input type="text" value={price1} onChange={(e) => setPrice1(e.target.value)} />
                        </div>

                        <div className='field'>
                            <label>할인가</label>
                            <input type="text" value={price2} onChange={(e) => setPrice2(e.target.value)} />
                        </div>

                        <div className='field'>
                            <label>조회수</label>
                            <input type="text" value={viewcount} onChange={(e) => setViewcount(e.target.value)} />
                        </div>

                        <div className='field'>
                            <label>판매수</label>
                            <input type="text" value={salecount} onChange={(e) => setSalecount(e.target.value)} />
                        </div>

                        <div className='field'>
                            <label>해시태그</label>
                            <input type="text" value={hashtag} onChange={(e) => setHashtag(e.target.value)} />
                        </div>

                        <div className='field'>
                            <label>기존 이미지</label>
                            <img
                                src={oldImg || '/images/noimage.jpg'}
                                style={{ width: '250px', height: 'auto', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div className='field image-field'>
                            <label>수정 이미지</label>
                            <div className="imgBox">
                                <input
                                    type='file'
                                    accept='image/*'
                                    onChange={handleNewImage}
                                    className="fileInput"
                                />

                                {newPreview && (
                                    <img
                                        src={newPreview}
                                        className="preview"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="btns">
                            <button onClick={onsubmit}>수정완료</button>
                            <button onClick={() => navigate('/admin/AdminEProduct')}>뒤로가기</button>
                        </div>
                    </div>
                ) : (
                    <div className="qnaview-loading">Loading...</div>
                )}
            </div>
        </div>
    );
}

export default AdminEProductDetail;