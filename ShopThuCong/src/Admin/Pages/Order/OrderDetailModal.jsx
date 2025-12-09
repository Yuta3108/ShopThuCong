import React from "react";

export default function OrderDetailModal({ open, onClose, data }) {
  if (!open || !data) return null;

  const { order, items } = data;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-xl relative animate-scaleIn">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-red-500 transition"
        >
          ✕
        </button>

        {/* TITLE */}
        <h2 className="text-2xl font-semibold text-teal-700 mb-4">
          Chi tiết đơn hàng #{order.OrderID}
        </h2>

        {/* GRID INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700 mb-4">
          <p><b>Người nhận:</b> {order.ReceiverName}</p>
          <p><b>SĐT:</b> {order.Phone}</p>
          <p><b>Email:</b> {order.Email}</p>
          <p><b>Địa chỉ:</b> {order.ShippingAddress}</p>
          <p><b>Ngày tạo:</b> {new Date(order.CreatedAt).toLocaleString()}</p>
          <p><b>Thanh toán:</b> {order.PaymentMethod}</p>
          <p><b>Trạng thái:</b> {order.Status}</p>
          {order.Note && (
            <p><b>Ghi chú:</b> {order.Note}</p>
          )}
        </div>

        {/* ITEMS TABLE */}
        <div className="rounded-xl overflow-hidden border shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-2 text-left">Tên SP</th>
                <th className="p-2 text-center">SL</th>
                <th className="p-2 text-center">Giá</th>
                <th className="p-2 text-right">Tổng</th>
              </tr>
            </thead>

            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} className="border-t hover:bg-slate-50">
                  <td className="p-2">{it.ProductName}</td>
                  <td className="p-2 text-center">{it.Quantity}</td>
                  <td className="p-2 text-center">
                    {Number(it.UnitPrice).toLocaleString()}₫
                  </td>
                  <td className="p-2 text-right text-teal-700 font-semibold">
                    {Number(it.TotalPrice).toLocaleString()}₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Voucher */}
        {order.VoucherCode && (
          <div className="mt-3 text-sm text-slate-600 text-right">
            <span className="font-semibold text-teal-700">Voucher áp dụng: </span>
            <span className="font-semibold text-white bg-teal-600 px-2 py-1 rounded-md shadow">
              {order.VoucherCode.toUpperCase()}
            </span>
          </div>
        )}

        {/* TỔNG TIỀN */}
        <div className="text-right mt-5 text-xl font-bold text-red-600">
          Tổng đơn: {Number(order.Total).toLocaleString()}₫
        </div>

        {/* BUTTON */}
        <div className="text-right mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition shadow"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
