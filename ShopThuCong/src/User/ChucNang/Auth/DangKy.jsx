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

    if (!/[a-zA-Z]/.test(matKhau) || matKhau.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "Mật khẩu không hợp lệ",
        text: "Mật khẩu phải có ít nhất 8 ký tự và chứa ít nhất một chữ cái.",
        confirmButtonColor: "#fb7185",
      });
      return;
    }

    if (!/^\d{10,11}$/.test(sdt)) {
      Swal.fire({
        icon: "warning",
        title: "Số điện thoại không hợp lệ",
        text: "Số điện thoại chỉ được chứa số và có 10–11 chữ số.",
        confirmButtonColor: "#fb7185",
      });
      return;
    }

    if (!ho.trim() || !ten.trim() || !diaChi.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin!",
        text: "Vui lòng điền đầy đủ họ, tên và địa chỉ.",
        confirmButtonColor: "#fb7185",
      });
      return;
    }

    const tenKhachHang = `${ho} ${ten}`.trim();
    const data = { tenKhachHang, email, matKhau, sdt, diaChi };

    try {
      const response = await fetch(
        `https://backend-eta-ivory-29.vercel.app/api/dangky`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const resData = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Đăng ký thành công!",
          text: "Vui Lòng Check Email để xác thực Email",
          showConfirmButton: false,
          timer: 1500,
        });
        setTimeout(() => navigate("/login"), 1500);
      } else {
        Swal.fire({
          icon: "error",
          title: "Đăng ký thất bại",
          text: resData.message || "Email đã tồn tại, vui lòng thử lại.",
          confirmButtonColor: "#fb7185",
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
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />

      <main className="flex-grow flex justify-center items-center py-10 px-4">
        <div
          className="bg-white w-full max-w-md shadow-[0_18px_45px_rgba(15,23,42,0.12)] rounded-3xl p-8 
                     border border-slate-200 animate-fadeIn transform transition-all duration-700 ease-out 
                     hover:-translate-y-1"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center text-rose-500 mb-2">
            Đăng ký tài khoản
          </h2>
          <p className="text-xs text-center text-slate-500 mb-6 uppercase tracking-[0.22em]">
            ThenFong Store
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Họ"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm 
                           focus:ring-2 focus:ring-rose-200 focus:border-rose-400 focus:outline-none"
                value={ho}
                onChange={(e) => setHo(e.target.value)}
              />
              <input
                type="text"
                placeholder="Tên"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm 
                           focus:ring-2 focus:ring-rose-200 focus:border-rose-400 focus:outline-none"
                value={ten}
                onChange={(e) => setTen(e.target.value)}
              />
            </div>

            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm 
                         focus:ring-2 focus:ring-rose-200 focus:border-rose-400 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Số điện thoại"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm 
                         focus:ring-2 focus:ring-rose-200 focus:border-rose-400 focus:outline-none"
              value={sdt}
              onChange={(e) => setSdt(e.target.value)}
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm 
                           focus:ring-2 focus:ring-rose-200 focus:border-rose-400 focus:outline-none"
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
              >
                <span className="text-xl select-none">
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </button>
            </div>

            <input
              type="text"
              placeholder="Địa chỉ"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm 
                         focus:ring-2 focus:ring-rose-200 focus:border-rose-400 focus:outline-none"
              value={diaChi}
              onChange={(e) => setDiaChi(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full 
                         font-semibold text-sm shadow-md hover:shadow-lg transition-all"
            >
              Đăng ký
            </button>
          </form>

          <div className="text-center mt-5 text-slate-600 text-sm">
            <p>
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-rose-500 hover:text-rose-600 hover:underline font-medium"
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
