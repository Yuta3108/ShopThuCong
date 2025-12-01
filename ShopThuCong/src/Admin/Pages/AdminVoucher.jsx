import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../Layout/Sidebar";
import VoucherTable from "./Voucher/VoucherTable";
import AddVoucherModal from "./Voucher/AddVoucherModal";
import EditVoucherModal from "./Voucher/EditVoucherModal";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function AdminVoucher() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
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
    setLoading(false);
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Thêm
  const handleAdd = async (payload) => {
    await axiosClient.post("/vouchers", payload);
    await fetchVouchers();
    setShowAdd(false);
  };

  // Sửa
  const handleUpdate = async (payload) => {
    await axiosClient.put(`/vouchers/${editData.VoucherID}`, payload);
    await fetchVouchers(); 
    setShowEdit(false);
  };

  // Xóa
  const handleDelete = async (id) => {
    await axiosClient.delete(`/vouchers/${id}`);
    await fetchVouchers();
  };

  return (
    <div className="flex bg-[#EDEDED] min-h-screen">
      <Sidebar />

      <div className="flex-1 p-6">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-bold text-teal-700">Quản lý voucher</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg"
          >
            + Thêm Voucher
          </button>
        </div>

        <VoucherTable
          vouchers={vouchers}
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

        {showAdd && (
          <AddVoucherModal
            onClose={() => setShowAdd(false)}
            onSubmit={handleAdd}
          />
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
