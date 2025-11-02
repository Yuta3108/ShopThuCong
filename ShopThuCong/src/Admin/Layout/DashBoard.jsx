import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import KPIcard from "../Chart/KPIcard";
import LineChart from "../Chart/LineChart";
import BarChart from "../Chart/BarChart";

export default function DashBoard() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") setIsAdmin(false);

    // hiệu ứng fade-in
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#EDEDED] relative overflow-hidden">
      <Sidebar />

      <div
        className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-700 ${
          fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <Topbar />

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <KPIcard
            title="Doanh thu hôm nay"
            value="$53k"
            badge="+55% so với tuần trước"
          />
          <KPIcard
            title="Người dùng mới"
            value="2,300"
            badge="+3% so với tháng trước"
          />
          <KPIcard
            title="Khách hàng mới"
            value="3,462"
            badge="-2% so với hôm qua"
          />
          <KPIcard
            title="Doanh số bán"
            value="$103,430"
            badge="+5% so với hôm qua"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between">
            <h3 className="font-semibold text-gray-700 mb-3">Doanh thu theo tháng</h3>
            <BarChart />
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between">
            <h3 className="font-semibold text-gray-700 mb-3">Tăng trưởng người dùng</h3>
            <LineChart />
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between">
            <h3 className="font-semibold text-gray-700 mb-3">Doanh số theo danh mục</h3>
            <LineChart />
          </div>
        </div>
      </div>

      {/* 🧱 Popup cảnh báo quyền truy cập */}
      {!isAdmin && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-[90%] max-w-[420px] text-center animate-scaleUp">
            <h2 className="text-2xl sm:text-3xl font-bold text-red-500 mb-3">
              🚫 Không có quyền truy cập
            </h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Tài khoản của bạn không có quyền truy cập vào trang quản trị.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all text-sm sm:text-base"
            >
              Quay lại Trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
