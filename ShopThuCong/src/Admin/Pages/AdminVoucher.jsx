import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../Layout/Sidebar";
import VoucherTable from "./Voucher/VoucherTable";
import AddVoucherModal from "./Voucher/AddVoucherModal";
import EditVoucherModal from "./Voucher/EditVoucherModal";
import { Search, Plus } from "lucide-react";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function AdminVoucher() {
  const [vouchers, setVouchers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState(null);

  const token = localStorage.getItem("token");

  const axiosClient = axios.create({ baseURL: API });
  axiosClient.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const fetchVouchers = async () => {
    const res = await axiosClient.get("/vouchers");
    setVouchers(res.data);
    setFiltered(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // ================= SEARCH LOGIC =================
  useEffect(() => {
  const keyword = search.toLowerCase();

  const result = vouchers.filter((v) => {
    return (
      (v.Code?.toLowerCase() || "").includes(keyword) ||
      String(v.DiscountValue || "").includes(keyword) ||
      String(v.MinOrder || "").includes(keyword) ||
      String(v.MaxDiscount || "").includes(keyword) ||
      String(v.Quantity || "").includes(keyword) ||
      (v.Status === 1 ? "hoạt động" : "khóa").includes(keyword)
    );
  });

  setFiltered(result);
}, [search, vouchers]);

  // ================= CRUD =================
  const handleAdd = async (payload) => {
    await axiosClient.post("/vouchers", payload);
    await fetchVouchers();
    setShowAdd(false);
  };

  const handleUpdate = async (payload) => {
    await axiosClient.put(`/vouchers/${editData.VoucherID}`, payload);
    await fetchVouchers();
    setShowEdit(false);
  };

  const handleDelete = async (id) => {
    await axiosClient.delete(`/vouchers/${id}`);
    await fetchVouchers();
  };

  return (
    <div className="flex bg-[#EDEDED] min-h-screen">
      <Sidebar />

      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-teal-700">
                        Quản Lý Voucher
                    </h1>
                </div>
        {/* ================= TITLE + SEARCH + ADD ================= */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">

          {/* SEARCH BOX */}
          <div className="relative w-full sm:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm voucher theo tên, mã, giá trị..."
              className="w-full pl-10 pr-3 py-2 border rounded-xl shadow-sm bg-white
                        focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          {/* BUTTON ADD */}
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 
                       rounded-xl hover:bg-teal-700 transition"
          >
            <Plus size={18} />
            Thêm Voucher
          </button>
        </div>

        {/* ================= TABLE ================= */}
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
              StartDate: item.StartDate?.slice(0, 10),
              EndDate: item.EndDate?.slice(0, 10),
              Status: item.Status,
            });
            setShowEdit(true);
          }}
          onDelete={handleDelete}
        />

        {/* ================= MODALS ================= */}
        {showAdd && (
          <AddVoucherModal onClose={() => setShowAdd(false)} onSubmit={handleAdd} />
        )}

        {showEdit && (
          <EditVoucherModal
            data={editData}
            setData={setEditData}
            onClose={() => setShowEdit(false)}
            onSubmit={handleUpdate}
          />
        )}
      </div>
    </div>
  );
}
