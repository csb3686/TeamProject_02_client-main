import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/TopCitiesWithProducts.css";
import { useNavigate } from "react-router-dom";
import Header from '../Header';
import Footer from '../Footer';

function TopCitiesWithProducts() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await axios.get("/api/product/TopCityProducts");
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p className="loading">Loading...</p>;
    if (!data) return <p className="loading">데이터를 불러오지 못했습니다.</p>;
    if (data.status !== "success") return <p className="loading">결과 없음: {data.status}</p>;

    const formatPrice = (product) => {
        if (!product) return "가격 정보 없음";
        const price = product.price ?? product.price1 ?? product.price2 ?? null;
        return price ? `${price.toLocaleString()}원` : "가격 정보 없음";
    };

    const getName = (product) => {
        if (!product) return "상품 없음";
        return product.name || product.ename || product.title || "상품명 없음";
    };

    const categories = ["숙소", "체험", "교통"];

    return (
        <article>
            <Header />

            <div className="top-cities-container">
                <h2 className="title" style={{height:'30px', display:'flex', justifyContent:'center',  alignItems:'center', margin: '20px 0', fontSize:'35px'}}>
                    🔥최근 1개월 가장 인기 있는 도시 TOP 3
                </h2>

                {data.cities.map((city) => (
                    <div key={city.cid} className="city-box">

                        <h3 className="city-title" style={{height:'30px', display:'flex', justifyContent:'center',  alignItems:'center', margin: '20px 0', fontSize:'25px'}}>
                            👑 {city.cityName ? city.cityName : "도시명 없음"} 👑
                        </h3>

                        <div className="product-list">
                            {categories.map((category) => {
                                const product = city.topProducts[category];

                                return (
                                    <div
                                        key={category}
                                        className="product-card"
                                        onClick={() => {
                                            if (!product) return;

                                            if (category === "숙소") navigate(`/hotelDetail/${product.hid}`);
                                            if (category === "체험") navigate(`/experienceDetail/${product.eid}`);
                                            if (category === "교통") navigate(`/transDetail/${product.tid}`);
                                        }}
                                        style={{ cursor: product ? "pointer" : "default" }}
                                    >
                                        <h4>{category}</h4>

                                        {product ? (
                                            <>
                                                <img
                                                    src={product.image}
                                                    alt={category}
                                                    className="product-img"
                                                />
                                                <p className="product-name">{getName(product)}</p>
                                                <p>{formatPrice(product)}</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="no-img">이미지 없음</div>
                                                <p className="product-name">상품 없음</p>
                                                <p>가격 정보 없음</p>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="more">
                    <div onClick={() => navigate('/experienceList')}>더 많은 투어/체험 정보 보기</div>
                    <div onClick={() => navigate('/hotelList')}>더 많은 숙소 정보 보기</div>
                    <div onClick={() => navigate('/transList')}>더 많은 교통 정보 보기</div>
                </div>

                <div className="back-btn" onClick={() => navigate('/')}>
                    <h2>뒤로가기</h2>
                </div>
            </div>

            <Footer />
        </article>
    );
}

export default TopCitiesWithProducts;
