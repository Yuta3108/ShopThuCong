import React, { useState } from "react";
import { X } from "lucide-react";

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

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
      <form
        className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl animate-scaleIn relative"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(data);
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

        <h2 className="text-xl font-semibold text-teal-700 mb-4">
          Thêm Voucher
        </h2>

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
                  update(
                    "DiscountValue",
                    parseMoneyInput(e.target.value)
                  )
                }
              />
            </div>

            {/* MIN ORDER */}
            <div>
              <label className="text-sm">Đơn tối thiểu</label>
              <input
                className={inputClass}
                value={formatMoney(data.MinOrder)}
                onChange={(e) => update("MinOrder", parseMoneyInput(e.target.value))}
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
                className={inputClass}
                value={data.Quantity}
                onChange={(e) => update("Quantity", Number(e.target.value))}
              />
            </div>

            {/* START */}
            <div>
              <label className="text-sm"> Ngày Bắt đầu</label>
              <input
                  type="date"
                  className={inputClass}
                  value={data.StartDate}
                  onChange={(e) => update("StartDate", e.target.value)}
                />
            </div>

            {/* END */}
            <div>
              <label className="text-sm">Ngày Kết thúc</label>
                    <input
                    type="date"
                    className={inputClass}
                    value={data.EndDate}
                    min={data.StartDate || undefined}
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
