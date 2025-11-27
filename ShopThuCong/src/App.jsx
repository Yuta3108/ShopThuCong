import TrangChu from './User/TrangChu'
import DangNhap from './User/ChucNang/Auth/DangNhap';
import { Routes, Route } from "react-router-dom";
import DangKy from './User/ChucNang/Auth/DangKy';
import LienHe from './User/Layout/Lienhe';
import QuenMatKhau from './User/ChucNang/Auth/QuenMK';
import DatLaiMatKhau from './User/ChucNang/Auth/ResetPass';
import UserProfile from './User/ChucNang/Auth/ProfileUser';
import DashBoard from './Admin/Layout/DashBoard';
import AdminUserPage from './Admin/Pages/AdminUser';
import ProductManagement from './Admin/Pages/ProductManagement';
import ProductCategoryPage from './User/ChucNang/Products/ProductCategoryPage';
import ProductAllPage from './User/ChucNang/Products/ProductAllPage';
import ProductDetailPage from './User/ChucNang/Products/ProductDetailPage';
import CartPage from './User/ChucNang/Cart/Cart';
import AdminVoucherPage from './Admin/Pages/AdminVoucher';
import Checkout from './User/ChucNang/Cart/Checkout';
import AdminOrderPage from './Admin/Pages/AdminOrder';
function App() {
  return (
    
    <Routes>
      //== User Routes ==//
      <Route path="/" element={<TrangChu />} />
      <Route path="/login" element={<DangNhap/>} />
      <Route path="/register" element={<DangKy />} />
      <Route path="/Lien-he" element={<LienHe />} />
      <Route path='/User' element={<UserProfile/>} />
      <Route path="/forgot-password" element={<QuenMatKhau />} />
      <Route path="/reset-password/:token" element={<DatLaiMatKhau />} />
      <Route path="/san-pham/:slug" element={<ProductCategoryPage />} />
      <Route path="/san-pham" element={<ProductAllPage />} />
      <Route path="/chi-tiet/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path='/checkout' element={<Checkout />} />
      //== Admin Routes ==// 
      <Route path='/admin' element={<DashBoard/>} />
      <Route path="/admin/users" element={<AdminUserPage />} />
      <Route path ="/admin/Products" element={<ProductManagement />} />
      <Route path="/admin/Voucher" element={<AdminVoucherPage />} />
      <Route path="/admin/Order" element={<AdminOrderPage />}/>
    </Routes>
  );
}

export default App;
