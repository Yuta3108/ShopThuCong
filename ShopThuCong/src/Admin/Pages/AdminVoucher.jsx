import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../Layout/Sidebar";
import VoucherTable from "./Voucher/VoucherTable";
import AddVoucherModal from "./Voucher/AddVoucherModal";
import EditVoucherModal from "./Voucher/EditVoucherModal";
import { Search, Plus, Gift, Calendar, Percent, Trash2, Edit } from "lucide-react";

const API = "https://backend-eta-ivory-29.vercel.app/api";

// AXIOS CLIENT
const axiosClient = axios.create({ baseURL: API });
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function AdminVoucher() {
  const [vouchers, setVouchers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState(null);

  //  SIDEBAR RESPONSIVE 
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = (state) =>
    setIsOpen(state !== undefined ? state : !isOpen);

  //  AUTH 
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-semibold">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  //  FETCH 
  const fetchVouchers = async () => {
    const res = await axiosClient.get("/vouchers");
    setVouchers(res.data);
    setFiltered(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  //  SEARCH FILTER 
  useEffect(() => {
    const keyword = search.toLowerCase();
    setFiltered(
      vouchers.filter((v) =>
        [
          v.Code,
          v.Type,
          v.DiscountValue,
          v.MinOrder,
          v.MaxDiscount,
          v.Quantity,
          v.Status ? "hoạt động" : "khoá"
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      )
    );
  }, [search, vouchers]);

  //  CRUD 
  const handleAdd = async (payload) => {
    await axiosClient.post("/vouchers", payload);
    fetchVouchers();
    setShowAdd(false);
  };

  const handleEdit = async (payload) => {
    await axiosClient.put(`/vouchers/${editData.VoucherID}`, payload);
    fetchVouchers();
    setShowEdit(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xoá voucher?")) return;
    await axiosClient.delete(`/vouchers/${id}`);
    fetchVouchers();
  };

  return (
    <div className="flex bg-[#F5F5F5] min-h-screen">

      {/* SIDEBAR */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => toggleSidebar(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 md:ml-64 p-4 sm:p-6">

        {/* HEADER */}
        <h1 className="text-2xl font-semibold text-teal-700 mb-6">
          Quản Lý Voucher
        </h1>

        {/* SEARCH + ADD BUTTON */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-6">
          <div className="relative w-full sm:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm voucher theo mã, giá trị, loại..."
              className="w-full pl-10 pr-3 py-2 rounded-xl border bg-white shadow-sm 
                         focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl 
                       hover:bg-teal-700 transition shadow"
          >
            <Plus size={18} /> Thêm Voucher
          </button>
        </div>

        {/*  MOBILE CARD LIST  */}
        <div className="grid grid-cols-1 md:hidden gap-4">
          {filtered.map((v) => (
            <div
              key={v.VoucherID}
              className="p-4 bg-white rounded-xl shadow border hover:shadow-md transition"
            >
              {/* top */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Gift size={20} className="text-teal-600" />
                  <span className="font-semibold">{v.Code}</span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    v.Status
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {v.Status ? "Hoạt động" : "Khoá"}
                </span>
              </div>

              {/* values */}
              <div className="text-sm text-slate-700 mt-3 space-y-1">
                <p className="flex items-center gap-2">
                  <Percent size={15} className="text-slate-500" />
                  Loại: {v.Type}
                </p>
                <p>Giá trị: {v.Type === "percent" ? v.DiscountValue + "%" : v.DiscountValue + "₫"}</p>
                <p>Đơn tối thiểu: {v.MinOrder}₫</p>
                <p>Số lượng: {v.Quantity}</p>

                {v.StartDate && v.EndDate && (
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={14} />
                    {v.StartDate.slice(0, 10)} → {v.EndDate.slice(0, 10)}
                  </p>
                )}
              </div>

              {/* actions */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setEditData({
                      ...v,
                      StartDate: v.StartDate?.slice(0, 10),
                      EndDate: v.EndDate?.slice(0, 10),
                    });
                    setShowEdit(true);
                  }}
                  className="flex-1 bg-yellow-500 text-white rounded-lg py-2 hover:bg-yellow-600 flex items-center justify-center"
                >
                  <Edit size={16} />
                  <span className="ml-1">Sửa</span>
                </button>

                <button
                  onClick={() => handleDelete(v.VoucherID)}
                  className="flex-1 bg-red-500 text-white rounded-lg py-2 hover:bg-red-600 flex items-center justify-center"
                >
                  <Trash2 size={16} />
                  <span className="ml-1">Xoá</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/*  DESKTOP TABLE  */}
        <div className="hidden md:block">
          <VoucherTable
            vouchers={filtered}
            loading={loading}
            onEdit={(item) => {
                setEditData({
                  ...item,
                  DiscountValue: Number(item.DiscountValue),
                  MinOrder: Number(item.MinOrder),
                  MaxDiscount: Number(item.MaxDiscount),
                  Quantity: Number(item.Quantity),
                  Status: Number(item.Status),

                  StartDate: item.StartDate?.slice(0, 10),
                  EndDate: item.EndDate?.slice(0, 10),
                });

                setShowEdit(true);
}}
            onDelete={handleDelete}
          />
        </div>

        {/*  MODALS  */}
        {showAdd && (
          <AddVoucherModal
            onSubmit={handleAdd}
            onClose={() => setShowAdd(false)}
          />
        )}

        {showEdit && (
          <EditVoucherModal
            data={editData}
            setData={setEditData}
            onSubmit={handleEdit}
            onClose={() => setShowEdit(false)}
          />
        )}
      </div>
    </div>
  );
}
