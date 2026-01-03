import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";
import Swal from "sweetalert2";
import VoucherModal from "./VoucherModal";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openVoucher, setOpenVoucher] = useState(false);
  const navigate = useNavigate();
  const isDB =
    localStorage.getItem("cartMode") === "db" &&
    !!localStorage.getItem("token");

  // LOAD CART
  useEffect(() => {
    const loadLocalCart = () => {
      const saved = JSON.parse(localStorage.getItem("cart")) || [];
      const normalized = saved.map((item) => ({
        ...item,
        key: item.key ?? item.VariantID ?? item.ProductID,
        quantity: Number(item.quantity ?? 1),
        price: Number(item.price ?? 0),
      }));
      setCart(normalized);
      setLoading(false);
    };

    if (!isDB) {
      loadLocalCart();
      return;
    }

    const loadDBCart = async () => {
      try {
        const res = await fetch(`${API}/cart`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          setCart([]);
        } else {
          const data = await res.json();
          const items = Array.isArray(data.items) ? data.items : [];

          const normalized = items.map((item) => ({
            ...item,
            key: item.CartItemID,
            quantity: Number(item.Quantity ?? 1),
            price: Number(item.UnitPrice ?? 0),
            ProductName: item.ProductName,
            ImageURL: item.ImageURL,
          }));

          setCart(normalized);
        }
      } catch {
        setCart([]);
      }
      setLoading(false);
    };

    loadDBCart();
  }, []);
  // LOCAL SAVE
  const saveLocalCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("updateCart"));
  };
  // INCREASE
  const increaseQty = async (item) => {
    if (!isDB) {
      saveLocalCart(
        cart.map((i) =>
          i.key === item.key ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
      return;
    }

    await fetch(`${API}/cart/updateQuantity/${item.key}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ quantity: item.quantity + 1 }),
    });

    setCart((prev) =>
      prev.map((i) =>
        i.key === item.key ? { ...i, quantity: i.quantity + 1 } : i
      )
    );

    window.dispatchEvent(new Event("updateCart"));
  };
  // DECREASE
  const decreaseQty = async (item) => {
    if (item.quantity <= 1) return;

    if (!isDB) {
      saveLocalCart(
        cart.map((i) =>
          i.key === item.key ? { ...i, quantity: i.quantity - 1 } : i
        )
      );
      return;
    }

    await fetch(`${API}/cart/updateQuantity/${item.key}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ quantity: item.quantity - 1 }),
    });

    setCart((prev) =>
      prev.map((i) =>
        i.key === item.key ? { ...i, quantity: i.quantity - 1 } : i
      )
    );

    window.dispatchEvent(new Event("updateCart"));
  };
  // REMOVE ITEM
  const removeItem = async (item) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Xoá sản phẩm?",
      text: `Bạn muốn xoá '${item.ProductName}' khỏi giỏ hàng?`,
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xoá",
    });

    if (!confirm.isConfirmed) return;

    if (!isDB) {
      const newCart = cart.filter((i) => i.key !== item.key);
      saveLocalCart(newCart);

      Swal.fire({
        icon: "success",
        title: "Đã xoá sản phẩm",
        timer: 1200,
        showConfirmButton: false,
      });

      return;
    }

    try {
      await fetch(`${API}/cart/remove/${item.key}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCart((prev) => prev.filter((i) => i.key !== item.key));
      window.dispatchEvent(new Event("updateCart"));

      Swal.fire({
        icon: "success",
        title: "Đã xoá sản phẩm",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch {}
  };
  // TOTAL
  const total = cart.reduce(
    (sum, i) => sum + Number(i.price) * Number(i.quantity),
    0
  );

  const handleCheckout = () => {
    const token = localStorage.getItem("token");
    if( total > 5000000 ) {
      Swal.fire({
        icon: "warning",
        title: "Giá trị đơn hàng vượt quá hạn mức",
        text: "Vui lòng giảm bớt sản phẩm trong giỏ hàng để tiếp tục thanh toán",
        confirmButtonColor: "#fb7185",
      });
      return;
    }
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Bạn chưa đăng nhập",
        text: "Đăng nhập để tiếp tục thanh toán",
      }).then(() => navigate("/login"));
      return;
    }

    navigate("/checkout");
  };
  // UI
  return (
    <div className="bg-[#F5F5F5] min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 pt-10 pb-20">
        <Link
          to="/"
          className="inline-flex items-center text-slate-500 hover:text-rose-500 mb-6 text-sm"
        >
          <ArrowLeft size={18} className="mr-1" />
          Tiếp tục mua sắm
        </Link>

        <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-slate-900">
          Giỏ hàng của bạn
        </h1>

        {loading ? (
          <div className="text-center py-20 text-slate-500 animate-pulse text-sm tracking-[0.2em] uppercase">
            Đang tải giỏ hàng…
          </div>
        ) : cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm py-14 px-6 text-center">
            <p className="text-lg font-medium text-slate-800 mb-2">
              Giỏ hàng đang trống
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Bắt đầu thêm vài món xinh xinh vào nhé 
            </p>
            <Link
              to="/san-pham"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 shadow-md hover:shadow-lg transition-all"
            >
              Xem sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-10">
            {/*  PRODUCT LIST  */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.key}
                  className="bg-white rounded-2xl p-4 flex gap-4 border shadow-sm"
                >
                  <img
                    src={item.ImageURL}
                    alt={item.ProductName}
                    className="w-24 h-24 object-cover rounded-xl border"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {item.ProductName}
                      </h3>

                      <p className="text-rose-500 font-bold mt-2">
                        {Number(item.price).toLocaleString()}₫
                      </p>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => decreaseQty(item)}
                        className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="w-10 text-center font-semibold">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increaseQty(item)}
                        className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/*  SUMMARY  */}
            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="bg-white p-6 rounded-2xl border shadow">
                <h2 className="text-lg font-semibold mb-4">
                  Tóm tắt đơn hàng
                </h2>

                <div className="flex justify-between mb-2 text-sm">
                  <span>Tạm tính</span>
                  <span>{total.toLocaleString()}₫</span>
                </div>

                <div className="flex justify-between text-sm mb-4">
                  <span>Phí vận chuyển</span>
                  <span className="text-slate-400">Tính ở bước sau</span>
                </div>

                <hr className="my-3" />

                {/* BUTTON MỞ POPUP VOUCHER */}
                <button
                  onClick={() => setOpenVoucher(true)}
                  className="w-full py-2 bg-slate-100 border border-slate-300 rounded-xl text-sm mb-4 hover:bg-slate-200"
                >
                  Chọn mã giảm giá
                </button>

                <div className="flex justify-between items-baseline mb-4">
                  <span className="font-medium">Tổng tiền</span>
                  <span className="text-xl font-bold text-rose-500">
                    {total.toLocaleString()}₫
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={total > 5000000}
                  className={`w-full py-3 rounded-full font-semibold
                  ${total > 5000000
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-rose-500 text-white hover:bg-rose-600"}
                `}
                >
                  Thanh toán
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
      {/* POPUP */}
      <VoucherModal
        isOpen={openVoucher}
        onClose={() => setOpenVoucher(false)}
      />
    </div>
  );
}
