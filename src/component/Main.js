import React, {useEffect, useState, useRef} from 'react'
import Header from './Header';
import Footer from './Footer';
import '../css/main.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Cookies } from 'react-cookie';
import CalendarModal from './CalendarModal';


function Main() {

    const [hotelList, setHotelList] = useState([]);
    const [transList, setTransList] = useState([]);
    const [experList, setExperList] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [start, setStart] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const navigate = useNavigate();
    const cookies = new Cookies();

    useEffect(
        ()=>{
            axios.get('/api/main/getHotelList') // 베스트 4개 + 옵션중 가장 저렴한 가격
            .then((result)=>{
                const hotels = 
                result.data.hotelList.map((hotel, idx) => (
                    {...hotel, price: result.data.price[idx]}
                ));
                setHotelList(hotels);
            })
            .catch((err)=>{console.error(err)})

            axios.get('/api/main/getTransList') // 베스트 4개
            .then((result)=>{
                setTransList(result.data.transList);
                // console.log(result.data.transList)
            })
            .catch((err)=>{console.error(err)})

            axios.get('/api/main/getExperience') // 베스트 4개 + 지역코드별 지역
            .then((result)=>{
                // console.log(result.data.experCity)
                const exper =
                result.data.experList.map((exper, idx)=>({
                    ...exper, region: result.data.experCity[idx]
                }));
                setExperList(exper);
            })
            .catch((err)=>{console.error(err)})
        },[]
    )


    function goNext_Main(){
        if(!start){return alert('출발지를 입력해주세요')}
        if(!keyword){return alert('목적지를 입력해주세요')}
        

        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(keyword, (data, status) => {
            if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
            const place = data[0];
            console.log(place);

            const placeFilter = {
                address_name: place.address_name,
                category_group_name: place.category_group_name,
                category_name: place.category_name,
                place_name: place.place_name,
                x: place.x,
                y: place.y,
                id: place.id,
                road_address_name: place.road_address_name,
                start: start,
                keyword: keyword,
                startdate: startDate,
                enddate: endDate
            };

            cookies.set('endplace', JSON.stringify(placeFilter), { path: '/' });

            navigate('/selectTranse');
            } else {
            alert("검색 결과가 없습니다.");
            }
        });

        ps.keywordSearch(start, (data, status) => {
            if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
            const place = data[0];

            // JSON으로 안전하게 저장
            const placeFilter = {
                address_name: place.address_name,
                category_group_name: place.category_group_name,
                category_name: place.category_name,
                place_name: place.place_name,
                x: place.x,
                y: place.y,
                id: place.id,
                road_address_name: place.road_address_name,
                start: start,
                keyword: keyword,
                startdate: startDate,
                enddate: endDate
            };

            cookies.set('startplace', JSON.stringify(placeFilter), { path: '/' });

            navigate('/selectTranse');
            } else {
            alert("검색 결과가 없습니다.");
            }
        });
    }

  return (
    <div className='main'>
        <Header />
        
        <section className='heroSection'>
            <div className='heroBanner'>
                <img src='/images/main_6.jpg' alt='메인 배너' />
                <div className='heroBannerOverlay'></div>
                <div className='heroContent'>
                    <div className='heroCopy'>
                        <h1 className="fadeInUp delay-1">한번에 계획하는 국내여행</h1>
                        <h1 className="fadeInUp delay-2">어디로 떠나고 싶으신가요?</h1>
                        <p className="fadeInUp delay-3">아래 검색창을 이용해 숙소, 교통, 체험까지</p>
                        <p className="fadeInUp delay-4">방문하시는 지역에 맞춰 나만의 패키지를 한번에 만들어보세요 !</p>
                        </div>
                    <div className='heroSearchBar fadeInUp delay-5'>
                        
                        <div className='mainCalenderM'>
                            <CalendarModal
                                mode="range"
                                startDate={startDate} 
                                endDate={endDate} 
                                setStartDate={setStartDate}
                                setEndDate={setEndDate}
                            />
                        </div>

                        <div className='heroSearchField'>
                            <input 
                                type='text' 
                                value={start} 
                                onChange={(e)=>{setStart(e.currentTarget.value)}} 
                                placeholder='출발지'
                            />
                        </div>
                        <div className='heroSearchField'>
                            <input 
                                type='text' 
                                value={keyword} 
                                onChange={(e)=>{setKeyword(e.currentTarget.value)}} 
                                placeholder='목적지'
                            />
                        </div>

                        
                        
                        <button className='heroSearchButton' onClick={()=>{goNext_Main()}}>
                            검색
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <div className='sectionWrap'>
            <section className='productSection hotelSection'>
                <div className='sectionHeader'>
                    <div className='sectionTitle'>
                        <h2>지금 가장 인기있는 숙소</h2>
                        <p>편안한 휴식을 위한 최고의 선택</p>
                    </div>
                    <button className='moreBtn' onClick={()=>{navigate('/HotelList')}}>
                        더보기 <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div className='hotelGrid'>
                    {
                        hotelList.map((hotel, idx)=>{
                            return(
                                <div className='productCard' key={idx} onClick={()=>{navigate('/hotelDetail/' + hotel.hid)}}>
                                    <div className='productImage'>
                                        <img src={hotel.image} alt={hotel.name} />
                                        {idx === 0 && <div className='productBadge'>BEST</div>}
                                    </div>
                                    <div className='productInfo'>
                                        <div className='productName'>{hotel.name}</div>
                                        <div className='productPrice'>
                                            <span className='priceAmount'>{new Intl.NumberFormat('ko-KR').format(hotel.price)}원</span>
                                            <span className='priceUnit'>~</span>
                                        </div>
                                        <div className='productDesc'>{hotel.content}</div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </section>

            <section className='productSection transSection'>
                <div className='inner'>
                    <div className='sectionHeader'>
                        <div className='sectionTitle'>
                            <h2>편안하게 목적지까지 인기 교통</h2>
                            <p>안전하고 편리한 여행의 시작</p>
                        </div>
                        <button className='moreBtn trbtn' onClick={()=>{navigate('/TransList')}}>
                            더보기 <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    <div className='transGrid'>
                        {
                            transList.map((trans, idx)=>{
                                return(
                                    <div className='transCard' key={idx} onClick={()=>{navigate('/transDetail/' + trans.tid)}}>
                                        <div className='transImage'>
                                            <img src={trans.image} alt={trans.name} />
                                            <div className='productBadge'>{trans.company}</div>
                                        </div>
                                        <div className='transInfo'>
                                            <div className='productName'>{trans.name}</div>
                                            <div className='transRoute'>
                                                <span className='routePoint'>{trans.start}</span>
                                                <i className="fas fa-arrow-right routeArrow"></i>
                                                <span className='routePoint'>{trans.end}</span>
                                            </div>
                                            <div className='productPrice'>
                                                <span className='priceOriginal'>{new Intl.NumberFormat('ko-KR').format(trans.price2)}원</span>
                                                <span className='priceAmount'>{new Intl.NumberFormat('ko-KR').format(trans.price1)}원</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </section>

            <section className='productSection experienceSection'>
                <div className='sectionHeader'>
                    <div className='sectionTitle'>
                        <h2>오감이 즐거운 특별한 관광/투어</h2>
                        <p>잊지 못할 특별한 경험을 선사합니다</p>
                    </div>
                    <button className='moreBtn' onClick={()=>{navigate('/ExperienceList')}}>
                        더보기 <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div className='experienceGrid'>
                    {
                        experList.map((ex, idx)=>{
                            return(
                                <div className='experienceCard' key={idx} onClick={()=>{navigate('/experienceDetail/' + ex.eid)}}>
                                    <div className='experienceImage'>
                                        <img src={ex.image} alt={ex.name} />
                                        <div className='experienceOverlay'></div>
                                        <div className='productBadge location'>{ex.region?.ad1 || '체험'}</div>
                                    </div>
                                    <div className='experienceInfo'>
                                        <div className='experienceRegion'>{ex.region?.ad1 || ''}</div>
                                        <div className='productName'>{ex.name}</div>
                                        <div className='productDesc'>{ex.content}</div>
                                        <div className='productPrice'>
                                            <span className='priceOriginal'>{new Intl.NumberFormat('ko-KR').format(ex.price1)}원</span>
                                            <span className='priceAmount'>{new Intl.NumberFormat('ko-KR').format(ex.price2)}원</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </section>
        </div>

        <Footer />
    </div>
  )
}

export default Main