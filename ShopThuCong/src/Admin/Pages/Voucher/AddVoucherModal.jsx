import React, { useState } from "react";
import { X } from "lucide-react";
import Swal from "sweetalert2";

// ========== FORMAT MONEY ==========
const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const parseMoneyInput = (value) =>
  Number(String(value).replace(/[^\d]/g, "")) || 0;

export default function AddVoucherModal({ onSubmit, onClose }) {
  const [data, setData] = useState({
    Code: "",
    Type: "fixed",
    DiscountValue: 0,
    MinOrder: 0,
    MaxDiscount: 0,
    Quantity: 1,
    StartDate: "",
    EndDate: "",
    Status: 1,
  });

  const inputClass =
    "w-full p-2 rounded-xl border border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-teal-500 outline-none";

  const update = (k, v) => setData({ ...data, [k]: v });

  // ===== RÀNG BUỘC NGÀY =====
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = data.StartDate ? new Date(data.StartDate) : null;
  if (startDate) startDate.setHours(0, 0, 0, 0);

  const endDate = data.EndDate ? new Date(data.EndDate) : null;
  if (endDate) endDate.setHours(0, 0, 0, 0);

  const handleSubmit = () => {
    // StartDate < hôm nay
    if (startDate && startDate < today) {
      Swal.fire({
        icon: "warning",
        title: "Ngày bắt đầu không hợp lệ",
        text: "Ngày bắt đầu không được nhỏ hơn hôm nay.",
      });
      return;
    }

    // EndDate < StartDate
    if (startDate && endDate && endDate < startDate) {
      Swal.fire({
        icon: "warning",
        title: "Ngày kết thúc không hợp lệ",
        text: "Ngày kết thúc không được nhỏ hơn ngày bắt đầu.",
      });
      return;
    }

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
      <form
        className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl animate-scaleIn relative"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-red-500 transition"
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-semibold text-teal-700 mb-3">
          Thêm Voucher
        </h2>

        {/*  NOTE RÀNG BUỘC */}
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          ℹ Ngày bắt đầu phải từ <b>hôm nay trở đi</b>. Voucher chỉ có hiệu lực
          khi ở trạng thái <b>Hoạt động</b>.
        </div>

        <div className="space-y-3">
          {/* CODE */}
          <div>
            <label className="text-sm">Mã voucher</label>
            <input
              className={inputClass}
              value={data.Code}
              onChange={(e) => update("Code", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* TYPE */}
            <div>
              <label className="text-sm">Loại</label>
              <select
                className={inputClass}
                value={data.Type}
                onChange={(e) => update("Type", e.target.value)}
              >
                <option value="percent">Phần trăm</option>
                <option value="fixed">Số tiền</option>
              </select>
            </div>

            {/* DISCOUNT VALUE */}
            <div>
              <label className="text-sm">Giá trị</label>
              <input
                className={inputClass}
                value={
                  data.Type === "percent"
                    ? data.DiscountValue
                    : formatMoney(data.DiscountValue)
                }
                onChange={(e) =>
                  update("DiscountValue", parseMoneyInput(e.target.value))
                }
              />
            </div>

            {/* MIN ORDER */}
            <div>
              <label className="text-sm">Đơn tối thiểu</label>
              <input
                className={inputClass}
                value={formatMoney(data.MinOrder)}
                onChange={(e) =>
                  update("MinOrder", parseMoneyInput(e.target.value))
                }
              />
            </div>

            {/* MAX DISCOUNT */}
            <div>
              <label className="text-sm">Giảm tối đa</label>
              <input
                disabled={data.Type === "fixed"}
                className={`${inputClass} ${
                  data.Type === "fixed"
                    ? "bg-slate-200 cursor-not-allowed"
                    : ""
                }`}
                value={
                  data.Type === "fixed"
                    ? ""
                    : formatMoney(data.MaxDiscount)
                }
                onChange={(e) =>
                  update("MaxDiscount", parseMoneyInput(e.target.value))
                }
              />
            </div>

            {/* QUANTITY */}
            <div>
              <label className="text-sm">Lượt sử dụng</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={data.Quantity}
                onChange={(e) => update("Quantity", Number(e.target.value))}
              />
            </div>

            {/* START DATE */}
            <div>
              <label className="text-sm">Ngày bắt đầu</label>
              <input
                type="date"
                className={inputClass}
                min={new Date().toISOString().slice(0, 10)}
                value={data.StartDate}
                onChange={(e) => update("StartDate", e.target.value)}
              />
            </div>

            {/* END DATE */}
            <div>
              <label className="text-sm">Ngày kết thúc</label>
              <input
                type="date"
                className={inputClass}
                min={data.StartDate || undefined}
                value={data.EndDate}
                onChange={(e) => update("EndDate", e.target.value)}
              />
            </div>

            {/* STATUS */}
            <div className="col-span-2">
              <label className="text-sm">Trạng thái</label>
              <select
                className={inputClass}
                value={data.Status}
                onChange={(e) => update("Status", Number(e.target.value))}
              >
                <option value={1}>Hoạt động</option>
                <option value={0}>Khoá</option>
              </select>
            </div>
          </div>
        </div>

        {/* FOOTER BUTTON */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 rounded-xl hover:bg-slate-300"
          >
            Hủy
          </button>

          <button className="px-5 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow">
            Thêm
          </button>
        </div>
      </form>
    </div>
  );
}
