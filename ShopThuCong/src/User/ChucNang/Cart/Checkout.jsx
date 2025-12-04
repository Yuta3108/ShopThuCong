import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";

const API = "https://backend-eta-ivory-29.vercel.app/api";

// ================= FORMAT MONEY =================
const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function CheckoutPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!token || !storedUser?.UserID) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await axios.get(`${API}/users/${storedUser.UserID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

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

  if (loading)
    return (
      <div className="bg-[#F5F5F5] min-h-screen">
        <Header />
        <p className="text-center py-10 text-slate-500">Đang tải…</p>
      </div>
    );

  if (!user)
    return (
      <div className="bg-[#F5F5F5] min-h-screen">
        <Header />
        <p className="text-center py-10 text-slate-500">
          Không tìm thấy thông tin người dùng
        </p>
      </div>
    );

  const subtotal = cart.reduce(
    (sum, i) => sum + i.UnitPrice * i.Quantity,
    0
  );

  // ================= APPLY VOUCHER =================
  const applyVoucher = async () => {
    const code = voucherCode.trim().toUpperCase();
    if (!code) return alert("Vui lòng nhập mã voucher!");

    try {
      const res = await axios.post(`${API}/vouchers/apply`, {
        code,
        subtotal: subtotal,
      });

      if (res.data.success) {
        setDiscount(Number(res.data.discount));
        alert("Áp dụng thành công!");
      } else {
        alert(res.data.message || "Mã không hợp lệ!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Mã không hợp lệ!");
      console.log("Voucher error:", err.response?.data);
    }
  };

  // ================= ORDER =================
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

  const total = Math.max(0, subtotal - discount);

  // ================= UI =================
  return (
    <div className="bg-[#F5F5F5] min-h-screen flex flex-col">
      <Header />

      {/* BREADCRUMB */}
      <div className="w-full bg-transparent">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-slate-600">
            <Link to="/" className="hover:text-rose-500">Trang chủ</Link>
            <span className="text-slate-400">›</span>
            <Link to="/cart" className="hover:text-rose-500">Giỏ hàng</Link>
            <span className="text-slate-400">›</span>
            <span className="text-rose-500 font-medium">Thanh toán</span>
          </nav>
        </div>
      </div>

      {/* MAIN */}
      <main className="flex-1 max-w-6xl mx-auto px-4 md:px-6 pb-20 grid grid-cols-1 md:grid-cols-[1.25fr,0.95fr] gap-8">
        
        {/* LEFT */}
        <div className="space-y-6">
          {/* SHIPPING */}
          <section className="bg-white p-6 rounded-3xl shadow-md border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Thông tin giao hàng</h2>

            <div className="space-y-4 text-sm">
              <div>
                <label className="text-slate-600">Họ tên</label>
                <input
                  value={user.FullName}
                  readOnly
                  className="w-full p-2.5 mt-1 border rounded-lg bg-slate-100 text-slate-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-600">Số điện thoại</label>
                  <input
                    value={user.Phone}
                    readOnly
                    className="w-full p-2.5 mt-1 border rounded-lg bg-slate-100 text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-slate-600">Email</label>
                  <input
                    value={user.Email}
                    readOnly
                    className="w-full p-2.5 mt-1 border rounded-lg bg-slate-100 text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600">Địa chỉ</label>
                <input
                  value={user.Address}
                  onChange={(e) => setUser({ ...user, Address: e.target.value })}
                  className="w-full p-2.5 mt-1 border rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
                />
              </div>
            </div>
          </section>

          {/* PAYMENT METHOD */}
          <section className="bg-white p-6 rounded-3xl shadow-md border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">Phương thức thanh toán</h2>

            <div className="space-y-3 text-sm text-slate-800">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" value="cod" checked={paymentMethod === "cod"} onChange={(e)=>setPaymentMethod(e.target.value)} className="accent-rose-500"/>
                <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" value="banking" checked={paymentMethod==="banking"} onChange={(e)=>setPaymentMethod(e.target.value)} className="accent-rose-500"/>
                <span>Chuyển khoản ngân hàng</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" value="momo" checked={paymentMethod==="momo"} onChange={(e)=>setPaymentMethod(e.target.value)} className="accent-rose-500"/>
                <span>Thanh toán qua Momo</span>
              </label>
            </div>
          </section>

          {/* NOTE */}
          <section className="bg-white p-6 rounded-3xl shadow-md border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Ghi chú đơn hàng</h2>

            <textarea
              className="w-full border p-3 rounded-xl h-24 text-sm text-slate-800 focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
              placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </section>
        </div>

        {/* RIGHT - SUMMARY */}
        <aside className="md:sticky md:top-24 h-fit">
          <section className="bg-white p-6 rounded-3xl shadow-md border border-slate-200">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Tóm tắt đơn hàng</h2>

            <div className="space-y-3 text-sm text-slate-800">
              {cart.map((item) => (
                <div key={item.CartItemID} className="flex justify-between gap-3">
                  <span className="flex-1">
                    {item.ProductName} × {item.Quantity}
                  </span>
                  <span className="font-semibold">
                    {formatMoney(item.UnitPrice * item.Quantity)}₫
                  </span>
                </div>
              ))}
            </div>

            {/* VOUCHER */}
            <div className="border-t border-slate-200 my-4"></div>

            <h3 className="text-sm font-semibold mb-2 text-slate-900">Mã giảm giá</h3>

            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none"
                placeholder="Nhập mã voucher..."
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              />
              <button
                onClick={applyVoucher}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-all"
              >
                Áp dụng
              </button>
            </div>

            {discount > 0 && (
              <p className="text-emerald-600 mt-2 text-sm font-semibold">
                Đã giảm {formatMoney(discount)}₫
              </p>
            )}

            <div className="border-t border-slate-200 my-4"></div>

            <div className="flex justify-between text-sm text-slate-700 mb-1">
              <span>Tạm tính</span>
              <span>{formatMoney(subtotal)}₫</span>
            </div>

            <div className="flex justify-between text-sm text-slate-700 mb-1">
              <span>Giảm giá</span>
              <span className="text-emerald-600">-{formatMoney(discount)}₫</span>
            </div>

            <div className="flex justify-between text-sm text-slate-700 mb-3">
              <span>Phí vận chuyển</span>
              <span className="text-slate-400">Tính khi xác nhận</span>
            </div>

            <div className="flex justify-between items-baseline mt-2">
              <span className="text-sm font-semibold text-slate-900">Tổng cộng</span>
              <span className="text-2xl font-bold text-rose-500">
                {formatMoney(total)}₫
              </span>
            </div>

            <button
              onClick={handleOrder}
              className="mt-6 w-full py-3 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Đặt hàng
            </button>
          </section>
        </aside>
      </main>

      <Footer />
    </div>
  );
}
