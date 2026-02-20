import React, { useState, useEffect } from 'react';
import jaxios from '../../util/JWTutil';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../../css/AdminEProductDetail.css';

import AdminHeader from './AdminHeader';

function AdminEProductInsert() {

    const loginUser = useSelector(state => state.user);
    const { eid } = useParams();
    const isEdit = Boolean(eid);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [city, setCity] = useState('');
    const [citySearch, setCitySearch] = useState(''); // 검색용 입력값
    const [citySuggestions, setCitySuggestions] = useState([]); // 자동완성 목록
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [price1, setPrice1] = useState('');
    const [price2, setPrice2] = useState('');

    const [viewcount, setViewcount] = useState('0');
    const [salecount, setSalecount] = useState('0');

    const [hashtag, setHashtag] = useState('#');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);


    useEffect(() => {
        if (!isEdit) return;

        jaxios.get(`/api/admin/AdminEProduct/${eid}`)
            .then(res => {
                const data = res.data.admin;
                setName(data.name);
                setContent(data.content);
                setCity(data.cid);
                setCitySearch(data.cid.substring(0, 5)); // 앞 5자리만 표시
                setPrice1(data.price1 != null ? data.price1.toString() : '');
                setPrice2(data.price2 != null ? data.price2.toString() : '');
                setViewcount(data.viewcount != null ? data.viewcount.toString() : '0');
                setSalecount(data.salecount != null ? data.salecount.toString() : '0');
                setHashtag(data.hashtag ? (data.hashtag.startsWith('#') ? data.hashtag : '#' + data.hashtag) : '#');
                setPreview(data.image);
            })
            .catch(err => console.error(err));
    }, [eid]);


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


    const handleNumberInput = (setter) => (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        setter(raw === '' ? '0' : raw);
    };


    const handleHashtagChange = (e) => {
        const value = e.target.value;
        setHashtag(value.startsWith('#') ? value : '#' + value);
    };


    const handleImage = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Number(price2) >= Number(price1)) {
            alert("할인가는 정가보다 낮아야 합니다.");
            return;
        }

        if (!name || !content || !city || !price1 || !price2 || !hashtag) {
            alert("필수 항목을 입력해주세요.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("eid", isEdit ? Number(eid) : 0);
            formData.append("name", name);
            formData.append("content", content);
            formData.append("city", city);
            formData.append("price1", price1);
            formData.append("price2", price2);
            formData.append("viewcount", viewcount);
            formData.append("salecount", salecount);
            formData.append("hashtag", hashtag);

            if (image) {
                formData.append("image", image);
            }

            const url = isEdit
                ? "/api/admin/updateAdminEProduct"
                : "/api/admin/insertAdminEProduct";

            await jaxios.post(url, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            alert(isEdit ? "수정 완료!" : "등록 완료!");
            navigate("/admin/AdminEProduct");

        } catch (err) {
            console.error(err);
            alert("오류가 발생했습니다.");
        }
    };

    return (
        <div className='admin_product_insert'>
            <AdminHeader />
            <div className='writeBoard'>
                <h2>{isEdit ? "상품 수정" : "상품 등록"}</h2>

                <div className='field'>
                    <label>투어명</label>
                    <input type='text' value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className='field'>
                    <label>내용</label>
                    <input type='text' value={content} onChange={(e) => setContent(e.target.value)} />
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
                    <input type='text' value={price1} onChange={(e) => setPrice1(e.target.value)} />
                </div>

                <div className='field'>
                    <label>할인가</label>
                    <input type='text' value={price2} onChange={(e) => setPrice2(e.target.value)} />
                </div>

                <div className='field'>
                    <label>조회수</label>
                    <input
                        type='text'
                        value={viewcount}
                        onChange={handleNumberInput(setViewcount)}
                    />
                </div>

                <div className='field'>
                    <label>판매수</label>
                    <input
                        type='text'
                        value={salecount}
                        onChange={handleNumberInput(setSalecount)}
                    />
                </div>

                <div className='field'>
                    <label>해시태그</label>
                    <input
                        type='text'
                        value={hashtag}
                        onChange={handleHashtagChange}
                    />
                </div>

                <div className="field image-field">
                    <label>사진 업로드</label>
                    <input type="file" accept="image/*" onChange={handleImage} />
                    {preview && (
                        <img src={preview} alt="미리보기" className="preview" />
                    )}
                </div>

                <div className='btns'>
                    <button onClick={handleSubmit}>
                        {isEdit ? "수정하기" : "등록하기"}
                    </button>
                    <button onClick={() => navigate('/admin/AdminEProduct')}>
                        뒤로가기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminEProductInsert;