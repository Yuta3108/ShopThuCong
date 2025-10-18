import React, { useEffect, useState } from "react";
import { Search, LogOut, X, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogoutConfirm = () => {
    localStorage.clear();
    setShowLogoutModal(false);
    navigate("/"); // quay về trang chủ
  };

  return (
    <>
      {/* ======= THANH TOPBAR ======= */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md mb-6 border border-gray-100">
        {/* Tiêu đề */}
        <h2 className="text-xl font-bold text-teal-600 tracking-wide">
          Dashboard Overview
        </h2>

        {/* Ô tìm kiếm */}
        <div className="flex items-center bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full w-60 sm:w-72 md:w-96 lg:w-[420px] transition-all shadow-inner">
          <Search size={18} className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Tìm kiếm dữ liệu, báo cáo, người dùng..."
            className="bg-transparent outline-none text-gray-700 w-full placeholder-gray-500"
          />
        </div>

        {/* Thông tin user + Đăng xuất */}
        {user && (
          <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all">
            {/* Avatar + Info */}
            <div className="flex items-center gap-3">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.hoTen || user.name || "User"
                )}&background=14b8a6&color=fff`}
                alt="avatar"
                className="w-10 h-10 rounded-full border border-gray-300"
              />
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-gray-800 leading-tight">
                  {user.hoTen || user.name}
                </span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
            </div>

            {/* Nút đăng xuất */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-all text-sm font-medium"
              title="Đăng xuất"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        )}
      </div>

      {/* ======= POPUP XÁC NHẬN ======= */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[999]">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-sm animate-scaleIn relative">
            {/* Nút đóng */}
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center space-y-4 mt-2">
              <AlertTriangle size={40} className="text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-800">
                Xác nhận đăng xuất
              </h3>
              <p className="text-gray-500 text-sm">
                Bạn có chắc muốn đăng xuất khỏi tài khoản này không?
              </p>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
