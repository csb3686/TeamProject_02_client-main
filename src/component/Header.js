import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { logoutAction } from '../store/userSlice'
import { Cookies } from 'react-cookie';
import jaxios from '../util/JWTutil'

import '../css/header.css'

function Header() {

  const navigate = useNavigate();
  const loginUser = useSelector(state=>state.user);
  const cookies = new Cookies();
  const dispatch = useDispatch();

  const location = useLocation();

  const [cartCount, setCartCount] = useState(null);

  useEffect(() => {
    if (!loginUser?.userid) {
      setCartCount(0); // 로그인 안 된 상태면 0
      return;
    }

    jaxios.get('/api/cart/getCartCount', { params: { userid: loginUser.userid } })
      .then((result) => {
          setCartCount(result.data);
      })
      .catch((err) => console.error(err));
  }, [loginUser?.userid]);

  function isActive(paths) {
    const current = location.pathname.toLowerCase();

    // 문자열이면 배열로 변환
    const arr = Array.isArray(paths) ? paths : [paths];

    // 비교
    return arr.some(p => current.startsWith(p.toLowerCase()))
      ? 'active'
      : '';
  }

  function onLogout(){
    dispatch(logoutAction());
    cookies.remove('user')
    cookies.remove('redirectPage')
    navigate('/main')
  }

  function loginCheck(path){
    if(!loginUser || !loginUser.userid){
        alert('로그인이 필요한 서비스 입니다.');
        navigate('/login');
        return;
    }
    navigate(path);
}

  return (
    <div className='header'>
      <div className='headerCn'>
        <div className='logo' onClick={()=>{navigate('/main')}}>
          <img src='/images/logo.png' alt='로고'/>
        </div>
        <div className='subMenu'>
          <div className='topMenu'>
            <ul>
              {
                (loginUser.userid)?
                (<li onClick={()=>{onLogout();}}>로그아웃</li>):
                (
                  <>

                    <li onClick={()=>{navigate('/login')}}>로그인</li>
                    <li onClick={()=>{navigate('/join')}}>회원가입</li>
                  </>
                )
              }
              <li onClick={()=>{loginCheck('/QnaList')}}>고객센터</li>
            </ul>
          </div>
          <div className='bottomMenu'>
            <ul>
              {
                loginUser.userid && (
                  loginUser.role === 'ADMIN' ? (
                    <li
                      className='userGreeting adminBtn'
                      onClick={() => navigate('/admin/member')}
                    >
                      관리자 페이지
                    </li>
                  ) : (
                    <li
                      className='userGreeting'
                      onClick={() => navigate('/mypage')}
                    >
                      {loginUser.name} 님 어서오세요!
                    </li>
                  )
                )
              }

              <li className='iconBtn' onClick={()=>{loginCheck('/mypage')}} title='마이페이지'>
                <i className="far fa-user"></i>
              </li>
              <li className='iconBtn headerCart' onClick={()=>{loginCheck('/cart')}} title='장바구니'>
                <i className="fas fa-shopping-cart"></i>
                <span className='mainCartCount'>{cartCount || 0}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className='cateMenu'>
          <div className='gnbWrap'>
            <ul className='mainMenu'>
              <li className={isActive('/TopCitiesWithProducts')} onClick={() => navigate('/TopCitiesWithProducts')}>목적지</li>
              <li className={isActive(['/hotelList', '/HotelDetail'])} onClick={() => navigate('/hotelList')}>숙소</li>
              <li className={isActive(['/transList','/transDetail'])} onClick={() => navigate('/transList')}>교통</li>
              <li className={isActive(['/experienceList','/ExperienceDetail'])} onClick={() => navigate('/experienceList')}>투어/체험</li>
              <li className={isActive(['/EReviewList','/HReviewList','/TReviewList'])} onClick={() => navigate('/EReviewList')}>리뷰</li>
            </ul>
          </div>
      </div>
    </div>
  )
}

export default Header