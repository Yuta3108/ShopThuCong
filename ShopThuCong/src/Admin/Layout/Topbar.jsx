import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";

export default function Topbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md mb-6 border border-gray-100">
      {/* Tiêu đề */}
      <h2 className="text-xl font-bold text-teal-600 tracking-wide">
        Dashboard Overview
      </h2>

      {/* Ô tìm kiếm */}
      <div className="flex items-center bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full w-[480px] transition-all shadow-inner">
        <Search size={18} className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Tìm kiếm dữ liệu, báo cáo, người dùng..."
          className="bg-transparent outline-none text-gray-700 w-full placeholder-gray-500"
        />
      </div>

      {/* Thông tin user bên phải */}
      {user && (
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all">
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
      )}
    </div>
  );
}
