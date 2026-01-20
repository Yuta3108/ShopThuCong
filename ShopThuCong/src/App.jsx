import { Routes, Route } from "react-router-dom";
import TrangChu from './User/TrangChu'
import DangNhap from './User/ChucNang/Auth/DangNhap';
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
import XacThucEmail from './User/ChucNang/Auth/XacThucEmail'
import AdminCategories from './Admin/Pages/AdminCategories'
import Paymentsuccess from './User/ChucNang/Cart/paymentsuccess';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
const ONE_DAY=1000*60*60*24;
function App() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const logout = () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("cartMode");
      localStorage.removeItem("lastActiveTime");
      Swal.fire({
        title: "Phiên đăng nhập đã hết hạn",
        icon: "warning",
        confirmButtonText: "OK"
      });
      navigate("/login");
    };

    const updateLastActive = () => {
      localStorage.setItem("lastActiveTime", Date.now());
    };

    //  Check khi load app
    const lastActive = localStorage.getItem("lastActiveTime");
    if (lastActive && Date.now() - Number(lastActive) > ONE_DAY) {
      logout();
      return;
    }

    // Theo dõi hành vi người dùng
    ["mousemove", "keydown", "click", "scroll"].forEach((event) =>
      window.addEventListener(event, updateLastActive)
    );

    // Lần đầu vào app
    updateLastActive();
    return () => {
      ["mousemove", "keydown", "click", "scroll"].forEach((event) =>
        window.removeEventListener(event, updateLastActive)
      );
    };
  }, [navigate]);

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
      <Route path="/cart" element={<CartPage />} />
      <Route path='/checkout' element={<Checkout />} />
      <Route path="/verify-email/:token" element={<XacThucEmail />} />
      <Route path="/payment-success" element={<Paymentsuccess />} />
      <Route path="/chi-tiet/:categorySlug/:productCode" element={<ProductDetailPage />}/>
      //== Admin Routes ==// 
      <Route path='/admin' element={<DashBoard/>} />
      <Route path="/admin/users" element={<AdminUserPage />} />
      <Route path ="/admin/Products" element={<ProductManagement />} />
      <Route path="/admin/Voucher" element={<AdminVoucherPage />} />
      <Route path="/admin/Order" element={<AdminOrderPage />}/>
      <Route path="/admin/Categories" element={<AdminCategories />}/>
    </Routes>
  );
}

export default App;
