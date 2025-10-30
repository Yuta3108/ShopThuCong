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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      setIsAdmin(false);
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-[#EDEDED] relative">
      <Sidebar />
      <div className="flex-1 p-6">
        <Topbar />

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPIcard title="Today's Money" value="$53k" badge="+55% than last week" />
          <KPIcard title="Today's Users" value="2,300" badge="+3% than last month" />
          <KPIcard title="New Clients" value="3,462" badge="-2% than yesterday" />
          <KPIcard title="Sales" value="$103,430" badge="+5% than yesterday" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100"><BarChart /></div>
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100"><LineChart /></div>
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100"><LineChart /></div>
        </div>
      </div>

      {/*Popup cảnh báo nếu không phải admin */}
      {!isAdmin && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-[420px] text-center">
            <h2 className="text-3xl font-bold text-red-500 mb-3">Không có quyền truy cập</h2>
            <p className="text-gray-600 mb-6">
              Tài khoản của bạn không có quyền truy cập vào trang quản trị.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
            >
              Quay lại Trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
