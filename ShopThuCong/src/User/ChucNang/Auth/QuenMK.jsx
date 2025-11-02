import React, { useState } from "react";
import Swal from "sweetalert2";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";

export default function QuenMatKhau() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Đã gửi liên kết đặt lại mật khẩu!",
          text: "Kiểm tra email để lấy link đặt lại.",
          confirmButtonColor: "#a855f7",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Không tìm thấy tài khoản",
          text: data.message,
          confirmButtonColor: "#a855f7",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi kết nối",
        text: "Không thể kết nối đến server.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-100 via-white to-purple-100">
      <Header />
      <main className="flex-grow flex justify-center items-center px-4 py-10">
        <div className="bg-white w-full max-w-md shadow-2xl rounded-2xl p-8 border border-gray-100 animate-fadeIn">
          <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">
            Quên Mật Khẩu
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Nhập email đăng ký của bạn"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-t from-purple-800 via-purple-500 to-purple-400 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg"
            >
              Gửi liên kết đặt lại
            </button>
          </form>
          <p className="text-center mt-5 text-gray-600">
            Nhớ lại mật khẩu?{" "}
            <a href="/auth" className="text-purple-700 hover:underline font-medium">
              Đăng nhập
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
