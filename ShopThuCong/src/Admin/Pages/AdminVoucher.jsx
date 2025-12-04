import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../Layout/Sidebar";
import VoucherTable from "./Voucher/VoucherTable";
import AddVoucherModal from "./Voucher/AddVoucherModal";
import EditVoucherModal from "./Voucher/EditVoucherModal";
import { Search, Plus } from "lucide-react";

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

  // FETCH
  const fetchVouchers = async () => {
    const res = await axiosClient.get("/vouchers");
    setVouchers(res.data);
    setFiltered(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // SEARCH FILTER
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
          v.Status ? "hoạt động" : "khoá",
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword)
      )
    );
  }, [search, vouchers]);

  // CRUD
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
    await axiosClient.delete(`/vouchers/${id}`);
    fetchVouchers();
  };

  return (
    <div className="flex bg-[#F5F5F5] min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64 p-6">

        {/* HEADER */}
        <h1 className="text-2xl font-semibold text-teal-700 tracking-tight mb-6">
          Quản Lý Voucher
        </h1>

        {/* SEARCH + ADD */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
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

        {/* TABLE */}
        <VoucherTable
          vouchers={filtered}
          loading={loading}
          onEdit={(item) => {
            setEditData({
              ...item,
              StartDate: item.StartDate?.slice(0, 10),
              EndDate: item.EndDate?.slice(0, 10),
            });
            setShowEdit(true);
          }}
          onDelete={handleDelete}
        />

        {/* MODALS */}
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
