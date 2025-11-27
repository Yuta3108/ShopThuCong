import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";
import { ArrowLeft } from "lucide-react";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function CheckoutPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // New states
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState("");

  // LẤY USER + CART
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!token || !storedUser?.UserID) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Lấy info user theo ID
        const userRes = await axios.get(`${API}/users/${storedUser.UserID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        // Lấy giỏ hàng DB
        const cartRes = await axios.get(`${API}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(cartRes.data.items || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) return <p className="text-center py-10">Đang tải…</p>;
  if (!user) return <p className="text-center py-10">Không tìm thấy thông tin người dùng</p>;

  const subtotal = cart.reduce((sum, i) => sum + i.UnitPrice * i.Quantity, 0);

  // ÁP DỤNG VOUCHER
  const applyVoucher = async () => {
    if (!voucherCode.trim()) return alert("Vui lòng nhập mã voucher!");

    try {
      const res = await axios.post(`${API}/vouchers/apply`, {
        code: voucherCode,
        subtotal: subtotal,
      });

      if (res.data.success) {
        setDiscount(res.data.discount);
      } else {
        alert(res.data.message || "Mã không hợp lệ!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Mã không hợp lệ!");
    }
  };


  // ĐẶT HÀNG
  const handleOrder = async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${API}/orders`,
        {
          receiverName: user.FullName,
          phone: user.Phone,
          email: user.Email,
          address: user.Address,
          paymentMethod,
          voucherCode,
          discount,
          note,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Đặt hàng thành công!");
      navigate("/");
    } catch (err) {
      alert("Đặt hàng thất bại!");
      console.log(err);
    }
  };
  // UI
  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <Header />

      {/* BREADCRUMB */}
      <div className="container mx-auto px-4 py-4 text-sm text-gray-600 flex items-center gap-2">
        <Link to="/" className="hover:text-pink-600">Trang chủ</Link>
        <span className="text-gray-400">›</span>
        <Link to="/cart" className="hover:text-pink-600">Giỏ hàng</Link>
        <span className="text-gray-400">›</span>
        <span className="text-pink-600 font-semibold">Thanh toán</span>
      </div>

      {/* MAIN */}
      <div className="container mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* LEFT – THÔNG TIN GIAO HÀNG */}
        <div>
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Thông tin giao hàng
            </h2>

            <div className="space-y-5">
              <div>
                <label className="text-gray-600 text-sm">Họ tên</label>
                <input
                  value={user.FullName}
                  readOnly
                  className="w-full p-3 mt-1 border rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label className="text-gray-600 text-sm">Số điện thoại</label>
                <input
                  value={user.Phone}
                  readOnly
                  className="w-full p-3 mt-1 border rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label className="text-gray-600 text-sm">Email</label>
                <input
                  value={user.Email}
                  readOnly
                  className="w-full p-3 mt-1 border rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label className="text-gray-600 text-sm">Địa chỉ</label>
                <input
                  value={user.Address}
                  onChange={(e)=> setUser({ ...user, Address: e.target.value })
                }
                  className="w-full p-3 mt-1 border rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* PHƯƠNG THỨC THANH TOÁN */}
          <div className="bg-white p-6 rounded-xl shadow-md border mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Phương thức thanh toán
            </h2>

            <div className="space-y-2 text-gray-800">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Thanh toán khi nhận hàng (COD)
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="banking"
                  checked={paymentMethod === "banking"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Chuyển khoản ngân hàng
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="momo"
                  checked={paymentMethod === "momo"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Thanh toán qua Momo
              </label>
            </div>
          </div>

          {/* NOTE */}
          <div className="bg-white p-6 rounded-xl shadow-md border mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Ghi chú đơn hàng
            </h2>

            <textarea
              className="w-full border p-3 rounded-lg h-28"
              placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT – TÓM TẮT ĐƠN */}
        <div>
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.CartItemID} className="flex justify-between">
                  <span>{item.ProductName} × {item.Quantity}</span>
                  <span className="font-semibold">
                    {(item.UnitPrice * item.Quantity).toLocaleString()}₫
                  </span>
                </div>
              ))}
            </div>

            {/* Voucher */}
            <div className="border-t my-4"></div>

            <h3 className="text-md font-semibold mb-2">Mã giảm giá</h3>

            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-lg p-3"
                placeholder="Nhập mã voucher..."
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
              />
              <button
                onClick={applyVoucher}
                className="px-4 bg-[#C2185B] text-white rounded-lg hover:bg-[#a3144d]"
              >
                Áp dụng
              </button>
            </div>

            {discount > 0 && (
              <p className="text-green-600 mt-2 font-semibold">
                Đã giảm {discount.toLocaleString()}₫
              </p>
            )}

            <div className="border-t my-4"></div>

            <div className="flex justify-between text-gray-700">
              <span>Tạm tính:</span>
              <span>{subtotal.toLocaleString()}₫</span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Giảm giá:</span>
              <span className="text-green-600">-{discount.toLocaleString()}₫</span>
            </div>

            <div className="flex justify-between font-bold text-lg mt-3">
              <span>Tổng cộng:</span>
              <span className="text-[#C2185B]">
                {(subtotal - discount).toLocaleString()}₫
              </span>
            </div>

            <button
              onClick={handleOrder}
              className="mt-6 w-full py-3 bg-gradient-to-r from-[#C2185B] to-[#E91E63]
              text-white rounded-xl text-lg font-semibold hover:opacity-90 shadow-lg hover:shadow-xl"
            >
              Đặt hàng
            </button>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
