import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../Layout/Sidebar";
import VoucherTable from "./Voucher/VoucherTable";
import AddVoucherModal from "./Voucher/AddVoucherModal";
import EditVoucherModal from "./Voucher/EditVoucherModal";

const API = "https://backend-eta-ivory-29.vercel.app/api";

// Hàm convert số an toàn
const toNumber = (val, fallback = 0) => {
  if (val === undefined || val === null || val === "") return fallback;
  const n = Number(val);
  return Number.isNaN(n) ? fallback : n;
};

// Chuẩn hóa dữ liệu voucher trước khi gửi lên BE
const normalizeVoucherPayload = (data) => {
  return {
    Code: data.Code?.trim(),
    Type: data.Type,
    DiscountValue: toNumber(data.DiscountValue),
    MinOrder: toNumber(data.MinOrder),
    MaxDiscount: data.Type === "fixed" ? 0 : toNumber(data.MaxDiscount, 0),
    Quantity: toNumber(data.Quantity, 0),
    StartDate: data.StartDate?.slice(0, 10),
    EndDate: data.EndDate?.slice(0, 10),
    Status:
      data.Status === 0 || data.Status === "0"
        ? 0
        : 1,
  };
};

export default function AdminVoucherPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState(null);

  const token = localStorage.getItem("token");

  const axiosClient = axios.create({ baseURL: API });

  axiosClient.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  useEffect(() => {
    const load = async () => {
      const res = await axiosClient.get("/vouchers");
      setVouchers(res.data);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Xóa
  const handleDelete = async (id) => {
    await axiosClient.delete(`/vouchers/${id}`);
    setVouchers((prev) => prev.filter((v) => v.VoucherID !== id));
  };

  // Thêm
  const handleAdd = async (formData) => {
    const payload = normalizeVoucherPayload(formData);

    const res = await axiosClient.post("/vouchers", payload);

    setVouchers((prev) => [
      { VoucherID: res.data.VoucherID, ...payload },
      ...prev,
    ]);
    setShowAdd(false);
  };

  // Sửa
  const handleUpdate = async () => {
    const payload = normalizeVoucherPayload(editData);

    await axiosClient.put(`/vouchers/${editData.VoucherID}`, payload);

    setVouchers((prev) =>
      prev.map((v) =>
        v.VoucherID === editData.VoucherID ? { ...v, ...payload } : v
      )
    );
    setShowEdit(false);
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
          loading={loading}
          vouchers={vouchers}
          onDelete={handleDelete}
          onEdit={(item) => {
            // Chuẩn hóa data đưa vào modal edit
            setEditData({
              ...item,
              StartDate: item.StartDate?.slice(0, 10),
              EndDate: item.EndDate?.slice(0, 10),
              Status: item.Status ?? 1,
            });
            setShowEdit(true);
          }}
        />

        {showAdd && (
          <AddVoucherModal
            onClose={() => setShowAdd(false)}
            onSubmit={handleAdd}
          />
        )}

        {showEdit && editData && (
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
