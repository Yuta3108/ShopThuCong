import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import Header from "../../Layout/Header";
import Footer from "../../Layout/Footer";

const API = "https://backend-eta-ivory-29.vercel.app/api";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const isDB =
  localStorage.getItem("cartMode") === "db" &&
  !!localStorage.getItem("token");

  useEffect(() => {
  const isDB =
  localStorage.getItem("cartMode") === "db" &&
  !!localStorage.getItem("token");

  if (!isDB) {
    // LOCAL MODE
    const saved = JSON.parse(localStorage.getItem("cart")) || [];
    const normalized = saved.map((item) => ({
      ...item,
      key: item.key ?? item.VariantID ?? item.ProductID,
      quantity: Number(item.quantity ?? 1),
      price: Number(item.price ?? 0),
    }));
    setCart(normalized);
    return;
  }

  // DB MODE
  const loadDBCart = async () => {
    const res = await fetch(`${API}/cart`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) {
      setCart([]); 
      return;
    }

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
  };

  loadDBCart();
}, []);

  // ========================
  // LOCAL MODE SAVE
  // ========================
  const saveLocalCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  // ========================
  // INCREASE QUANTITY
  // ========================
  const increaseQty = async (item) => {
    if (!isDB) {
      // LOCAL
      saveLocalCart(
        cart.map((i) =>
          i.key === item.key ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      // DB MODE
      await fetch(`${API}/cart/updateQuantity/${item.key}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ quantity: item.quantity + 1 }),
      });

      // reload
      setCart((prev) =>
          prev.map((i) =>
            i.key === item.key ? { ...i, quantity: i.quantity + 1 } : i
          )
        );
    }
  };

  // ========================
  // DECREASE QUANTITY
  // ========================
  const decreaseQty = async (item) => {
    if (item.quantity <= 1) return;

    if (!isDB) {
      saveLocalCart(
        cart.map((i) =>
          i.key === item.key ? { ...i, quantity: i.quantity - 1 } : i
        )
      );
    } else {
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
    }
  };

  // ========================
  // REMOVE ITEM
  // ========================
  const removeItem = async (item) => { 
  if (!isDB) {
    // Local mode
    saveLocalCart(cart.filter((i) => i.key !== item.key));
    setCart(cart.filter((i) => i.key !== item.key));
    return;
  }

  // DB mode
  try {
    await fetch(`${API}/cart/remove/${item.key}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    // Xoá item trong state FE
    setCart((prev) => prev.filter((i) => i.key !== item.key));

  } catch (err) {
    console.error("DELETE ERROR:", err);
  }
};

  const total = cart.reduce(
    (sum, i) => sum + Number(i.price) * Number(i.quantity),
    0
  );

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

        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Giỏ hàng của bạn
        </h1>

        {cart.length === 0 ? (
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
                  className="bg-white rounded-xl shadow p-4 flex items-center gap-4 hover:shadow-lg transition-all"
                >
                  <img
                    src={item.ImageURL}
                    alt={item.ProductName}
                    className="w-24 h-24 object-cover rounded-xl shadow-sm"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {item.ProductName}
                    </h3>

                    <p className="text-[#C2185B] font-bold mt-1">
                      {Number(item.price).toLocaleString()}₫
                    </p>

                    {/* QUANTITY */}
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() => decreaseQty(item)}
                        className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all hover:scale-110"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="w-10 text-center font-semibold text-gray-800">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increaseQty(item)}
                        className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all hover:scale-110"
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Tổng cộng
              </h2>

              <div className="flex justify-between mb-3 text-gray-700">
                <span>Tạm tính</span>
                <span>{total.toLocaleString()}₫</span>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between text-xl font-bold text-[#C2185B] mb-4">
                <span>Tổng tiền</span>
                <span>{total.toLocaleString()}₫</span>
              </div>

              <button className="w-full py-3 bg-[#C2185B] text-white rounded-xl text-lg font-semibold hover:bg-[#a6144c] transition-all shadow-md hover:shadow-lg">
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
