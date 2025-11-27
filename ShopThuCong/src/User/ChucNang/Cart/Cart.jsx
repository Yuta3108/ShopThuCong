import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
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
      } catch (err) {
        console.log("Lỗi cart:", err);
        setCart([]);
      }
      setLoading(false);
    };

    loadDBCart();
  }, []);

  // Kết Hợp Cart Local
  const saveLocalCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("updateCart"));
  };

  // Tăng Số Lượng
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

  // Giảm Số Lượng
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

  //REMOVE ITEM
  const removeItem = async (item) => {
    if (!isDB) {
      const newCart = cart.filter((i) => i.key !== item.key);
      saveLocalCart(newCart);
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
    } catch {}
  };

  //TOTAL
  const total = cart.reduce(
    (sum, i) => sum + Number(i.price) * Number(i.quantity),
    0
  );

  // CHECKOUT 
  const handleCheckout = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Vui lòng đăng nhập để thanh toán!");
      return navigate("/login");
    }

    navigate("/checkout");
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen flex flex-col">
      <Header />

      <div className="container mx-auto px-4 mt-8 flex-1">
        <Link
          to="/"
          className="flex items-center text-gray-600 hover:text-[#C2185B] mb-6 transition-all"
        >
          <ArrowLeft size={18} className="mr-1" />
          Tiếp tục mua sắm
        </Link>

        <h1 className="text-3xl font-bold mb-6 text-gray-900">Giỏ hàng của bạn</h1>

        {loading ? (
          <div className="text-center py-20 text-gray-500 animate-pulse">
            Đang tải giỏ hàng…
          </div>
        ) : cart.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            Giỏ hàng đang trống…
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
            {/* LIST ITEMS */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.key}
                  className="bg-white rounded-xl shadow p-4 flex items-center gap-4 
                  hover:shadow-xl transition-all border border-gray-100"
                >
                  <img
                    src={item.ImageURL}
                    alt={item.ProductName}
                    className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-2">
                      {item.ProductName}
                    </h3>

                    <p className="text-pink-600 font-bold text-lg mb-2">
                      {Number(item.price).toLocaleString()}₫
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => decreaseQty(item)}
                        className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center 
                        justify-center transition-all hover:scale-110"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="w-10 text-center font-semibold text-gray-800">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increaseQty(item)}
                        className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center 
                        justify-center transition-all hover:scale-110"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item)}
                    className="text-red-500 hover:text-red-700 hover:scale-110 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* SUMMARY */}
            <div className="bg-white p-6 rounded-2xl shadow h-fit border">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tổng cộng</h2>

              <div className="flex justify-between mb-3 text-gray-700">
                <span>Tạm tính</span>
                <span>{total.toLocaleString()}₫</span>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between text-xl font-bold text-[#C2185B] mb-4">
                <span>Tổng tiền</span>
                <span>{total.toLocaleString()}₫</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-gradient-to-r from-[#C2185B] to-[#E91E63]
                text-white rounded-xl text-lg font-semibold hover:opacity-90 transition-all 
                shadow-lg hover:shadow-xl"
              >
                Thanh toán ngay
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
