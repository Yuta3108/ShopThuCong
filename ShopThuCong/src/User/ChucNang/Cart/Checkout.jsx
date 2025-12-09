import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";

const API = "http://localhost:5000/api";

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value) || 0);

export default function CheckoutPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // ============================
  // APPLY VOUCHER (MANUAL)
  // ============================
  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      Swal.fire({
        icon: "info",
        title: "Chưa nhập mã voucher",
        text: "Vui lòng nhập mã giảm giá!",
      });
      return;
    }

    try {
      const subtotal = cart.reduce(
        (sum, item) => sum + item.UnitPrice * item.Quantity,
        0
      );

      const res = await axios.post(`${API}/vouchers/apply`, {
        code: voucherCode.trim().toUpperCase(),
        subtotal,
      });

      if (res.data.success) {
        setDiscount(Number(res.data.discount));
        Swal.fire({
          icon: "success",
          title: "Áp dụng thành công!",
          text: `Bạn được giảm ${formatMoney(res.data.discount)}₫`,
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        setDiscount(0);
        Swal.fire({
          icon: "error",
          title: "Voucher không hợp lệ",
          text: res.data.message,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi khi áp dụng voucher",
        text: err.response?.data?.message || "Không thể áp dụng mã giảm giá",
      });
    }
  };

  // ============================
  // APPLY VOUCHER AUTO
  // ============================
  const applyVoucherAuto = async (code) => {
    try {
      const subtotal = cart.reduce(
        (sum, item) => sum + item.UnitPrice * item.Quantity,
        0
      );

      if (subtotal <= 0) return;

      const res = await axios.post(`${API}/vouchers/apply`, {
        code: code.trim().toUpperCase(),
        subtotal,
      });

      if (res.data.success) {
        setDiscount(Number(res.data.discount));
      } else {
        setDiscount(0);
      }
    } catch {
      setDiscount(0);
    }
  };

  // ============================
  // LOAD USER + CART
  // ============================
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const savedVoucher = localStorage.getItem("selectedVoucher");

    if (!token || !storedUser?.UserID) {
      Swal.fire({
        icon: "warning",
        title: "Bạn chưa đăng nhập",
        text: "Vui lòng đăng nhập để tiếp tục!",
      }).then(() => navigate("/login"));
      return;
    }

    if (savedVoucher && savedVoucher !== "undefined" && savedVoucher !== "null") {
      setVoucherCode(savedVoucher);
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

  // ============================
  // AUTO APPLY VOUCHER WHEN CART LOADED
  // ============================
  useEffect(() => {
    if (voucherCode && cart.length > 0) {
      applyVoucherAuto(voucherCode);
    }
  }, [voucherCode, cart]);

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
        <p className="text-center py-10">Không tìm thấy người dùng.</p>
      </div>
    );

  const subtotal = cart.reduce(
    (sum, item) => sum + item.UnitPrice * item.Quantity,
    0
  );
  const total = Math.max(0, subtotal - discount);

  // ============================
  // SUBMIT ORDER
  // ============================
  const handleOrder = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
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

      Swal.fire({
        icon: "success",
        title: "Đặt hàng thành công 🎉",
        timer: 1500,
        showConfirmButton: false,
      });

      localStorage.removeItem("selectedVoucher");
      navigate("/");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi đặt hàng",
        text: err.response?.data?.message || "Không thể tạo đơn hàng",
      });
    }
  };

  // ============================
  // UI
  // ============================
  return (
    <div className="bg-[#F5F5F5] min-h-screen flex flex-col">
      <Header />

      {/* BREADCRUMB - VERSION FIXED LEFT */}
      <div className="w-full px-6 py-4">
        <div className="max-w-[1280px] mx-auto text-left">
          <nav className="text-sm text-slate-600 flex gap-2 justify-start">
            <Link to="/" className="hover:text-rose-500">Trang chủ</Link>
            /
            <Link to="/cart" className="hover:text-rose-500">Giỏ hàng</Link>
            /
            <span className="text-rose-500 font-medium">Thanh toán</span>
          </nav>
        </div>
      </div>

      <main className="flex-1 max-w-[1280px] mx-auto px-6 pb-16 grid grid-cols-1 md:grid-cols-[1.4fr,1fr] gap-10">

        {/* LEFT */}
        <section className="bg-white p-6 rounded-2xl border shadow">
          <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>

          <div className="space-y-4 text-sm">
            <div>
              <label className="text-slate-600">Họ tên</label>
              <input
                className="w-full p-3 border rounded-xl bg-slate-100 mt-1"
                readOnly
                value={user.FullName}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-600">Số điện thoại</label>
                <input
                  className="w-full p-3 border rounded-xl bg-slate-100 mt-1"
                  readOnly
                  value={user.Phone}
                />
              </div>
              <div>
                <label className="text-slate-600">Email</label>
                <input
                  className="w-full p-3 border rounded-xl bg-slate-100 mt-1"
                  readOnly
                  value={user.Email}
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600">Địa chỉ giao hàng</label>
              <input
                className="w-full p-3 border rounded-xl bg-white mt-1"
                value={user.Address}
                onChange={(e) => setUser({ ...user, Address: e.target.value })}
              />
            </div>

            <div>
              <label className="text-slate-600">Ghi chú</label>
              <textarea
                className="w-full p-3 border rounded-xl bg-white mt-1 h-24"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <section className="bg-white p-6 rounded-2xl border shadow h-fit">
          <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>

          {cart.map((item) => (
            <div key={item.CartItemID} className="flex justify-between text-sm mb-2">
              <span>{item.ProductName} × {item.Quantity}</span>
              <span>{formatMoney(item.UnitPrice * item.Quantity)}₫</span>
            </div>
          ))}

          <hr className="my-4" />

          {/* VOUCHER */}
          <div className="mb-4">
            <label className="text-sm font-medium">Mã giảm giá</label>
            <div className="flex gap-2 mt-2">
              <input
                className="flex-1 p-2 border rounded-lg"
                placeholder="Nhập mã voucher..."
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
              />

              <button
                onClick={applyVoucher}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
              >
                Áp dụng
              </button>
            </div>

            {discount > 0 && (
              <p className="text-emerald-600 text-sm mt-1">
                Đã giảm {formatMoney(discount)}₫
              </p>
            )}
          </div>

          <hr className="my-4" />

          <div className="flex justify-between text-sm">
            <span>Tạm tính</span>
            <span>{formatMoney(subtotal)}₫</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Giảm giá</span>
            <span className="text-emerald-600">-{formatMoney(discount)}₫</span>
          </div>

          <div className="flex justify-between text-xl font-bold text-rose-500 mt-3 mb-6">
            <span>Tổng cộng</span>
            <span>{formatMoney(total)}₫</span>
          </div>

          {/* PAYMENT */}
          <h2 className="text-lg font-semibold mb-3">Phương thức thanh toán</h2>

          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Thanh toán khi nhận hàng (COD)
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="banking"
                checked={paymentMethod === "banking"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Chuyển khoản ngân hàng
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="momo"
                checked={paymentMethod === "momo"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Ví MoMo
            </label>
          </div>

          <button
            onClick={handleOrder}
            className="w-full mt-6 py-3 bg-rose-500 text-white rounded-full font-semibold hover:bg-rose-600"
          >
            Đặt hàng
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
