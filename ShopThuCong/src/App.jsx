import TrangChu from './User/TrangChu'
import DangNhap from './User/ChucNang/Auth/DangNhap';
import { Routes, Route } from "react-router-dom";
import DangKy from './User/ChucNang/Auth/DangKy';
import LienHe from './User/Layout/Lienhe';
import DashBoard from './Admin/Layout/DashBoard';
import AdminUserPage from './Admin/UserManage/AdminUser';
import UserProfile from './User/ChucNang/Auth/ProfileUser';
function App() {
  return (
    
    <Routes>
      //== User Routes ==//
      <Route path="/" element={<TrangChu />} />
      <Route path="/auth" element={<DangNhap/>} />
      <Route path="/register" element={<DangKy />} />
      <Route path="/Lien-he" element={<LienHe />} />
      <Route path='/User' element={<UserProfile/>} />
      //== Admin Routes ==// 
      <Route path='/admin' element={<DashBoard/>} />
      <Route path="/admin/users" element={<AdminUserPage />} />
    </Routes>
  );
}

export default App;
