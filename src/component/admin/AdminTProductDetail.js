import React, { useState, useEffect } from 'react';
import jaxios from '../../util/JWTutil';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../../css/AdminEProductDetail.css';
import AdminHeader from './AdminHeader';

function AdminTProductDetail() {
    const loginUser = useSelector(state => state.user);
    const { tid } = useParams();
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
    const [salecount, setSalecount] = useState('');
    const [oldImg, setOldImg] = useState('');

    const [newImageFile, setNewImageFile] = useState(null);
    const [newPreview, setNewPreview] = useState(null);

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

    // 숫자형 시간 → 문자열 변환 (930 → "09:30")
    const formatTime = (timeValue) => {
        if (timeValue === null || timeValue === undefined) return "";
        const hour = Math.floor(timeValue / 100);
        const minute = timeValue % 100;
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };

    // 문자열 시간 → 숫자 변환 ("09:30" → 930)
    const parseTime = (timeString) => {
        if (!timeString) return "";
        const [hour, minute] = timeString.split(':').map(Number);
        return hour * 100 + minute;
    };

    useEffect(() => {
        if (!loginUser.userid) {
            navigate('/login');
            return;
        }

        jaxios.get(`/api/admin/AdminTProduct/${tid}`)
            .then(result => {
                const t = result.data.admin;
                setTProductDetail(t);

                setName(t.name || '');
                setCategory(t.category || '');
                setCompany(t.company || '');
                setStart(t.start || '');
                setEnd(t.end || '');

                // 숫자형 시간 → "HH:MM" 변환
                setStartTime(t.starttime != null ? formatTime(t.starttime) : "");
                setEndTime(t.endtime != null ? formatTime(t.endtime) : "");

                setMaxCount(t.maxcount?.toString() || '0');
                setPrice1(t.price1?.toString() || '0');
                setPrice2(t.price2?.toString() || '0');
                setSalecount(t.salecount?.toString() || '0');
                setOldImg(t.image || '');
            })
            .catch(err => console.error(err));
    }, [tid]);

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

    // 출발시간 선택 시
    const handleStartTimeChange = (e) => {
        const newStartTime = e.target.value;
        setStartTime(newStartTime);

        if (endtime && parseTime(newStartTime) >= parseTime(endtime)) {
            setEndTime("");
        }
    };

    // 도착시간 선택 시
    const handleEndTimeChange = (e) => {
        const newEndTime = e.target.value;

        if (starttime && parseTime(newEndTime) <= parseTime(starttime)) {
            alert("도착시간은 출발시간보다 늦어야 합니다.");
            return;
        }
        setEndTime(newEndTime);
    };

    function onSubmit() {

        if (!name || !category || !company || !start || !end || !starttime || !endtime) {
            alert("필수 항목을 입력해주세요.");
            return;
        }

        if (Number(price1) >= Number(price2)) {
            alert("할인가는 정가보다 낮아야 합니다.");
            return;
        }

        if (parseTime(starttime) >= parseTime(endtime)) {
            alert("도착시간은 출발시간보다 늦어야 합니다.");
            return;
        }

        const formData = new FormData();
        formData.append("tid", tid);
        formData.append("name", name);
        formData.append("category", category);
        formData.append("company", company);
        formData.append("start", start);
        formData.append("end", end);

        // 문자열 → 숫자로 변환 후 서버 전송
        formData.append("starttime", parseTime(starttime));
        formData.append("endtime", parseTime(endtime));

        formData.append("maxcount", maxcount);
        formData.append("price1", price1);
        formData.append("price2", price2);
        formData.append("salecount", salecount);

        if (newImageFile) formData.append("image", newImageFile);

        jaxios.post('/api/admin/updateAdminTProduct', formData)
            .then(result => {
                alert("수정 완료!");
                navigate('/admin/AdminTProduct');
            })
            .catch(err => console.error(err));
    }

    return (
        <div>
            <AdminHeader />
            <div className="subPage" style={{ paddingTop: '100px', paddingBottom: '10px' }}>

                {tProductDetail ? (
                    <div className="qnaview">
                        <h2>교통 상품 정보</h2>

                        {/* 교통명 */}
                        <div className='field'>
                            <label>교통명</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>

                        {/* 카테고리 */}
                        <div className='field'>
                            <label>카테고리</label>
                            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
                        </div>

                        {/* 회사 */}
                        <div className='field'>
                            <label>회사</label>
                            <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
                        </div>

                        {/* 출발지 */}
                        <div className='field'>
                            <label>출발지</label>
                            <input type="text" value={start} onChange={(e) => setStart(e.target.value)} />
                        </div>

                        {/* 도착지 */}
                        <div className='field'>
                            <label>도착지</label>
                            <input type="text" value={end} onChange={(e) => setEnd(e.target.value)} />
                        </div>

                        {/* 출발시간 */}
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

                        {/* 도착시간 */}
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

                        {/* 나머지 숫자 필드 */}
                        <div className='field'>
                            <label>남은 수량</label>
                            <input type="text" value={maxcount} onChange={(e) => setMaxCount(e.target.value)} />
                        </div>

                        <div className='field'>
                            <label>정가</label>
                            <input type="text" value={price2} onChange={(e) => setPrice2(e.target.value)} />
                        </div>

                        <div className='field'>
                            <label>할인가</label>
                            <input type="text" value={price1} onChange={(e) => setPrice1(e.target.value)} />
                        </div>

                        <div className='field'>
                            <label>판매수</label>
                            <input type="text" value={salecount} onChange={(e) => setSalecount(e.target.value)} />
                        </div>

                        {/* 기존 이미지 */}
                        <div className='field'>
                            <label>기존 이미지</label>
                            <img
                                src={oldImg || '/images/noimage.jpg'}
                                alt="기존 이미지"
                                style={{ width: '250px', border: '1px solid #ddd' }}
                            />
                        </div>

                        {/* 수정 이미지 */}
                        <div className='field'>
                            <label>수정 이미지</label>
                            <input
                                type='file'
                                accept='image/*'
                                onChange={handleNewImage}
                            />

                            {newPreview && (
                                <img
                                    src={newPreview}
                                    alt="미리보기"
                                    className="preview"
                                />
                            )}
                        </div>

                        <div className="btns">
                            <button onClick={onSubmit}>수정 완료</button>
                            <button onClick={() => navigate('/admin/AdminTProduct')}>뒤로가기</button>
                        </div>
                    </div>
                ) : (
                    <div className="qnaview-loading">Loading...</div>
                )}
            </div>
        </div>
    );
}

export default AdminTProductDetail;