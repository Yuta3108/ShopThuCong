import React, { useEffect, useState } from "react";
import Sidebar from "../Layout/Sidebar";
import axios from "axios";
import { Search, Pencil, Trash2, Eye } from "lucide-react";

import OrderDetailModal from "../Pages/Order/OrderDetailModal";
import OrderStatusModal from "../Pages/Order/OrderStatusModal";

const API = "https://backend-eta-ivory-29.vercel.app/api";

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

  // =============== AXIOS CLIENT ===============
  const axiosClient = axios.create({
    baseURL: API,
    headers: { "Content-Type": "application/json" },
  });

  axiosClient.interceptors.request.use((config) => {
    const tk = localStorage.getItem("token");
    if (tk) config.headers.Authorization = `Bearer ${tk}`;
    return config;
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-semibold text-center p-6">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  // ===================== FETCH =====================
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axiosClient.get("/orders");
        setOrders(Array.isArray(data) ? data : data.orders || []);
      } catch (err) {
        console.log("Fetch lỗi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // ================= DELETE ORDER =================
  const handleDelete = async (id) => {
    setRemoving(id);
    setTimeout(async () => {
      await axiosClient.delete(`/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o.OrderID !== id));
      setRemoving(null);
    }, 250);
  };

  // ================= UPDATE STATUS =================
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put(`/orders/${editData.OrderID}`, {
        status: editData.Status.toLowerCase(),
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.OrderID === editData.OrderID
            ? { ...o, Status: editData.Status.toLowerCase() }
            : o
        )
      );

      setShowEdit(false);
    } catch (err) {
      alert("Cập nhật thất bại!");
      console.log(err);
    }
  };

  // ================= VIEW DETAIL =================
  const handleViewDetail = async (orderId) => {
    try {
      setLoadingDetail(true);
      const { data } = await axiosClient.get(`/orders/${orderId}`);
      setDetailData(data);
      setShowDetail(true);
    } catch (err) {
      alert("Không lấy được chi tiết đơn hàng!");
      console.log(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // =============== FILTER ===============
  const filtered = orders.filter((o) => {
    const s = search.toLowerCase();
    return (
      o.OrderID.toString().includes(s) ||
      o.ReceiverName?.toLowerCase().includes(s) ||
      o.Phone?.toLowerCase().includes(s)
    );
  });

  // =============== STATUS MAPPING ===============
  const statusMapping = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    completed: "Hoàn tất",
    cancelled: "Đã hủy",
  };

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

  const inputBase =
    "border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 p-2 rounded-lg outline-none transition-all";

  return (
    <div className="flex bg-[#EDEDED] min-h-screen">
      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        {/* Header */}
        <div className="mb-3">
          <h1 className="text-xl sm:text-2xl font-bold text-teal-700">
            Quản Lý Đơn Hàng
          </h1>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div className="relative w-full sm:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã đơn, tên, số điện thoại…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border shadow-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white text-sm"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-center text-gray-500 py-10">Đang tải...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-md bg-white border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-teal-400 to-teal-300 text-white">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Người nhận</th>
                  <th className="p-3">SĐT</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phương thức</th>
                  <th className="p-3">Tổng tiền</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((o, i) => (
                  <tr
                    key={o.OrderID}
                    className={`border-t transition-all duration-300 ${
                      removing === o.OrderID ? "opacity-0 translate-x-4" : ""
                    } ${i % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-teal-50`}
                  >
                    <td className="p-3 text-center">{o.OrderID}</td>
                    <td className="p-3 text-center font-semibold">{o.ReceiverName}</td>
                    <td className="p-3 text-center">{o.Phone}</td>
                    <td className="p-3 text-center">{o.Email}</td>
                    <td className="p-3 text-center uppercase">
                      {o.PaymentMethod}
                    </td>

                    <td className="p-3 text-center text-teal-700 font-bold">
                      {(Number(o.Total) || 0).toLocaleString()}₫
                    </td>

                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(
                          o.Status
                        )}`}
                      >
                        {statusMapping[o.Status] || o.Status}
                      </span>
                    </td>

                    <td className="p-3 w-40">
                      <div className="flex justify-center gap-3">
                        {/* EDIT */}
                        <button
                          onClick={() => {
                            setEditData(o);
                            setShowEdit(true);
                          }}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                        >
                          <Pencil size={18} />
                        </button>

                        {/* VIEW */}
                        <button
                          onClick={() => handleViewDetail(o.OrderID)}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700"
                        >
                          <Eye size={18} />
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => handleDelete(o.OrderID)}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600"
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

        {/* POPUPS */}
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
