import React, { useState } from "react";
import Swal from "sweetalert2";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";

export default function QuenMatKhau() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "https://backend-eta-ivory-29.vercel.app/api/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Đã gửi liên kết đặt lại mật khẩu!",
          text: "Kiểm tra email để lấy link đặt lại.",
          confirmButtonColor: "#fb7185",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Không tìm thấy tài khoản",
          text: data.message,
          confirmButtonColor: "#fb7185",
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
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-grow flex justify-center items-center px-4 py-10">
        <div className="bg-white w-full max-w-md shadow-[0_18px_45px_rgba(15,23,42,0.12)] rounded-3xl p-8 border border-slate-200 animate-fadeIn">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-rose-500 mb-2">
            Quên mật khẩu
          </h2>
          <p className="text-xs text-center text-slate-500 mb-6">
            Nhập email đăng ký để nhận liên kết đặt lại mật khẩu
          </p>
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <input
              type="email"
              placeholder="Email của bạn"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Gửi liên kết đặt lại
            </button>
          </form>
          <p className="text-center mt-5 text-slate-600 text-sm">
            Nhớ lại mật khẩu?{" "}
            <a
              href="/login"
              className="text-rose-500 hover:text-rose-600 hover:underline font-medium"
            >
              Đăng nhập
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
