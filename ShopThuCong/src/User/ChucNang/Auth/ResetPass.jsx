import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";

export default function DatLaiMatKhau() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Mật khẩu không khớp!",
        confirmButtonColor: "#fb7185",
      });
      return;
    }
    try {
      const res = await fetch(
        "https://backend-eta-ivory-29.vercel.app/api/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Đặt lại mật khẩu thành công!",
          text: "Bây giờ bạn có thể đăng nhập lại.",
          showConfirmButton: false,
          timer: 1500,
        });
        setTimeout(() => navigate("/login"), 1500);
      } else {
        Swal.fire({
          icon: "error",
          title: "Token không hợp lệ hoặc đã hết hạn",
          text: data.message,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi kết nối máy chủ",
        text: "Vui lòng thử lại sau.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-grow flex justify-center items-center px-4 py-10">
        <div className="bg-white w-full max-w-md shadow-[0_18px_45px_rgba(15,23,42,0.12)] rounded-3xl p-8 border border-slate-200 animate-fadeIn">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-rose-500 mb-6">
            Đặt lại mật khẩu
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 focus:outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-400 focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Xác nhận
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
