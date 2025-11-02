import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";

function DangKy() {
  const [ho, setHo] = useState("");
  const [ten, setTen] = useState("");
  const [email, setEmail] = useState("");
  const [sdt, setSdt] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Kiểm tra ràng buộc dữ liệu
    if (!/[a-zA-Z]/.test(matKhau) || matKhau.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "Mật khẩu không hợp lệ",
        text: "Mật khẩu phải có ít nhất 8 ký tự và chứa ít nhất một chữ cái.",
        confirmButtonColor: "#a855f7",
      });
      return;
    }

    if (!/^\d{10,11}$/.test(sdt)) {
      Swal.fire({
        icon: "warning",
        title: "Số điện thoại không hợp lệ",
        text: "Số điện thoại chỉ được chứa số và có 10–11 chữ số.",
        confirmButtonColor: "#a855f7",
      });
      return;
    }

    if (!ho.trim() || !ten.trim() || !diaChi.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin!",
        text: "Vui lòng điền đầy đủ họ, tên và địa chỉ.",
        confirmButtonColor: "#a855f7",
      });
      return;
    }

    const tenKhachHang = `${ho} ${ten}`.trim();
    const data = { tenKhachHang, email, matKhau, sdt, diaChi };

    try {
      const response = await fetch(`https://backend-eta-ivory-29.vercel.app/api/dangky`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Đăng ký thành công!",
          text: "Bạn có thể đăng nhập ngay bây giờ.",
          showConfirmButton: false,
          timer: 1500,
        });
        setTimeout(() => navigate("/auth"), 1500);
      } else {
        Swal.fire({
          icon: "error",
          title: "Đăng ký thất bại",
          text: resData.message || "Email đã tồn tại, vui lòng thử lại.",
          confirmButtonColor: "#a855f7",
        });
      }
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi kết nối máy chủ",
        text: "Không thể kết nối đến server. Vui lòng thử lại sau.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-100 via-white to-purple-100">
      <Header />

      <main className="flex-grow flex justify-center items-center py-10 px-4">
        <div
          className="bg-white w-full max-w-md shadow-2xl rounded-2xl p-8 border border-gray-100 
          animate-fadeIn transform transition-all duration-700 ease-out hover:scale-[1.02]"
        >
          <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">
            Đăng Ký Tài Khoản
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Họ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:outline-none"
                value={ho}
                onChange={(e) => setHo(e.target.value)}
              />
              <input
                type="text"
                placeholder="Tên"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:outline-none"
                value={ten}
                onChange={(e) => setTen(e.target.value)}
              />
            </div>

            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Số điện thoại"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:outline-none"
              value={sdt}
              onChange={(e) => setSdt(e.target.value)}
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:outline-none"
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600"
              >
                <span className="text-xl select-none">
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </button>
            </div>

            <input
              type="text"
              placeholder="Địa chỉ"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:outline-none"
              value={diaChi}
              onChange={(e) => setDiaChi(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-t from-purple-800 via-purple-500 to-purple-400 
                         text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg"
            >
              Đăng Ký
            </button>
          </form>

          <div className="text-center mt-5 text-gray-600">
            <p>
              Đã có tài khoản?{" "}
              <Link
                to="/auth"
                className="text-purple-700 hover:underline font-medium"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default DangKy;
