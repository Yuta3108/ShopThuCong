import React, { useEffect, useState } from "react";
import { Home, BarChart3, Settings } from "lucide-react";

export default function Sidebar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="w-64 min-h-screen bg-gray-900 text-gray-200 p-4 flex flex-col justify-between">
      {/* Phần menu */}
      <div>
        <h1 className="text-xl font-bold mb-6">Admin Panel</h1>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 hover:text-white cursor-pointer">
            <Home size={18}/> Dashboard
          </li>
          <li className="flex items-center gap-3 hover:text-white cursor-pointer">
            <BarChart3 size={18}/> Reports
          </li>
          <li className="flex items-center gap-3 hover:text-white cursor-pointer">
            <Settings size={18}/> Settings
          </li>
        </ul>
      </div>

      {/* Phần hiển thị thông tin user */}
      {user && (
        <div className="border-t border-gray-700 pt-4 mt-4">
          <div className="flex items-center gap-3">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.hoTen || user.name || "User")}&background=10b981&color=fff`}
              alt="avatar"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-sm font-semibold">{user.hoTen || user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* nút đăng xuất */}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/"; // quay về trang chủ
            }}
            className="mt-3 text-xs text-red-400 hover:text-red-300"
          >
            Đăng xuất
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-6 text-center">© 2025 ShopThuCong</p>
    </div>
  );
}
