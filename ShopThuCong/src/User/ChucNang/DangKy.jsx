import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Layout/Header";
import Footer from "../Layout/Footer";

function DangKy() {
  const [ho, setHo] = useState("");
  const [ten, setTen] = useState("");
  const [email, setEmail] = useState("");
  const [sdt, setSdt] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/[a-zA-Z]/.test(matKhau) || matKhau.length < 8) {
      setError("Mật khẩu phải có chữ và ít nhất 8 ký tự.");
      return;
    }
    if (!/^\d{10,11}$/.test(sdt)) {
      setError("Số điện thoại phải gồm 10 đến 11 chữ số.");
      return;
    }

    const tenKhachHang = `${ho} ${ten}`.trim();
    const data = { tenKhachHang, email, matKhau, sdt, diaChi };

    try {
      const response = await fetch(`https://backend-eta-ivory-29.vercel.app/api/khachhang/dangky`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Đăng ký thành công!");
        navigate("/auth");
      } else {
        const err = await response.json();
        setError(err.message || "Đăng ký thất bại. Có thể email đã tồn tại.");
      }
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      setError("Lỗi kết nối đến máy chủ.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-100 via-white to-purple-100">
      {/* Header */}
      <Header />

      {/* Nội dung chính */}
      <main className="flex-grow flex justify-center items-center py-10 px-4">
        <div className="bg-white w-full max-w-md shadow-2xl rounded-2xl p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">
            Đăng Ký Tài Khoản
          </h2>

          {error && (
            <p className="text-red-600 mb-4 text-center text-sm font-medium">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Họ"
                className="w-full px-4 py-2 border rounded-md mb-4"
                value={ho}
                onChange={(e) => setHo(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Tên"
                className="w-full px-4 py-2 border rounded-md mb-4"
                value={ten}
                onChange={(e) => setTen(e.target.value)}
                required
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
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:opacity-90 transition duration-200 shadow-md"
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

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default DangKy;
