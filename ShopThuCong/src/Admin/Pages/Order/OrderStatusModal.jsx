// components/orders/OrderStatusModal.jsx
import React from "react";

export default function OrderStatusModal({
  open,
  onClose,
  editData,
  setEditData,
  onSubmit,
}) {
  if (!open) return null;

  const inputBase =
    "border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 p-2 rounded-lg outline-none transition-all";

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <form
        onSubmit={onSubmit}
        className="bg-white w-full max-w-md p-6 rounded-2xl shadow-lg"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-teal-600">
            Cập nhật trạng thái
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl"
          >
            ×
          </button>
        </div>

        <label className="text-sm font-medium">Trạng thái đơn hàng</label>
        <select
          className={`${inputBase} w-full mt-1`}
          value={editData.Status}
          onChange={(e) =>
            setEditData({ ...editData, Status: e.target.value })
          }
        >
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang giao</option>
          <option value="completed">Hoàn tất</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        <div className="flex justify-end mt-5 gap-2">
          <button
            onClick={onClose}
            type="button"
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
