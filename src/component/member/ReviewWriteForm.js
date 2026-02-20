import React, { useEffect, useState } from "react";
import '../../css/review.css'
import jaxios from "../../util/JWTutil";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Header";
import Footer from "../Footer";
import { useSelector } from "react-redux";

function ReviewWriteForm() {
  const { oid } = useParams();
  const loginUser = useSelector( state=>state.user );
  const [orderData, setOrderData] = useState(null);
  const [hotelData, setHotelData] = useState(null);
  const [optionData, setOptionData] = useState(null);
  const [experienceData, setExperienceData] = useState(null);
  const [transData, setTransData] = useState(null);

  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [point, setPoint] = useState(5);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
      if (!oid) return;

      jaxios.get(`/api/order/getOrderDetail/${oid}`)
        .then(res => {
          const data = res.data;
          setOrderData(data.order);
          setHotelData(data.hotel || null);
          setOptionData(data.option || null);
          setExperienceData(data.experience || null);
          setTransData(data.trans || null);
        })
        .catch(err => console.error(err));
  }, [oid]);

  // 파일 업로드
  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  //날짜포맷
  const formatDate = (dateString) =>
  dateString ? dateString.split("T")[0] : "";

  // 리뷰 등록
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!title || !content) {
    alert("제목과 내용을 입력해주세요.");
    return;
  }

  try {
    const dto = {
      userid: loginUser.userid,
      oid: Number(oid),
      title: title,
      content: content,
      point: point
    };

    const formData = new FormData();
    formData.append(
      "dto",
      new Blob([JSON.stringify(dto)], { type: "application/json" })
    );

    // 이미지 선택 안 하면 append 안 함
    if (image) formData.append("image", image);

    const res = await jaxios.post("/api/member/insertReview", formData); // Content-Type 지정 금지
    console.log("리뷰 등록 성공:", res.data);
    alert("리뷰가 등록되었습니다!");
    navigate("/mypage");

  } catch (err) {
    console.error("리뷰 등록 실패:", err);
    alert("리뷰 등록 중 오류가 발생했습니다.");
  }

  
};


  return (
    <div className='mypage'>
        <Header />
          <div className="myWrap">
            <div className='mypage-content'>
                <div className='mypage-submenu'>
                    <div className='mypage-title'>MY PAGE</div>
                    <ul>
                        <li onClick={()=>{navigate('/mypage')}}>주문내역</li>
                        <li onClick={()=>{navigate('/editmember')}}>회원정보 수정</li>
                        <li onClick={()=>{navigate('/reviewBox')}}>리뷰 보관함</li>
                    </ul>
                </div>

                <div className='mypage-content-wrap'>
                    <div className='mypage-detail'>
                        <div className=''>
                            <div className="review-form-container">
                                <h2 className="reviewTitle">리뷰 작성</h2>

                                {orderData && (
                                  <>
                                    {orderData.category === '숙소' && (
                                      <div className="product-info">
                                        <div className="product-img-placeholder">
                                              <img src={hotelData.image} alt={hotelData.name} />
                                        </div>
                                        <div className="product-text">
                                            <div className="product-category">{orderData.category}</div>
                                            <div className="product-name">{hotelData.name}</div>
                                            <div className="product-option">{optionData?.name}</div>
                                            <div className="product-date">
                                                예약일 {formatDate(orderData.checkInDate)} ~ {formatDate(orderData.checkOutDate)}
                                            </div>
                                        </div>
                                      </div>
                                    )}

                                    {orderData.category === '체험' && (
                                      <div className="product-info">
                                        <div className="product-img-placeholder">
                                              <img src={experienceData.image} alt={experienceData.name} />
                                        </div>
                                        <div className="product-text">
                                            <div className="product-category">{orderData.category}</div>
                                            <div className="product-name">{experienceData.name}</div>
                                            <div className="product-date">예약일 {formatDate(orderData.selecteddate)}</div>
                                        </div>
                                      </div>
                                    )}

                                    {orderData.category === '교통' && (
                                      <div className="product-info">
                                        <div className="product-img-placeholder">
                                              <img src={transData.image} alt={transData.name} />
                                        </div>
                                        <div className="product-text">
                                            <div className="product-category">{orderData.category}</div>
                                            <div className="product-name">{transData.name}</div>
                                            <div className="product-date">예약일 {formatDate(orderData.selecteddate)}</div>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}

                                <form className="review-form" onSubmit={handleSubmit}>
                                  <div className="form-group">
                                    <label>평점</label>
                                    <div className="rating-stars">
                                      {[1,2,3,4,5].map(num => (
                                        <span 
                                          key={num} 
                                          className={num <= point ? "star active" : "star"} 
                                          onClick={() => setPoint(num)}
                                        >
                                          ★
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="form-group">
                                    <label>제목</label>
                                    <input
                                      type="text"
                                      placeholder="리뷰 제목을 입력해주세요"
                                      value={title}
                                      onChange={(e) => setTitle(e.target.value)}
                                    />
                                  </div>

                                  <div className="form-group">
                                    <label>내용</label>
                                    <textarea
                                      placeholder="리뷰 내용을 입력해주세요."
                                      value={content}
                                      onChange={(e) => setContent(e.target.value)}
                                      rows={6}
                                    ></textarea>
                                  </div>

                                  <div className="form-group">
                                    <label>사진 업로드 (선택)</label>
                                    <input type="file" accept="image/*" onChange={handleImage} />
                                    <div className="previewBox">
                                        {preview && <img src={preview} alt="preview" className="preview-img" />}

                                    </div>
                                  </div>

                                  <button className="submit-btn" type="submit">
                                    리뷰 등록
                                  </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        <Footer/>
    </div>
  );
}

export default ReviewWriteForm;
