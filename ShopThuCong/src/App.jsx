import TrangChu from './User/TrangChu'
import DangNhap from './User/ChucNang/DangNhap';
import { Routes, Route } from "react-router-dom";
import DangKy from './User/ChucNang/DangKy';
import LienHe from './User/Layout/Lienhe';
import DashBoard from './Admin/Layout/DashBoard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<TrangChu />} />
      <Route path="/auth" element={<DangNhap/>} />
      <Route path="/register" element={<DangKy />} />
      <Route path="/Lien-he" element={<LienHe />} />
      <Route path='/admin' element={<DashBoard/>} />
    </Routes>
  );
}

export default App;
