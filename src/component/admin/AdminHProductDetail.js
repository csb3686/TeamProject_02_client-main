import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../../css/AdminEProductDetail.css';
import AdminHeader from './AdminHeader';
import jaxios from '../../util/JWTutil';

function AdminHProductDetail() {
    const loginUser = useSelector(state => state.user);
    const { hid } = useParams();

    const [hotelDetail, setHotelDetail] = useState(null);
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [cid, setCid] = useState('');
    const [viewcount, setViewcount] = useState('');
    const [salecount, setSalecount] = useState('');
    const [oldImg, setOldImg] = useState('');

    const [optionList, setOptionList] = useState([]);

    const [newImageFile, setNewImageFile] = useState(null);
    const [newPreview, setNewPreview] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!loginUser.userid) {
            navigate('/login');
            return;
        }

        // 호텔 정보 가져오기
        jaxios.get(`/api/admin/AdminHProduct/${hid}`)
            .then((result) => {
                const d = result.data.admin;
                setHotelDetail(d);
                setName(d.name);
                setContent(d.content);
                setCid(d.cid);
                setViewcount(d.viewcount);
                setSalecount(d.salecount);
                setOldImg(d.image);
            })
            .catch((err) => console.error(err));

        // 옵션 리스트 불러오기
        jaxios.get('/api/admin/getAdminHOption', { params: { hid: hid } })
            .then((result) => {
                const list = result.data.option.map(op => ({
                    ...op,
                    newImgFile: null,
                    newImgPreview: null
                }));
                setOptionList(list);
            })
            .catch(err => console.error(err));

    }, []);

    // -----------------------------
    // 호텔 대표 이미지 선택
    // -----------------------------
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

    // -----------------------------
    // 옵션 이미지 선택
    // -----------------------------
    function handleOptionImage(e, idx) {
        const file = e.target.files[0];
        const newList = [...optionList];
        newList[idx].newImgFile = file;

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                newList[idx].newImgPreview = reader.result;
                setOptionList(newList);
            };
            reader.readAsDataURL(file);
        } else {
            newList[idx].newImgPreview = null;
            setOptionList(newList);
        }
    }

    // -----------------------------
    // 최종 저장 클릭
    // -----------------------------
    async function onsubmit() {
        if (!name) return alert('호텔명을 입력하세요');
        if (!content) return alert('내용을 입력하세요');

        // 1) 호텔 정보 업데이트
        const formData = new FormData();
        formData.append("hid", hid);
        formData.append("name", name);
        formData.append("content", content);
        formData.append("cid", cid);
        formData.append("viewcount", viewcount);
        formData.append("salecount", salecount);

        if (newImageFile) {
            formData.append("image", newImageFile);
        }

        try {
            const res1 = await jaxios.post('/api/admin/updateAdminHProduct', formData);
            if (res1.data.msg !== 'ok') {
                alert("호텔 정보 저장 실패");
                return;
            }
        } catch (err) {
            console.error(err);
            alert("호텔 정보 저장 에러");
        }

        // 2) 각 옵션 정보 + 이미지 저장
        for (let i = 0; i < optionList.length; i++) {
            const option = optionList[i];

            // (1) 옵션 텍스트 정보 업데이트
            try {
                await jaxios.post('/api/admin/updateAdminHOption', option);
            } catch (err) {
                console.error("옵션 수정 실패", err);
            }

            // (2) 옵션 이미지 개별 업로드
            if (option.newImgFile) {
                const opForm = new FormData();
                opForm.append("opimage", option.newImgFile);
                opForm.append("opid", option.opid);

                try {
                    await jaxios.post('/api/admin/insertHOptionImage', opForm);
                } catch (err) {
                    console.error("옵션 이미지 수정 실패", err);
                }
            }
        }

        alert('호텔 수정이 완료되었습니다!');
        navigate('/admin/AdminHProduct');
    }


    return (
        <div>
            <AdminHeader />
            <div className="subPage" style={{ paddingTop: '100px', paddingBottom: '10px' }}>
                {hotelDetail ? (
                    <div className="qnaview">

                        <h2>호텔 정보 수정</h2>

                        <div className='field'>
                            <label>호텔명</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} />
                        </div>

                        <div className='field'>
                            <label>설명</label>
                            <input type="text" value={content} onChange={e => setContent(e.target.value)} />
                        </div>

                        <div className='field'>
                            <label>도시코드</label>
                            <input type="text" value={cid} onChange={e => setCid(e.target.value)} />
                        </div>

                        <div className='field'>
                            <label>조회수</label>
                            <input type="text" value={viewcount} onChange={e => setViewcount(e.target.value)} />
                        </div>

                        <div className='field'>
                            <label>판매수</label>
                            <input type="text" value={salecount} onChange={e => setSalecount(e.target.value)} />
                        </div>

                        {/* 기존 이미지 */}
                        <div className='field'>
                            <label>기존 이미지</label>
                            <img
                                src={oldImg || '/images/noimage.jpg'}
                                style={{ width: '250px', border: '1px solid #ddd' }}
                            />
                        </div>

                        {/* 수정 이미지 */}
                        <div className='field'>
                            <label>수정 이미지</label>
                            <input type='file' accept='image/*' onChange={handleNewImage} />
                            {newPreview && (
                                <img src={newPreview} style={{ width: '250px', marginTop: '10px' }} />
                            )}
                        </div>

                        <hr />

                        <h3>옵션 정보</h3>

                        {optionList.map((op, idx) => (
                            <div key={idx} className="optionWrap">

                                <div className='field'>
                                    <label>옵션명</label>
                                    <input type="text"
                                        value={op.name}
                                        onChange={e => {
                                            const newList = [...optionList];
                                            newList[idx].name = e.target.value;
                                            setOptionList(newList);
                                        }} />
                                </div>

                                <div className='field'>
                                    <label>옵션내용</label>
                                    <input type="text"
                                        value={op.content}
                                        onChange={e => {
                                            const newList = [...optionList];
                                            newList[idx].content = e.target.value;
                                            setOptionList(newList);
                                        }} />
                                </div>

                                <div className='field'>
                                    <label>소비자가</label>
                                    <input type="text"
                                        value={op.price2}
                                        onChange={e => {
                                            const newList = [...optionList];
                                            newList[idx].price2 = e.target.value;
                                            setOptionList(newList);
                                        }} />
                                </div>

                                <div className='field'>
                                    <label>판매가</label>
                                    <input type="text"
                                        value={op.price1}
                                        onChange={e => {
                                            const newList = [...optionList];
                                            newList[idx].price1 = e.target.value;
                                            setOptionList(newList);
                                        }} />
                                </div>

                                <div className='field'>
                                    <label>객실수</label>
                                    <input type="text"
                                        value={op.maxcount}
                                        onChange={e => {
                                            const newList = [...optionList];
                                            newList[idx].maxcount = e.target.value;
                                            setOptionList(newList);
                                        }} />
                                </div>

                                {/* 기존 옵션 이미지 */}
                                <div className='field'>
                                    <label>기존 이미지</label>
                                    <img
                                        src={op.image || '/images/noimage.jpg'}
                                        style={{ width: '250px', border: '1px solid #ddd' }}
                                    />
                                </div>

                                {/* 옵션 수정 이미지 */}
                                <div className='field'>
                                    <label>수정 이미지</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleOptionImage(e, idx)}
                                    />
                                    {op.newImgPreview && (
                                        <img src={op.newImgPreview} style={{ width: '250px', marginTop: '10px' }} />
                                    )}
                                </div>

                                <hr />
                            </div>
                        ))}

                        <div className="btns">
                            <button onClick={onsubmit}>수정완료</button>
                            <button onClick={() => navigate('/admin/AdminHProduct')}>뒤로가기</button>
                        </div>

                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        </div>
    );
}

export default AdminHProductDetail;
