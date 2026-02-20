import React, { useState, useEffect } from 'react';
import jaxios from '../../util/JWTutil';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../../css/AdminEProductDetail.css';
import AdminHeader from './AdminHeader';

function AdminHProductInsert() {
    const loginUser = useSelector(state => state.user);
    const { hid } = useParams();
    const isEdit = Boolean(hid);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [notice, setNotice] = useState('');
    const [city, setCity] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    

    const [viewcount, setViewcount] = useState('0');
    const [salecount, setSalecount] = useState('0');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    // 옵션 리스트
    const [optionList, setOptionList] = useState([
        { name: '', content: '', price1: 0, price2: 0, maxcount: 0 }
    ]);
    const [imageList, setImageList] = useState([null]);
    const [previewList, setPreviewList] = useState([null]);

    // 도시 검색
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

    const handleCitySearch = (e) => {
        const value = e.target.value;
        setCitySearch(value);
        searchCity(value);
    };

    const selectCity = (cityData) => {
        setCity(cityData.cid);
        setCitySearch(`${cityData.ad1} ${cityData.ad2} ${cityData.ad3 || ''}`);
        setShowSuggestions(false);
    };

    const handleNumberInput = (setter) => (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        setter(raw === '' ? '0' : raw);
    };

    // 호텔 이미지 핸들러
    const handleImage = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // 옵션 이미지 핸들러
    const handleOptionImage = (index, e) => {
        const file = e.target.files[0];
        const newImageList = [...imageList];
        newImageList[index] = file;
        setImageList(newImageList);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPreviewList = [...previewList];
                newPreviewList[index] = reader.result;
                setPreviewList(newPreviewList);
            };
            reader.readAsDataURL(file);
        }
    };

    // 옵션 필드 변경
    const handleChange = (index, field, value) => {
        const newList = [...optionList];
        newList[index][field] = value;
        setOptionList(newList);
    };

    // 옵션 추가
    const addOption = () => {
        setOptionList([...optionList, { name: '', content: '', price1: 0, price2: 0, maxcount: 0 }]);
        setImageList([...imageList, null]);
        setPreviewList([...previewList, null]);
    };

    // 옵션 삭제
    const removeOption = (index) => {
        if (optionList.length <= 1) {
            alert('최소 1개의 옵션이 필요합니다.');
            return;
        }
        setOptionList(optionList.filter((_, i) => i !== index));
        setImageList(imageList.filter((_, i) => i !== index));
        setPreviewList(previewList.filter((_, i) => i !== index));
    };

    // 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 유효성 검사
        if (!name || !content || !city) {
            alert("호텔 필수 항목을 입력해주세요.");
            return;
        }

        // 옵션 유효성 검사
        for (let i = 0; i < optionList.length; i++) {
            const opt = optionList[i];
            if (!opt.name || !opt.content || !opt.maxcount) {
                alert(`옵션 ${i + 1}의 필수 항목을 입력해주세요.`);
                return;
            }
            if (opt.price1 <= 0 || opt.price2 <= 0) {
                alert(`옵션 ${i + 1}의 가격을 입력해주세요.`);
                return;
            }
        }

        try {

            //호텔 정보 저장
            const formData = new FormData();
            formData.append('name', name);
            formData.append('content', content);
            formData.append('notice', notice);
            formData.append('cid', city);
            formData.append('viewcount', viewcount || 0);
            formData.append('salecount', salecount || 0);
            if (image) formData.append('image', image);

            const hotelResult = await jaxios.post('/api/admin/insertHProduct', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const savedHid = hotelResult.data.hid;
            console.log('호텔 등록 완료, hid:', savedHid);

            // 각 옵션 저장
            for (let i = 0; i < optionList.length; i++) {
                try {
                    // 옵션 정보 저장
                    const optionResult = await jaxios.post('/api/admin/insertAdminHOption', 
                        optionList[i], 
                        { params: { hid: savedHid } }
                    );

                    const savedOpid = optionResult.data.opid;
                    console.log(`옵션 ${i + 1} 등록 완료, opid:`, savedOpid);

                    // 옵션 이미지 업로드
                    if (imageList[i]) {
                        const fd = new FormData();
                        fd.append("opimage", imageList[i]);

                        await jaxios.post('/api/admin/insertHOptionImage', fd, {
                            params: { opid: savedOpid },
                            headers: { "Content-Type": "multipart/form-data" }
                        });
                        console.log(`옵션 ${i + 1} 이미지 업로드 완료`);
                    }
                } catch (err) {
                    console.error(`옵션 ${i + 1} 저장 실패:`, err);
                    alert(`옵션 ${i + 1} 저장 중 오류가 발생했습니다.`);
                }
            }

            alert('상품 등록이 완료되었습니다!');
            navigate('/admin/adminHProduct');


        } catch (err) {
            console.error('저장 오류:', err);
            alert("오류가 발생했습니다: " + (err.response?.data?.message || err.message));
        }


    };
  
    return (
        <div className='admin_product_insert'>
            <AdminHeader />
            <div className='writeBoard'>
                <h2>상품 등록</h2>

               
                <div className='field'>
                    <label>호텔명</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="호텔명" />
                </div>

                
                <div className='field'>
                    <label>내용</label>
                    <input type="text" value={content} onChange={e => setContent(e.target.value)}
                    placeholder="내용" />
                </div>

                <div className='field'>
                    <label>유의사항</label>
                    <input type="text" value={notice} onChange={e => setNotice(e.target.value)}
                    placeholder="유의사항" />
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
                            position: 'absolute', top: '100%', left: 0, right: 0,
                            backgroundColor: 'white', border: '1px solid #ddd',
                            borderRadius: '4px', maxHeight: '200px', overflowY: 'auto',
                            listStyle: 'none', padding: 0, margin: '4px 0',
                            zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            {citySuggestions.map((cityData, index) => (
                                <li 
                                    key={index}
                                    onClick={() => selectCity(cityData)}
                                    style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
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
                    <label>조회수</label>
                    <input type='text' value={viewcount} onChange={handleNumberInput(setViewcount)} />
                </div>

                <div className='field'>
                    <label>판매수</label>
                    <input type='text' value={salecount} onChange={handleNumberInput(setSalecount)} />
                </div>

                
                <div className="field image-field">
                    <label>호텔 사진 업로드</label>
                    <input type="file" accept="image/*" onChange={handleImage} />
                    {preview && <img src={preview} alt="미리보기" className="preview" />}
                </div>
                
                <h3 style={{ marginTop: '30px', borderTop: '2px solid #333', paddingTop: '20px' }}>옵션 정보</h3>
                {optionList.map((option, idx) => (
                    <div key={idx} className='option_field' style={{ 
                        border: '1px solid #ddd', 
                        padding: '20px', 
                        marginBottom: '20px', 
                        borderRadius: '8px',
                        backgroundColor: '#f9f9f9'
                    }}>
                        <h4>옵션 {idx + 1}</h4>
                        
                        <div className='field'>
                            <label>옵션명</label>
                            <input 
                                type='text'
                                value={option.name}
                                onChange={(e) => handleChange(idx, 'name', e.target.value)}
                                placeholder="옵션 이름" 
                            />
                        </div>

                        <div className='field'>
                            <label>옵션설명</label>
                            <input 
                                type='text' 
                                value={option.content}
                                onChange={(e) => handleChange(idx, 'content', e.target.value)}
                                placeholder="옵션 설명" 
                            />
                        </div>

                        <div className='field'>
                            <label>정가</label>
                            <input 
                                type='text' 
                                value={option.price2}
                                onChange={(e) => handleChange(idx, 'price2', e.target.value)}
                                placeholder="소비자가" 
                            />
                        </div>

                        <div className='field'>
                            <label>할인가</label>
                            <input 
                                type='text' 
                                value={option.price1}
                                onChange={(e) => handleChange(idx, 'price1',e.target.value) || 0}
                                placeholder="판매가" 
                            />
                        </div>

                        <div className='field'>
                            <label>객실 수량</label>
                            <input 
                                type='text' 
                                value={option.maxcount}
                                onChange={(e) => handleChange(idx, 'maxcount', e.target.value) || 0}
                                placeholder="객실 수량" 
                            />
                        </div>

                        <div className="field image-field">
                            <label>옵션 사진 업로드</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleOptionImage(idx, e)} 
                            />
                            {previewList[idx] && (
                                <img src={previewList[idx]} alt="미리보기" className="preview" />
                            )}
                        </div>

                        <div className='field' style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" onClick={addOption}>옵션 추가</button>
                            <button 
                                type="button" 
                                onClick={() => removeOption(idx)}
                                style={{ backgroundColor: '#dc3545' }}
                            >
                                옵션 삭제
                            </button>
                        </div>
                    </div>
                ))}

                {/* 제출 버튼 */}

                <div className='btns'>
                    <button onClick={handleSubmit}>등록하기</button>
                    <button onClick={() => navigate('/admin/AdminHProduct')}>뒤로가기</button>
                </div>
            </div>
        </div>
    );
}

export default AdminHProductInsert;