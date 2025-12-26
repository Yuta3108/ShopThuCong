import React from "react";
import { orderStatusText } from "../../../utils/orderStatus";
export default function OrderStatusModal({
  open,
  onClose,
  editData,
  setEditData,
  onSubmit,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
      <form
        onSubmit={onSubmit}
        className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl animate-scaleIn"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-teal-700">
            Cập nhật trạng thái
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-red-500 text-xl"
          >
            ✕
          </button>
        </div>

        <label className="text-sm font-medium">Trạng thái đơn hàng</label>
          <select
            value={editData.Status}
            onChange={(e) =>
              setEditData({ ...editData, Status: e.target.value })
            }
            className="w-full mt-1 p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
          >
            {Object.entries(orderStatusText).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700"
          >
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
}
