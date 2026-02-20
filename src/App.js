import { Route, Routes, useLocation } from 'react-router-dom';

import Chatbot from './component/Chatbot.js';
import Login from './component/member/Login';
import Join from './component/member/Join';
import Main from './component/Main'
import ExperienceList from './component/product/ExperienceList'
import HotelDetail from './component/hotel/HotelDetail';
import HotelList from './component/product/HotelList';
import TransList from './component/product/TransList';
import FindAccount from './component/member/FindAccount';
import FindPassword from './component/member/FindPassword';
import ResetPassword from './component/member/ResetPassword';
import Cart from './component/order/Cart'
import QnaList from './component/customer/QnaList'
import QnaDetail from './component/customer/QnaDetail';
import NoticeList from './component/customer/NoticeList'
import NoticeDetail from './component/customer/NoticeDetail';
import AdminRoute from './component/admin/AdminRoute.js';
import Admin from './component/admin/Admin';
import NotAuthorized from './component/admin/NotAuthorized.js';
import EReviewList from './component/product/EReviewList';
import Order from './component/order/Order';
import OrderDetail from './component/order/OrderDetail';
import MyPage from './component/member/MyPage';
import EditMember from './component/member/EditMember';
import Package from './component/package/Package';
import HReviewList from './component/product/HReviewList';
import TReviewList from './component/product/TReviewList.js';
import ReviewBox from './component/member/ReviewBox.js';
import ExperienceDetail from './component/product/ExperienceDetail.js';
import KakaoIdLogin from './component/member/KakaoIdLogin.js';
import AdminMember from './component/admin/AdminMember.js';
import AdminEProduct from './component/admin/AdminProduct.js';
import AdminEProductDetail from './component/admin/AdminEProductDetail.js';
import AdminEProductInsert from './component/admin/AdminEProductInsert.js';
import AdminHProduct from './component/admin/AdminHProduct.js';
import AdminHProductDetail from './component/admin/AdminHProductDetail.js';
import AdminHProductInsert from './component/admin/AdminHProductInsert.js';
import AdminTProduct from './component/admin/AdminTProduct.js';
import AdminTProductDetail from './component/admin/AdminTProductDetail.js';
import AdminTProductInsert from './component/admin/AdminTProductInsert.js';
import AdminNotice from './component/admin/notice/AdminNotice.js';
import AdminNoticeDetail from './component/admin/notice/AdminNoticeDetail.js';
import AdminNoticeWrite from './component/admin/notice/AdminNoticeWrite.js';
import AdminNoticeEdit from './component/admin/notice/AdminNoticeEdit.js';
import GoSerchResult from './component/admin/GoSerchResult.js';
import TopCitiesWithProducts from './component/product/TopCitiesWithProducts.js';
import TransDetail from './component/trans/TransDetail.js';
import SelectTranse from './component/package/SelectTranse.js';
import SelectHotel from './component/package/SelectHotel.js';
import SelectEx from './component/package/SelectEx.js';
import OrderForCart from './component/order/OrderForCart.js';
import ReviewWriteForm from './component/member/ReviewWriteForm.js';
import GoLogin from './component/package/GoLogin.js';
import GoCartForPackage from './component/order/OrderForPackage.js';
import ConfirmPackage from './component/package/ConfirmPackage.js';
import SelectEndTranse from './component/package/selectEndTranse.js'
import NotFound from './component/NotFound.js';



function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="App">
      {!isAdmin && <Chatbot />}
      <Routes>
        {/* MEMBER route */}
        <Route path='/' element={<Package />} />
        <Route path='/main' element={<Main />} />
        <Route path='/login' element={<Login />} />
        <Route path='/kakaoIdLogin/:userid' element={<KakaoIdLogin />} />
        <Route path='/join' element={<Join />} />
        <Route path='/findAccount' element={<FindAccount />} />
        <Route path='/findPassword' element={<FindPassword />} />
        <Route path='/resetPassword/:resetToken' element={<ResetPassword />} />
        <Route path='/mypage' element={<MyPage />} />
        <Route path='/editmember' element={<EditMember />} />
        <Route path='/reviewWriteForm/:oid' element={<ReviewWriteForm />} />
        <Route path='/reviewBox' element={<ReviewBox />} />

        {/* PRODUCT route */}
        <Route path='/ExperienceList' element={<ExperienceList />} />
        <Route path='/TransList' element={<TransList />} />
        <Route path='/HotelList' element={<HotelList />} />
        <Route path='/hotelDetail/:hid' element={<HotelDetail />} />
        <Route path='/package' element={<Package />} />
        <Route path='/experienceDetail/:eid' element={<ExperienceDetail />} />
        <Route path='/TopCitiesWithProducts' element={<TopCitiesWithProducts />} />
        <Route path='/transDetail/:tid' element={<TransDetail />} />

        {/* ORDER route */}
        <Route path='/cart' element={<Cart />} />
        <Route path='/order' element={<Order />} />
        <Route path='/orderDetail/:oid' element={<OrderDetail />} />
        <Route path='/orderForCart' element={<OrderForCart />} />
        <Route path='/goCartForPackage' element={<GoCartForPackage />} />
        
        {/* CUSTOMER route */}
        <Route path='/QnaList' element={<QnaList />} />
        <Route path="/QnaDetail/:qid" element={<QnaDetail />} />
        <Route path='/NoticeList' element={<NoticeList />} />
        <Route path='/NoticeDetail/:nid' element={<NoticeDetail />} />

        {/* Package route */}
        <Route path='/selectTranse' element={<SelectTranse />} />
        <Route path='/selectHotel' element={<SelectHotel />} />
        <Route path='/selectEx' element={<SelectEx />} />
        <Route path='/goLogin' element={<GoLogin />} />confirmPackage
        <Route path='/confirmPackage' element={<ConfirmPackage />} />
        <Route path='/selectendtrans' element={<SelectEndTranse />} />

        <Route path='/EReviewList' element={<EReviewList />} />
        <Route path='/HReviewList' element={<HReviewList />} />
        <Route path='/TReviewList' element={<TReviewList />} />
        

        <Route path="/admin" element={<AdminRoute />}>
          <Route index element={<AdminMember />} />
          <Route path="/admin/member" element={<AdminMember />} />
          <Route path='/admin/adminEProduct' element={<AdminEProduct />} />
          <Route path='/admin/adminEProductDetail/:eid' element={<AdminEProductDetail />} />
          <Route path='/admin/adminHProduct' element={<AdminHProduct />} />
          <Route path='/admin/adminHProductDetail/:hid' element={<AdminHProductDetail />} />
          <Route path='/admin/adminTProduct' element={<AdminTProduct />} />
          <Route path='/admin/adminTProductDetail/:tid' element={<AdminTProductDetail />} />
          <Route path='/admin/adminEProductInsert' element={<AdminEProductInsert />} />
          <Route path='/admin/adminTProductInsert' element={<AdminTProductInsert />} />
          <Route path='/admin/adminHProductInsert' element={<AdminHProductInsert />} />
          
          <Route path="/admin/notice" element={<AdminNotice />} />
          <Route path="/admin/noticeDetail/:nid" element={<AdminNoticeDetail />} />
          <Route path="/admin/noticeWrite" element={<AdminNoticeWrite />} />
          <Route path="/admin/noticeEdit/:nid" element={<AdminNoticeEdit />} />
          <Route path="/admin/goSerchResult" element={<GoSerchResult />} />
        </Route>
        <Route path='/notAuthorized' element={<NotAuthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
