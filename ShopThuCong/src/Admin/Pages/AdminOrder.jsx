import React, { useEffect, useState } from "react";
import Sidebar from "../Layout/Sidebar";
import axios from "axios";
import { Search, Pencil, Trash2, Eye } from "lucide-react";

import OrderDetailModal from "../Pages/Order/OrderDetailModal";
import OrderStatusModal from "../Pages/Order/OrderStatusModal";

const API = "https://backend-eta-ivory-29.vercel.app/api";

// AXIOS CLIENT
const axiosClient = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  const tk = localStorage.getItem("token");
  if (tk) config.headers.Authorization = `Bearer ${tk}`;
  return config;
});

export default function AdminOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [removing, setRemoving] = useState(null);

  // Popup trạng thái
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState(null);

  // Popup chi tiết
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // Protect route
  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-semibold">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axiosClient.get("/orders");
        setOrders(Array.isArray(data) ? data : data.orders || []);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Delete order
  const handleDelete = async (id) => {
    if (!window.confirm("Xoá đơn hàng này?")) return;

    setRemoving(id);
    setTimeout(async () => {
      await axiosClient.delete(`/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o.OrderID !== id));
      setRemoving(null);
    }, 200);
  };

  // Update status
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put(`/orders/${editData.OrderID}`, {
        status: editData.Status.toLowerCase(),
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.OrderID === editData.OrderID
            ? { ...o, Status: editData.Status }
            : o
        )
      );

      setShowEdit(false);
    } catch {
      alert("Cập nhật thất bại!");
    }
  };

  // View detail
  const handleViewDetail = async (id) => {
    try {
      setLoadingDetail(true);
      const { data } = await axiosClient.get(`/orders/${id}`);
      setDetailData(data);
      setShowDetail(true);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Status color
  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Filter search
  const filtered = orders.filter((o) => {
    const s = search.toLowerCase();
    return (
      o.OrderID.toString().includes(s) ||
      o.ReceiverName?.toLowerCase().includes(s) ||
      o.Phone?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="flex bg-[#F5F5F5] min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64 p-6">
        {/* HEADER */}
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight mb-6">
          Quản Lý Đơn Hàng
        </h1>

        {/* SEARCH */}
        <div className="flex flex-col sm:flex-row sm:justify-between mb-5 gap-3">
          <div className="relative w-full sm:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã đơn / tên / SĐT..."
              className="w-full pl-10 pr-3 py-2 rounded-xl border bg-white shadow-sm 
                         focus:ring-2 focus:ring-teal-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <p className="text-center text-slate-500 py-10">Đang tải...</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow border">
            <table className="min-w-full text-sm">
              <thead className="bg-teal-600 text-white">
                <tr>
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Người nhận</th>
                  <th className="p-3 text-left">SĐT</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Thanh toán</th>
                  <th className="p-3 text-left">Tổng</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((o, i) => (
                  <tr
                    key={o.OrderID}
                    className={`border-t transition ${
                      i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-teal-50 ${
                      removing === o.OrderID ? "opacity-0 scale-[.98]" : ""
                    }`}
                  >
                    <td className="p-3">{o.OrderID}</td>
                    <td className="p-3 font-medium">{o.ReceiverName}</td>
                    <td className="p-3">{o.Phone}</td>
                    <td className="p-3">{o.Email}</td>
                    <td className="p-3 uppercase">{o.PaymentMethod}</td>

                    <td className="p-3 font-bold text-teal-700">
                      {(Number(o.Total) || 0).toLocaleString()}₫
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(
                          o.Status
                        )}`}
                      >
                        {o.Status}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => {
                            setEditData(o);
                            setShowEdit(true);
                          }}
                          className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() => handleViewDetail(o.OrderID)}
                          className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() => handleDelete(o.OrderID)}
                          className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODALS */}
        <OrderDetailModal
          open={showDetail}
          onClose={() => setShowDetail(false)}
          data={detailData}
        />

        <OrderStatusModal
          open={showEdit}
          onClose={() => setShowEdit(false)}
          editData={editData}
          setEditData={setEditData}
          onSubmit={handleUpdateStatus}
        />
      </div>
    </div>
  );
}
