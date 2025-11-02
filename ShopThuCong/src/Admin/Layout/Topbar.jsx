import React, { useEffect, useState } from "react";
import { Search, LogOut, X, AlertTriangle, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Topbar({ onToggleSidebar }) {
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogoutConfirm = () => {
    localStorage.clear();
    setShowLogoutModal(false);
    navigate("/"); // quay về trang chủ
  };

  return (
    <>
      {/* ======= THANH TOPBAR ======= */}
      <div className="flex flex-wrap justify-between items-center bg-white p-3 sm:p-4 rounded-xl shadow-md mb-6 border border-gray-100 animate-fadeSlide">
        {/* Nút mở sidebar khi mobile */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-gray-600 hover:text-teal-600 transition p-2"
        >
          <Menu size={22} />
        </button>

        {/* Tiêu đề */}
        <h2 className="text-lg sm:text-xl font-bold text-teal-600 tracking-wide">
          Dashboard Overview
        </h2>

        {/* Ô tìm kiếm */}
        <div className="flex items-center bg-gray-100 hover:bg-gray-200 px-3 sm:px-4 py-2 rounded-full w-full sm:w-72 md:w-96 lg:w-[420px] transition-all shadow-inner mt-3 sm:mt-0">
          <Search size={18} className="text-gray-500 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Tìm kiếm dữ liệu, báo cáo, người dùng..."
            className="bg-transparent outline-none text-gray-700 w-full placeholder-gray-500 text-sm"
          />
        </div>

        {/* Thông tin user + Đăng xuất */}
        {user && (
          <div className="flex items-center gap-3 sm:gap-4 bg-gray-50 px-3 sm:px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all mt-3 sm:mt-0">
            {/* Avatar + Info */}
            <div className="flex items-center gap-3">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.hoTen || user.name || "User"
                )}&background=14b8a6&color=fff`}
                alt="avatar"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-teal-400"
              />
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-gray-800 leading-tight truncate max-w-[120px]">
                  {user.hoTen || user.name}
                </span>
                <span className="text-xs text-gray-500 truncate max-w-[140px]">
                  {user.email}
                </span>
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

      {/* ======= POPUP XÁC NHẬN ĐĂNG XUẤT ======= */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[999] animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-sm animate-scaleUp relative">
            {/* Nút đóng */}
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center space-y-4 mt-2">
              <AlertTriangle size={44} className="text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-800">
                Xác nhận đăng xuất
              </h3>
              <p className="text-gray-500 text-sm">
                Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?
              </p>

              <div className="flex gap-3 mt-5">
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
