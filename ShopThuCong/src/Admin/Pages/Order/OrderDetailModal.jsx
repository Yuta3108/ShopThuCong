
import React from "react";
export default function OrderDetailModal({ open, onClose, data }) {
  if (!open || !data) return null;

  const { order, items } = data;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4 z-50">
      <div className="bg-white w-full max-w-2xl p-6 rounded-2xl shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-teal-700">
            Chi tiết đơn hàng #{order.OrderID}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl">
            ×
          </button>
        </div>

        {/* ORDER INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <p><b>Người nhận:</b> {order.ReceiverName}</p>
          <p><b>SĐT:</b> {order.Phone}</p>
          <p><b>Email:</b> {order.Email}</p>
          <p><b>Địa chỉ:</b> {order.ShippingAddress}</p>
          <p><b>Ngày tạo:</b> {new Date(order.CreatedAt).toLocaleString()}</p>
          <p><b>Thanh toán:</b> {order.PaymentMethod}</p>
          <p><b>Trạng thái:</b> {order.Status}</p>
        </div>

        {/* TABLE */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Tên SP</th>
                <th className="p-2 text-center">SL</th>
                <th className="p-2 text-center">Giá</th>
                <th className="p-2 text-right">Tổng</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{it.ProductName}</td>
                  <td className="p-2 text-center">{it.Quantity}</td>
                  <td className="p-2 text-center">{Number(it.UnitPrice).toLocaleString()}₫</td>
                  <td className="p-2 text-right text-teal-700 font-semibold">
                    {Number(it.TotalPrice).toLocaleString()}₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  {order.VoucherCode && (
  <div className="text-right mt-3 text-sm text-gray-600">
    <span className="font-semibold text-teal-700">Voucher áp dụng:</span>{" "}
    <span className="font-bold text-teal-600 px-2 py-0.5 bg-teal-50 rounded-md border border-teal-200">
      {order.VoucherCode.toUpperCase()}
    </span>
  </div>
)}
        {/* TỔNG TIỀN */}
        <div className="text-right mt-4 text-lg font-bold text-red-600">
          Tổng đơn: {Number(order.Total).toLocaleString()}₫
        </div>

        {/* CLOSE */}
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
