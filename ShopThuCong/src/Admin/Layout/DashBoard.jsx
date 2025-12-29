import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import LineChart from "../Chart/LineChart";
import KPIcard from "../Chart/KPIcard";
import PieChart from "../Chart/Piechart";

// ================= AXIOS CLIENT =================
const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api",
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [topProducts, setTopProducts] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const toggleSidebar = (state) =>
    setIsOpen(state !== undefined ? state : !isOpen);
  
  const navigate = useNavigate();
  // ================= CHECK TOKEN =================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, []);
  
  // ================= FETCH KPI =================
  useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const [summaryRes, topProductsRes] = await Promise.all([
        axiosClient.get("/orders/dashboard-summary"),
        axiosClient.get("/orders/top-selling-products"),
      ]);

      // KPI summary
      setSummary(summaryRes.data.data);

      // Top products
      setTopProducts(topProductsRes.data.data || []);
    } catch (err) {
      console.error("Fetch dashboard data error:", err);
    } finally {
      setLoadingSummary(false);
      setLoadingTop(false);
    }
  };

  fetchDashboardData();
}, []);
  return (
    <div className="flex bg-[#F5F5F5] min-h-screen">
      {/* SIDEBAR */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* CONTENT */}
      <div className="flex-1 md:ml-64 flex flex-col transition-all">
        {/* TOPBAR */}
        <Topbar />

        {/* PAGE BODY */}
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* TITLE */}
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Tổng quan hoạt động của cửa hàng hôm nay
            </p>

            {/* ================= KPI CARDS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              <KPIcard
                  title="Tổng doanh thu"
                  value={
                    loadingSummary || !summary
                      ? "—"
                      : new Intl.NumberFormat("vi-VN").format(summary.totalRevenue)
                  }
                  subText={
                    typeof summary?.revenueGrowth === "number"
                      ? `${summary.revenueGrowth >= 0 ? "+" : ""}${summary.revenueGrowth}% so với tháng trước`
                      : "—"
                  }
                  loading={loadingSummary}
                />


              <KPIcard
                title="Đơn hàng"
                value={loadingSummary || !summary ? "—" : summary.totalOrders}
                subText={
                  typeof summary?.orderGrowth === "number"
                    ? `${summary.orderGrowth >= 0 ? "+" : ""}${summary.orderGrowth}% so với tháng trước`
                    : "—"
                }
                loading={loadingSummary}
              />

              <KPIcard
                title="Khách hàng"
                value={loadingSummary ? "—" : summary.totalCustomers}
                loading={loadingSummary}
              />

              <KPIcard
                title="Đơn Hàng Hôm Nay"
                value={
                  loadingSummary ? "—" : `${summary.todayOrders}`
                }
                loading={loadingSummary}
              />
            </div>

            {/* ================= CHARTS ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-[350px] flex flex-col">
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  Doanh thu theo tháng
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Biểu đồ đường 
                </p>

                <div className="flex-1 min-h-[240px]">
                  <LineChart />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-[350px] flex flex-col">
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  Trạng thái đơn hàng
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Biểu đồ tròn 
                </p>

                <div className="flex-1 min-h-[240px]">
                  <PieChart />
                </div>
              </div>
            </div>

            {/* ================= BEST SELLER ================= */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-1">
                Sản phẩm bán chạy
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Top sale sản phẩm
              </p>

              {loadingTop ? (
                <p className="text-sm text-slate-400">Đang tải dữ liệu...</p>
              ) : topProducts.length === 0 ? (
                <p className="text-sm text-slate-400">Chưa có dữ liệu</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {topProducts.map((p) => (
                    <div
                      key={p.productId}
                      className="flex items-center justify-between gap-4"
                    >
                      {/* LEFT */}
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl || "https://via.placeholder.com/40"}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border"
                        />
                        <span className="text-sm text-slate-800">
                          {p.name}
                        </span>
                      </div>

                      {/* RIGHT */}
                      <span className="text-sm font-semibold text-slate-900">
                        {p.sold} sp
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
