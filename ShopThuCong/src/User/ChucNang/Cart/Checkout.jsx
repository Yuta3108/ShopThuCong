import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";
import { Phone } from "lucide-react";

const API = "https://backend-eta-ivory-29.vercel.app/api";

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
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [shippingFee, setShippingFee] = useState(0);
  const autoAppliedRef = useRef(false);
  const [addressDetail, setAddressDetail] = useState("");
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [provinceId, setProvinceId] = useState("");
  const [toDistrictId, setToDistrictId] = useState("");
  const [toWardCode, setToWardCode] = useState("");
  const SERVICE_MAP = {
    standard: 53321,
    fast: 53321
  };
  const serviceId = SERVICE_MAP[shippingMethod];
  const subtotal = cart.reduce(
    (sum, item) => sum + item.UnitPrice * item.Quantity,
    0
  );
  const total = Math.max(0, subtotal - discount + shippingFee);
  const calculateShippingFee = async (districtId, wardCode) => {
    try {
      const res = await axios.post(`${API}/shipping/ghn/fee`, {
        to_district_id: Number(districtId),
        to_ward_code: wardCode,
        service_id: serviceId,
        insurance_value: subtotal,
        cod_amount: paymentMethod === "cod" ? subtotal : 0,
      });

      const fee = res.data?.data?.total || 0;
      setShippingFee(fee);
    } catch (err) {
      console.error("GHN fee error:", err);
      setShippingFee(0);
    }
  };
  // --- APPLY VOUCHER  ---
  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      setDiscount(0);
      localStorage.removeItem("selectedVoucher");
      autoAppliedRef.current = true;
      return;
    }

    try {
      const res = await axios.post(`${API}/vouchers/apply`, {
        code: voucherCode.trim().toUpperCase(),
        orderTotal: subtotal,
      });

      if (res.data.success) {
        setDiscount(Number(res.data.discount));
        Swal.fire({
          icon: "success",
          title: "Áp dụng thành công!",
          text: `Đã giảm ${formatMoney(res.data.discount)}₫`,
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
  useEffect(() => {
    axios.get(`${API}/shipping/ghn/provinces`)
      .then(res => setProvinces(res.data.data))
      .catch(() => setProvinces([]));
  }, []);
  useEffect(() => {
    if (toDistrictId && toWardCode) {
      calculateShippingFee(toDistrictId, toWardCode);
    }
  }, [shippingMethod]);
  // --- APPLY VOUCHER  ---
  const applyVoucherAuto = async (code) => {
    try {
      const res = await axios.post(`${API}/vouchers/apply`, {
        code: code.trim().toUpperCase(),
        orderTotal: subtotal,
      });
      if (res.data.success) {
        setDiscount(Number(res.data.discount));
      } else {
        setDiscount(0);
      }
    } catch (err) {
      if (err.response?.status === 400) {
        Swal.fire({
          title: "Voucher không hợp lệ",
          text: err.response.data?.message,
          confirmButtonText: "OK",
        });
      }
      setDiscount(0);
    }
  };

  // --- LOAD USER + CART ---
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
      } catch {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // --- AUTO APPLY VOUCHER ONCE ---
  useEffect(() => {
    if (!voucherCode) return;
    if (cart.length === 0) return;
    if (subtotal <= 0) return;
    if (autoAppliedRef.current) return;

    autoAppliedRef.current = true;
    applyVoucherAuto(voucherCode);
  }, [voucherCode, cart, subtotal]);

  // --- HANDLE ORDER ---
  const handleOrder = async () => {
    //  Validate địa chỉ
    if (!addressDetail || !toDistrictId || !toWardCode) {
      return Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin giao hàng",
        text: "Vui lòng nhập đầy đủ địa chỉ, quận/huyện và phường/xã",
      });
    }

    if (!shippingFee || shippingFee <= 0) {
      return Swal.fire({
        icon: "warning",
        title: "Chưa tính phí vận chuyển",
        text: "Vui lòng chọn đầy đủ địa chỉ để tính phí giao hàng",
      });
    }

    //  Build địa chỉ đầy đủ
    const ward = wards.find((w) => w.WardCode === toWardCode);
    const district = districts.find((d) => d.DistrictID == toDistrictId);

    if (!ward || !district) {
      return Swal.fire({
        icon: "error",
        title: "Địa chỉ không hợp lệ",
        text: "Vui lòng chọn lại quận/huyện và phường/xã",
      });
    }

    const fullAddress = `${addressDetail}, ${ward.WardName}, ${district.DistrictName}`;

    //  Check token
    const token = localStorage.getItem("token");
    if (!token) {
      return Swal.fire({
        icon: "warning",
        title: "Chưa đăng nhập",
        text: "Vui lòng đăng nhập để tiếp tục",
      });
    }

    try {
      // Gửi đơn hàng (CHỈ GỬI FIELD BE DÙNG)
      const res = await axios.post(
        `${API}/orders`,
        {
          receiverName: user.FullName,
          phone: user.Phone,
          email: user.Email,
          address: fullAddress,
          paymentMethod,
          shippingMethod,
          shippingFee,
          voucherCode,
          discount,
          note,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const orderId = res.data?.orderId;
      if (!orderId) {
        return Swal.fire("Lỗi", "Không tạo được đơn hàng", "error");
      }

      // ZaloPay (GIỮ NGUYÊN)
      if (paymentMethod === "zalopay") {
        const zaloRes = await axios.post(
          `${API}/payment/zalopay`,
          { amount: total, orderId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const orderUrl = zaloRes.data?.order_url;
        if (!orderUrl) {
          return Swal.fire("Lỗi", "Không tạo được đơn ZaloPay", "error");
        }

        localStorage.setItem("pendingOrderId", orderId);
        window.location.href = orderUrl;
        return;
      }

      // Thành công
      Swal.fire({
        icon: "success",
        title: "Đặt hàng thành công",
        text: "Vui lòng kiểm tra hoá đơn trong Email",
        timer: 1500,
        showConfirmButton: false,
      });

      localStorage.removeItem("selectedVoucher");
      navigate("/");
    } catch (err) {
      console.error("Order error:", err);
      localStorage.removeItem("selectedVoucher");
      localStorage.removeItem("pendingOrderId");
      setVoucherCode("");
      setDiscount(0);
      Swal.fire({
        icon: "error",
        title: "Lỗi đặt hàng",
        text: err.response?.data?.message || "Không thể tạo đơn hàng",
      });
    }
  };
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status"); // cancel | fail | success 

  if (status === "cancel" || status === "fail") {
    const orderId = localStorage.getItem("pendingOrderId");

    if (orderId) {
      // GỌI API HUỶ ĐƠN ZALOPAY
      axios
        .post(`${API}/orders/${orderId}/cancel-zalopay`)
        .catch((err) => {
          console.error("Cancel order error:", err);
        });
    }

    //  CLEAR LOCAL
    localStorage.removeItem("pendingOrderId");
    localStorage.removeItem("selectedVoucher");

    setVoucherCode("");
    setDiscount(0);

    Swal.fire({
      icon: "warning",
      title: "Thanh toán không thành công",
      text: "Đơn hàng đã được huỷ. Vui lòng thử lại.",
    });

    // DỌN URL cho sạch
    window.history.replaceState({}, document.title, "/checkout");
  }
}, []);

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

  return (
    <div className="bg-[#F5F5F5] min-h-screen flex flex-col">
      <Header />

      <div className="w-full px-6 py-4">
        <div className="max-w-[1280px] mx-auto text-left">
          <nav className="text-sm text-slate-600 flex gap-2 justify-start">
            <Link to="/" className="hover:text-rose-500">Trang chủ</Link> /
            <Link to="/cart" className="hover:text-rose-500">Giỏ hàng</Link> /
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
              <input className="w-full p-3 border rounded-xl bg-slate-100 focus:ring-2 focus:ring-rose-400 outline-none" readOnly value={user.FullName} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-600">Số điện thoại</label>
                <input className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-rose-400 outline-none" value={user.Phone}
                  onChange={(e) => setUser({ ...user, Phone: e.target.value })} />
              </div>
              <div>
                <label className="text-slate-600">Email</label>
                <input className="w-full p-3 border rounded-xl bg-slate-100 focus:ring-2 focus:ring-rose-400 outline-none" readOnly value={user.Email} />
              </div>
            </div>

            <div className="space-y-5 text-sm">

              {/* Địa chỉ chi tiết */}
              <div>
                <label className="block text-slate-600 mb-1">
                  Địa chỉ chi tiết
                </label>
                <input
                  className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-rose-400 outline-none"
                  placeholder="Số nhà, tên đường..."
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                />
              </div>

              {/* Khu vực */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tỉnh / Thành */}
                <div>
                  <label className="block text-slate-600 mb-1">
                    Tỉnh / Thành phố
                  </label>
                  <select
                    value={provinceId}
                    onChange={async (e) => {
                      const id = e.target.value;
                      setProvinceId(id);
                      setToDistrictId("");
                      setToWardCode("");
                      setWards([]);
                      setShippingFee(0);

                      const res = await axios.get(
                        `${API}/shipping/ghn/districts?province_id=${id}`
                      );
                      setDistricts(res.data.data);
                    }}
                    className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-rose-400 outline-none"
                  >
                    <option value="">Chọn tỉnh / thành</option>
                    {provinces.map((p) => (
                      <option key={p.ProvinceID} value={p.ProvinceID}>
                        {p.ProvinceName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quận / Huyện */}
                <div>
                  <label className="block text-slate-600 mb-1">
                    Quận / Huyện
                  </label>
                  <select
                    value={toDistrictId}
                    onChange={async (e) => {
                      const id = e.target.value;
                      setToDistrictId(id);
                      setToWardCode("");
                      setShippingFee(0);

                      const res = await axios.get(
                        `${API}/shipping/ghn/wards?district_id=${id}`
                      );
                      setWards(res.data.data);
                    }}
                    className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-rose-400 outline-none"
                  >
                    <option value="">Chọn quận / huyện</option>
                    {districts.map((d) => (
                      <option key={d.DistrictID} value={d.DistrictID}>
                        {d.DistrictName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phường / Xã */}
                <div>
                  <label className="block text-slate-600 mb-1">
                    Phường / Xã
                  </label>
                  <select
                    value={toWardCode}
                    onChange={(e) => {
                      const ward = e.target.value;
                      setToWardCode(ward);
                      if (toDistrictId && ward) {
                        calculateShippingFee(toDistrictId, ward);
                      }
                    }}
                    className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-rose-400 outline-none"
                  >
                    <option value="">Chọn phường / xã</option>
                    {wards.map((w) => (
                      <option key={w.WardCode} value={w.WardCode}>
                        {w.WardName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PHƯƠNG THỨC GIAO HÀNG */}
              <div>
                <label className="block text-slate-600 mb-2">
                  Phương thức giao hàng
                </label>

                <div className="flex gap-4">
                  <label
                    className={`flex items-center gap-2 px-4 py-3 border rounded-xl cursor-pointer transition
                        ${shippingMethod === "standard"
                        ? "border-rose-500 bg-rose-50"
                        : "hover:border-slate-400"}`}
                  >
                    <input
                      type="radio"
                      value="standard"
                      checked={shippingMethod === "standard"}
                      onChange={() => setShippingMethod("standard")}
                    />
                    Giao hàng tiêu chuẩn
                  </label>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-slate-600 mb-1">
                  Ghi chú
                </label>
                <textarea
                  className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-rose-400 outline-none h-24"
                  placeholder="Ghi chú cho người bán tối đa 200 ký tự..."
                  value={note}
                  maxLength={200}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
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

          <div className="mb-4">
            <label className="text-sm font-medium">Mã giảm giá</label>
            <div className="flex gap-2 mt-2">
              <input
                className="flex-1 p-2 border rounded-lg bg-slate-100 focus:ring-2 focus:ring-rose-400 outline-none"
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
          <div className="flex justify-between text-sm">
            <span>Phí vận chuyển</span>
            <span>{formatMoney(shippingFee)}₫</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-rose-500 mt-3 mb-6">
            <span>Tổng cộng</span>
            <span>{formatMoney(total)}₫</span>
          </div>

          <h2 className="text-lg font-semibold mb-3">Phương thức thanh toán</h2>

          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" value="cod" checked={paymentMethod === "cod"} onChange={(e) => setPaymentMethod(e.target.value)} />
              Thanh toán khi nhận hàng (COD)
            </label>
            {/* Banking + ZaloPay chỉ hiện khi total > 0 */}
            {total > 0 && (
              <>
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
                    value="zalopay"
                    checked={paymentMethod === "zalopay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Thanh toán qua ZaloPay
                </label>
              </>
            )}
          </div>

          <button
            onClick={handleOrder}
            disabled={!shippingFee || shippingFee <= 0}
            className="w-full mt-6 py-3 bg-rose-500 text-white rounded-full font-semibold disabled:opacity-50"
          >
            Đặt hàng
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
