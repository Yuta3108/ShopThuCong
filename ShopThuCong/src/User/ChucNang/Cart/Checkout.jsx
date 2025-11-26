import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Checkout() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_USER = "http://localhost:5000/api/user/profile";
  const API_CART = "http://localhost:5000/api/cart";
  const API_ORDER = "http://localhost:5000/api/orders";

  // ===== Kiểm tra login =====
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  // ===== Lấy user + giỏ hàng =====
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      try {
        const userRes = await axios.get(API_USER, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        const cartRes = await axios.get(API_CART, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(cartRes.data.items);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const subtotal = items.reduce(
    (sum, item) => sum + item.UnitPrice * item.Quantity,
    0
  );

  // ===== Submit đặt hàng =====
  const handleOrder = async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        API_ORDER,
        {
          receiverName: user.FullName,
          phone: user.Phone,
          email: user.Email,
          address: user.Address,
          paymentMethod: "cod",
          note: "",
          voucherCode: "",
          discount: 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Đặt hàng thành công!");
      window.location.href = "/orders";
    } catch {
      alert("Đặt hàng thất bại!");
    }
  };

  if (loading) return <div className="p-4 text-center">Đang tải...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 mt-8">
      <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* THÔNG TIN */}
        <div className="md:col-span-2 space-y-6">
          <div className="border p-5 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Thông tin giao hàng</h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Họ tên</label>
                <input
                  value={user.FullName}
                  readOnly
                  className="w-full p-3 border rounded-lg mt-1 bg-gray-100"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Số điện thoại</label>
                <input
                  value={user.Phone}
                  readOnly
                  className="w-full p-3 border rounded-lg mt-1 bg-gray-100"
                />
              </div>
                <div>
                <label className="text-sm text-gray-600">Email</label>
                <input
                  value={user.Email}
                  readOnly
                  className="w-full p-3 border rounded-lg mt-1 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Địa chỉ</label>
                <input
                  value={user.Address}
                  readOnly
                  className="w-full p-3 border rounded-lg mt-1 bg-gray-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TÓM TẮT ĐƠN */}
        <div className="border p-5 rounded-xl shadow-md h-fit">
          <h2 className="text-xl font-semibold mb-3">Tóm tắt đơn hàng</h2>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.CartItemID} className="flex justify-between">
                <span>
                  {item.ProductName} x {item.Quantity}
                </span>
                <span className="font-semibold">
                  {(item.UnitPrice * item.Quantity).toLocaleString()}₫
                </span>
              </div>
            ))}
          </div>

          <div className="border-t my-4"></div>

          <div className="flex justify-between font-bold text-lg">
            <span>Tổng cộng:</span>
            <span className="text-[#C2185B]">
              {subtotal.toLocaleString()}₫
            </span>
          </div>

          <button
            onClick={handleOrder}
            className="mt-5 w-full py-3 bg-gradient-to-r from-[#C2185B] to-[#E91E63]
            text-white rounded-xl text-lg font-semibold hover:opacity-90 shadow-lg hover:shadow-xl"
          >
            Đặt hàng
          </button>
        </div>
      </div>
    </div>
  );
}
