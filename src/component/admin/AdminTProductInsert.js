import React, { useState, useEffect } from 'react';
import jaxios from '../../util/JWTutil';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../../css/AdminEProductDetail.css';

import AdminHeader from './AdminHeader';

function AdminTProductInsert() {

    const loginUser = useSelector(state => state.user);
    const { tid } = useParams();
    const isEdit = Boolean(tid);
    const navigate = useNavigate();

    const [tProductDetail, setTProductDetail] = useState(null);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [company, setCompany] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [starttime, setStartTime] = useState(''); 
    const [endtime, setEndTime] = useState('');      
    const [maxcount, setMaxCount] = useState('');    
  
    const [price1, setPrice1] = useState('');
    const [price2, setPrice2] = useState('');

    const [salecount, setSalecount] = useState('0');

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    // 30분 단위 시간 옵션 생성 (00:00 ~ 23:30)
    const generateTimeOptions = () => {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeValue = hour * 100 + minute;
                const timeLabel = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                options.push({ value: timeValue, label: timeLabel });
            }
        }
        return options;
    };

    const [timeOptions] = useState(generateTimeOptions());

    // 숫자를 시간 형식으로 변환 (예: 930 -> "09:30")
    const formatTime = (timeValue) => {
        if (timeValue === null || timeValue === undefined) return '';
        const hour = Math.floor(timeValue / 100);
        const minute = timeValue % 100;
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };

    // 시간 형식을 숫자로 변환 (예: "09:30" -> 930)
    const parseTime = (timeString) => {
        if (!timeString) return 0;
        const [hour, minute] = timeString.split(':').map(Number);
        return hour * 100 + minute;
    };

    useEffect(() => {
        if (!isEdit) return;

        jaxios.get(`/api/admin/AdminTProduct/${tid}`)
            .then(res => {
                const data = res.data.admin;
                console.log('서버에서 받은 데이터:', data);
                
                setTProductDetail(data);
                setName(data.name || '');
                setCategory(data.category || '');
                setCompany(data.company || '');
                setStart(data.start || '');
                setEnd(data.end || '');
                
                // ⭐ starttime, endtime은 이제 timetable ID
                // 서버에서 변환된 시간 문자열을 받아옴
                setStartTime(data.starttimeStr || '');
                setEndTime(data.endtimeStr || '');
                
                setMaxCount(data.maxcount != null ? data.maxcount.toString() : '0');
                setPrice1(data.price1 != null ? data.price1.toString() : '');
                setPrice2(data.price2 != null ? data.price2.toString() : '');
                setSalecount(data.salecount != null ? data.salecount.toString() : '0');
                setPreview(data.image);
            })
            .catch(err => console.error(err));
    }, [tid, isEdit]);

    const handleNumberInput = (setter) => (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        setter(raw === '' ? '0' : raw);
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

    // 출발시간 변경 핸들러
    const handleStartTimeChange = (e) => {
        const newStartTime = e.target.value;
        setStartTime(newStartTime);
        
        // 도착시간이 출발시간보다 빠른 경우 도착시간 초기화
        if (endtime && parseTime(newStartTime) >= parseTime(endtime)) {
            setEndTime('');
        }
    };

    // 도착시간 변경 핸들러
    const handleEndTimeChange = (e) => {
        const newEndTime = e.target.value;
        
        // 출발시간보다 빠른 시간 선택 방지
        if (starttime && parseTime(newEndTime) <= parseTime(starttime)) {
            alert('도착시간은 출발시간보다 늦어야 합니다.');
            return;
        }
        
        setEndTime(newEndTime);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Number(price2) >= Number(price1)) {
            alert("할인가는 정가보다 낮아야 합니다.");
            return;
        }

        // 시간 검증 추가
        if (starttime && endtime && parseTime(starttime) >= parseTime(endtime)) {
            alert("도착시간은 출발시간보다 늦어야 합니다.");
            return;
        }

        if (!name || !category || !company || !start || !end || !starttime || !endtime || !maxcount || !salecount || !price1 || !price2) {
            alert("필수 항목을 입력해주세요.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("tid", isEdit ? Number(tid) : 0);  
            formData.append("name", name);
            formData.append("category", category);
            formData.append("company", company);
            formData.append("start", start);
            formData.append("end", end);
            
            // ⭐ 시간 문자열을 그대로 전송 (서버에서 timetable ID로 변환)
            formData.append("starttime", starttime);
            formData.append("endtime", endtime);
            
            formData.append("maxcount", maxcount);
            formData.append("salecount", salecount);
            formData.append("price1", price1);
            formData.append("price2", price2);

            if (image) {
                formData.append("image", image);
            }

            const url = isEdit
                ? "/api/admin/updateAdminTProduct"
                : "/api/admin/insertAdminTProduct";

            await jaxios.post(url, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            alert(isEdit ? "수정 완료!" : "등록 완료!");
            navigate("/admin/AdminTProduct");

        } catch (err) {
            console.error(err);
            alert("오류가 발생했습니다.");
        }
    };

    return (
        <div className='admin_product_insert'>
            <AdminHeader />
            <div className='writeBoard'>
                <h2>{isEdit ? "교통 상품 수정" : "교통 상품 등록"}</h2>

                <div className='field'>
                    <label>교통명</label>
                    <input type='text' value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className='field'>
                    <label>카테고리</label>
                    <input type='text' value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>

                <div className='field'>
                    <label>회사</label>
                    <input type='text' value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>

                <div className='field'>
                    <label>출발지</label>
                    <input type='text' value={start} onChange={(e) => setStart(e.target.value)} />
                </div>

                <div className='field'>
                    <label>도착지</label>
                    <input type='text' value={end} onChange={(e) => setEnd(e.target.value)} />
                </div>

                <div className='field'>
                    <label>출발시간</label>
                    <select 
                        value={starttime}
                        onChange={handleStartTimeChange}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        <option value="">선택하세요</option>
                        {timeOptions.map(option => (
                            <option key={option.value} value={option.label}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className='field'>
                    <label>도착시간</label>
                    <select 
                        value={endtime}
                        onChange={handleEndTimeChange}
                        disabled={!starttime}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        <option value="">선택하세요</option>
                        {timeOptions
                            .filter(option => !starttime || parseTime(option.label) > parseTime(starttime))
                            .map(option => (
                                <option key={option.value} value={option.label}>
                                    {option.label}
                                </option>
                            ))
                        }
                    </select>
                </div>

                <div className='field'>
                    <label>최대 수량</label>
                    <input 
                        type='text' 
                        value={maxcount} 
                        onChange={handleNumberInput(setMaxCount)}  
                    />
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
                    <label>판매수</label>
                    <input 
                        type='text' 
                        value={salecount} 
                        onChange={handleNumberInput(setSalecount)} 
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
                    <button onClick={() => navigate('/admin/AdminTProduct')}>
                        뒤로가기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AdminTProductInsert;