import React from "react";
import { X } from "lucide-react";

export default function EditVoucherModal({ data, setData, onClose, onSubmit }) {
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
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 text-slate-500 hover:text-red-500 transition"
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-semibold text-blue-600 mb-4">
          Sửa Voucher
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm">Mã voucher</label>
            <input
              className={inputClass}
              value={data.Code}
              onChange={(e) => update("Code", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="text-sm">Giá trị</label>
              <input
                type="number"
                className={inputClass}
                value={data.DiscountValue}
                onChange={(e) => update("DiscountValue", Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm">Đơn tối thiểu</label>
              <input
                type="number"
                className={inputClass}
                value={data.MinOrder}
                onChange={(e) => update("MinOrder", Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm">Giảm tối đa</label>
              <input
                type="number"
                disabled={data.Type === "fixed"}
                className={`${inputClass} ${
                  data.Type === "fixed"
                    ? "bg-slate-200 cursor-not-allowed"
                    : ""
                }`}
                value={data.Type === "fixed" ? 0 : data.MaxDiscount}
                onChange={(e) => update("MaxDiscount", Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm">Lượt sử dụng</label>
              <input
                type="number"
                className={inputClass}
                value={data.Quantity}
                onChange={(e) => update("Quantity", Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm">Bắt đầu</label>
              <input
                type="date"
                className={inputClass}
                value={data.StartDate}
                onChange={(e) => update("StartDate", e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm">Kết thúc</label>
              <input
                type="date"
                className={inputClass}
                value={data.EndDate}
                onChange={(e) => update("EndDate", e.target.value)}
              />
            </div>

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

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300"
          >
            Hủy
          </button>

          <button className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow">
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
