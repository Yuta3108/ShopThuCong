import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useNavigate } from "react-router-dom";

import BarChart from "../Chart/BarChart";
import LineChart from "../Chart/LineChart";
import KPIcard from "../Chart/KPIcard";

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  const navigate = useNavigate();

  // ================= CHECK TOKEN =================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // test decode xem token có hợp lệ không
      JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, []);

  const KPIS = [
    { title: "Tổng doanh thu", value: "32.5M", badge: "+12% so với tháng trước" },
    { title: "Đơn hàng", value: "1,284", badge: "+4.5% so với tháng trước" },
    { title: "Khách hàng", value: "872", badge: "+22 khách mới" },
    { title: "Tỷ lệ chuyển đổi", value: "6.4%", badge: "+0.7%" },
  ];

  return (
    <div className="flex bg-[#F5F5F5] min-h-screen">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 ml-64 flex flex-col">
        <Topbar />

        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Tổng quan hoạt động của cửa hàng hôm nay
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
              {KPIS.map((kpi, i) => (
                <KPIcard 
                  key={i}
                  title={kpi.title}
                  value={kpi.value}
                  badge={kpi.badge}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-[350px] flex flex-col">
                <h3 className="text-sm font-semibold text-slate-800 mb-1">Doanh thu theo tháng</h3>
                <p className="text-xs text-slate-500 mb-3">Biểu đồ đường minh hoạ</p>
                <div className="flex-1 min-h-[240px]">
                  <LineChart />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-[350px] flex flex-col">
                <h3 className="text-sm font-semibold text-slate-800 mb-1">Lượt truy cập website</h3>
                <p className="text-xs text-slate-500 mb-3">Biểu đồ cột minh hoạ</p>
                <div className="flex-1 min-h-[240px]">
                  <BarChart />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-[340px]">
              <h3 className="text-sm font-semibold text-slate-800 mb-1">Sản phẩm bán chạy</h3>
              <p className="text-xs text-slate-500 mb-4">Top sale sản phẩm</p>

              <div className="flex flex-col gap-4 text-sm text-slate-700">
                <div className="flex justify-between"><span>Bộ kim chỉ mini</span><span className="font-semibold">524 sp</span></div>
                <div className="flex justify-between"><span>Thước đo len</span><span className="font-semibold">312 sp</span></div>
                <div className="flex justify-between"><span>Kéo cắt giấy</span><span className="font-semibold">280 sp</span></div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
